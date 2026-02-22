<template>
  <div class="winter-page">
    <!-- Category Products -->
    <div class="category-list">
      <div class="category-header">
        <h2>{{ language === 'ar' ? '❄️ ملابس شتوية' : '❄️ Winter Clothes' }}</h2>
      </div>

      <div v-if="filteredDresses.length === 0" class="no-results">
        {{ language === 'ar' ? 'لا توجد نتائج' : 'No results found' }}
      </div>

      <div v-else class="dresses">
        <DressCard
          v-for="dress in filteredDresses"
          :key="dress.id"
          :dress="dress"
          :language="language"
          @add-to-cart="addToCart"
        />
      </div>
    </div>

    <footer class="socials-footer">
      <a :href="social.instagram" target="_blank" rel="noopener" class="social-icon-link">
        <img :src="igIcon" alt="instagram" class="social-icon" />
      </a>
      <a :href="social.facebook" target="_blank" rel="noopener" class="social-icon-link">
        <img :src="fbIcon" alt="facebook" class="social-icon" />
      </a>
      <a :href="social.whatsapp" target="_blank" rel="noopener" class="social-icon-link">
        <img :src="waIcon" alt="whatsapp" class="social-icon" />
      </a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import DressCard from '../components/DressCard.vue'
import igIcon from '../assets/icons/instagram.svg'
import fbIcon from '../assets/icons/facebook.svg'
import waIcon from '../assets/icons/whatsapp.svg'
import dressesData from '../data/dresses.js'

const { language } = useLanguage()

const dresses = ref(dressesData)
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const searchQuery = ref('')

const social = ref({ 
  instagram: 'https://www.instagram.com/motex.fashion/', 
  facebook: 'https://www.facebook.com/motexjo',
  whatsapp: 'https://wa.me/970798660315'
})

// تصفية الفساتين الشتوية
const filteredDresses = computed(() => {
  let filtered = dresses.value.filter(d => d.category === 'winter')
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(dress => {
      const nameAr = dress.name.toLowerCase()
      const nameEn = dress.nameEn.toLowerCase()
      return nameAr.includes(query) || nameEn.includes(query)
    })
  }
  
  return filtered
})

function addToCart(item) {
  const count = cart.value.filter(i => i.id === item.id && i.size === item.size).length
  if(count >= 2) {
    alert(language.value === 'ar' ? 'يمكن إضافة حد أقصى فستانين لكل نوع ومقاس' : 'Maximum 2 dresses per type and size')
    return
  }
  cart.value.push(item)
  localStorage.setItem('cart', JSON.stringify(cart.value))
  const dressName = language.value === 'ar' ? item.name : item.nameEn
  const sizeText = language.value === 'ar' ? 'مقاس' : 'Size'
  alert(`${dressName} - ${sizeText} ${item.size} ${language.value === 'ar' ? 'تمت الإضافة للسلة' : 'added to cart'}`)
}
</script>

<style scoped>
.winter-page {
  padding: 0;
  font-family: Arial, sans-serif;
}

.category-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
}

.category-header h2 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.category-list {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.search-box {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 12px rgba(141, 90, 58, 0.2);
  transform: translateY(-2px);
}

.no-results {
  text-align: center;
  color: #999;
  padding: 60px 20px;
  font-size: 18px;
}

.dresses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.socials-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 30px 0;
  margin-top: 20px;
  border-top: 1px solid #eee;
}

.socials-footer .social-icon {
  width: 40px;
  height: 40px;
  display: inline-block;
}

.socials-footer .social-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.socials-footer .social-icon-link:hover {
  transform: scale(1.12);
}

@media (max-width: 768px) {
  .dresses {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}
</style>
