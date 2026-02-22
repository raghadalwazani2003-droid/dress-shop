import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  updateProfile
} from 'firebase/auth'
import { auth, getAuthActionUrl } from '../firebase/config'
import { currentUser, clearBackendAuth } from '../firebase/auth'

const DEBUG = import.meta.env.DEV

function log(...args) {
  if (DEBUG) console.log('[Firebase Auth]', ...args)
}

function logError(...args) {
  console.error('[Firebase Auth]', ...args)
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isValidEmail(str) {
  return typeof str === 'string' && EMAIL_REGEX.test(str.trim())
}

/** Map Firebase auth error codes to user-friendly messages (en/ar) */
export function getAuthErrorMessage(code, lang = 'en') {
  const ar = lang === 'ar'
  const map = {
    'auth/configuration-not-found': ar ? 'المصادقة غير مفعّلة في Firebase. فعّل Email/Password و Sign-in method.' : 'Auth not configured. Enable Email/Password in Firebase Console.',
    'auth/email-already-in-use': ar ? 'هذا البريد مستخدم بالفعل' : 'This email is already in use',
    'auth/invalid-email': ar ? 'البريد الإلكتروني غير صالح' : 'Invalid email address',
    'auth/user-not-found': ar ? 'لا يوجد حساب بهذا البريد' : 'No account with this email',
    'auth/wrong-password': ar ? 'كلمة المرور غير صحيحة' : 'Wrong password',
    'auth/invalid-credential': ar ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials',
    'auth/invalid-verification-code': ar ? 'رمز خاطئ أو منتهي الصلاحية' : 'Invalid or expired code',
    'auth/code-expired': ar ? 'انتهت صلاحية الرمز' : 'Code expired',
    'auth/too-many-requests': ar ? 'محاولات كثيرة. جرّبي لاحقاً' : 'Too many attempts. Try again later',
    'auth/network-request-failed': ar ? 'خطأ في الشبكة' : 'Network error',
    'auth/weak-password': ar ? 'كلمة المرور ضعيفة (6 أحرف على الأقل)' : 'Password too weak (min 6 characters)',
    'auth/operation-not-allowed': ar ? 'طريقة الدخول غير مفعّلة. تحققي من إعدادات Firebase.' : 'Sign-in method not enabled. Check Firebase Console.',
    'auth/argument-error': ar ? 'قيمة غير صالحة (تحققي من البريد أو الرابط)' : 'Invalid value (check email or link)',
  }
  return map[code] || (ar ? 'حدث خطأ' : 'An error occurred')
}

/** Single source for action URL: magic link and password reset. handleCodeInApp = true. */
function getActionCodeSettings(path = '/login') {
  let base = (getAuthActionUrl() || '').trim()
  if (!base && typeof window !== 'undefined') base = (window.location?.origin || '') + '/login'
  const baseWithoutPath = base.replace(/\/login\/?$/, '').replace(/\/register\/?$/, '') || base
  const final = (baseWithoutPath + (path.startsWith('/') ? path : '/' + path)).replace(/\/$/, '')
  log('Action URL:', final)
  return {
    url: final,
    handleCodeInApp: true,
  }
}

function createFreshRecaptchaContainer() {
  const existing = document.querySelectorAll('[id^="recaptcha-container"]')
  existing.forEach((el) => {
    try {
      el.remove()
    } catch (_) {}
  })
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
    } catch (_) {}
    window.recaptchaVerifier = null
  }
  const id = `recaptcha-container-${Date.now()}`
  const container = document.createElement('div')
  container.id = id
  container.className = 'recaptcha-hidden'
  container.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;'
  document.body.appendChild(container)
  log('New reCAPTCHA container:', id)
  return container
}

export function useFirebaseAuth() {
  if (!auth) {
    return {
      currentUser,
      auth: null,
      loginWithEmail: async () => { throw new Error('Firebase not configured') },
      loginWithPhone: async () => { throw new Error('Firebase not configured') },
      registerWithEmail: async () => { throw new Error('Firebase not configured') },
      sendEmailSignInLink: async () => { throw new Error('Firebase not configured') },
      finishEmailLinkSignIn: async () => ({ user: null, wasSignup: false }),
      resetPassword: async () => { throw new Error('Firebase not configured') },
      logout: async () => {},
      getToken: () => null,
      getAuthErrorMessage,
    }
  }

  async function loginWithEmail(email, password) {
    const e = String(email ?? '').trim().toLowerCase()
    const p = String(password ?? '')
    if (!e) throw new Error('Email is required')
    if (!p) throw new Error('Password is required')
    log('loginWithEmail:', e)
    const cred = await signInWithEmailAndPassword(auth, e, p)
    log('Login success:', cred.user?.email)
    return cred.user
  }

  async function loginWithPhone(phoneNumber) {
    const raw = String(phoneNumber ?? '').trim()
    if (!raw) throw new Error('Phone number is required')
    const container = createFreshRecaptchaContainer()
    const appVerifier = new RecaptchaVerifier(auth, container, { size: 'invisible', callback: () => {} })
    window.recaptchaVerifier = appVerifier
    const formatted = raw.startsWith('+') ? raw : `+962${raw.replace(/^0/, '')}`
    log('signInWithPhoneNumber:', formatted)
    const result = await signInWithPhoneNumber(auth, formatted, appVerifier)
    log('SMS sent (or test bypass). Confirm with OTP.')
    return result
  }

  async function registerWithEmail(email, password, name = '') {
    const e = String(email ?? '').trim().toLowerCase()
    const p = String(password ?? '')
    if (!e) throw new Error('Email is required')
    if (!p) throw new Error('Password is required')
    if (!isValidEmail(e)) throw new Error('Invalid email address')
    log('registerWithEmail:', e)
    const cred = await createUserWithEmailAndPassword(auth, e, p)
    if (name) await updateProfile(cred.user, { displayName: String(name).trim() })
    log('Register success:', cred.user?.email)
    return cred.user
  }

  async function sendEmailSignInLink(email, signup = false) {
    const e = String(email ?? '').trim().toLowerCase()
    if (!e) throw new Error('Email is required')
    if (!isValidEmail(e)) throw new Error('Invalid email address')
    const path = signup ? '/register' : '/login'
    const actionCodeSettings = getActionCodeSettings(path)
    log('sendSignInLinkToEmail:', e, 'url:', actionCodeSettings.url, 'handleCodeInApp:', true)
    try {
      await sendSignInLinkToEmail(auth, e, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', e)
      if (signup) window.localStorage.setItem('emailLinkSignup', '1')
      log('Magic link email sent to', e)
    } catch (err) {
      logError('sendSignInLinkToEmail failed', err?.code, err?.message, err)
      throw err
    }
  }

  async function finishEmailLinkSignIn(userProvidedEmail = null) {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      log('Not an email link URL')
      return null
    }
    let email = (userProvidedEmail && String(userProvidedEmail).trim()) || window.localStorage.getItem('emailForSignIn') || ''
    email = email.trim().toLowerCase()
    if (!email) {
      const msg = 'Please enter your email to complete sign-in. The link may have been opened in a different browser.'
      logError(msg)
      throw new Error(msg)
    }
    const wasSignup = window.localStorage.getItem('emailLinkSignup')
    log('finishEmailLinkSignIn:', email)
    const result = await signInWithEmailLink(auth, email, window.location.href)
    window.localStorage.removeItem('emailForSignIn')
    window.localStorage.removeItem('emailLinkSignup')
    window.history.replaceState({}, document.title, window.location.pathname || '/login')
    log('Email link sign-in success:', result?.user?.email)
    return { user: result.user, wasSignup: !!wasSignup }
  }

  async function resetPassword(email) {
    const e = String(email ?? '').trim().toLowerCase()
    if (!e) throw new Error('Email is required')
    if (!isValidEmail(e)) throw new Error('Invalid email address')
    const actionCodeSettings = getActionCodeSettings('/login')
    log('sendPasswordResetEmail:', e, 'url:', actionCodeSettings.url)
    try {
      await sendPasswordResetEmail(auth, e, actionCodeSettings)
      log('Password reset email sent to', e)
    } catch (err) {
      logError('sendPasswordResetEmail failed', err?.code, err?.message, err)
      throw err
    }
  }

  async function logout() {
    clearBackendAuth()
    if (auth) await fbSignOut(auth)
    currentUser.value = null
  }

  function getToken() {
    return auth.currentUser?.getIdToken() ?? null
  }

  return {
    currentUser,
    auth,
    loginWithEmail,
    loginWithPhone,
    registerWithEmail,
    sendEmailSignInLink,
    finishEmailLinkSignIn,
    resetPassword,
    logout,
    getToken,
    getAuthErrorMessage,
  }
}
