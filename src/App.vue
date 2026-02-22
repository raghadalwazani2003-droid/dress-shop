<template>
  <div id="app">
    <SplashScreen />
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import SplashScreen from './components/SplashScreen.vue'
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  color: #111;
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
