<template>
  <div class="auth-page">
    <h1>Auth</h1>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>

    <!-- Magic link needs email (opened in different browser) -->
    <section v-if="needsEmailForLink">
      <h2>Complete Sign-In</h2>
      <p>Enter the email address you used to request the sign-in link.</p>
      <form @submit.prevent="handleCompleteMagicLink">
        <input v-model="magicLinkCompleteEmail" type="email" placeholder="Email" required />
        <button type="submit" :disabled="loading">Complete Sign-In</button>
        <button type="button" @click="needsEmailForLink = false; error = ''">Cancel</button>
      </form>
    </section>

    <!-- 1. Signup with Email -->
    <section>
      <h2>Signup (Email + Password)</h2>
      <form @submit.prevent="handleSignupEmail">
        <input v-model="signupEmail" type="email" placeholder="Email" />
        <input v-model="signupPassword" type="password" placeholder="Password" />
        <input v-model="signupName" type="text" placeholder="Name (optional)" />
        <button type="submit" :disabled="loading">Sign Up</button>
      </form>
    </section>

    <!-- 2. Signup with Magic Link -->
    <section>
      <h2>Signup (Magic Link)</h2>
      <form @submit.prevent="handleSignupMagicLink">
        <input v-model="magicLinkEmail" type="email" placeholder="Email" />
        <button type="submit" :disabled="loading">Send Magic Link</button>
      </form>
    </section>

    <!-- 3. Login with Email -->
    <section>
      <h2>Login (Email + Password)</h2>
      <form @submit.prevent="handleLoginEmail">
        <input v-model="loginEmail" type="email" placeholder="Email" />
        <input v-model="loginPassword" type="password" placeholder="Password" />
        <button type="submit" :disabled="loading">Log In</button>
      </form>
    </section>

    <!-- 4. Login with Magic Link -->
    <section>
      <h2>Login (Magic Link)</h2>
      <form @submit.prevent="handleLoginMagicLink">
        <input v-model="loginMagicEmail" type="email" placeholder="Email" />
        <button type="submit" :disabled="loading">Send Magic Link</button>
      </form>
    </section>

    <!-- 5. Forgot Password -->
    <section>
      <h2>Forgot Password</h2>
      <form v-if="forgotStep === 1" @submit.prevent="handleForgotPassword">
        <input v-model="forgotEmailOrPhone" type="text" placeholder="Email or phone (+962...)" />
        <button type="submit" :disabled="loading">Send Reset / OTP</button>
      </form>
      <template v-else-if="forgotStep === 2 && forgotIsPhone">
        <p>Enter OTP sent to your phone:</p>
        <form @submit.prevent="handleVerifyForgotOtp">
          <input v-model="forgotOtp" type="text" inputmode="numeric" placeholder="6-digit code" maxlength="6" />
          <button type="submit" :disabled="loading">Verify</button>
        </form>
      </template>
      <template v-else-if="forgotStep === 2 && !forgotIsPhone">
        <p>Check your email for the password reset link.</p>
      </template>
    </section>

    <!-- 6. Phone OTP Signup / Login -->
    <section>
      <h2>Phone OTP (Signup / Login)</h2>
      <form v-if="phoneStep === 1" @submit.prevent="handleSendPhoneOtp">
        <input v-model="phoneNumber" type="tel" placeholder="Phone (+962791234567)" />
        <button type="submit" :disabled="loading">Send OTP</button>
      </form>
      <form v-else @submit.prevent="handleVerifyPhoneOtp">
        <input v-model="phoneOtp" type="text" inputmode="numeric" placeholder="6-digit code" maxlength="6" />
        <button type="submit" :disabled="loading">Verify OTP</button>
        <button type="button" @click="phoneStep = 1; phoneOtp = ''; error = ''">Change Number</button>
      </form>
    </section>

    <button v-if="currentUser" @click="handleLogout">Logout</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const {
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
} = useAuth()

const loading = ref(false)
const error = ref('')
const success = ref('')

const signupEmail = ref('')
const signupPassword = ref('')
const signupName = ref('')
const magicLinkEmail = ref('')
const loginEmail = ref('')
const loginPassword = ref('')
const loginMagicEmail = ref('')
const forgotEmailOrPhone = ref('')
const forgotOtp = ref('')
const forgotStep = ref(1)
const phoneNumber = ref('')
const phoneOtp = ref('')
const phoneStep = ref(1)
const needsEmailForLink = ref(false)
const magicLinkCompleteEmail = ref('')

const forgotIsPhone = computed(() => {
  const v = forgotEmailOrPhone.value.trim()
  return v && !v.includes('@') && /^[\d+][\d\s-]*\d$/.test(v.replace(/\s/g, ''))
})

function clearMessages() {
  error.value = ''
  success.value = ''
}

function handleErr(e) {
  error.value = e?.message || e?.code || String(e)
}

async function handleSignupEmail() {
  clearMessages()
  const email = signupEmail.value?.trim?.() ?? ''
  const pw = signupPassword.value ?? ''
  if (!email) { error.value = 'Email is required'; return }
  if (!pw) { error.value = 'Password is required'; return }
  loading.value = true
  try {
    await signupWithEmail(email, pw, signupName.value?.trim?.() ?? '')
    success.value = 'Account created!'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleSignupMagicLink() {
  clearMessages()
  const email = magicLinkEmail.value?.trim?.() ?? ''
  if (!email) { error.value = 'Email is required'; return }
  loading.value = true
  try {
    await signupWithEmailMagicLink(email)
    success.value = 'Magic link sent! Check your email.'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleLoginEmail() {
  clearMessages()
  const email = loginEmail.value?.trim?.() ?? ''
  const pw = loginPassword.value ?? ''
  if (!email) { error.value = 'Email is required'; return }
  if (!pw) { error.value = 'Password is required'; return }
  loading.value = true
  try {
    await loginWithEmail(email, pw)
    success.value = 'Logged in!'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleLoginMagicLink() {
  clearMessages()
  const email = loginMagicEmail.value?.trim?.() ?? ''
  if (!email) { error.value = 'Email is required'; return }
  loading.value = true
  try {
    await loginWithEmailMagicLink(email)
    success.value = 'Magic link sent! Check your email.'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleForgotPassword() {
  clearMessages()
  const val = forgotEmailOrPhone.value?.trim?.() ?? ''
  if (!val) { error.value = 'Email or phone is required'; return }
  loading.value = true
  try {
    await forgotPassword(val)
    forgotStep.value = 2
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleVerifyForgotOtp() {
  clearMessages()
  const code = forgotOtp.value?.trim?.() ?? ''
  if (!code) { error.value = 'OTP is required'; return }
  loading.value = true
  try {
    await verifyPhoneOtp(code)
    success.value = 'Signed in via phone.'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleSendPhoneOtp() {
  clearMessages()
  const phone = phoneNumber.value?.trim?.() ?? ''
  if (!phone) { error.value = 'Phone number is required'; return }
  loading.value = true
  try {
    await sendPhoneOtp(phone)
    phoneStep.value = 2
    phoneOtp.value = ''
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleVerifyPhoneOtp() {
  clearMessages()
  const code = phoneOtp.value?.trim?.() ?? ''
  if (!code) { error.value = 'OTP is required'; return }
  loading.value = true
  try {
    await verifyPhoneOtp(code)
    success.value = 'Signed in!'
  } catch (e) { handleErr(e) }
  finally { loading.value = false }
}

async function handleLogout() {
  clearMessages()
  try {
    await logout()
    success.value = 'Logged out.'
  } catch (e) { handleErr(e) }
}

async function handleCompleteMagicLink() {
  const email = magicLinkCompleteEmail.value?.trim?.() ?? ''
  if (!email) { error.value = 'Email is required'; return }
  clearMessages()
  loading.value = true
  try {
    const result = await finishEmailLinkSignIn(email)
    if (result?.user) {
      success.value = 'Signed in via magic link!'
      needsEmailForLink.value = false
    } else if (result?.needsEmail) {
      needsEmailForLink.value = true
    }
  } catch (e) {
    handleErr(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const url = window.location.href
  if (!url.includes('oobCode=') && !url.includes('apiKey=')) return
  loading.value = true
  try {
    const result = await finishEmailLinkSignIn()
    if (result?.user) {
      success.value = 'Signed in via magic link!'
    } else if (result?.needsEmail) {
      needsEmailForLink.value = true
    }
  } catch (e) {
    window.history.replaceState({}, document.title, window.location.pathname || '/auth')
    handleErr(e)
  } finally {
    loading.value = false
  }
})
</script>
