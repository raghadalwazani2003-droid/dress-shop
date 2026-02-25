import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || 'https://dress-shop-backend-y4l0.onrender.com').replace(/\/$/, '')

const API = axios.create({
  baseURL: BASE,
  withCredentials: false,
})

export default API
