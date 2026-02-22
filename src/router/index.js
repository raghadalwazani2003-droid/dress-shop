import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Winter from '../views/Winter.vue'
import CartView from '../views/CartView.vue'
import Login from '../views/Login.vue'
import Category from '../views/Category.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Favorites from '../views/Favorites.vue'
import RegisterEmail from '../views/RegisterEmail.vue'
import RegisterOtp from '../views/RegisterOtp.vue'
import VerifyEmail from '../views/VerifyEmail.vue'
import Search from '../views/Search.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import Delivery from '../views/Delivery.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import Exchange from '../views/Exchange.vue'
import AuthPage from '../views/AuthPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/winter', name: 'Winter', component: Winter },
  { path: '/category/:name', name: 'Category', component: Category },
  { path: '/dress/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: CartView },
  { path: '/favorites', name: 'Favorites', component: Favorites },

  { path: '/auth', name: 'Auth', component: AuthPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: RegisterOtp },
  { path: '/register-email', name: 'RegisterEmail', component: RegisterEmail },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail },

  { path: '/search', name: 'Search', component: Search },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/delivery', name: 'Delivery', component: Delivery },
  { path: '/privacy', name: 'Privacy', component: Privacy },
  { path: '/terms', name: 'Terms', component: Terms },
  { path: '/exchange', name: 'Exchange', component: Exchange },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
