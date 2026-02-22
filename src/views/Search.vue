<template>
  <div class="info-page search-page" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <div class="info-container">
      <h1 class="info-title">{{ t('title') }}</h1>
      <form class="search-form" @submit.prevent="goSearch">
        <input
          v-model="query"
          type="search"
          :placeholder="t('placeholder')"
          class="search-input"
          autofocus
        />
        <button type="submit" class="search-btn">{{ t('search') }}</button>
      </form>
      <p class="search-hint">{{ t('hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { language } = useLanguage()
const query = ref('')

const t = (key) => {
  const strings = {
    title: { ar: 'بحث', en: 'Search' },
    placeholder: { ar: 'ابحث عن فستان...', en: 'Search for a dress...' },
    search: { ar: 'بحث', en: 'Search' },
    hint: { ar: 'ستظهر النتائج في الصفحة الرئيسية.', en: 'Results will appear on the home page.' }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}

function goSearch() {
  const q = query.value?.trim()
  router.push({ path: '/', query: q ? { search: q } : {} })
}
</script>

<style scoped>
.search-page {
  min-height: 60vh;
  padding: 40px 24px 60px;
  background: linear-gradient(180deg, #fafafa 0%, #f5f2ef 100%);
}

.info-container {
  max-width: 560px;
  margin: 0 auto;
}

.info-title {
  font-size: 28px;
  font-weight: 700;
  color: #8d5a3a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(141, 90, 58, 0.2);
}

.search-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 14px 18px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #8d5a3a;
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.15);
}

.search-btn {
  padding: 14px 24px;
  background: #8d5a3a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.search-btn:hover {
  background: #7a4a2d;
}

.search-hint {
  font-size: 14px;
  color: #6b6560;
}

@media (max-width: 600px) {
  .search-form {
    flex-direction: column;
  }
}
</style>
