<template>
  <InfoPageLayout :title="t('title')">
    <p class="lead">{{ t('lead') }}</p>
    <p>{{ t('data') }}</p>
    <p>{{ t('use') }}</p>
    <p>{{ t('contact') }}</p>
  </InfoPageLayout>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'
import InfoPageLayout from '../components/InfoPageLayout.vue'

const { language } = useLanguage()

const t = (key) => {
  const strings = {
    title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    lead: {
      ar: 'نحن في Motex نحترم خصوصيتك ونحمي بياناتك الشخصية.',
      en: 'At Motex we respect your privacy and protect your personal data.'
    },
    data: {
      ar: 'نجمع فقط البيانات الضرورية لمعالجة الطلبات والتواصل معك (الاسم، رقم الهاتف، العنوان، البريد الإلكتروني). لا نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية.',
      en: 'We only collect data necessary to process orders and communicate with you (name, phone, address, email). We do not share your data with third parties for marketing purposes.'
    },
    use: {
      ar: 'بياناتك تُستخدم لتأكيد الطلبات والتوصيل والرد على استفساراتك فقط.',
      en: 'Your data is used solely for order confirmation, delivery, and responding to your inquiries.'
    },
    contact: {
      ar: 'لأي استفسار حول الخصوصية، تواصل معنا عبر الواتساب.',
      en: 'For any privacy-related inquiries, please contact us via WhatsApp.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>
