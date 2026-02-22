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
    title: { ar: 'معلومات التوصيل', en: 'Delivery Information' },
    lead: {
      ar: 'نقوم بالتوصيل إلى جميع محافظات المملكة خلال 1 إلى 3 أيام عمل.',
      en: 'We deliver to all cities within 1–3 business days.'
    },
    body: {
      ar: 'يتم التواصل مع الزبون لتأكيد الطلب قبل الإرسال.',
      en: 'Customers will be contacted to confirm orders before shipping.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>
