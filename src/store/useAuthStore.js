import { create } from 'zustand'
import * as fbAuth from '../firebase/auth.js'
import { deriveMasterKey } from '../firebase/crypto.js'
import * as syncEngine from '../sync/syncEngine.js'
import { firebaseEnabled } from '../firebase/config.js'

// Auth is entirely optional — the app must work fully offline with no one
// signed in. masterKey lives only in memory (never localStorage/IndexedDB):
// it's re-derived from the user's password each time they sign in or unlock,
// so a page refresh keeps the Firebase session but loses the key, which
// needsUnlock (below) surfaces as a "re-enter your password" prompt.
let listenerAttached = false

export const useAuthStore = create((set, get) => ({
  ready: false, // true once the initial Firebase auth state has resolved
  user: null, // { uid, email } | null
  masterKey: null, // CryptoKey | null
  needsUnlock: false,

  // Guarded against double-invocation (e.g. React StrictMode's double-effect
  // in dev) since it registers a listener as a side effect.
  init: () => {
    if (listenerAttached) return
    listenerAttached = true
    if (!firebaseEnabled) {
      set({ ready: true })
      return
    }
    fbAuth.onAuthStateChanged((user) => {
      if (user) {
        set({ user: { uid: user.uid, email: user.email }, ready: true, needsUnlock: !get().masterKey })
      } else {
        syncEngine.stop()
        set({ user: null, masterKey: null, needsUnlock: false, ready: true })
      }
    })
  },

  signUp: async (email, password) => {
    const user = await fbAuth.signUp(email, password)
    const salt = await syncEngine.getOrCreateSalt(user.uid)
    const masterKey = await deriveMasterKey(password, salt)
    set({ user: { uid: user.uid, email: user.email }, masterKey, needsUnlock: false })
    await syncEngine.start(user.uid, masterKey)
  },

  signIn: async (email, password) => {
    const user = await fbAuth.signIn(email, password)
    const salt = await syncEngine.getOrCreateSalt(user.uid)
    const masterKey = await deriveMasterKey(password, salt)
    set({ user: { uid: user.uid, email: user.email }, masterKey, needsUnlock: false })
    await syncEngine.start(user.uid, masterKey)
  },

  // Re-derives the master key for an already-signed-in Firebase session
  // (e.g. after a page refresh) without asking for the email again.
  unlock: async (password) => {
    const { user } = get()
    if (!user) return
    const salt = await syncEngine.getOrCreateSalt(user.uid)
    const masterKey = await deriveMasterKey(password, salt)
    set({ masterKey, needsUnlock: false })
    await syncEngine.start(user.uid, masterKey)
  },

  signOut: async () => {
    syncEngine.stop()
    await fbAuth.signOutUser()
    set({ user: null, masterKey: null, needsUnlock: false })
  },

  resetPassword: (email) => fbAuth.resetPassword(email),
}))
