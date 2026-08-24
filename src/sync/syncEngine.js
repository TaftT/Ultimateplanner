// Two-way real-time sync between IndexedDB (source of truth for the UI) and
// Firebase Realtime Database (encrypted, per-user store). Items and their
// instances sync only when the item's syncEnabled is on; categories and
// journal entries have no per-record toggle — they sync unconditionally
// whenever someone is signed in, since they're global/day-keyed rather than
// individually ownable the way an item is.
//
// Push (local -> cloud) always wins on the writer's side: a local save always
// overwrites the corresponding cloud node, stamped with the save's own
// updatedAt. Pull (cloud -> local) is last-write-wins by comparing plaintext
// updatedAt fields, and writes straight through the raw indexedDbRepository
// (not syncedRepository) so an incoming remote change never re-triggers a
// push back to the cloud.
//
// Known limitation for items/instances specifically: a remote item node
// being removed does NOT delete the local copy. Both "delete this item" and
// "turn sync off for this item" remove the cloud node the same way, and
// there's no way to tell them apart from a listener alone — treating removal
// as "also delete locally" would risk wiping local data just from toggling
// sync off on another device. Categories have no such ambiguity (no toggle,
// so a removed cloud category can only mean it was actually deleted), so
// category deletions DO propagate across devices.

import { ref, set, remove, update, get, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database'
import { rtdb, firebaseEnabled } from '../firebase/config.js'
import { generateSalt, generateDataKey, wrapKey, unwrapKey, encryptJson, decryptJson } from '../firebase/crypto.js'
import * as localRepo from '../data/indexedDbRepository.js'
import { useEntityStore } from '../store/useEntityStore.js'

let state = null // { uid, masterKey } while signed in and sync is active
let detachFns = []

const itemsPath = (uid) => `users/${uid}/items`
const instancesPath = (uid) => `users/${uid}/instances`
const categoriesPath = (uid) => `users/${uid}/categories`
const journalsPath = (uid) => `users/${uid}/journals`
const saltPath = (uid) => `users/${uid}/meta/salt`

export async function getOrCreateSalt(uid) {
  const snap = await get(ref(rtdb, saltPath(uid)))
  if (snap.exists()) return snap.val()
  const salt = generateSalt()
  await set(ref(rtdb, saltPath(uid)), salt)
  return salt
}

async function buildEnvelope(payload, masterKey) {
  const dataKey = await generateDataKey()
  const { wrappedKey, keyIv } = await wrapKey(dataKey, masterKey)
  const { ciphertext, iv } = await encryptJson(payload, dataKey)
  return { wrappedKey, keyIv, ciphertext, iv }
}

async function openEnvelope(record, masterKey) {
  const dataKey = await unwrapKey(record.wrappedKey, record.keyIv, masterKey)
  return decryptJson({ ciphertext: record.ciphertext, iv: record.iv }, dataKey)
}

// ---- Push (local -> cloud) -------------------------------------------------

export async function pushItem(item) {
  if (!state || !firebaseEnabled) return
  if (!item.syncEnabled) return removeItem(item.id)
  const envelope = await buildEnvelope(item, state.masterKey)
  await set(ref(rtdb, `${itemsPath(state.uid)}/${item.id}`), { updatedAt: item.updatedAt, ...envelope })
}

export async function removeItem(itemId) {
  if (!state || !firebaseEnabled) return
  await remove(ref(rtdb, `${itemsPath(state.uid)}/${itemId}`))
  const snap = await get(ref(rtdb, instancesPath(state.uid)))
  if (snap.exists()) {
    const updates = {}
    snap.forEach((child) => {
      if (child.val().itemId === itemId) updates[child.key] = null
    })
    if (Object.keys(updates).length > 0) await update(ref(rtdb, instancesPath(state.uid)), updates)
  }
}

export async function pushInstance(instance, parentSyncEnabled) {
  if (!state || !firebaseEnabled) return
  if (!parentSyncEnabled) return removeInstance(instance.id)
  const envelope = await buildEnvelope(instance, state.masterKey)
  await set(ref(rtdb, `${instancesPath(state.uid)}/${instance.id}`), {
    itemId: instance.itemId,
    updatedAt: instance.updatedAt,
    ...envelope,
  })
}

export async function removeInstance(instanceId) {
  if (!state || !firebaseEnabled) return
  await remove(ref(rtdb, `${instancesPath(state.uid)}/${instanceId}`))
}

export async function pushInstancesBulk(instances, parentSyncEnabled) {
  for (const instance of instances) {
    await pushInstance(instance, parentSyncEnabled)
  }
}

export async function pushCategory(category) {
  if (!state || !firebaseEnabled) return
  const envelope = await buildEnvelope(category, state.masterKey)
  await set(ref(rtdb, `${categoriesPath(state.uid)}/${category.id}`), { updatedAt: category.updatedAt, ...envelope })
}

export async function removeCategory(categoryId) {
  if (!state || !firebaseEnabled) return
  await remove(ref(rtdb, `${categoriesPath(state.uid)}/${categoryId}`))
}

// Journals are keyed by date rather than a generated id, and there's no
// "delete a journal entry" concept in the app, so there's no removeJournal.
export async function pushJournal(journal) {
  if (!state || !firebaseEnabled) return
  const envelope = await buildEnvelope(journal, state.masterKey)
  await set(ref(rtdb, `${journalsPath(state.uid)}/${journal.date}`), { updatedAt: journal.updatedAt, ...envelope })
}

// ---- Pull (cloud -> local) --------------------------------------------------

async function mergeRemoteItem(id, record) {
  if (!state || !record) return
  const local = await localRepo.getItem(id)
  if (local && local.updatedAt >= record.updatedAt) return
  const remote = await openEnvelope(record, state.masterKey)
  await localRepo.saveItem(remote)
  useEntityStore.getState().refreshItems()
}

async function mergeRemoteInstance(id, record) {
  if (!state || !record) return
  const local = await localRepo.getInstance(id)
  if (local && local.updatedAt >= record.updatedAt) return
  const remote = await openEnvelope(record, state.masterKey)
  await localRepo.saveInstance(remote)
  await useEntityStore.getState().refreshAllInstances()
  await useEntityStore.getState().reloadLoadedDates()
}

async function mergeRemoteCategory(id, record) {
  if (!state || !record) return
  const local = (await localRepo.getAllCategories()).find((c) => c.id === id)
  if (local && local.updatedAt >= record.updatedAt) return
  const remote = await openEnvelope(record, state.masterKey)
  await localRepo.saveCategory(remote)
  useEntityStore.getState().refreshCategories()
}

// Unlike items, a category removal is unambiguous (no sync toggle to
// confuse it with), so this is safe to propagate as a real local delete.
async function removeRemoteCategory(id) {
  if (!state) return
  await localRepo.deleteCategory(id)
  useEntityStore.getState().refreshCategories()
  useEntityStore.getState().refreshItems()
}

async function mergeRemoteJournal(date, record) {
  if (!state || !record) return
  const local = await localRepo.getJournalForDate(date)
  if (local && local.updatedAt >= record.updatedAt) return
  const remote = await openEnvelope(record, state.masterKey)
  await localRepo.saveJournal(remote)
  // Only refresh a date that's actually cached — an unviewed date will pick
  // up the merged local data naturally next time it's loaded.
  if (date in useEntityStore.getState().journalsByDate) {
    await useEntityStore.getState().loadJournalForDate(date)
  }
}

// ---- Start / stop -----------------------------------------------------------

async function reconcileAll(uid, masterKey) {
  const [itemsSnap, instancesSnap, categoriesSnap, journalsSnap] = await Promise.all([
    get(ref(rtdb, itemsPath(uid))),
    get(ref(rtdb, instancesPath(uid))),
    get(ref(rtdb, categoriesPath(uid))),
    get(ref(rtdb, journalsPath(uid))),
  ])
  const remoteItems = itemsSnap.exists() ? itemsSnap.val() : {}
  const localItems = await localRepo.getAllItems()
  const localItemsById = new Map(localItems.map((i) => [i.id, i]))

  for (const [id, record] of Object.entries(remoteItems)) {
    const local = localItemsById.get(id)
    if (!local || record.updatedAt > local.updatedAt) {
      const decrypted = await openEnvelope(record, masterKey)
      await localRepo.saveItem(decrypted)
    }
  }
  for (const item of localItems) {
    if (!item.syncEnabled) continue
    const record = remoteItems[item.id]
    if (!record || item.updatedAt > record.updatedAt) {
      await pushItem(item)
    }
  }

  const remoteInstances = instancesSnap.exists() ? instancesSnap.val() : {}
  const localInstances = await localRepo.getAllInstances()
  const localInstancesById = new Map(localInstances.map((i) => [i.id, i]))
  // Re-read items in case the loop above created any locally.
  const itemsById = new Map((await localRepo.getAllItems()).map((i) => [i.id, i]))

  for (const [id, record] of Object.entries(remoteInstances)) {
    const local = localInstancesById.get(id)
    if (!local || record.updatedAt > local.updatedAt) {
      const decrypted = await openEnvelope(record, masterKey)
      await localRepo.saveInstance(decrypted)
    }
  }
  for (const instance of localInstances) {
    const parent = itemsById.get(instance.itemId)
    if (!parent?.syncEnabled) continue
    const record = remoteInstances[instance.id]
    if (!record || instance.updatedAt > record.updatedAt) {
      await pushInstance(instance, true)
    }
  }

  const remoteCategories = categoriesSnap.exists() ? categoriesSnap.val() : {}
  const localCategories = await localRepo.getAllCategories()
  const localCategoriesById = new Map(localCategories.map((c) => [c.id, c]))

  for (const [id, record] of Object.entries(remoteCategories)) {
    const local = localCategoriesById.get(id)
    if (!local || record.updatedAt > local.updatedAt) {
      const decrypted = await openEnvelope(record, masterKey)
      await localRepo.saveCategory(decrypted)
    }
  }
  for (const category of localCategories) {
    const record = remoteCategories[category.id]
    if (!record || category.updatedAt > record.updatedAt) {
      await pushCategory(category)
    }
  }

  const remoteJournals = journalsSnap.exists() ? journalsSnap.val() : {}
  const localJournals = await localRepo.getAllJournals()
  const localJournalsByDate = new Map(localJournals.map((j) => [j.date, j]))

  for (const [date, record] of Object.entries(remoteJournals)) {
    const local = localJournalsByDate.get(date)
    if (!local || record.updatedAt > local.updatedAt) {
      const decrypted = await openEnvelope(record, masterKey)
      await localRepo.saveJournal(decrypted)
    }
  }
  for (const journal of localJournals) {
    const record = remoteJournals[journal.date]
    if (!record || journal.updatedAt > record.updatedAt) {
      await pushJournal(journal)
    }
  }

  useEntityStore.getState().refreshItems()
  await useEntityStore.getState().refreshAllInstances()
  await useEntityStore.getState().reloadLoadedDates()
  useEntityStore.getState().refreshCategories()
  const loadedJournalDates = Object.keys(useEntityStore.getState().journalsByDate)
  await Promise.all(loadedJournalDates.map((d) => useEntityStore.getState().loadJournalForDate(d)))
}

function attachListeners(uid) {
  const itemsR = ref(rtdb, itemsPath(uid))
  const instancesR = ref(rtdb, instancesPath(uid))
  const categoriesR = ref(rtdb, categoriesPath(uid))
  const journalsR = ref(rtdb, journalsPath(uid))

  detachFns.push(onChildAdded(itemsR, (snap) => mergeRemoteItem(snap.key, snap.val())))
  detachFns.push(onChildChanged(itemsR, (snap) => mergeRemoteItem(snap.key, snap.val())))
  detachFns.push(onChildAdded(instancesR, (snap) => mergeRemoteInstance(snap.key, snap.val())))
  detachFns.push(onChildChanged(instancesR, (snap) => mergeRemoteInstance(snap.key, snap.val())))
  detachFns.push(onChildAdded(categoriesR, (snap) => mergeRemoteCategory(snap.key, snap.val())))
  detachFns.push(onChildChanged(categoriesR, (snap) => mergeRemoteCategory(snap.key, snap.val())))
  detachFns.push(onChildRemoved(categoriesR, (snap) => removeRemoteCategory(snap.key)))
  detachFns.push(onChildAdded(journalsR, (snap) => mergeRemoteJournal(snap.key, snap.val())))
  detachFns.push(onChildChanged(journalsR, (snap) => mergeRemoteJournal(snap.key, snap.val())))
}

export async function start(uid, masterKey) {
  if (!firebaseEnabled) return
  stop()
  state = { uid, masterKey }
  await reconcileAll(uid, masterKey)
  attachListeners(uid)
}

export function stop() {
  for (const detach of detachFns) detach()
  detachFns = []
  state = null
}

export function isSyncing() {
  return state !== null
}
