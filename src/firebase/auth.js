import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export const currentUser = ref(null)

function restoreBackendUser() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userJson = localStorage.getItem(AUTH_USER_KEY)
    if (token && userJson) {
      const user = JSON.parse(userJson)
      currentUser.value = { uid: user.id, email: user.email, name: user.email }
      return true
    }
  } catch (_) {}
  return false
}

export function setBackendAuth(user, token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  currentUser.value = user ? { uid: user.id, email: user.email, name: user.email } : null
}

export function clearBackendAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  currentUser.value = null
}

export function initAuth() {
  // On load: if we have backend session, show user (Firebase may not be configured)
  restoreBackendUser()
  if (!auth) return
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getOrCreateUserProfile(user)
      currentUser.value = {
        uid: user.uid,
        email: user.email || profile?.email,
        phone: user.phoneNumber || profile?.phone,
        name: profile?.name || user.displayName || user.email || user.phoneNumber || ''
      }
    } else {
      // Only clear if we don't have a backend session (backend user stays until logout)
      if (!localStorage.getItem(AUTH_TOKEN_KEY)) currentUser.value = null
    }
  })
}

async function getOrCreateUserProfile(fbUser) {
  if (!db) return {}
  const userRef = doc(db, 'users', fbUser.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    return snap.data()
  }
  const profile = {
    email: fbUser.email || null,
    phone: fbUser.phoneNumber || null,
    name: fbUser.displayName || fbUser.email || fbUser.phoneNumber || '',
    createdAt: new Date().toISOString()
  }
  await setDoc(userRef, profile)
  return profile
}
