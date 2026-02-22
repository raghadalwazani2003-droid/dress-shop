<template>
  <div class="home">
    <section
      class="hero"
      v-if="heroImage"
      :style="{ backgroundImage: `url(${heroImage})` }"
    ></section>
    <section class="hero" v-else></section>

    <section v-if="!currentCategory" id="categories" class="categories">
      <div class="cat-card" @click="selectCategory('evening')">
        <img :src="catCardLink.evening" alt="فساتين السهرة" class="cat-img" />
        <div class="cat-label">
          {{ language === 'ar' ? '👗 فساتين السهرة' : '👗 Evening Dresses' }}
        </div>
      </div>

      <div class="cat-card" @click="selectCategory('winter')">
        <img :src="catCardLink.winter" alt="ملابس شتوية" class="cat-img" />
        <div class="cat-label">
          {{ language === 'ar' ? '❄️ ملابس شتوية' : '❄️ Winter Clothes' }}
        </div>
      </div>
    </section>

    <div
      v-if="!currentCategory && !searchQuery"
      class="hint"
    >
      {{
        language === 'ar'
          ? 'اضغط على أي فئة لعرض المنتجات'
          : 'Click on a category to view products'
      }}
    </div>

    <div v-if="currentCategory || searchQuery" class="category-list">
      <div class="category-header">
        <h2>
          <span v-if="searchQuery">
            {{
              language === 'ar'
                ? 'نتائج البحث عن: '
                : 'Search results for: '
            }}
            <strong>{{ searchQuery }}</strong>
          </span>
          <span v-else>
            {{
              language === 'ar'
                ? currentCategory === 'evening'
                  ? 'فساتين السهرة'
                  : 'ملابس شتوية'
                : currentCategory === 'evening'
                ? 'Evening Dresses'
                : 'Winter Clothes'
            }}
          </span>
        </h2>
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
      <a :href="social.instagram" target="_blank" class="social-icon-link">
        <img :src="igIcon" alt="instagram" class="social-icon" />
      </a>
      <a :href="social.facebook" target="_blank" class="social-icon-link">
        <img :src="fbIcon" alt="facebook" class="social-icon" />
      </a>
      <a :href="social.whatsapp" target="_blank" class="social-icon-link">
        <img :src="waIcon" alt="whatsapp" class="social-icon" />
      </a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import DressCard from '../components/DressCard.vue'
import hero from '../assets/hero.PNG'
import igIcon from '../assets/icons/instagram.svg'
import fbIcon from '../assets/icons/facebook.svg'
import waIcon from '../assets/icons/whatsapp.svg'
import dressesData from '../data/dresses.js'

const router = useRouter()
const route = useRoute()
const { language } = useLanguage()

const heroImage = ref(hero)

/* ✅ التعديل هنا */
const catCardLink = ref({
  evening: new URL('../assets/فساتين-السهرة.JPEG', import.meta.url).href,
  winter: '/dresses/winter-cover.png'
})

const dresses = ref(dressesData)
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const searchQuery = ref('')

const social = ref({
  instagram: 'https://www.instagram.com/motex.fashion/',
  facebook: 'https://www.facebook.com/motexjo',
  whatsapp: 'https://wa.me/970798660315'
})

const currentCategory = ref(null)

function normalizeArabic(text) {
  return text
    .replace(/^ال/g, '')
    .replace(/ال/g, '')
    .replace(/[أإء]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim()
}

const filteredDresses = computed(() => {
  let filtered = dresses.value

  if (searchQuery.value) {
    const query = normalizeArabic(searchQuery.value.toLowerCase())
    filtered = filtered.filter(dress => {
      const nameAr = normalizeArabic(dress.name.toLowerCase())
      const nameEn = dress.nameEn.toLowerCase()
      return nameAr.includes(query) || nameEn.includes(query)
    })
  } else if (currentCategory.value) {
    filtered = filtered.filter(
      d => d.category === currentCategory.value
    )
  }

  return filtered
})

onMounted(() => {
  checkCategory()
  checkSearch()
})

watch(() => route.query.category, checkCategory)
watch(() => route.query.search, checkSearch)

function checkCategory() {
  const categoryParam = route.query.category
  if (categoryParam === 'evening' || categoryParam === 'winter') {
    selectCategory(categoryParam)
  } else {
    currentCategory.value = null
    searchQuery.value = ''
  }
}

function checkSearch() {
  const searchParam = route.query.search
  if (searchParam) {
    currentCategory.value = null
    searchQuery.value = String(searchParam).trim()
  } else {
    searchQuery.value = ''
  }
}

function selectCategory(cat) {
  currentCategory.value = cat
  searchQuery.value = ''
  setTimeout(
    () => window.scrollTo({ top: 460, behavior: 'smooth' }),
    50
  )
}

function addToCart(item) {
  const count = cart.value.filter(
    i => i.id === item.id && i.size === item.size
  ).length

  if (count >= 2) {
    alert(
      language.value === 'ar'
        ? 'يمكن إضافة حد أقصى فستانين لكل نوع ومقاس'
        : 'Maximum 2 dresses per type and size'
    )
    return
  }

  cart.value.push(item)
  localStorage.setItem('cart', JSON.stringify(cart.value))

  const dressName =
    language.value === 'ar' ? item.name : item.nameEn
  const sizeText =
    language.value === 'ar' ? 'مقاس' : 'Size'

  alert(
    `${dressName} - ${sizeText} ${item.size} ${
      language.value === 'ar'
        ? 'تمت الإضافة للسلة'
        : 'added to cart'
    }`
  )
}
</script>

<style scoped>
.home {
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to bottom, #f8f6f4, #ffffff);
}

/* ================= HERO ================= */
.hero {
  height: 520px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* ================= CATEGORIES ================= */
.categories {
  display: flex;
  gap: 40px;
  margin: 60px 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 🔥 الكرت صار أكبر */
.cat-card {
  width: 420px;
  min-height: 520px;
  border-radius: 18px;
  overflow: hidden;
  text-align: center;
  background: white;
  cursor: pointer;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cat-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 18px 45px rgba(141, 90, 58, 0.25);
}

/* 🔥 الصورة كاملة بدون قص */
.cat-img {
  width: 100%;
  height: 440px;
  object-fit: contain;
  background: #f7f5f2;
  padding: 12px;
  display: block;
}

/* ================= LABEL ================= */
.cat-label {
  padding: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #f9f7f5 0%, #f5f0eb 100%);
  color: #8d5a3a;
  font-size: 18px;
  letter-spacing: 0.4px;
}

/* ================= HINT ================= */
.hint {
  text-align: center;
  color: #888;
  margin: 40px 0;
  font-size: 18px;
}

/* ================= PRODUCTS ================= */
.category-list {
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.dresses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}

/* ================= FOOTER ================= */
.socials-footer {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 50px 20px;
  margin-top: 60px;
  border-top: 2px solid rgba(141, 90, 58, 0.15);
}

.social-icon {
  width: 64px;
  height: 64px;
  transition: all 0.3s ease;
}

.social-icon-link:hover {
  transform: translateY(-8px) scale(1.15);
}

/* ================= TABLET ================= */
@media (max-width: 768px) {
  .hero {
    height: 380px;
  }

  .cat-card {
    width: 95%;
    min-height: 460px;
  }

  .cat-img {
    height: 360px;
  }

  .cat-label {
    font-size: 16px;
  }
}

/* ================= MOBILE ================= */
@media (max-width: 480px) {
  .hero {
    height: 280px;
  }

  .cat-card {
    width: 100%;
    min-height: 420px;
  }

  .cat-img {
    height: 300px;
    padding: 8px;
  }

  .cat-label {
    font-size: 15px;
    padding: 14px;
  }
}
</style>

