<template>
  <InfoPageLayout :title="t('title')">
    <p class="lead">{{ t('lead') }}</p>
    <div class="contact-phone">
      <span class="phone-label">{{ t('phone') }}</span>
      <a :href="phoneTel" class="phone-number">0798660315</a>
    </div>
    <div class="contact-methods">
      <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="contact-btn">
        <span class="contact-icon">📱</span>
        <span>{{ t('whatsapp') }}</span>
      </a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="contact-btn">
        <span class="contact-icon">📷</span>
        <span>{{ t('instagram') }}</span>
      </a>
    </div>
    <p>{{ t('note') }}</p>
  </InfoPageLayout>
</template>

<script setup>
import { useLanguage } from '../composables/useLanguage'
import InfoPageLayout from '../components/InfoPageLayout.vue'

const { language } = useLanguage()
const whatsappUrl = 'https://wa.me/962798660315'
const phoneTel = 'tel:+962798660315'

const t = (key) => {
  const strings = {
    title: { ar: 'تواصل معنا', en: 'Contact Us' },
    lead: {
      ar: 'نرحب بتواصلكم عبر الهاتف أو الواتساب أو انستغرام.',
      en: 'We welcome your messages by phone, WhatsApp or Instagram.'
    },
    phone: { ar: 'رقم الهاتف:', en: 'Phone:' },
    whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
    instagram: { ar: 'انستغرام', en: 'Instagram' },
    note: {
      ar: 'سيتم الرد عليكم في أقرب وقت ممكن.',
      en: 'We will get back to you as soon as possible.'
    }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>

<style scoped>
.contact-phone {
  margin-bottom: 24px;
}

.phone-label {
  display: block;
  font-size: 14px;
  color: #6b6560;
  margin-bottom: 6px;
}

.phone-number {
  font-size: 22px;
  font-weight: 700;
  color: #8d5a3a;
  text-decoration: none;
}

.phone-number:hover {
  text-decoration: underline;
}

.contact-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #fff;
  border: 1px solid rgba(141, 90, 58, 0.3);
  border-radius: 10px;
  color: #8d5a3a;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.contact-btn:hover {
  background: rgba(141, 90, 58, 0.08);
}

.contact-icon {
  font-size: 20px;
}
</style>
