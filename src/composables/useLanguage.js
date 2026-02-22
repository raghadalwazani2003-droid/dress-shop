import { ref, watch } from 'vue'

const language = ref(localStorage.getItem('language') || 'ar')

// تعيين الاتجاه عند التحميل
if (typeof document !== 'undefined') {
  document.documentElement.dir = language.value === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = language.value === 'ar' ? 'ar' : 'en'
}

export function useLanguage() {
  function setLanguage(lang) {
    language.value = lang
    localStorage.setItem('language', lang)
    // تحديث اتجاه الصفحة
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    }
  }

  function t(key) {
    const translations = {
      'Login': { ar: 'تسجيل دخول', en: 'Login' },
      'Cart': { ar: 'السلة', en: 'Cart' },
      'Evening Dresses': { ar: 'فساتين سهرة', en: 'Evening Dresses' },
      'Winter Clothes': { ar: 'ملابس شتوية', en: 'Winter Clothes' },
      'My Favorites': { ar: 'مفضلاتي', en: 'My Favorites' },
      'Search': { ar: 'بحث', en: 'Search' },
      'Empty Cart': { ar: 'السلة فارغة', en: 'Empty Cart' },
      'Add to Cart': { ar: 'أضف إلى السلة', en: 'Add to Cart' },
      'Size': { ar: 'المقاس', en: 'Size' },
      'Select Size': { ar: 'اختاري المقاس', en: 'Select Size' },
      'Back': { ar: 'عودة', en: 'Back' },
      'Delivery Details': { ar: 'تفاصيل التوصيل', en: 'Delivery Details' },
      'Governorate': { ar: 'المحافظة', en: 'Governorate' },
      'Phone': { ar: 'رقم الهاتف', en: 'Phone' },
      'Notes': { ar: 'ملاحظات', en: 'Notes' },
      'Delivery Date': { ar: 'يوم التوصيل', en: 'Delivery Date' },
      'Confirm Order': { ar: 'تأكيد الطلب', en: 'Confirm Order' },
      'No results': { ar: 'لا توجد نتائج', en: 'No results' },
      'Delete': { ar: 'حذف', en: 'Delete' },
      'Quantity': { ar: 'الكمية', en: 'Quantity' },
      'Total': { ar: 'الإجمالي', en: 'Total' },
      'Sign In': { ar: 'تسجيل دخول', en: 'Sign In' },
      'Sign Up': { ar: 'إنشاء حساب', en: 'Sign Up' },
      'Forgot Password': { ar: 'هل نسيت كلمة المرور؟', en: 'Forgot Password' }
    }

    return translations[key]?.[language.value] || key
  }

  return {
    language,
    setLanguage,
    t
  }
}
