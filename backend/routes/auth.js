import express from 'express'
import bcrypt from 'bcryptjs'
import * as db from '../db.js'
import { signToken } from '../middleware/auth.js'
import { createOTP, verifyOTP, isPhoneOrEmail } from '../services/otp.js'
import { sendOTPEmail } from '../services/email.js'
import { sendOTPWhatsApp } from '../services/whatsapp.js'

const router = express.Router()

function findUser(identifier) {
  return db.findUser(identifier)
}

function normalizeIdentifier(identifier) {
  return String(identifier).trim().toLowerCase()
}

// Register with OTP: send verification code (legacy flow)
router.post('/register/start', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }
    const normalized = normalizeIdentifier(email)
    const existing = findUser(normalized)
    if (existing) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hash = await bcrypt.hash(password, 10)
    db.setPendingRegister(normalized, hash)
    const code = createOTP(normalized, 'register')
    const result = await sendOTPEmail(normalized, code)
    if (!result.success && !result.mock) {
      return res.status(500).json({ message: 'Failed to send email' })
    }
    return res.json({ message: 'Verification code sent' })
  } catch (err) {
    console.error('Register start error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Register with OTP: verify and create account
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' })
    }
    const normalized = normalizeIdentifier(email)
    if (!verifyOTP(normalized, otp, 'register')) {
      return res.status(401).json({ message: 'Invalid or expired code' })
    }
    const user = findUser(normalized)
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const passwordHash = db.getAndRemovePendingRegister(normalized)
    const userData = { email: normalized, password_hash: passwordHash }
    const newUser = db.addUser(userData)
    const token = signToken({ id: newUser.id })
    return res.json({
      token,
      user: { id: newUser.id, email: newUser.email, phone: newUser.phone }
    })
  } catch (err) {
    console.error('Register verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Register: email or phone + password (direct)
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body
    const ident = email || phone
    if (!ident || !password) {
      return res.status(400).json({ message: 'Email or phone and password required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const existing = findUser(ident)
    if (existing) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hash = await bcrypt.hash(password, 10)
    const normalized = normalizeIdentifier(ident)
    const userData = normalized.includes('@')
      ? { email: normalized, password_hash: hash }
      : { phone: normalized, password_hash: hash }
    const user = db.addUser(userData)
    const token = signToken({ id: user.id })
    return res.json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login: email/phone + password
router.post('/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body
    if (!phoneOrEmail || !password) {
      return res.status(400).json({ message: 'Email/phone and password required' })
    }
    const user = findUser(phoneOrEmail)
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = signToken({ id: user.id })
    return res.json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login with OTP: send code
router.post('/login/start', async (req, res) => {
  try {
    const { phoneOrEmail } = req.body
    if (!phoneOrEmail) {
      return res.status(400).json({ message: 'Email or phone required' })
    }
    const normalized = normalizeIdentifier(phoneOrEmail)
    const code = createOTP(normalized, 'login')
    const channel = isPhoneOrEmail(phoneOrEmail)
    if (channel === 'phone') {
      await sendOTPWhatsApp(normalized, code)
    } else {
      const result = await sendOTPEmail(normalized, code)
      if (!result.success && !result.mock) {
        return res.status(500).json({ message: 'Failed to send email' })
      }
    }
    return res.json({
      message: channel === 'phone' ? 'Code sent via WhatsApp' : 'Code sent via email'
    })
  } catch (err) {
    console.error('Login start error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login with OTP: verify code
router.post('/login/verify', async (req, res) => {
  try {
    const { phoneOrEmail, otp } = req.body
    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ message: 'Email/phone and OTP required' })
    }
    const normalized = normalizeIdentifier(phoneOrEmail)
    if (!verifyOTP(normalized, otp, 'login')) {
      return res.status(401).json({ message: 'Invalid or expired code' })
    }
    let user = findUser(phoneOrEmail)
    if (!user) {
      user = db.addUser(
        normalized.includes('@')
          ? { email: normalized }
          : { phone: normalized }
      )
    }
    const token = signToken({ id: user.id })
    return res.json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone }
    })
  } catch (err) {
    console.error('Login verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot password: send reset code (OTP). Sends to any email/phone for verification; user may not exist in backend (e.g. Firebase-only).
router.post('/forgot-password/start', async (req, res) => {
  try {
    const { phoneOrEmail } = req.body
    if (!phoneOrEmail) {
      return res.status(400).json({ message: 'Email or phone required' })
    }
    const normalized = normalizeIdentifier(phoneOrEmail)
    const code = createOTP(normalized, 'reset')
    const channel = isPhoneOrEmail(phoneOrEmail)
    if (channel === 'phone') {
      await sendOTPWhatsApp(normalized, code)
    } else {
      const result = await sendOTPEmail(normalized, code)
      if (!result.success && !result.mock) {
        return res.status(500).json({ message: 'Failed to send email' })
      }
    }
    return res.json({
      message: channel === 'phone' ? 'Reset code sent via WhatsApp' : 'Reset code sent via email'
    })
  } catch (err) {
    console.error('Forgot password start error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot password: verify OTP only (e.g. before sending Firebase reset link)
router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { phoneOrEmail, otp } = req.body
    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ message: 'Email/phone and OTP required' })
    }
    const normalized = normalizeIdentifier(phoneOrEmail)
    if (!verifyOTP(normalized, otp, 'reset')) {
      return res.status(401).json({ message: 'Invalid or expired code' })
    }
    return res.json({ ok: true })
  } catch (err) {
    console.error('Forgot password verify-otp error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot password: verify code and set new password
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { phoneOrEmail, otp, newPassword } = req.body
    if (!phoneOrEmail || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const normalized = normalizeIdentifier(phoneOrEmail)
    if (!verifyOTP(normalized, otp, 'reset')) {
      return res.status(401).json({ message: 'Invalid or expired code' })
    }
    const user = findUser(phoneOrEmail)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const hash = await bcrypt.hash(newPassword, 10)
    db.updateUser(user.id, { password_hash: hash })
    const token = signToken({ id: user.id })
    return res.json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone },
      message: 'Password reset successfully'
    })
  } catch (err) {
    console.error('Forgot password verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
