<template>
  <div class="auth-page" :dir="dir">
    <div id="recaptcha-container" class="recaptcha-hidden"></div>
    <div class="auth-card">
      <h1 class="logo">MOTEX</h1>
      <p class="tagline">{{ t('tagline') }}</p>

      <p v-if="!hasConfig" class="firebase-error">{{ t('firebaseNotConfigured') }}</p>
      <p v-else-if="firebaseError" class="firebase-error">{{ firebaseError }}</p>

      <!-- Login: Email + Password -->
      <form v-if="mode === 'login'" @submit.prevent="doLogin" class="auth-form">
        <input
          v-model="email"
          type="email"
          :placeholder="t('emailPlaceholder')"
          class="input"
          required
          autocomplete="username"
          @focus="error = ''; firebaseError = ''"
        />
        <input
          v-model="password"
          type="password"
          :placeholder="t('password')"
          class="input"
          autocomplete="current-password"
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('loggingIn') : t('logIn') }}
        </button>
        <a href="#" class="forgot-link" @click.prevent="mode = 'forgot'; forgotStep = 1; resetForgot()">
          {{ t('forgotPassword') }}
        </a>
      </form>

      <div v-if="mode === 'login'" class="divider"><span>{{ t('or') }}</span></div>
      <button v-if="mode === 'login'" type="button" class="btn-outline" @click="mode = 'otp'; otpStep = 1; resetOtp()">
        {{ t('logInWithOtp') }}
      </button>

      <!-- OTP Login: Step 1 - Enter email or phone -->
      <form v-else-if="mode === 'otp' && otpStep === 1" @submit.prevent="sendOtpLogin" class="auth-form">
        <p class="hint">{{ t('enterEmailOrPhone') }}</p>
        <input
          v-model="emailOrPhone"
          type="text"
          :placeholder="t('emailOrPhonePlaceholder')"
          class="input"
          required
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('sending') : t('sendCode') }}
        </button>
        <button type="button" class="btn-text" @click="mode = 'login'; resetOtp()">{{ t('back') }}</button>
      </form>

      <!-- OTP Login: Step 2 - Phone: Enter OTP -->
      <form v-else-if="mode === 'otp' && otpStep === 2 && isPhoneOtp" @submit.prevent="verifyPhoneOtpLogin" class="auth-form">
        <p class="hint">{{ t('enterCodeSent') }}</p>
        <input
          v-model="otp"
          type="text"
          inputmode="numeric"
          :placeholder="t('code6Digits')"
          class="input input-otp"
          maxlength="6"
          required
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('verifying') : t('confirm') }}
        </button>
        <button type="button" class="btn-text" @click="otpStep = 1; otp = ''; error = ''">{{ t('changeNumber') }}</button>
      </form>

      <!-- OTP Login: Step 2 - Email: Enter OTP + resend + countdown -->
      <form v-else-if="mode === 'otp' && otpStep === 2 && !isPhoneOtp" @submit.prevent="verifyEmailOtpLogin" class="auth-form">
        <p class="hint">{{ t('enterCodeSent') }}</p>
        <p class="hint-small">{{ t('checkSpamToo') }}</p>
        <input
          v-model="otp"
          type="text"
          inputmode="numeric"
          :placeholder="t('code6Digits')"
          class="input input-otp"
          maxlength="6"
          required
          @focus="error = ''"
        />
        <div class="otp-actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? t('verifying') : t('confirm') }}
          </button>
          <button
            type="button"
            class="btn-text"
            :disabled="otpResendCooldown > 0 || loading"
            @click="resendEmailOtp"
          >
            {{ otpResendCooldown > 0 ? t('resendIn') + otpResendCooldown + (language === 'ar' ? ' ث' : 's') : t('resendCode') }}
          </button>
        </div>
        <button type="button" class="btn-text" @click="mode = 'login'; resetOtp()">{{ t('back') }}</button>
      </form>

      <!-- Forgot: Step 1 - Enter email or phone -->
      <form v-else-if="mode === 'forgot' && forgotStep === 1" @submit.prevent="sendForgotOtp" class="auth-form">
        <p class="hint">{{ t('forgotHintOtp') }}</p>
        <input
          v-model="forgotEmailOrPhone"
          type="text"
          :placeholder="t('emailOrPhonePlaceholder')"
          class="input"
          required
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('sending') : t('sendCode') }}
        </button>
        <button type="button" class="btn-text" @click="mode = 'login'; resetForgot()">{{ t('back') }}</button>
      </form>

      <!-- Forgot: Step 2 - Enter code sent to email + new password -->
      <form v-else-if="mode === 'forgot' && forgotStep === 2" @submit.prevent="submitForgotVerify" class="auth-form">
        <p class="hint">{{ t('enterCodeSent') }}</p>
        <p v-if="forgotIsEmail" class="hint-small">{{ t('checkSpamToo') }}</p>
        <input
          v-model="forgotOtp"
          type="text"
          inputmode="numeric"
          :placeholder="t('code6Digits')"
          class="input input-otp"
          maxlength="6"
          required
          @focus="error = ''"
        />
        <input
          v-model="forgotNewPassword"
          type="password"
          :placeholder="t('newPassword')"
          class="input"
          minlength="6"
          required
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('verifying') : t('confirm') }}
        </button>
        <button type="button" class="btn-text" @click="forgotStep = 1; forgotOtp = ''; forgotNewPassword = ''; error = ''">{{ t('back') }}</button>
      </form>

      <!-- Forgot: Step 3 - Result (password changed or phone message) -->
      <div v-else-if="mode === 'forgot' && forgotStep === 3" class="auth-form">
        <p class="hint success">{{ forgotPasswordChanged ? t('passwordChanged') : t('phoneNoPassword') }}</p>
        <button type="button" class="btn-text" @click="mode = 'login'; resetForgot()">{{ t('back') }}</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="signup-section">
        <span>{{ t('noAccount') }}</span>
        <router-link to="/register" class="link">{{ t('signUp') }}</router-link>
        <span class="sep">·</span>
        <router-link to="/register-email" class="link-secondary">{{ t('signUpWithPassword') }}</router-link>
      </div>
    </div>

    <div v-if="successMessage" class="toast success">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { hasConfig } from '../firebase/config'
import { login as apiLogin, forgotPasswordStart, forgotPasswordVerify, sendEmailOtp, verifyEmailOtp } from '../api/auth'
import { setBackendAuth } from '../firebase/auth'

const router = useRouter()
const { language } = useLanguage()
const {
  loginWithEmail,
  loginWithPhone,
  finishEmailLinkSignIn,
  getAuthErrorMessage
} = useFirebaseAuth()

const mode = ref('login')
const otpStep = ref(1)
const forgotStep = ref(1)
const email = ref('')
const password = ref('')
const emailOrPhone = ref('')
const otp = ref('')
const forgotEmailOrPhone = ref('')
const forgotOtp = ref('')
const forgotNewPassword = ref('')
const forgotPasswordChanged = ref(false)
const otpResendCooldown = ref(0)
let resendTimer = null
const loading = ref(false)
const error = ref('')
const firebaseError = ref('')
const successMessage = ref('')
let phoneConfirmation = null

const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

const isPhoneOtp = computed(() => {
  const v = emailOrPhone.value.trim()
  if (!v || v.includes('@')) return false
  return /^[\d+][\d\s-]*\d$/.test(v.replace(/\s/g, ''))
})

const forgotIsEmail = computed(() => forgotEmailOrPhone.value.trim().includes('@'))

const t = (key) => {
  const strings = {
    tagline: { ar: 'فساتين بأناقة وأسلوب', en: 'Elegant dresses and style' },
    firebaseNotConfigured: { ar: 'Firebase غير مُهيأ. أضف VITE_FIREBASE_* في .env', en: 'Firebase not configured. Add VITE_FIREBASE_* to .env' },
    emailPlaceholder: { ar: 'البريد الإلكتروني', en: 'Email address' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    logIn: { ar: 'تسجيل الدخول', en: 'Log In' },
    loggingIn: { ar: 'جاري تسجيل الدخول...', en: 'Logging in...' },
    forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
    or: { ar: 'أو', en: 'or' },
    logInWithOtp: { ar: 'تسجيل الدخول برمز OTP', en: 'Log in with OTP' },
    enterEmailOrPhone: { ar: 'أدخلي بريدك أو رقم هاتفك', en: 'Enter your email or phone' },
    emailOrPhonePlaceholder: { ar: 'البريد الإلكتروني أو رقم الهاتف', en: 'Email or phone number' },
    sending: { ar: 'جاري الإرسال...', en: 'Sending...' },
    sendCode: { ar: 'إرسال الرمز', en: 'Send code' },
    back: { ar: '← رجوع', en: '← Back' },
    enterCodeSent: { ar: 'أدخلي الرمز الذي وصلك', en: 'Enter the code you received' },
    code6Digits: { ar: 'الرمز (6 أرقام)', en: 'Code (6 digits)' },
    newPassword: { ar: 'كلمة المرور الجديدة (6 أحرف)', en: 'New password (min 6)' },
    verifying: { ar: 'جاري التحقق...', en: 'Verifying...' },
    confirm: { ar: 'تأكيد', en: 'Confirm' },
    changeNumber: { ar: '← تغيير الرقم', en: '← Change number' },
    checkEmail: { ar: 'تحققي من بريدك', en: 'Check your email' },
    clickLinkToSignIn: { ar: 'اضغطي على الرابط في الرسالة لتسجيل الدخول', en: 'Click the link in the email to sign in' },
    resendCode: { ar: 'إعادة إرسال الرمز', en: 'Resend code' },
    resendIn: { ar: 'إعادة الإرسال بعد ث', en: 'Resend in ' },
    forgotHintOtp: { ar: 'أدخلي بريدك أو رقمك لإرسال رمز التحقق', en: 'Enter your email or phone to receive a verification code' },
    resetEmailSent: { ar: 'تم إرسال رابط إعادة التعيين! تحققي من بريدك', en: 'Reset link sent! Check your email' },
    checkSpamToo: { ar: 'إن لم تصلك الرسالة، تحققي من مجلد السبام أو البريد المزعج', en: 'If the message didn\'t arrive, check your spam or junk folder' },
    passwordChanged: { ar: 'تم تغيير كلمة السر بنجاح. يمكنك تسجيل الدخول الآن', en: 'Password changed. You can sign in now.' },
    phoneNoPassword: { ar: 'حسابات الهاتف تسجّل دخولاً بالرمز فقط. لا يوجد كلمة مرور لإعادة تعيينها.', en: 'Phone accounts sign in with OTP only. No password to reset.' },
    noAccount: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
    signUp: { ar: 'إنشاء حساب', en: 'Sign up' },
    signUpWithPassword: { ar: 'التسجيل بالبريد وكلمة المرور', en: 'Sign up with email & password' }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}

function resetOtp() {
  emailOrPhone.value = ''
  otp.value = ''
  error.value = ''
  otpStep.value = 1
  otpResendCooldown.value = 0
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
}

function startResendCooldown(seconds = 60) {
  otpResendCooldown.value = seconds
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    otpResendCooldown.value--
    if (otpResendCooldown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

function resetForgot() {
  forgotEmailOrPhone.value = ''
  forgotOtp.value = ''
  forgotNewPassword.value = ''
  forgotPasswordChanged.value = false
  error.value = ''
  forgotStep.value = 1
}

async function doLogin() {
  const trimmedEmail = (email.value && String(email.value).trim()) || ''
  const pwd = (password.value && String(password.value)) || ''
  if (!trimmedEmail) {
    error.value = language.value === 'ar' ? 'أدخلي البريد الإلكتروني' : 'Email is required'
    return
  }
  if (!pwd) {
    error.value = language.value === 'ar' ? 'أدخلي كلمة المرور' : 'Password is required'
    return
  }
  error.value = ''
  firebaseError.value = ''
  loading.value = true
  try {
    const res = await apiLogin(trimmedEmail, pwd)
    if (res.data?.token && res.data?.user) {
      setBackendAuth(res.data.user, res.data.token)
      successMessage.value = language.value === 'ar' ? 'تم الدخول!' : 'Logged in!'
      setTimeout(() => router.push('/'), 1500)
      return
    }
    throw new Error(res.data?.message || 'Login failed')
  } catch (e) {
    const msg = e.response?.data?.message || e.message
    if (e.response?.status === 403 || msg?.includes('غير مفعّل')) {
      error.value = language.value === 'ar' ? 'الحساب غير مفعّل، فعّل الإيميل أولاً' : 'Account not verified. Verify your email first.'
      return
    }
    if (e.response?.status === 400 || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
      error.value = language.value === 'ar' ? 'بيانات خاطئة' : 'Invalid credentials'
      return
    }
    if (e.code === 'ERR_NETWORK' || e.response?.status >= 500) {
      error.value = language.value === 'ar' ? 'تعذر الاتصال بالخادم' : 'Cannot reach server'
      return
    }
    error.value = msg || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
  } finally {
    loading.value = false
  }
}

async function sendOtpLogin() {
  const v = (emailOrPhone.value && String(emailOrPhone.value).trim()) || ''
  if (!v) {
    error.value = language.value === 'ar' ? 'أدخلي البريد أو رقم الهاتف' : 'Enter your email or phone number'
    return
  }
  error.value = ''
  firebaseError.value = ''
  loading.value = true
  try {
    if (isPhoneOtp.value) {
      phoneConfirmation = await loginWithPhone(v)
      otpStep.value = 2
      otp.value = ''
    } else {
      if (!v.includes('@')) {
        error.value = language.value === 'ar' ? 'أدخلي بريداً إلكترونياً صالحاً' : 'Please enter a valid email address'
        loading.value = false
        return
      }
      await sendEmailOtp(v.toLowerCase(), 'login')
      otpStep.value = 2
      otp.value = ''
      startResendCooldown()
    }
  } catch (e) {
    const msg = e.response?.data?.message || e.message
    if (e.response?.status === 429) {
      error.value = msg || (language.value === 'ar' ? 'انتظري قليلاً قبل إعادة الإرسال' : 'Please wait before resending')
      const retry = e.response?.data?.retryAfterSeconds
      if (retry) startResendCooldown(retry)
    } else if (e.code === 'auth/configuration-not-found') firebaseError.value = t('firebaseNotConfigured')
    else error.value = msg || getAuthErrorMessage(e.code, language.value) || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Login] sendOtpLogin', e?.response?.data, e?.message)
  } finally {
    loading.value = false
  }
}

async function resendEmailOtp() {
  const v = (emailOrPhone.value && String(emailOrPhone.value).trim()).toLowerCase() || ''
  if (!v || !v.includes('@')) return
  error.value = ''
  loading.value = true
  try {
    await sendEmailOtp(v, 'login')
    startResendCooldown()
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (e.response?.status === 429 && e.response?.data?.retryAfterSeconds) {
      startResendCooldown(e.response.data.retryAfterSeconds)
    }
  } finally {
    loading.value = false
  }
}

async function verifyEmailOtpLogin() {
  const code = (otp.value && String(otp.value).trim()) || ''
  if (!code) {
    error.value = language.value === 'ar' ? 'أدخلي الرمز' : 'Enter the code'
    return
  }
  const emailVal = (emailOrPhone.value && String(emailOrPhone.value).trim()).toLowerCase() || ''
  if (!emailVal) return
  error.value = ''
  loading.value = true
  try {
    const res = await verifyEmailOtp(emailVal, code, 'login')
    if (res.data?.token && res.data?.user) {
      setBackendAuth(res.data.user, res.data.token)
      successMessage.value = language.value === 'ar' ? 'تم الدخول!' : 'Logged in!'
      setTimeout(() => router.push('/'), 1500)
    } else {
      successMessage.value = language.value === 'ar' ? 'تم التحقق' : 'Verified'
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'رمز خاطئ أو منتهي' : 'Invalid or expired code')
  } finally {
    loading.value = false
  }
}

async function verifyPhoneOtpLogin() {
  const code = (otp.value && String(otp.value).trim()) || ''
  if (!code) {
    error.value = language.value === 'ar' ? 'أدخلي الرمز' : 'Enter the code'
    return
  }
  error.value = ''
  loading.value = true
  try {
    if (!phoneConfirmation) throw new Error('No confirmation')
    await phoneConfirmation.confirm(code)
    successMessage.value = language.value === 'ar' ? 'تم الدخول!' : 'Logged in!'
    setTimeout(() => router.push('/'), 1500)
  } catch (e) {
    error.value = getAuthErrorMessage(e.code, language.value) || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Login] verifyPhoneOtp', e?.code, e?.message)
  } finally {
    loading.value = false
  }
}

async function sendForgotOtp() {
  const emailOrPhoneVal = (forgotEmailOrPhone.value && String(forgotEmailOrPhone.value).trim()) || ''
  if (!emailOrPhoneVal) {
    error.value = language.value === 'ar' ? 'أدخلي بريدك الإلكتروني أو رقم هاتفك' : 'Please enter your email or phone number'
    return
  }
  if (!forgotIsEmail.value) {
    forgotStep.value = 3
    return
  }
  const emailVal = emailOrPhoneVal.toLowerCase()
  if (!emailVal.includes('@')) {
    error.value = language.value === 'ar' ? 'أدخلي بريداً إلكترونياً صالحاً' : 'Please enter a valid email address'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await forgotPasswordStart(emailVal)
    forgotStep.value = 2
    forgotOtp.value = ''
    forgotNewPassword.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Login] forgotPasswordStart failed', e?.response?.data, e?.message)
  } finally {
    loading.value = false
  }
}

async function submitForgotVerify() {
  if (!forgotIsEmail.value) return
  error.value = ''
  loading.value = true
  try {
    await forgotPasswordVerify(
      forgotEmailOrPhone.value.trim(),
      forgotOtp.value.trim(),
      forgotNewPassword.value
    )
    forgotPasswordChanged.value = true
    forgotStep.value = 3
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'رمز خاطئ أو منتهي' : 'Invalid or expired code')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const url = window.location.href
  const hasMagicLink = url.includes('oobCode=') || url.includes('apiKey=')
  if (!hasMagicLink) return
  try {
    const result = await finishEmailLinkSignIn()
    if (result?.user) {
      if (import.meta.env.DEV) console.log('[Login] Magic link sign-in success', result.user?.email)
      successMessage.value = language.value === 'ar' ? 'تم الدخول!' : 'Logged in!'
      setTimeout(() => router.push('/'), 1500)
    }
  } catch (e) {
    window.history.replaceState({}, document.title, window.location.pathname || '/login')
    error.value = getAuthErrorMessage(e.code, language.value) || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Login] Magic link finish failed', e?.code, e?.message)
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  padding: 40px 40px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.logo { text-align: center; font-size: 36px; font-weight: 700; color: #262626; margin: 0 0 8px; letter-spacing: 1px; }
.tagline { text-align: center; color: #8e8e8e; font-size: 15px; margin: 0 0 28px; }

.firebase-error {
  font-size: 12px; color: #ed4956; background: #fff5f5; padding: 10px; border-radius: 8px; margin-bottom: 16px;
}

.auth-form { display: flex; flex-direction: column; gap: 8px; }

.input {
  width: 100%; padding: 12px 14px; border: 1px solid #dbdbdb; border-radius: 8px;
  font-size: 14px; background: #fafafa; box-sizing: border-box;
}
.input:focus { outline: none; border-color: #8d5a3a; background: #fff; box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.15); }
.input-otp { text-align: center; letter-spacing: 8px; font-size: 18px; }
.otp-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }

.btn-primary {
  width: 100%; padding: 12px; margin-top: 8px; border: none; border-radius: 8px;
  background: linear-gradient(135deg, #8d5a3a 0%, #a6704d 100%); color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-outline {
  width: 100%; padding: 12px; margin-top: 8px; border: 1px solid #dbdbdb; border-radius: 8px;
  background: #fff; color: #262626; font-size: 14px; font-weight: 500; cursor: pointer;
}
.btn-outline:hover { background: #fafafa; }

.btn-text {
  background: none; border: none; color: #8d5a3a; font-size: 13px; font-weight: 500;
  cursor: pointer; padding: 12px 0; margin-top: 4px;
}

.forgot-link { font-size: 12px; color: #00376b; text-decoration: none; margin-top: 12px; text-align: center; }
.forgot-link:hover { text-decoration: underline; }

.divider { display: flex; align-items: center; margin: 20px 0; gap: 16px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #dbdbdb; }
.divider span { font-size: 13px; color: #8e8e8e; font-weight: 500; }

.hint { font-size: 14px; color: #262626; margin: 0 0 4px; text-align: center; }
.hint-small { font-size: 12px; color: #8e8e8e; margin: 0 0 16px; text-align: center; }
.hint.success { color: #009688; }

.error { font-size: 13px; color: #ed4956; text-align: center; margin: 12px 0 0; }

.signup-section {
  margin-top: 28px; padding-top: 24px; border-top: 1px solid #dbdbdb;
  text-align: center; font-size: 14px; color: #262626;
}
.signup-section .sep { margin: 0 6px; color: #8e8e8e; }
.signup-section .link { color: #8d5a3a; font-weight: 600; text-decoration: none; }
.signup-section .link:hover { text-decoration: underline; }
.link-secondary { color: #8e8e8e; font-size: 13px; text-decoration: none; margin-left: 4px; }
[dir="rtl"] .link-secondary { margin-left: 0; margin-right: 4px; }

.recaptcha-hidden { position: absolute; left: -9999px; }

.toast {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 1000;
  background: #009688; color: #fff;
}

@media (max-width: 480px) {
  .auth-card { padding: 32px 24px 20px; }
}
</style>
