<template>
  <InfoPageLayout :title="t('title')">
    <p class="lead">{{ t('lead') }}</p>
  </InfoPageLayout>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'
import InfoPageLayout from '../components/InfoPageLayout.vue'

const { language } = useLanguage()

const t = (key) => {
  const strings = {
    title: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    lead: {
      ar: 'جميع الطلبات تخضع لتأكيد هاتفي قبل الإرسال.',
      en: 'All orders are subject to phone confirmation before shipping.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>
