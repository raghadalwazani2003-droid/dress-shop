<template>
  <div class="cart-page" :dir="language === 'ar' ? 'rtl' : 'ltr'">
    <div class="cart-header">
      <h1>{{ language === 'ar' ? 'السلة' : 'Cart' }}</h1>
      <span v-if="cart.length > 0" class="item-count">{{ totalItems }} {{ language === 'ar' ? 'منتج' : 'items' }}</span>
    </div>

    <div v-if="cart.length === 0" class="empty-cart">
      <p>{{ language === 'ar' ? 'السلة فارغة' : 'Your cart is empty' }}</p>
    </div>

    <div v-else class="cart-layout">
      <!-- Left: Cart items + Delivery form -->
      <div class="cart-main">
        <section class="cart-items-section">
          <h2>{{ language === 'ar' ? 'المنتجات' : 'Products' }}</h2>
          <div class="cart-items">
            <div v-for="(item, index) in cart" :key="index" class="cart-item">
              <div class="item-image">
                <img :src="item.image" alt="dress" />
              </div>
              <div class="item-info">
                <p class="item-name">{{ language === 'ar' ? item.name : item.nameEn }}</p>
                <p class="item-meta">{{ language === 'ar' ? 'مقاس' : 'Size' }}: {{ item.size }}</p>
                <p v-if="item.embroidery" class="item-meta">{{ language === 'ar' ? 'التطريز' : 'Embroidery' }}: {{ item.embroidery }}</p>
                <p class="item-price">{{ (item.price * (item.qty || 1)).toFixed(1) }} JD</p>
              </div>
              <div class="item-actions">
                <div class="quantity-selector">
                  <button type="button" @click="changeQty(index, -1)" :disabled="(item.qty || 1) <= 1">−</button>
                  <input type="number" v-model.number="cart[index].qty" min="1" @change="syncCart" />
                  <button type="button" @click="changeQty(index, 1)">+</button>
                </div>
                <button type="button" class="remove-btn" @click="removeItem(index)">
                  {{ language === 'ar' ? 'حذف' : 'Remove' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="delivery-section">
          <h2>{{ language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details' }}</h2>
          <div class="form-row">
            <div class="form-group">
              <label>{{ language === 'ar' ? 'المحافظة' : 'Province' }}</label>
              <select v-model="selectedGov">
                <option value="" disabled>{{ language === 'ar' ? 'اختاري المحافظة' : 'Select Province' }}</option>
                <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ language === 'ar' ? 'رقم الهاتف' : 'Phone Number' }}</label>
              <input type="tel" v-model="phone" :placeholder="language === 'ar' ? '0791234567' : '+962791234567'" />
            </div>
          </div>
          <div class="form-group">
            <label>{{ language === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
            <textarea v-model="notes" :placeholder="language === 'ar' ? 'اكتبي أي ملاحظات خاصة...' : 'Add any special notes...'"></textarea>
          </div>
          <div class="form-group">
            <label>{{ language === 'ar' ? 'يوم التوصيل' : 'Delivery Day' }}</label>
            <select v-model="selectedDelivery">
              <option value="" disabled>{{ language === 'ar' ? 'اختاري يوم التوصيل' : 'Select Delivery Day' }}</option>
              <option v-for="day in availableDeliveryDays" :key="day.value" :value="day.value">{{ day.label }}</option>
            </select>
            <small v-if="isAfter5PM" class="delivery-note">
              {{ language === 'ar' ? 'ملاحظة: الطلبات بعد الساعة 5 مساء لن تُسلم غداً' : 'Orders after 5 PM will not be delivered tomorrow' }}
            </small>
          </div>
        </section>
      </div>

      <!-- Right: Sticky summary panel -->
      <aside class="summary-panel">
        <div class="panel-inner">
          <h2>{{ language === 'ar' ? 'ملخص الطلب' : 'Order Summary' }}</h2>

          <div class="payment-section">
            <label class="section-label">{{ language === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}</label>
            <p v-if="requiresDirectPayment" class="card-required-note">
              {{ language === 'ar' ? 'أكثر من 3 منتجات → الدفع يجب أن يكون عبر فيزا أو زين كاش' : 'More than 3 items → Payment must be direct via Visa or Zain Cash' }}
            </p>
            <div class="payment-cards">
              <label
                v-for="pm in paymentMethods"
                :key="pm.id"
                class="payment-card"
                :class="{ selected: selectedPayment === pm.id, disabled: requiresDirectPayment && pm.id === 'cash' }"
              >
                <input
                  type="radio"
                  :value="pm.id"
                  v-model="selectedPayment"
                  :disabled="requiresDirectPayment && pm.id === 'cash'"
                />
                <span class="payment-icon">{{ pm.icon }}</span>
                <span class="payment-text">{{ language === 'ar' ? pm.labelAr : pm.labelEn }}</span>
              </label>
            </div>
          </div>

          <div class="order-summary">
            <div class="summary-row">
              <span>{{ language === 'ar' ? 'عدد المنتجات' : 'Number of items' }}</span>
              <span>{{ totalItems }}</span>
            </div>
            <div class="summary-row total-row">
              <span>{{ language === 'ar' ? 'الإجمالي' : 'Total price' }}</span>
              <span class="total-amount">{{ totalPrice.toFixed(1) }} JD</span>
            </div>
          </div>

          <button type="button" class="confirm-btn" @click="submitOrder">
            {{ language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order' }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { submitOrder as submitOrderApi } from '../api/orders'

const { language } = useLanguage()

const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

cart.value.forEach(item => {
  if (!item.qty) item.qty = 1
})

const governorates = ['عمّان', 'الزرقاء', 'إربد', 'المفرق', 'البلقاء', 'مأدبا', 'الكرك', 'معان', 'العقبة', 'جرش', 'عجلون', 'الطفيلة']
const selectedGov = ref('')
const phone = ref('')
const notes = ref('')
const selectedDelivery = ref('')
const selectedPayment = ref('')

const paymentMethods = [
  { id: 'cash', icon: '💵', labelEn: 'Cash on Delivery', labelAr: 'الدفع عند الاستلام' },
  { id: 'card', icon: '💳', labelEn: 'Visa / MasterCard', labelAr: 'فيزا / ماستركارد' },
  { id: 'zaincash', icon: '📱', labelEn: 'Zain Cash', labelAr: 'زين كاش' }
]

const totalItems = computed(() => cart.value.reduce((sum, item) => sum + (item.qty || 1), 0))
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + item.price * (item.qty || 1), 0))
const requiresDirectPayment = computed(() => totalItems.value > 3)
const selectedPaymentLabel = computed(() => {
  const pm = paymentMethods.find(p => p.id === selectedPayment.value)
  return pm ? (language.value === 'ar' ? pm.labelAr : pm.labelEn) : ''
})

watch(requiresDirectPayment, (req) => {
  if (req && selectedPayment.value === 'cash') {
    selectedPayment.value = 'card'
  }
}, { immediate: true })

const isAfter5PM = computed(() => {
  const now = new Date()
  const jordanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Amman' }))
  return jordanTime.getHours() >= 17
})

const availableDeliveryDays = computed(() => {
  const today = new Date()
  const jordanToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Amman' }))
  const days = []
  const startDay = isAfter5PM.value ? 2 : 1
  for (let i = startDay; i < startDay + 3; i++) {
    const d = new Date(jordanToday)
    d.setDate(d.getDate() + i)
    const locale = language.value === 'ar' ? 'ar-JO' : 'en-US'
    const label = d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    days.push({ value: d.toISOString().split('T')[0], label })
  }
  return days
})

function syncCart() {
  cart.value = cart.value.map(item => ({ ...item, qty: Math.max(1, item.qty || 1) }))
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

function changeQty(index, change) {
  const newQty = (cart.value[index].qty || 1) + change
  if (newQty >= 1) {
    cart.value[index].qty = newQty
    localStorage.setItem('cart', JSON.stringify(cart.value))
  }
}

function removeItem(index) {
  cart.value.splice(index, 1)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

async function submitOrder() {
  if (!selectedGov.value || !phone.value || !selectedDelivery.value) {
    alert(language.value === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields')
    return
  }
  if (!selectedPayment.value) {
    alert(language.value === 'ar' ? 'الرجاء اختيار طريقة الدفع' : 'Please select a payment method')
    return
  }

  const order = {
    items: cart.value,
    governorate: selectedGov.value,
    phone: phone.value,
    notes: notes.value,
    deliveryDate: selectedDelivery.value,
    paymentMethod: selectedPayment.value,
    total: totalPrice.value,
    createdAt: new Date().toISOString()
  }

  const success = await submitOrderApi(order)

  if (!success) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))
  }

  const deliveryLabel = availableDeliveryDays.value.find(d => d.value === selectedDelivery.value).label
  const paymentLabel = selectedPaymentLabel.value
  if (language.value === 'ar') {
    alert(`✅ تم استلام طلبك بنجاح!\nالمحافظة: ${selectedGov.value}\nيوم التوصيل: ${deliveryLabel}\nطريقة الدفع: ${paymentLabel}\nسيتم التواصل معك على ${phone.value}`)
  } else {
    alert(`✅ Your order has been received successfully!\nGovernorate: ${selectedGov.value}\nDelivery Date: ${deliveryLabel}\nPayment: ${paymentLabel}\nWe will contact you at ${phone.value}`)
  }

  cart.value = []
  selectedGov.value = ''
  phone.value = ''
  notes.value = ''
  selectedDelivery.value = ''
  selectedPayment.value = requiresDirectPayment.value ? 'card' : ''
  localStorage.setItem('cart', JSON.stringify([]))
}
</script>

<style scoped>
.cart-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.cart-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.cart-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111;
}

.item-count {
  font-size: 14px;
  color: #666;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

/* Layout */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 32px;
  align-items: start;
}

.cart-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cart items section */
.cart-items-section h2,
.delivery-section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  gap: 16px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 18px;
  align-items: center;
}

.item-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f9f9f9;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0 0 4px 0;
  font-weight: 700;
  font-size: 15px;
  color: #333;
}

.item-meta {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}

.item-price {
  margin: 0;
  font-weight: 700;
  font-size: 15px;
  color: #8d5a3a;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  background: #f9f9f9;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  color: #8d5a3a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-selector button:hover:not(:disabled) {
  background: rgba(141, 90, 58, 0.08);
}

.quantity-selector button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 44px;
  height: 36px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.remove-btn {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ff6b6b;
  color: white;
}

/* Delivery section */
.delivery-section {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8d5a3a;
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.1);
}

.form-group textarea {
  min-height: 56px;
  resize: vertical;
}

.delivery-note {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #ff9800;
}

/* Sticky summary panel */
.summary-panel {
  position: sticky;
  top: 100px;
}

.panel-inner {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.panel-inner h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.card-required-note {
  margin: -4px 0 12px 0;
  font-size: 12px;
  color: #ff9800;
}

.payment-section {
  margin-bottom: 20px;
}

.payment-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
  min-height: 52px;
}

.payment-card:hover:not(.disabled) {
  border-color: #8d5a3a;
  background: rgba(141, 90, 58, 0.04);
}

.payment-card.selected {
  border-color: #8d5a3a;
  background: rgba(141, 90, 58, 0.08);
  box-shadow: 0 0 0 2px rgba(141, 90, 58, 0.15);
}

.payment-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.payment-card input {
  accent-color: #8d5a3a;
}

.payment-icon {
  font-size: 24px;
  line-height: 1;
}

.payment-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.order-summary {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.total-row {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
  font-weight: 700;
  font-size: 16px;
}

.total-amount {
  color: #8d5a3a;
  font-size: 18px;
}

.confirm-btn {
  width: 100%;
  padding: 16px 24px;
  background: #8d5a3a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 52px;
}

.confirm-btn:hover {
  background: #7a4a2d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(141, 90, 58, 0.3);
}

/* Responsive */
@media (max-width: 992px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .cart-page {
    padding: 16px 12px;
  }

  .cart-item {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #eee;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .panel-inner {
    padding: 24px;
  }

  .delivery-section {
    padding: 20px;
  }
}
</style>
