<template>
  <div class="detail-page" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <button class="back-btn" @click="goBack">← {{ language === 'ar' ? 'عودة' : 'Back' }}</button>

    <div v-if="dress" class="detail-container">
      <!-- الصورة والألوان -->
      <div class="image-section">
        <div class="main-image-container">
          <img 
            :src="currentImage" 
            :alt="dress.name" 
            class="main-image" 
            @click="openZoom(currentImage)"
          />
          <button class="nav left" @click.stop="prevImage">◀</button>
          <button class="nav right" @click.stop="nextImage">▶</button>
        </div>

        <!-- دوائر الألوان تحت الصورة وفي المنتصف -->
        <div class="colors">
          <span
            v-for="(color, index) in dress.colors"
            :key="index"
            :style="{ backgroundColor: color.bgColor }"
            class="color-circle"
            :class="{ active: index === selectedColorIndex }"
            @click="changeColor(index)"
            :title="language === 'ar' ? color.name : color.nameEn"
          ></span>
        </div>
      </div>

      <!-- نافذة تكبير الصورة مع zoom حر -->
      <div v-if="zoomImage" class="zoom-overlay" @click="closeZoom">
        <img 
          :src="zoomSrc" 
          class="zoomed-image" 
          ref="zoomedImage"
          @wheel.prevent="zoomWithWheel"
        />
      </div>

      <!-- المعلومات -->
      <div class="info-section">
        <h1>{{ language === 'ar' ? dress.name : dress.nameEn }}</h1>
        <p class="price">{{ dress.price }} JD</p>

        <!-- المادة -->
        <div class="material-section">
          <h3>{{ language === 'ar' ? 'المادة والخامة' : 'Material & Fabric' }}</h3>
          <p>{{ language === 'ar' ? dress.material : dress.materialEn }}</p>
        </div>

        <!-- جدول المقاسات -->
        <div class="size-chart-section">
          <div class="size-chart-header" @click="toggleSizeChart">
            <span class="arrow" :class="{ open: showSizeChart }">
              {{ showSizeChart ? '▼' : '◀' }}
            </span>
            <h3>
              {{ language === 'ar' ? 'جدول المقاسات' : 'Size Chart' }}
            </h3>
          </div>

          <div class="size-chart-table" v-if="showSizeChart">
            <table>
              <thead>
                <tr>
                  <th>{{ language === 'ar' ? 'المقاس' : 'Size' }}</th>
                  <th>{{ language === 'ar' ? 'الطول (سم)' : 'Height (cm)' }}</th>
                  <th>{{ language === 'ar' ? 'الوزن (كغ)' : 'Weight (kg)' }}</th>
                  <th>{{ language === 'ar' ? 'الخصر (سم)' : 'Waist (cm)' }}</th>
                  <th>{{ language === 'ar' ? 'الصدر (سم)' : 'Chest (cm)' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dress.sizeChart" :key="item.size">
                  <td class="size-cell">{{ item.size }}</td>
                  <td>{{ item.height }}</td>
                  <td>{{ item.weight }}</td>
                  <td>{{ item.waist }}</td>
                  <td>{{ item.chest }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- اختيار المقاس والإضافة للسلة -->
        <div class="purchase-section">
          <div class="size-select">
            <label>{{ language === 'ar' ? 'اختاري المقاس' : 'Select Size' }}:</label>
            <select v-model="selectedSize">
              <option disabled value="">{{ language === 'ar' ? 'اختاري المقاس' : 'Select Size' }}</option>
              <option v-for="size in dress.sizes" :key="size">{{ size }}</option>
            </select>
          </div>
          <!-- اختيار التطريز (لفستان حريم السلطان فقط) -->
          <div v-if="dress.embroideryOptions" class="embroidery-select">
            <label>{{ language === 'ar' ? 'اختيار التطريز' : 'Embroidery' }}:</label>
            <select v-model="selectedEmbroidery">
              <option disabled value="">{{ language === 'ar' ? 'اختاري نوع التطريز' : 'Choose embroidery' }}</option>
              <option v-for="opt in dress.embroideryOptions" :key="opt.id" :value="opt.id">
                {{ language === 'ar' ? opt.name : opt.nameEn }}
              </option>
            </select>
          </div>
          <button class="add-to-cart-btn" @click="addToCart">
            {{ language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart' }}
          </button>
        </div>

        <!-- قسم التعليقات -->
        <div class="comments-section">
          <h3>{{ language === 'ar' ? 'التعليقات' : 'Comments' }}</h3>

          <!-- نموذج إضافة تعليق -->
          <form class="comment-form" @submit.prevent="submitComment">
            <div class="comment-inputs">
              <input
                v-model="newCommentName"
                type="text"
                class="comment-input"
                :placeholder="language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'"
              />
              <textarea
                v-model="newCommentText"
                class="comment-textarea"
                :placeholder="language === 'ar' ? 'اكتبي تعليقك هنا...' : 'Write your comment...'"
                rows="3"
                required
              ></textarea>
            </div>
            <button type="submit" class="comment-submit-btn">
              {{ language === 'ar' ? 'إضافة تعليق' : 'Add Comment' }}
            </button>
          </form>

          <!-- قائمة التعليقات -->
          <div v-if="comments.length" class="comments-list">
            <div
              v-for="(comment, index) in comments"
              :key="index"
              class="comment-card"
            >
              <div class="comment-header">
                <span class="comment-name">
                  {{ comment.name || (language === 'ar' ? 'زائرة' : 'Guest') }}
                </span>
                <span class="comment-date">
                  {{ formatDate(comment.date) }}
                </span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
            </div>
          </div>
          <p v-else class="no-comments">
            {{ language === 'ar' ? 'لا توجد تعليقات بعد.' : 'No comments yet.' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>{{ language === 'ar' ? 'لم يتم العثور على الفستان' : 'Dress not found' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import dressesData from '../data/dresses.js'

const router = useRouter()
const route = useRoute()
const { language } = useLanguage()

const dress = ref(null)
const selectedSize = ref('')
const selectedEmbroidery = ref('')
const selectedColorIndex = ref(0)
const currentImage = ref('')

// Zoomable
const zoomImage = ref(false)
const zoomSrc = ref('')
const zoomedImage = ref(null)
let zoomScale = 1

// جدول المقاسات
const showSizeChart = ref(false)

// التعليقات
const comments = ref([])
const newCommentName = ref('')
const newCommentText = ref('')
const commentsKey = ref('') // مفتاح التخزين لهذا المنتج

// البحث عن الفستان وتحميل التعليقات
function findDress() {
  const id = parseInt(route.params.id)
  dress.value = dressesData.find(d => d.id === id)
  if (dress.value) {
    currentImage.value = dress.value.colors[0].far || dress.value.colors[0].image

    commentsKey.value = `comments_product_${dress.value.id}`
    const saved = localStorage.getItem(commentsKey.value)
    comments.value = saved ? JSON.parse(saved) : []
  }
}

function changeColor(index) {
  selectedColorIndex.value = index
  const color = dress.value.colors[index]
  currentImage.value = color.far || color.image
}

function prevImage() {
  const color = dress.value.colors[selectedColorIndex.value]
  const far = color.far || color.image
  const close = color.close || color.far || color.image
  const close2 = color.close2
  if (close2 && currentImage.value === close2) {
    currentImage.value = close
  } else if (currentImage.value === close) {
    currentImage.value = far
  } else {
    currentImage.value = close2 || close
  }
}

function nextImage() {
  const color = dress.value.colors[selectedColorIndex.value]
  const far = color.far || color.image
  const close = color.close || color.far || color.image
  const close2 = color.close2
  if (currentImage.value === far) {
    currentImage.value = close
  } else if (close2 && currentImage.value === close) {
    currentImage.value = close2
  } else {
    currentImage.value = far
  }
}

function openZoom(src) {
  zoomSrc.value = src
  zoomScale = 1
  zoomImage.value = true
}

function closeZoom() {
  zoomImage.value = false
}

function zoomWithWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoomScale = Math.min(Math.max(0.5, zoomScale + delta), 5)
  if (zoomedImage.value) {
    zoomedImage.value.style.transform = `scale(${zoomScale})`
  }
}

function toggleSizeChart() {
  showSizeChart.value = !showSizeChart.value
}

function addToCart() {
  if (!selectedSize.value) {
    alert(language.value === 'ar' ? 'اختاري المقاس أولاً' : 'Please select a size first')
    return
  }
  if (dress.value.embroideryOptions && !selectedEmbroidery.value) {
    alert(language.value === 'ar' ? 'اختاري نوع التطريز' : 'Please choose embroidery type')
    return
  }
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const item = {
    id: dress.value.id,
    name: dress.value.name,
    nameEn: dress.value.nameEn,
    price: dress.value.price,
    size: selectedSize.value,
    color: language.value === 'ar'
      ? dress.value.colors[selectedColorIndex.value].name
      : dress.value.colors[selectedColorIndex.value].nameEn,
    image: currentImage.value,
    qty: 1
  }
  if (dress.value.embroideryOptions && selectedEmbroidery.value) {
    const opt = dress.value.embroideryOptions.find(o => o.id === selectedEmbroidery.value)
    item.embroidery = language.value === 'ar' ? (opt?.name ?? selectedEmbroidery.value) : (opt?.nameEn ?? selectedEmbroidery.value)
  }
  cart.push(item)
  localStorage.setItem('cart', JSON.stringify(cart))
  const dressName = language.value === 'ar' ? dress.value.name : dress.value.nameEn
  const sizeText = language.value === 'ar' ? 'مقاس' : 'Size'
  const embText = item.embroidery ? ` - ${item.embroidery}` : ''
  alert(`${dressName} - ${sizeText} ${selectedSize.value}${embText} ${language.value === 'ar' ? 'تمت الإضافة للسلة' : 'added to cart'}`)
  selectedSize.value = ''
  selectedEmbroidery.value = ''
}

// إضافة تعليق جديد (أحدث تعليق أولاً)
function submitComment() {
  if (!newCommentText.value.trim()) return

  const comment = {
    name: newCommentName.value.trim(),
    text: newCommentText.value.trim(),
    date: new Date().toISOString()
  }

  comments.value.unshift(comment)
  localStorage.setItem(commentsKey.value, JSON.stringify(comments.value))

  newCommentText.value = ''
}

function formatDate(iso) {
  const d = new Date(iso)
  return language.value === 'ar'
    ? d.toLocaleString('ar-JO')
    : d.toLocaleString('en-GB')
}

function goBack() { 
  router.back() 
}

findDress()
</script>

<style scoped>
.detail-page { padding: 20px; max-width: 1200px; margin: 0 auto; font-family: Arial, sans-serif; }
.back-btn { background: #8d5a3a; color:white; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600; margin-bottom:20px; transition: all 0.2s ease; }
.back-btn:hover { background:#6d4129; transform:translateY(-2px); }

.detail-container { display:grid; grid-template-columns:1fr 1fr; gap:40px; }

/* ترتيب الصورة والألوان عموديًا */
.image-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image-container { position:relative; height:600px; border-radius:10px; overflow:hidden; background:#f5f5f5; }
.main-image { width:100%; height:100%; object-fit:contain; cursor:zoom-in; }

.nav { position:absolute; top:50%; transform:translateY(-50%); background: rgba(255,255,255,0.7); border:none; padding:8px 12px; border-radius:50%; cursor:pointer; font-size:16px; transition: all 0.2s ease; }
.nav:hover { background: rgba(255,255,255,0.95); }
.nav.left { left:12px; } .nav.right { right:12px; }

/* الألوان تحت الصورة وبالوسط */
.colors {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.color-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.color-circle:hover {
  transform: scale(1.1);
  border-color: #8d5a3a;
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.2);
}

.color-circle.active {
  border-color: #8d5a3a;
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.3);
}

.info-section { display:flex; flex-direction:column; gap:20px; }
.info-section h1 { margin:0; font-size:32px; color:#333; }
.price { font-size:24px; font-weight:700; color:#8d5a3a; margin:0; }

.material-section { background:#f9f9f9; padding:16px; border-radius:8px; border-left:4px solid #8d5a3a; }
.material-section h3 { margin:0 0 10px 0; color:#333; font-size:16px; }
.material-section p { margin:0; color:#666; line-height:1.6; }

.size-chart-section { background:#f9f9f9; padding:16px; border-radius:8px; }
.size-chart-header { display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; }
.size-chart-header h3 { margin:0; color:#333; font-size:16px; }
.size-chart-header .arrow { font-size:16px; color:#8d5a3a; display:inline-flex; align-items:center; justify-content:center; width:24px; }
.size-chart-table { overflow-x:auto; margin-top:12px; }
table { width:100%; border-collapse:collapse; }
thead { background:#8d5a3a; color:white; }
th,td { padding:12px; text-align:center; border-bottom:1px solid #eee; font-size:13px; }
tbody tr:hover { background:#f0f0f0; }
.size-cell { font-weight:600; color:#8d5a3a; }

.purchase-section { display:flex; flex-direction:column; gap:12px; margin-top:10px; }
.size-select { display:flex; flex-direction:column; gap:6px; }
.size-select label { font-weight:600; color:#333; font-size:14px; }
.size-select select { padding:10px; border:2px solid #8d5a3a; border-radius:6px; font-family:inherit; cursor:pointer; transition: all 0.2s ease; }
.size-select select:focus { outline:none; box-shadow:0 0 0 3px rgba(141,90,58,0.1); }

.embroidery-select { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
.embroidery-select label { font-weight:600; color:#333; font-size:14px; }
.embroidery-select select { padding:10px; border:2px solid #8d5a3a; border-radius:6px; font-family:inherit; cursor:pointer; transition: all 0.2s ease; }
.embroidery-select select:focus { outline:none; box-shadow:0 0 0 3px rgba(141,90,58,0.1); }

.add-to-cart-btn { padding:14px; background:#8d5a3a; color:white; border:none; border-radius:6px; font-weight:700; font-size:16px; cursor:pointer; transition:all 0.2s ease; }
.add-to-cart-btn:hover { background:#6d4129; transform:translateY(-2px); box-shadow:0 4px 12px rgba(141,90,58,0.3); }

.not-found { text-align:center; padding:40px; color:#999; font-size:18px; }

/* Zoom */
.zoom-overlay {
  position:fixed; top:0; left:0; width:100vw; height:100vh;
  background:rgba(0,0,0,0.9); display:flex; justify-content:center; align-items:center;
  z-index:9999; cursor:grab;
}
.zoomed-image {
  max-width:95%;
  max-height:95%;
  object-fit:contain;
  transition: transform 0.2s ease;
  cursor:grab;
}

/* التعليقات */
.comments-section {
  margin-top: 20px;
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #eee;
}
.comments-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.comment-input,
.comment-textarea {
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.comment-input:focus,
.comment-textarea:focus {
  outline: none;
  border-color: #8d5a3a;
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.15);
}
.comment-submit-btn {
  align-self: flex-start;
  background: #8d5a3a;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.comment-submit-btn:hover {
  background: #6d4129;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(141, 90, 58, 0.3);
}

.comments-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-card {
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #eee;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.comment-name {
  font-weight: 600;
  color: #8d5a3a;
  font-size: 13px;
}
.comment-date {
  font-size: 11px;
  color: #999;
}
.comment-text {
  margin: 0;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
}
.no-comments {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}

/* Responsive */
@media (max-width:768px) {
  .detail-container { grid-template-columns:1fr; gap:20px; }
  .main-image-container { height:400px; }
  .info-section h1 { font-size:24px; }
  th,td { padding:8px; }
}
</style>
