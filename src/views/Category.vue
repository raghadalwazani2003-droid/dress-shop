<template>
  <div class="category-page">
    <div class="container">
      <div class="category-header">
        <h2>{{ title }}</h2>
        <button @click="$router.back()">عودة</button>
      </div>

      <div class="dresses">
        <DressCard v-for="dress in filtered" :key="dress.id" :dress="dress" @add-to-cart="addToCart" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DressCard from '../components/DressCard.vue'
import dressesData from '../data/dresses.js'

const route = useRoute()
const router = useRouter()
const cat = route.params.name
const title = cat === 'evening' ? 'فساتين السهرة' : 'ملابس شتوية'

const filtered = computed(() => dressesData.filter(d => d.category === cat))

const cart = JSON.parse(localStorage.getItem('cart') || '[]')
function addToCart(item) {
  const count = cart.filter(i => i.id === item.id && i.size === item.size).length
  if(count >= 2) { alert('حد أقصى فستانين لكل نوع'); return }
  cart.push(item)
  localStorage.setItem('cart', JSON.stringify(cart))
  alert('تمت الإضافة')
}
</script>

<style>
.hero-small { display:none }
.container { padding: 18px }
.category-header { display:flex; justify-content:space-between; align-items:center }
.dresses { display:grid; grid-template-columns: repeat(auto-fill, minmax(250px,1fr)); gap:18px; margin-top:18px }
</style>
