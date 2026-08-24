import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth'
import { auth, firebaseEnabled } from './config.js'

function requireAuth() {
  if (!firebaseEnabled || !auth) {
    throw new Error('Cloud sync is not configured for this deployment')
  }
  return auth
}

export async function signUp(email, password) {
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email, password)
  return user
}

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(requireAuth(), email, password)
  return user
}

export async function signOutUser() {
  await signOut(requireAuth())
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(requireAuth(), email)
}

/** No-ops (returns a no-op unsubscribe) when Firebase isn't configured. */
export function onAuthStateChanged(callback) {
  if (!firebaseEnabled || !auth) return () => {}
  return firebaseOnAuthStateChanged(auth, callback)
}
