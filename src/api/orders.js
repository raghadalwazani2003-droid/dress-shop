import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Submit order to backend.
 * @param {Object} order - Order payload: { items, governorate, phone, notes, deliveryDate, paymentMethod, total, createdAt }
 * @returns {Promise<boolean>} - true if backend accepted, false if API unavailable (fallback to localStorage)
 */
export async function submitOrder(order) {
  try {
    await API.post('/orders', order)
    return true
  } catch (err) {
    // Backend not available or error - caller will fallback to localStorage
    if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
      console.warn('Orders API unavailable, using localStorage fallback')
    }
    return false
  }
}
