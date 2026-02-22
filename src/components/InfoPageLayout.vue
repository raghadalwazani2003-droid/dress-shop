<template>
  <div class="info-page" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <div class="info-container">
      <h1 class="info-title">{{ title }}</h1>
      <div class="info-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'

defineProps({
  title: { type: String, required: true }
})

const { language } = useLanguage()
</script>

<style scoped>
.info-page {
  min-height: 60vh;
  padding: 40px 24px 60px;
  background: linear-gradient(180deg, #fafafa 0%, #f5f2ef 100%);
}

.info-container {
  max-width: 720px;
  margin: 0 auto;
}

.info-title {
  font-size: 28px;
  font-weight: 700;
  color: #8d5a3a;
  margin: 0 0 28px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(141, 90, 58, 0.2);
}

.info-content {
  font-size: 16px;
  line-height: 1.75;
  color: #3d3632;
}

.info-content :deep(p) {
  margin: 0 0 16px 0;
}

.info-content :deep(p:last-child) {
  margin-bottom: 0;
}

.info-content :deep(ul) {
  margin: 0 0 16px 0;
  padding-inline-start: 24px;
}

.info-content :deep(li) {
  margin-bottom: 8px;
}

.info-content :deep(.lead) {
  font-size: 18px;
  color: #4a4541;
  margin-bottom: 24px;
}

.info-content :deep(.policy-ok) {
  color: #2e7d32;
  margin-bottom: 8px;
}

.info-content :deep(.policy-no) {
  color: #6b6560;
}

@media (max-width: 600px) {
  .info-page {
    padding: 28px 16px 48px;
  }

  .info-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .info-content {
    font-size: 15px;
  }
}
</style>
