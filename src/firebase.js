import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

/** Action URL for email link and password reset. Must be whitelisted in Firebase Console → Auth → Authorized domains. */
export function getAuthActionUrl() {
  const fromEnv = (import.meta.env.VITE_AUTH_ACTION_URL || '').trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/login`
  return ''
}

let app = null
let auth = null
let db = null

if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    auth.setPersistence(browserLocalPersistence)
    const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location?.host || '')
    if (auth.settings != null && (import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEV_TESTING === 'true' || isLocalhost)) {
      auth.settings.appVerificationDisabledForTesting = true
    }
  } catch (e) {
    console.error('[Firebase] init error:', e.message, e)
  }
}

export { auth, db, hasConfig }
export default app

/*
  Example: use db in a Vue component

  import { db } from '@/firebase.js'
  import { collection, getDocs } from 'firebase/firestore'

  onMounted(async () => {
    if (!db) return
    const snap = await getDocs(collection(db, 'test'))
    console.log('Firestore test:', snap.size, 'documents')
  })

  Note: Restart the dev server (npm run dev) after changing .env.
*/
