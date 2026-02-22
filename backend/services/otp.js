import * as db from '../db.js'

const OTP_LENGTH = 6

function generateOTP() {
  let code = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

function isPhone(value) {
  const v = String(value).trim()
  if (v.includes('@')) return false
  return /^[\d+][\d\s-]*\d$/.test(v.replace(/\s/g, ''))
}

export function createOTP(identifier, type = 'login') {
  const code = generateOTP()
  db.addOTP(identifier, code, type)
  return code
}

export function verifyOTP(identifier, code, type = 'login') {
  return db.verifyAndRemoveOTP(identifier, code.trim(), type)
}

export function isPhoneOrEmail(value) {
  return isPhone(value) ? 'phone' : 'email'
}
