<template>
  <div class="auth-page" :dir="dir">
    <div id="recaptcha-container-register" class="recaptcha-hidden"></div>
    <div class="auth-card">
      <h1 class="logo">MOTEX</h1>
      <p class="tagline">{{ t('tagline') }}</p>

      <p v-if="!hasConfig" class="firebase-error">{{ t('firebaseNotConfigured') }}</p>
      <p v-else-if="firebaseError" class="firebase-error">{{ firebaseError }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <!-- Step 1: Enter email or phone -->
      <form v-if="step === 1" @submit.prevent="sendVerification" class="auth-form">
        <p class="hint">{{ t('enterEmailOrPhone') }}</p>
        <p class="hint-small">{{ t('otpSentHint') }}</p>
        <input
          v-model="emailOrPhone"
          type="text"
          :placeholder="t('emailOrPhonePlaceholder')"
          class="input"
          required
          autocomplete="tel email"
          @focus="error = ''; firebaseError = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('sending') : t('sendCode') }}
        </button>
      </form>

      <!-- Step 2a: Enter OTP (phone) -->
      <form v-else-if="step === 2 && isPhone" @submit.prevent="verifyPhoneOtp" class="auth-form">
        <p class="hint">{{ t('enterCodeSent') }}</p>
        <p class="hint-small">{{ t('viaSms') }}</p>
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
        <button type="button" class="btn-text" @click="step = 1; otp = ''; error = ''">
          {{ t('changeNumber') }}
        </button>
      </form>

      <!-- Step 2b: Email OTP input + resend + countdown -->
      <form v-else-if="step === 2 && !isPhone" @submit.prevent="verifyEmailOtpSubmit" class="auth-form">
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
        <button type="button" class="btn-text" @click="step = 1; otp = ''; error = ''">
          {{ t('useDifferentEmail') }}
        </button>
      </form>

      <!-- Step 3: Set password after email OTP verified -->
      <form v-else-if="step === 3" @submit.prevent="completeRegister" class="auth-form">
        <p class="hint">{{ t('setPassword') }}</p>
        <input
          v-model="password"
          type="password"
          :placeholder="t('passwordPlaceholder')"
          class="input"
          minlength="6"
          required
          @focus="error = ''"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('creating') : t('createAccount') }}
        </button>
      </form>

      <div class="signup-section">
        <span>{{ t('haveAccount') }}</span>
        <router-link to="/login" class="link">{{ t('logIn') }}</router-link>
      </div>
      <div class="signup-section">
        <router-link to="/register-email" class="link-secondary">{{ t('signUpWithPassword') }}</router-link>
      </div>
    </div>

    <div v-if="toast" class="toast success">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { hasConfig } from '../firebase/config'
import { sendEmailOtp, verifyEmailOtp, registerComplete } from '../api/auth'
import { setBackendAuth } from '../firebase/auth'

const router = useRouter()
const { language } = useLanguage()
const { loginWithPhone, getAuthErrorMessage } = useFirebaseAuth()

const step = ref(1)
const emailOrPhone = ref('')
const otp = ref('')
const password = ref('')
const registerToken = ref('')
const otpResendCooldown = ref(0)
let resendTimer = null
const loading = ref(false)
const error = ref('')
const firebaseError = ref('')
const successMessage = ref('')
const toast = ref('')
let phoneConfirmation = null

const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

const isPhone = computed(() => {
  const v = emailOrPhone.value.trim()
  if (!v || v.includes('@')) return false
  return /^[\d+][\d\s-]*\d$/.test(v.replace(/\s/g, ''))
})

const t = (key) => {
  const strings = {
    tagline: { ar: 'إنشاء حساب', en: 'Create account' },
    firebaseNotConfigured: { ar: 'Firebase غير مُهيأ. أضف قيم VITE_FIREBASE_* في .env', en: 'Firebase not configured. Add VITE_FIREBASE_* to .env' },
    enterEmailOrPhone: { ar: 'أدخلي بريدك الإلكتروني أو رقم هاتفك', en: 'Enter your email or phone number' },
    otpSentHint: { ar: 'إيميل → رمز في البريد | هاتف → رمز SMS', en: 'Email → code in inbox | Phone → SMS code' },
    emailOrPhonePlaceholder: { ar: 'البريد الإلكتروني أو رقم الهاتف', en: 'Email or phone number' },
    sending: { ar: 'جاري الإرسال...', en: 'Sending...' },
    sendCode: { ar: 'إرسال الرمز', en: 'Send code' },
    enterCodeSent: { ar: 'أدخلي الرمز الذي وصلك', en: 'Enter the code you received' },
    viaSms: { ar: 'عبر الرسائل النصية', en: 'via SMS' },
    code6Digits: { ar: 'الرمز (6 أرقام)', en: 'Code (6 digits)' },
    verifying: { ar: 'جاري التحقق...', en: 'Verifying...' },
    confirm: { ar: 'تأكيد', en: 'Confirm' },
    changeNumber: { ar: '← تغيير الرقم', en: '← Change number' },
    checkEmail: { ar: 'تحققي من بريدك', en: 'Check your email' },
    clickLinkToComplete: { ar: 'اضغطي على الرابط في الرسالة لإكمال التسجيل', en: 'Click the link in the email to complete sign-up' },
    useDifferentEmail: { ar: '← استخدام بريد آخر', en: '← Use different email' },
    resendCode: { ar: 'إعادة إرسال الرمز', en: 'Resend code' },
    resendIn: { ar: 'إعادة الإرسال بعد ', en: 'Resend in ' },
    checkSpamToo: { ar: 'إن لم تصلك الرسالة، تحققي من مجلد السبام', en: 'If you don\'t receive it, check spam folder' },
    setPassword: { ar: 'اختيار كلمة المرور', en: 'Choose your password' },
    passwordPlaceholder: { ar: 'كلمة المرور (6 أحرف على الأقل)', en: 'Password (min 6 characters)' },
    creating: { ar: 'جاري إنشاء الحساب...', en: 'Creating account...' },
    createAccount: { ar: 'إنشاء الحساب', en: 'Create account' },
    haveAccount: { ar: 'لديك حساب؟', en: 'Have an account?' },
    logIn: { ar: 'تسجيل الدخول', en: 'Log in' },
    signUpWithPassword: { ar: 'التسجيل بالبريد وكلمة المرور', en: 'Sign up with email & password' }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
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

async function sendVerification() {
  const v = (emailOrPhone.value && String(emailOrPhone.value).trim()) || ''
  if (!v) {
    error.value = language.value === 'ar' ? 'أدخلي البريد أو رقم الهاتف' : 'Enter your email or phone number'
    return
  }
  error.value = ''
  firebaseError.value = ''
  loading.value = true
  try {
    if (isPhone.value) {
      phoneConfirmation = await loginWithPhone(v)
      step.value = 2
      otp.value = ''
    } else {
      if (!v.includes('@')) {
        error.value = language.value === 'ar' ? 'أدخلي بريداً إلكترونياً صالحاً' : 'Please enter a valid email address'
        loading.value = false
        return
      }
      await sendEmailOtp(v.toLowerCase(), 'register')
      step.value = 2
      otp.value = ''
      startResendCooldown()
    }
  } catch (e) {
    if (e.response?.status === 429) {
      error.value = e.response?.data?.message || (language.value === 'ar' ? 'انتظري قليلاً قبل إعادة الإرسال' : 'Please wait before resending')
      if (e.response?.data?.retryAfterSeconds) startResendCooldown(e.response.data.retryAfterSeconds)
    } else if (e.code === 'auth/configuration-not-found') firebaseError.value = t('firebaseNotConfigured')
    else error.value = e.response?.data?.message || getAuthErrorMessage(e.code, language.value) || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Register] sendVerification', e?.response?.data, e?.message)
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
    await sendEmailOtp(v, 'register')
    startResendCooldown()
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (e.response?.status === 429 && e.response?.data?.retryAfterSeconds) startResendCooldown(e.response.data.retryAfterSeconds)
  } finally {
    loading.value = false
  }
}

async function verifyEmailOtpSubmit() {
  const code = (otp.value && String(otp.value).trim()) || ''
  const emailVal = (emailOrPhone.value && String(emailOrPhone.value).trim()).toLowerCase() || ''
  if (!code || !emailVal) {
    error.value = language.value === 'ar' ? 'أدخلي الرمز' : 'Enter the code'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const res = await verifyEmailOtp(emailVal, code, 'register')
    if (res.data?.registerToken) {
      registerToken.value = res.data.registerToken
      step.value = 3
      password.value = ''
    } else {
      error.value = language.value === 'ar' ? 'حدث خطأ' : 'Error'
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'رمز خاطئ أو منتهي' : 'Invalid or expired code')
  } finally {
    loading.value = false
  }
}

async function completeRegister() {
  const pwd = (password.value && String(password.value)) || ''
  if (pwd.length < 6) {
    error.value = language.value === 'ar' ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'
    return
  }
  if (!registerToken.value) {
    error.value = language.value === 'ar' ? 'انتهت الجلسة. أعدي التحقق من البريد.' : 'Session expired. Verify email again.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const res = await registerComplete(registerToken.value, pwd)
    if (res.data?.token && res.data?.user) {
      setBackendAuth(res.data.user, res.data.token)
      toast.value = language.value === 'ar' ? 'تم إنشاء الحساب!' : 'Account created!'
      setTimeout(() => router.push('/'), 1500)
    } else {
      error.value = res.data?.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
  } finally {
    loading.value = false
  }
}

async function verifyPhoneOtp() {
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
    toast.value = language.value === 'ar' ? 'تم إنشاء الحساب!' : 'Account created!'
    setTimeout(() => router.push('/'), 1500)
  } catch (e) {
    error.value = getAuthErrorMessage(e.code, language.value) || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
    if (import.meta.env.DEV) console.error('[Register] verifyPhoneOtp', e?.code, e?.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Email OTP flow no longer uses magic link
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

.logo { text-align: center; font-size: 36px; font-weight: 700; color: #262626; margin: 0 0 8px; }
.tagline { text-align: center; color: #8e8e8e; font-size: 15px; margin: 0 0 24px; }

.firebase-error, .error {
  font-size: 13px; color: #ed4956; background: #fff5f5; padding: 10px; border-radius: 8px; margin-bottom: 12px;
}

.success { font-size: 13px; color: #009688; margin-bottom: 12px; }

.auth-form { display: flex; flex-direction: column; gap: 8px; }

.input {
  width: 100%; padding: 12px 14px; border: 1px solid #dbdbdb; border-radius: 8px;
  font-size: 14px; background: #fafafa; box-sizing: border-box;
}
.input:focus { outline: none; border-color: #8d5a3a; background: #fff; }
.input-otp { text-align: center; letter-spacing: 8px; font-size: 18px; }

.btn-primary {
  width: 100%; padding: 12px; margin-top: 8px; border: none; border-radius: 8px;
  background: linear-gradient(135deg, #8d5a3a 0%, #a6704d 100%); color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-text {
  background: none; border: none; color: #8d5a3a; font-size: 13px; font-weight: 500;
  cursor: pointer; padding: 12px 0; margin-top: 4px;
}

.hint { font-size: 14px; color: #262626; margin: 0 0 4px; text-align: center; }
.hint-small { font-size: 12px; color: #8e8e8e; margin: 0 0 16px; text-align: center; }
.hint.success { color: #009688; }
.otp-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }

.signup-section {
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #dbdbdb;
  text-align: center; font-size: 14px; color: #262626;
}
.signup-section .link { color: #8d5a3a; font-weight: 600; text-decoration: none; }
.signup-section .link:hover { text-decoration: underline; }
.link-secondary { color: #8e8e8e; font-size: 13px; text-decoration: none; }
.link-secondary:hover { text-decoration: underline; }

.recaptcha-hidden { position: absolute; left: -9999px; }

.toast {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 1000;
  background: #009688; color: #fff;
}
</style>
