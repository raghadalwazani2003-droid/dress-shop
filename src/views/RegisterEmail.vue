<template>
  <div class="auth-page" :dir="dir">
    <div class="auth-card">
      <h1 class="logo">MOTEX</h1>
      <p class="tagline">{{ language === 'ar' ? 'إنشاء حساب جديد' : 'Create account' }}</p>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="success">{{ message }}</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <input
          v-model="email"
          type="email"
          :placeholder="language === 'ar' ? 'البريد الإلكتروني' : 'Email'"
          class="input"
          required
          @focus="error = ''"
        />
        <input
          v-model="password"
          type="password"
          :placeholder="language === 'ar' ? 'كلمة المرور (6 أحرف)' : 'Password (min 6)'"
          class="input"
          required
          minlength="6"
          @focus="error = ''"
        />
        <input
          v-model="name"
          type="text"
          :placeholder="language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'"
          class="input"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? (language === 'ar' ? 'جاري التسجيل...' : 'Signing up...') : (language === 'ar' ? 'إنشاء حساب' : 'Sign Up') }}
        </button>
      </form>

      <div class="signup-section">
        <span>{{ language === 'ar' ? 'لديك حساب؟' : 'Have an account?' }}</span>
        <router-link to="/login" class="link">{{ language === 'ar' ? 'تسجيل دخول' : 'Log in' }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'
import { registerStart } from '../api/auth'

const router = useRouter()
const { language } = useLanguage()
const { registerWithEmail } = useFirebaseAuth()

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

const dir = computed(() => (language.value === 'ar' ? 'rtl' : 'ltr'))

async function handleRegister() {
  error.value = ''
  message.value = ''
  loading.value = true

  try {
    const res = await registerStart(email.value.trim(), password.value)
    if (res.data?.message) {
      message.value = res.data.message
      sessionStorage.setItem('register_email', email.value.trim())
      setTimeout(() => router.push({ path: '/verify-email', query: { email: email.value.trim() } }), 1000)
      return
    }
    throw new Error(res.data?.message || 'Failed')
  } catch (e) {
    if (e.response?.status === 400 && e.response?.data?.message) {
      error.value = e.response.data.message
      return
    }
    if (e.code === 'ERR_NETWORK' || e.response?.status >= 500) {
      try {
        await registerWithEmail(email.value.trim(), password.value, name.value.trim())
        message.value = language.value === 'ar' ? 'تم إنشاء الحساب!' : 'Account created!'
        setTimeout(() => router.push('/'), 1500)
      } catch (fbErr) {
        const msg = fbErr.code === 'auth/configuration-not-found'
          ? (language.value === 'ar' ? 'تفعيل المصادقة في Firebase Console' : 'Enable Auth in Firebase Console')
          : fbErr.code === 'auth/email-already-in-use'
            ? (language.value === 'ar' ? 'الإيميل مستخدم بالفعل' : 'Email already in use')
            : fbErr.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
        error.value = msg
      }
      loading.value = false
      return
    }
    error.value = e.response?.data?.message || e.message || (language.value === 'ar' ? 'حدث خطأ' : 'Error')
  } finally {
    loading.value = false
  }
}
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

.logo {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 8px;
}

.tagline {
  text-align: center;
  color: #8e8e8e;
  font-size: 15px;
  margin: 0 0 24px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #8d5a3a;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #8d5a3a 0%, #a6704d 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  font-size: 13px;
  color: #ed4956;
  margin-bottom: 12px;
}

.success {
  font-size: 13px;
  color: #009688;
  margin-bottom: 12px;
}

.signup-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #dbdbdb;
  text-align: center;
  font-size: 14px;
}

.signup-section .link {
  color: #8d5a3a;
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
}

[dir="rtl"] .signup-section .link {
  margin-left: 0;
  margin-right: 6px;
}
</style>
