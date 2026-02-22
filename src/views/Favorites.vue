<template>
  <div class="favorites-page" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <button class="back-btn" @click="goBack">← {{ language === 'ar' ? 'عودة' : 'Back' }}</button>

    <div class="favorites-container">
      <h1>{{ language === 'ar' ? '❤️ المفضلات' : '❤️ My Favorites' }}</h1>

      <div v-if="favorites.length === 0" class="empty">
        <p class="empty-text">{{ language === 'ar' ? 'لا توجد عناصر مفضلة' : 'No favorite items yet' }}</p>
        <button class="browse-btn" @click="goHome">
          {{ language === 'ar' ? 'تصفح المنتجات' : 'Browse Products' }}
        </button>
      </div>

      <div v-else class="favorites-grid">
        <div v-for="item in favorites" :key="`${item.id}-${item.image}`" class="favorite-card">
          <div class="card-image">
            <img :src="item.image" :alt="item.name" />
            <button class="remove-btn" @click="removeFavorite(item)">
              ✕
            </button>
          </div>
          <div class="card-info">
            <h3>{{ language === 'ar' ? item.name : item.nameEn }}</h3>
            <p class="price">{{ item.price }} JD</p>
            <button class="view-btn" @click="viewProduct(item.id)">
              {{ language === 'ar' ? 'عرض التفاصيل' : 'View Details' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { language } = useLanguage()

const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

function removeFavorite(item) {
  const filtered = favorites.value.filter(f => !(f.id === item.id && f.image === item.image))
  favorites.value = filtered
  localStorage.setItem('favorites', JSON.stringify(filtered))
}

function viewProduct(id) {
  router.push(`/dress/${id}`)
}

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.back-btn {
  background: #8d5a3a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #6d4129;
  transform: translateY(-2px);
}

.favorites-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.favorites-container h1 {
  margin: 0 0 30px 0;
  color: #333;
  font-size: 32px;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  color: #999;
  font-size: 18px;
  margin: 0 0 20px 0;
}

.browse-btn {
  background: #8d5a3a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background: #6d4129;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(141, 90, 58, 0.3);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
}

.favorite-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.favorite-card:hover {
  box-shadow: 0 8px 24px rgba(141, 90, 58, 0.15);
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-info h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.price {
  color: #8d5a3a;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
}

.view-btn {
  margin-top: auto;
  padding: 10px;
  background: #8d5a3a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: #6d4129;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .favorites-container {
    padding: 20px;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  .card-image {
    height: 220px;
  }
}
</style>
