<template>
  <div class="card">
    <div class="image-container">
      <img :src="currentImage" @click="toggleZoom" :class="{ zoomed: zoom }" />

      <button class="nav left" @click.stop="prevImage">◀</button>
      <button class="nav right" @click.stop="nextImage">▶</button>

      <button class="favorite" :class="{ on: favorite }" @click.stop="toggleFavorite">
        <span v-if="favorite">❤️</span>
        <span v-else>🤍</span>
      </button>
    </div>

    <h3 class="title" @click="goToDetail">{{ language === 'ar' ? dress.name : dress.nameEn }}</h3>
    <p class="price">{{ dress.price }} {{ language === 'ar' ? 'دينار' : 'JD' }}</p>

    <div class="size-row">
      <label class="size-label">{{ language === 'ar' ? 'المقاس' : 'Size' }}:</label>
      <select v-model="selectedSize">
        <option disabled value="">{{ language === 'ar' ? 'اختاري المقاس' : 'Select Size' }}</option>
        <option v-for="size in dress.sizes" :key="size">{{ size }}</option>
      </select>
    </div>

    <div class="colors">
      <span
        v-for="(color, index) in dress.colors"
        :key="index"
        :style="{ backgroundColor: color.bgColor || extractHex(color.image) }"
        class="color-circle"
        :class="{ active: index === selectedColorIndex }"
        @click="changeColor(index)"
        :title="language === 'ar' ? color.name : color.nameEn"
      ></span>
    </div>

    <button class="add-btn" @click="add">{{ language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart' }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({ 
  dress: Object,
  language: String
})
const emit = defineEmits(['add-to-cart'])

const selectedSize = ref('')
const selectedColorIndex = ref(0)
const zoomIndex = ref(0)
const zoom = ref(false)
const favorite = ref(false)

// support colors[].image (fallback) or colors[].far/close
const currentImage = ref(props.dress.colors[0].image || props.dress.colors[0].far || '')

function add() {
  if(!selectedSize.value) {
    alert(props.language === 'ar' ? 'اختاري المقاس أولًا' : 'Please select a size first')
    return
  }
  const item = { 
    ...props.dress, 
    size: selectedSize.value, 
    color: props.language === 'ar' ? props.dress.colors[selectedColorIndex.value].name : props.dress.colors[selectedColorIndex.value].nameEn,
    image: currentImage.value 
  }
  emit('add-to-cart', item)
}

function changeColor(index) {
  selectedColorIndex.value = index
  zoomIndex.value = 0
  const c = props.dress.colors[index]
  currentImage.value = c.image || c.far || currentImage.value
}

function toggleZoom() {
  zoom.value = !zoom.value
}

function prevImage() {
  const c = props.dress.colors[selectedColorIndex.value]
  const far = c.far || c.image
  const close = c.close || c.far || c.image
  const close2 = c.close2
  if (close2 && currentImage.value === close2) {
    currentImage.value = close
    zoom.value = true
  } else if (currentImage.value === close) {
    currentImage.value = far
    zoom.value = false
  } else {
    currentImage.value = close2 || close
    zoom.value = true
  }
}

function nextImage() {
  zoom.value = true
  const c = props.dress.colors[selectedColorIndex.value]
  const far = c.far || c.image
  const close = c.close || c.far || c.image
  const close2 = c.close2
  if (currentImage.value === far) {
    currentImage.value = close
  } else if (close2 && currentImage.value === close) {
    currentImage.value = close2
  } else {
    currentImage.value = far
    zoom.value = false
  }
}

function toggleFavorite() {
  favorite.value = !favorite.value
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const payload = { 
    id: props.dress.id, 
    name: props.dress.name,
    nameEn: props.dress.nameEn,
    price: props.dress.price,
    image: currentImage.value 
  }
  if(favorite.value) {
    favs.push(payload)
    localStorage.setItem('favorites', JSON.stringify(favs))
    alert(props.language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to favorites')
  } else {
    const filtered = favs.filter(f => !(f.id === payload.id && f.image === payload.image))
    localStorage.setItem('favorites', JSON.stringify(filtered))
    alert(props.language === 'ar' ? 'تم الحذف من المفضلة' : 'Removed from favorites')
  }
}

function extractHex(url) {
  const m = url && url.match(/([0-9A-F]{6})/i)
  return m ? `#${m[1]}` : '#ddd'
}

function goToDetail() {
  router.push(`/dress/${props.dress.id}`)
}
</script>

<style scoped>
.card {
  border: 1px solid rgba(141, 90, 58, 0.1);
  padding: 14px;
  width: 100%;
  position: relative;
  background: white;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  box-shadow: 0 12px 36px rgba(141, 90, 58, 0.18);
  transform: translateY(-6px);
  border-color: rgba(141, 90, 58, 0.2);
}

.image-container { 
  position: relative; 
  height: 380px; 
  overflow: hidden; 
  border-radius: 10px; 
  background: linear-gradient(135deg, #f9f7f5 0%, #ede8e3 100%);
  margin-bottom: 2px;
}
.image-container img { 
  width: 100%; 
  height: 100%; 
  object-fit: contain; /* بدل cover */
  cursor: zoom-in; 
  transition: transform 0.35s ease; 
  display: block; 
  background: #f9f7f5; /* اللون خلف الصورة إذا في فراغ */
}


.image-container img.zoomed { 
  transform: scale(1.15); 
  cursor: zoom-out; 
}

.nav { 
  position: absolute; 
  top: 50%; 
  transform: translateY(-50%); 
  background: rgba(255,255,255,0.9); 
  border: none; 
  padding: 8px 10px; 
  border-radius: 50%; 
  cursor: pointer; 
  font-size: 16px;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 10;
}

.image-container:hover .nav {
  opacity: 1;
}

.nav:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-50%) scale(1.15);
}

.nav.left { left: 8px; }
.nav.right { right: 8px; }

.favorite { 
  position: absolute; 
  top: 12px; 
  right: 12px; 
  cursor: pointer; 
  font-size: 22px; 
  background: rgba(255,255,255,0.95); 
  border-radius: 50%; 
  padding: 8px; 
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: all 0.3s ease;
  z-index: 11;
}

.favorite:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.25);
}

.favorite.on { 
  transform: scale(1.1); 
}

.title { 
  margin: 12px 0 6px; 
  font-size: 16px; 
  font-weight: 700;
  cursor: pointer; 
  color: #8d5a3a; 
  transition: all 0.3s ease;
  line-height: 1.3;
}

.title:hover { 
  color: #a6704d;
  transform: translateX(2px);
}

.price { 
  margin: 0 0 10px; 
  font-weight: 800; 
  color: #333; 
  font-size: 17px;
}

.size-row { 
  display: flex; 
  gap: 10px; 
  align-items: center;
  margin-bottom: 8px;
}

.size-label { 
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.size-row select {
  flex: 1;
  padding: 8px 10px;
  border: 1.5px solid rgba(141, 90, 58, 0.2);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.size-row select:hover {
  border-color: rgba(141, 90, 58, 0.4);
}

.size-row select:focus {
  outline: none;
  border-color: rgba(141, 90, 58, 0.6);
  box-shadow: 0 0 8px rgba(141, 90, 58, 0.15);
}

.colors { 
  display: flex; 
  margin: 10px 0; 
  gap: 6px;
  flex-wrap: wrap;
}

.color-circle { 
  width: 26px; 
  height: 26px; 
  border-radius: 50%; 
  cursor: pointer; 
  border: 2px solid rgba(0,0,0,0.15); 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.color-circle:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.color-circle.active { 
  border: 2.5px solid #8d5a3a;
  box-shadow: 0 4px 14px rgba(141, 90, 58, 0.3);
  transform: scale(1.12);
}

.add-btn { 
  margin-top: 10px; 
  padding: 12px; 
  border-radius: 10px; 
  border: none; 
  background: linear-gradient(135deg, #8d5a3a 0%, #a6704d 100%);
  color: white; 
  cursor: pointer; 
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(141, 90, 58, 0.2);
}

.add-btn:hover { 
  background: linear-gradient(135deg, #7a4a2d 0%, #8d5a3a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(141, 90, 58, 0.3);
}

.add-btn:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .image-container {
    height: 340px;
  }

  .title {
    font-size: 15px;
  }

  .price {
    font-size: 16px;
  }

  .add-btn {
    padding: 11px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .card {
    padding: 12px;
  }

  .image-container {
    height: 300px;
  }

  .title {
    margin: 10px 0 5px;
    font-size: 14px;
  }

  .price {
    margin: 0 0 8px;
    font-size: 15px;
  }

  .size-row {
    gap: 8px;
    margin-bottom: 6px;
  }

  .size-label {
    font-size: 12px;
  }

  .size-row select {
    font-size: 12px;
    padding: 7px 9px;
  }

  .color-circle {
    width: 24px;
    height: 24px;
  }

  .add-btn {
    margin-top: 8px;
    padding: 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 10px;
    border-radius: 10px;
  }

  .image-container {
    height: 240px;
    border-radius: 8px;
  }

  .title {
    margin: 8px 0 4px;
    font-size: 13px;
  }

  .price {
    margin: 0 0 6px;
    font-size: 14px;
  }

  .size-row {
    gap: 6px;
    margin-bottom: 5px;
  }

  .size-label {
    font-size: 11px;
  }

  .size-row select {
    font-size: 11px;
    padding: 6px 8px;
  }

  .colors {
    margin: 8px 0;
    gap: 4px;
  }

  .color-circle {
    width: 22px;
    height: 22px;
    border: 1.5px solid rgba(0,0,0,0.15);
  }

  .add-btn {
    margin-top: 6px;
    padding: 9px;
    font-size: 11px;
  }
}
</style>
