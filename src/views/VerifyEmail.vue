<template>
  <div class="auth-page" :dir="dir">
    <div class="auth-container">
      <div class="auth-box">
        <h1 class="logo">MOTEX</h1>
        <p class="subtitle">{{ language === 'ar' ? 'تأكيد البريد' : 'Verify email' }}</p>

        <template v-if="verifyEmail">
          <p class="info">{{ language === 'ar' ? 'أدخلي الرمز المرسل إلى بريدك' : 'Enter the code sent to your email' }}</p>
          <form class="auth-form" @submit.prevent="handleVerify">
            <input
              v-model="otp"
              type="text"
              inputmode="numeric"
              :placeholder="language === 'ar' ? 'الرمز (6 أرقام)' : 'Code (6 digits)'"
              class="input"
              maxlength="6"
              required
            />
            <p v-if="error" class="error">{{ error }}</p>
            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تأكيد' : 'Verify') }}
            </button>
          </form>
        </template>
        <template v-else>
          <p class="info">{{ language === 'ar' ? 'استخدمي صفحة التسجيل أو الدخول' : 'Use Register or Login page' }}</p>
          <router-link to="/login" class="login-btn">{{ language === 'ar' ? 'تسجيل دخول' : 'Log in' }}</router-link>
          <router-link to="/register-email" class="back-login">{{ language === 'ar' ? 'إنشاء حساب' : 'Sign up' }}</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { registerVerify } from '../api/auth'
import { setBackendAuth } from '../firebase/auth'

const route = useRoute()
const router = useRouter()
const { language } = useLanguage()

const verifyEmail = ref('')
const otp = ref('')
const loading = ref(false)
const error = ref('')

const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

onMounted(() => {
  const email = route.query.email || sessionStorage.getItem('register_email')
  if (email) {
    verifyEmail.value = email
  }
})

async function handleVerify() {
  if (!verifyEmail.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await registerVerify(verifyEmail.value, otp.value.trim())
    if (res.data?.token && res.data?.user) {
      setBackendAuth(res.data.user, res.data.token)
      sessionStorage.removeItem('register_email')
      router.push('/')
    } else {
      throw new Error(res.data?.message || 'Verification failed')
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'رمز خاطئ أو منتهي' : 'Invalid or expired code')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* مثل RegisterEmail تقريباً */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  direction: rtl;
}
.auth-container {
  width: 100%;
  max-width: 400px;
}
.auth-box {
  background: white;
  border-radius: 16px;
  padding: 30px 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.logo {
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  color: #8d5a3a;
  margin-bottom: 8px;
}
.subtitle {
  text-align: center;
  color: #888;
  margin-bottom: 20px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 4px;
}
input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.info {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.error {
  color: #ed4956;
  font-size: 13px;
  margin-bottom: 8px;
}

.login-btn,
.back-login {
  display: block;
  text-align: center;
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.login-btn {
  border: none;
  background: #8d5a3a;
  color: #fff;
}

.back-login {
  border: 1px solid #ddd;
  background: #fff;
  color: #8d5a3a;
}
</style>
