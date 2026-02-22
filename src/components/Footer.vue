<template>
  <footer class="footer" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <div class="footer-inner">
      <!-- 1. Brand Section -->
      <section class="footer-brand">
        <h2 class="brand-name">MOTEX</h2>
        <p class="brand-tagline">{{ t('tagline') }}</p>
        <p class="brand-desc">{{ t('handmade') }}</p>
      </section>

      <!-- 2. Shop Section -->
      <section class="footer-col">
        <h3 class="col-title">{{ t('shop') }}</h3>
        <nav class="footer-nav">
          <router-link to="/?category=evening" class="footer-link">{{ t('eveningDresses') }}</router-link>
          <router-link to="/?category=winter" class="footer-link">{{ t('winterDresses') }}</router-link>
          <router-link to="/" class="footer-link">{{ t('shopAll') }}</router-link>
        </nav>
      </section>

      <!-- 3. Information Section -->
      <section class="footer-col">
        <h3 class="col-title">{{ t('information') }}</h3>
        <nav class="footer-nav">
          <router-link to="/search" class="footer-link">{{ t('search') }}</router-link>
          <router-link to="/about" class="footer-link">{{ t('aboutUs') }}</router-link>
          <router-link to="/contact" class="footer-link">{{ t('contactUs') }}</router-link>
          <router-link to="/delivery" class="footer-link">{{ t('deliveryInfo') }}</router-link>
          <router-link to="/privacy" class="footer-link">{{ t('privacyPolicy') }}</router-link>
          <router-link to="/terms" class="footer-link">{{ t('termsConditions') }}</router-link>
          <router-link to="/exchange" class="footer-link">{{ t('exchangeReturn') }}</router-link>
        </nav>
      </section>

      <!-- 4. Contact & Social -->
      <section class="footer-contact">
        <h3 class="col-title">{{ t('contactUs') }}</h3>
        <a :href="phoneTel" class="footer-phone">0798660315</a>
        <div class="social-links">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn"
            :aria-label="t('whatsapp')"
          >
            <img src="@/assets/icons/whatsapp.svg" alt="" class="social-icon-img" width="24" height="24" />
            <span class="social-label">{{ t('whatsapp') }}</span>
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn"
            :aria-label="t('instagram')"
          >
            <img src="@/assets/icons/instagram.svg" alt="" class="social-icon-img" width="24" height="24" />
            <span class="social-label">{{ t('instagram') }}</span>
          </a>
        </div>
      </section>

      <!-- 5. Payment Methods -->
      <section class="footer-payment">
        <h3 class="col-title">{{ t('paymentMethods') }}</h3>
        <div class="payment-badges">
          <span class="badge">{{ t('cashOnDelivery') }}</span>
          <span class="badge">{{ t('visaMastercard') }}</span>
          <span class="badge">{{ t('zainCash') }}</span>
        </div>
      </section>
    </div>

    <!-- 6. Bottom Copyright -->
    <div class="footer-bottom">
      <p class="copyright">© 2026 Motex — {{ t('allRightsReserved') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { language } = useLanguage()

const whatsappUrl = 'https://wa.me/962798660315'
const phoneTel = 'tel:+962798660315'

const t = (key) => {
  const strings = {
    tagline: {
      ar: 'نحن مشغل Motex متخصصون في تصميم وتفصيل الفساتين منذ أكثر من 27 عاماً.',
      en: '27 years of experience in designing and tailoring dresses.'
    },
    handmade: {
      ar: 'جميع المنتجات مصنوعة يدوياً في مشغلنا الخاص وبأعلى جودة.',
      en: 'All products are handmade in our own atelier with premium quality.'
    },
    shop: { ar: 'تسوق', en: 'Shop' },
    eveningDresses: { ar: 'فساتين سهرة', en: 'Evening Dresses' },
    winterDresses: { ar: 'فساتين شتوية', en: 'Winter Dresses' },
    shopAll: { ar: 'جميع الفساتين', en: 'Shop All' },
    information: { ar: 'معلومات', en: 'Information' },
    search: { ar: 'بحث', en: 'Search' },
    aboutUs: { ar: 'من نحن', en: 'About Us' },
    contactUs: { ar: 'تواصل معنا', en: 'Contact Us' },
    deliveryInfo: { ar: 'معلومات التوصيل', en: 'Delivery Information' },
    privacyPolicy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    termsConditions: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    exchangeReturn: { ar: 'سياسة الاستبدال والإرجاع', en: 'Exchange & Return Policy' },
    whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
    instagram: { ar: 'انستغرام', en: 'Instagram' },
    paymentMethods: { ar: 'طرق الدفع', en: 'Payment Methods' },
    cashOnDelivery: { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery' },
    visaMastercard: { ar: 'فيزا / ماستركارد', en: 'Visa / MasterCard' },
    zainCash: { ar: 'زين كاش', en: 'Zain Cash' },
    allRightsReserved: { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved' }
  }
  return strings[key]?.[language.value] || strings[key]?.en || key
}
</script>

<style scoped>
.footer {
  background: linear-gradient(180deg, #f8f6f4 0%, #f0ebe6 100%);
  color: #3d3632;
  margin-top: auto;
  border-top: 1px solid rgba(141, 90, 58, 0.15);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 32px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px 32px;
}

.footer-brand {
  grid-column: 1 / -1;
  max-width: 560px;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: #8d5a3a;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.brand-tagline {
  font-size: 15px;
  line-height: 1.65;
  margin: 0 0 8px 0;
  color: #4a4541;
}

.brand-desc {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: #6b6560;
}

.col-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8d5a3a;
  margin: 0 0 16px 0;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  font-size: 14px;
  color: #4a4541;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #8d5a3a;
}

.footer-contact {
  grid-column: span 1;
}

.footer-phone {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #8d5a3a;
  text-decoration: none;
  margin-bottom: 12px;
}

.footer-phone:hover {
  text-decoration: underline;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid rgba(141, 90, 58, 0.25);
  border-radius: 8px;
  color: #8d5a3a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.social-btn:hover {
  background: rgba(141, 90, 58, 0.08);
  border-color: #8d5a3a;
  transform: translateY(-1px);
}

.social-icon-img {
  width: 22px;
  height: 22px;
  display: block;
}

.footer-payment {
  grid-column: span 1;
}

.payment-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  font-size: 12px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid rgba(141, 90, 58, 0.2);
  border-radius: 6px;
  color: #5a524c;
}

.footer-bottom {
  border-top: 1px solid rgba(141, 90, 58, 0.12);
  padding: 20px 24px;
}

.copyright {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 13px;
  color: #6b6560;
  text-align: center;
}

@media (max-width: 900px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    padding: 40px 20px 28px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 16px 24px;
  }

  .brand-name {
    font-size: 24px;
  }

  .brand-tagline,
  .brand-desc {
    font-size: 14px;
  }

  .policies-list {
    flex-direction: column;
  }

  .footer-contact,
  .footer-payment {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    padding: 16px;
  }

  .copyright {
    font-size: 12px;
  }
}
</style>
