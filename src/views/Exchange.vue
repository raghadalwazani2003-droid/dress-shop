<template>
  <InfoPageLayout :title="t('title')">
    <p class="lead">{{ t('lead') }}</p>
    <ul>
      <li class="policy-ok">{{ t('policyOk') }}</li>
      <li class="policy-no">{{ t('policyNo') }}</li>
    </ul>
  </InfoPageLayout>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'
import InfoPageLayout from '../components/InfoPageLayout.vue'

const { language } = useLanguage()

const t = (key) => {
  const strings = {
    title: { ar: 'سياسة الاستبدال والإرجاع', en: 'Exchange & Return Policy' },
    lead: {
      ar: 'الشروط التالية تنطبق على المعاينة والاستبدال:',
      en: 'The following terms apply to inspection and exchange:'
    },
    policyOk: {
      ar: '✔ يمكن معاينة الطلب قبل الدفع عند اختيار 3 قطع أو أقل.',
      en: '✔ Inspection before payment is available for orders of 3 items or less.'
    },
    policyNo: {
      ar: '❌ لا يمكن التبديل بعد المعاينة.',
      en: '❌ No exchange after inspection.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>
