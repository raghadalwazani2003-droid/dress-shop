
<template>
  <header class="header" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <div class="header-container">
      <!-- Logo/Brand -->
      <div class="logo-section">
        <button class="logo-btn" @click="goHome">
          <span class="logo-text">MOTEX</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="nav-links">
        <button 
          class="nav-link"
          @click="goHome"
        >
          {{ language === 'ar' ? '🏠 الرئيسية' : '🏠 Home' }}
        </button>
        <button 
          class="nav-link"
          @click="goToCategory('evening')"
        >
          {{ language === 'ar' ? '👗 السهرة' : '👗 Evening' }}
        </button>
        <button 
          class="nav-link"
          @click="goToCategory('winter')"
        >
          {{ language === 'ar' ? '❄️ الشتاء' : '❄️ Winter' }}
        </button>
      </nav>

      <!-- Search Bar -->
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="language === 'ar' ? 'ابحث عن فستان...' : 'Search dresses...'"
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button class="search-btn" @click="performSearch" :title="language === 'ar' ? 'بحث' : 'Search'">
          ❔
        </button>
      </div>

      <!-- Right Section: Actions -->
      <div class="header-actions">
        <!-- Language Toggle -->
        <button 
          class="action-btn lang-btn"
          @click="toggleLanguage"
          :title="language === 'ar' ? 'English' : 'العربية'"
        >
          {{ language === 'ar' ? '🇬🇧 EN' : '🇸🇦 AR' }}
        </button>

        <!-- Login/User -->
        <div class="user-section">
          <template v-if="currentUser">
            <span class="user-name">
              {{ currentUser?.email || currentUser?.phone || currentUser?.name || '' }}
            </span>
            <button class="action-btn logout-btn" @click="logoutUser">
              {{ language === 'ar' ? '🚪 خروج' : '🚪 Logout' }}
            </button>
          </template>
          <template v-else>
            <button class="action-btn login-btn" @click="goLogin">
              {{ language === 'ar' ? '📝 تسجيل دخول' : '📝 Sign In' }}
            </button>
          </template>
        </div>

        <!-- Favorites Button -->
        <button 
          class="action-btn favorites-btn"
          @click="goFavorites"
        >
          ❤️
          <span class="badge">{{ favCount }}</span>
        </button>

        <!-- Cart Button -->
        <button 
          class="action-btn cart-btn"
          @click="goCart"
        >
          🛒
          <span class="badge">{{ cartCount }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useFirebaseAuth } from '../composables/useFirebaseAuth'

const router = useRouter()
const { language, setLanguage } = useLanguage()
const { currentUser, logout } = useFirebaseAuth()

const cartItems = ref([])
const favItems = ref([])
const searchQuery = ref('')

const cartCount = computed(() => cartItems.value.length)
const favCount = computed(() => favItems.value.length)

onMounted(() => {
  loadCartAndFavorites()
  document.documentElement.dir = language.value === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = language.value
})

watch(language, (newLang) => {
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = newLang
})

function loadCartAndFavorites() {
  cartItems.value = JSON.parse(localStorage.getItem('cart') || '[]')
  favItems.value = JSON.parse(localStorage.getItem('favorites') || '[]')
}

function toggleLanguage() {
  setLanguage(language.value === 'ar' ? 'en' : 'ar')
}

function goHome() {
  router.push('/')
}

function goToCategory(cat) {
  router.push(`/?category=${cat}`)
}

function goLogin() {
  router.push('/login')
}

async function logoutUser() {
  await logout()
  router.push('/')
}

function goCart() {
  router.push('/cart')
}

function goFavorites() {
  router.push('/favorites')
}

function performSearch() {
  const trimmed = searchQuery.value.trim()
  if (trimmed) {
    router.push({ 
      path: '/', 
      query: { search: trimmed } 
    })
  }
}
</script>

<style scoped>
/* نفس ستايلك مع تعديل اسم currentUser → user-name/email */
.header {
  background: linear-gradient(135deg, #8d5a3a 0%, #a6704d 100%);
  color: white;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.header-container {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 16px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Logo/Brand */
.logo-section {
  flex-shrink: 0;
}

.logo-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-btn:hover {
  transform: scale(1.08) rotate(-2deg);
}

.logo-text {
  font-size: 26px;
  font-weight: 800;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
}

.nav-link {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Search Bar */
.search-bar {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 200px;
  max-width: 450px;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.97);
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: #aaa;
}

.search-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  position: relative;
  backdrop-filter: blur(5px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.lang-btn {
  min-width: 75px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 0 8px;
}

.login-btn {
  min-width: 100px;
}

.logout-btn {
  min-width: 95px;
}

.favorites-btn,
.cart-btn {
  font-size: 18px;
  position: relative;
  min-width: 48px;
  justify-content: center;
  padding: 10px 12px;
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4444 100%);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 3px 10px rgba(255, 68, 68, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.95);
}

/* الميديا كويريز كما كانت عندك (قصّيتها للتركيز) */
@media (max-width: 1024px) {
  .header-container {
    gap: 16px;
    padding: 14px 15px;
  }
  .logo-text {
    font-size: 24px;
  }
  .nav-links {
    gap: 8px;
  }
  .nav-link {
    padding: 8px 11px;
    font-size: 12px;
    border-radius: 6px;
  }
  .search-bar {
    max-width: 320px;
    gap: 6px;
  }
  .search-input {
    padding: 9px 14px;
    font-size: 13px;
  }
  .search-btn {
    padding: 9px 12px;
    font-size: 15px;
  }
  .action-btn {
    padding: 8px 11px;
    font-size: 13px;
  }
  .lang-btn {
    min-width: 70px;
  }
  .login-btn,
  .logout-btn {
    min-width: 85px;
  }
  .favorites-btn,
  .cart-btn {
    font-size: 16px;
    min-width: 44px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 10px;
  }
  .logo-section {
    order: 1;
    flex-basis: auto;
  }
  .logo-text {
    font-size: 22px;
  }
  .nav-links {
    order: 3;
    flex-basis: 100%;
    gap: 6px;
    justify-content: space-between;
  }
  .nav-link {
    flex: 1;
    padding: 7px 8px;
    font-size: 11px;
    text-align: center;
  }
  .search-bar {
    order: 2;
    flex-basis: 100%;
    max-width: none;
    gap: 5px;
  }
  .search-input {
    padding: 8px 12px;
    font-size: 12px;
  }
  .search-btn {
    padding: 8px 10px;
    font-size: 14px;
  }
  .header-actions {
    order: 4;
    flex-basis: 100%;
    margin-left: 0;
    justify-content: space-around;
    gap: 8px;
  }
  .user-section {
    gap: 4px;
    flex: 1;
    justify-content: center;
  }
  .user-name {
    font-size: 11px;
    padding: 0 3px;
  }
  .action-btn {
    padding: 7px 9px;
    font-size: 11px;
    flex: 0 0 auto;
  }
  .lang-btn {
    min-width: 60px;
  }
  .login-btn,
  .logout-btn {
    min-width: 75px;
  }
  .favorites-btn,
  .cart-btn {
    font-size: 14px;
    min-width: 40px;
    padding: 7px 8px;
  }
  .badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: -8px;
    right: -8px;
  }
}

@media (max-width: 480px) {
  .header-container {
    gap: 8px;
    padding: 10px 8px;
  }
  .logo-text {
    font-size: 20px;
  }
  .nav-links {
    flex-basis: 100%;
    order: 3;
  }
  .nav-link {
    padding: 6px 6px;
    font-size: 10px;
  }
  .search-bar {
    order: 2;
    flex-basis: 100%;
    gap: 4px;
  }
  .search-input {
    padding: 7px 10px;
    font-size: 12px;
  }
  .header-actions {
    order: 4;
    flex-basis: 100%;
    gap: 6px;
  }
  .action-btn {
    padding: 6px 8px;
    font-size: 10px;
  }
  .user-name {
    display: none;
  }
  .lang-btn {
    min-width: 50px;
  }
  .login-btn,
  .logout-btn {
    min-width: 65px;
  }
  .favorites-btn,
  .cart-btn {
    font-size: 13px;
    min-width: 35px;
    padding: 6px 6px;
  }
}
</style>
