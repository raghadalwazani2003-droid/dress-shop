<template>
  <InfoPageLayout :title="t('title')">
    <p class="lead">{{ t('lead') }}</p>
    <p>{{ t('body') }}</p>
  </InfoPageLayout>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'
import InfoPageLayout from '../components/InfoPageLayout.vue'

const { language } = useLanguage()

const t = (key) => {
  const strings = {
    title: { ar: 'من نحن', en: 'About Us' },
    lead: {
      ar: 'نحن مشغل Motex متخصصون في تصميم وتفصيل الفساتين منذ أكثر من 27 عاماً.',
      en: 'Motex is a professional dress atelier with more than 27 years of experience in designing and tailoring dresses.'
    },
    body: {
      ar: 'جميع المنتجات المعروضة هي من تصميم وتنفيذ مشغلنا الخاص وبأعلى جودة.',
      en: 'All displayed products are handmade in our own workshop with premium quality.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>
