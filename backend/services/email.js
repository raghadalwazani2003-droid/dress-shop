import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    console.warn('Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env')
    return null
  }
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user, pass }
  })
  return transporter
}

export async function sendOTPEmail(to, code) {
  const trans = getTransporter()
  if (!trans) {
    if (process.env.NODE_ENV !== 'production') console.log(`[EMAIL MOCK] OTP for ${to}: ${code}`)
    return { success: true, mock: true }
  }
  try {
    await trans.sendMail({
      from: process.env.SMTP_FROM || 'MOTEX <noreply@motex.com>',
      to,
      subject: 'Your MOTEX login code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    })
    return { success: true }
  } catch (err) {
    console.error('Email send error:', err.message)
    return { success: false, error: err.message }
  }
}
