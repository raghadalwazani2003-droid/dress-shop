/**
 * Firebase 9+ Auth Composable
 * Supports: Email signup (magic link), Email login, Forgot password, Phone OTP
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as fbSignOut,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { currentUser } from '../firebase/auth'

function getActionUrl() {
  return import.meta.env.VITE_AUTH_ACTION_URL || `${window.location.origin}/auth`
}

export function useAuth() {
  if (!auth) {
    return {
      currentUser,
      signupWithEmail: async () => { throw new Error('Firebase not configured') },
      loginWithEmail: async () => { throw new Error('Firebase not configured') },
      forgotPassword: async () => { throw new Error('Firebase not configured') },
      sendPhoneOtp: async () => { throw new Error('Firebase not configured') },
      verifyPhoneOtp: () => null,
      finishEmailLinkSignIn: async () => null,
      logout: async () => {}
    }
  }

  let phoneConfirmation = null

  function createFreshRecaptchaContainer() {
    document.querySelectorAll('[id^="recaptcha-auth-"]').forEach((el) => el.remove())
    if (window._recaptchaVerifier) {
      try { window._recaptchaVerifier.clear() } catch (_) {}
      window._recaptchaVerifier = null
    }
    const id = `recaptcha-auth-${Date.now()}`
    const container = document.createElement('div')
    container.id = id
    container.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(container)
    return container
  }

  async function signupWithEmail(email, password, displayName = '') {
    const e = String(email || '').trim()
    const p = String(password || '')
    if (!e) throw new Error('Email is required')
    if (!p) throw new Error('Password is required')
    const cred = await createUserWithEmailAndPassword(auth, e.toLowerCase(), p)
    if (displayName) await updateProfile(cred.user, { displayName: String(displayName).trim() })
    return cred.user
  }

  async function signupWithEmailMagicLink(email) {
    const e = String(email || '').trim().toLowerCase()
    if (!e) throw new Error('Email is required')
    const actionCodeSettings = {
      url: getActionUrl(),
      handleCodeInApp: true
    }
    await sendSignInLinkToEmail(auth, e, actionCodeSettings)
    window.localStorage.setItem('emailForSignIn', e.toLowerCase())
    window.localStorage.setItem('emailLinkSignup', '1')
  }

  async function loginWithEmail(email, password) {
    const e = String(email || '').trim()
    const p = String(password || '')
    if (!e) throw new Error('Email is required')
    if (!p) throw new Error('Password is required')
    const cred = await signInWithEmailAndPassword(auth, e.toLowerCase(), p)
    return cred.user
  }

  async function loginWithEmailMagicLink(email) {
    const e = String(email || '').trim().toLowerCase()
    if (!e) throw new Error('Email is required')
    const actionCodeSettings = {
      url: getActionUrl(),
      handleCodeInApp: true
    }
    await sendSignInLinkToEmail(auth, e, actionCodeSettings)
    window.localStorage.setItem('emailForSignIn', e.toLowerCase())
  }

  async function forgotPassword(emailOrPhone) {
    const v = String(emailOrPhone || '').trim()
    if (!v) throw new Error('Email or phone is required')
    if (v.includes('@')) {
      await sendPasswordResetEmail(auth, v.toLowerCase())
    } else {
      await sendPhoneOtp(v)
    }
  }

  async function sendPhoneOtp(phoneNumber) {
    const v = String(phoneNumber || '').trim()
    if (!v) throw new Error('Phone number is required')
    const container = createFreshRecaptchaContainer()
    const appVerifier = new RecaptchaVerifier(auth, container, { size: 'invisible', callback: () => {} })
    window._recaptchaVerifier = appVerifier
    const phone = v.startsWith('+') ? v : `+962${v.replace(/^0/, '')}`
    phoneConfirmation = await signInWithPhoneNumber(auth, phone, appVerifier)
  }

  async function verifyPhoneOtp(code) {
    const c = String(code || '').trim()
    if (!c) throw new Error('OTP is required')
    if (!phoneConfirmation) throw new Error('No OTP sent. Request a new code.')
    const result = await phoneConfirmation.confirm(c)
    phoneConfirmation = null
    return result.user
  }

  async function finishEmailLinkSignIn(userEmail = null) {
    if (!isSignInWithEmailLink(auth, window.location.href)) return null
    const trimmed = userEmail ? String(userEmail).trim().toLowerCase() : ''
    let email = trimmed || window.localStorage.getItem('emailForSignIn') || ''
    if (!email) return { needsEmail: true }
    const wasSignup = window.localStorage.getItem('emailLinkSignup')
    const result = await signInWithEmailLink(auth, email, window.location.href)
    window.localStorage.removeItem('emailForSignIn')
    window.localStorage.removeItem('emailLinkSignup')
    window.history.replaceState({}, document.title, window.location.pathname || '/auth')
    return { user: result.user, wasSignup: !!wasSignup }
  }

  async function logout() {
    await fbSignOut(auth)
    currentUser.value = null
  }

  return {
    currentUser,
    signupWithEmail,
    signupWithEmailMagicLink,
    loginWithEmail,
    loginWithEmailMagicLink,
    forgotPassword,
    sendPhoneOtp,
    verifyPhoneOtp,
    finishEmailLinkSignIn,
    logout
  }
}
