import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    console.warn('Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env')
    console.warn('Current values', { host, user: !!user, pass: !!pass })
    return null
  }
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
+  const secure = process.env.SMTP_SECURE === 'true' || port === 465
+  transporter = nodemailer.createTransport({
+    host,
+    port,
+    secure,
+    auth: { user, pass },
+  })
+
+  // log connection info in development
+  if (process.env.NODE_ENV !== 'production') {
+    console.log('[email] transporter created', { host, port, secure, user })
+    transporter.verify((err, success) => {
+      if (err) {
+        console.error('[email] verify error', err.message)
+      } else {
+        console.log('[email] smtp connection verified')
+      }
+    })
+  }
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
