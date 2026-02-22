<!-- src/components/SplashScreen.vue -->
<template>
  <transition name="fade-out">
    <div v-if="isVisible" class="splash-screen">
      <img
        src="@/assets/Black-White-Minimalist-Professional-Initial-Logo-transparent.png"
        alt="Logo"
        class="splash-logo"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true)

onMounted(() => {
  // مدة ظهور السبللاش (غيّر الرقم حسب ما تحب بالملّي ثانية)
  setTimeout(() => {
    isVisible.value = false
  }, 400) // 0.7 ثانية مثلاً
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0; /* تغطية الشاشة كاملة */
  display: flex;
  justify-content: center;
  align-items: center;
  /* خلفية فاتحة شبه شفافة تخلي اللي وراها مبين */
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(2px); /* اختياري لتنعيم الخلفية */
  z-index: 9999;
  margin: 0;
  padding: 0;
}

/* اللوجو: فقط الأحرف لأن الخلفية شفافة في ملف الصورة */
.splash-logo {
  max-width: 60%;
  max-height: 60%;
  object-fit: contain;
  animation: slideIn 0.5s ease-in-out;
}

/* أنيميشن دخول اللوجو */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ترانزيشن اختفاء/ظهور السبللاش */
.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
}
</style>
