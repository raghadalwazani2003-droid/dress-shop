import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables")
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, ''),
})
const API = axios.create({ baseURL })

// Attach backend JWT to requests when present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Register: backend email + OTP flow
export function registerStart(email, password) {
  return API.post('/auth/register/start', { email: String(email || '').trim(), password })
}
export function registerVerify(email, otp) {
  return API.post('/auth/register/verify', { email: String(email || '').trim(), otp })
}

// Login: backend expects { email, password }
export function login(email, password) {
  return API.post('/auth/login', { email: String(email || '').trim(), password })
}

// Forgot password: backend email-only
export function forgotPasswordStart(email) {
  return API.post('/auth/forgot-password/start', { email: String(email || '').trim() })
}

// Single step: verify OTP and set new password (backend has no separate verify-otp)
export function forgotPasswordVerify(email, otp, newPassword) {
  return API.post('/auth/forgot-password/verify', {
    email: String(email || '').trim(),
    otp,
    newPassword,
  })
}

// Generic email OTP (replaces magic link)
export function sendEmailOtp(email, purpose = 'login') {
  return API.post('/auth/send-email-otp', {
    email: String(email || '').trim().toLowerCase(),
    purpose,
  })
}

export function verifyEmailOtp(email, otp, purpose = 'login') {
  return API.post('/auth/verify-email-otp', {
    email: String(email || '').trim().toLowerCase(),
    otp: String(otp || '').trim(),
    purpose,
  })
}

export function registerComplete(registerToken, password) {
  return API.post('/auth/register/complete', { registerToken, password })
}
