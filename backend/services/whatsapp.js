/**
 * WhatsApp OTP sender
 * For production: integrate Twilio WhatsApp API or WhatsApp Business API
 * https://www.twilio.com/docs/whatsapp
 */
export async function sendOTPWhatsApp(phone, code) {
  // TODO: Integrate Twilio or WhatsApp Business API
  // Example Twilio: await twilioClient.messages.create({ from: 'whatsapp:+14155238886', to: `whatsapp:${phone}`, body: `Your MOTEX code: ${code}` })
  if (process.env.NODE_ENV !== 'production') console.log(`[WhatsApp MOCK] OTP for ${phone}: ${code}`)
  return { success: true, mock: true }
}
