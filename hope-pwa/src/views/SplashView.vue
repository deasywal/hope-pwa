<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, 2500) // Durasi
})
</script>

<template>
  <div class="splash-container">
    <div class="splash-content">
      <!-- Logo -->
      <img src="/images/Hope_logo.png" alt="HOPE Logo" class="splash-logo" />
      
      <!-- Kata - kata Hari Ini -->
      <div class="splash-text-group">
        <h2 class="splash-title">Hitung Omzet dan Penjualan Elektronik</h2>
        <p class="splash-subtitle">Halo, Pemilik UMKM, Semangat terus mengembangkan usahamu!</p>
      </div>
      
      <!-- Efek Loading Titik Berputar -->
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Watermark & Versi -->
      <div class="splash-footer-inline">
        <span class="watermark-text">© Capston Project 44/B</span>
        <span class="version-text">v0.1.0.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  border-left: 1px solid #dcdde1;
  border-right: 1px solid #dcdde1;
  padding: 20px;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  animation: fadeIn 0.6s ease-in-out;
  width: 100%;
  margin-top: -30px;
}

/* Logo */
.splash-logo {
  height: 95px;
  width: auto;
  object-fit: contain;
}

.splash-text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.splash-title {
  font-size: 18px;
  font-weight: bold;
  color: #2f3640;
  margin: 0;
}

.splash-subtitle {
  font-size: 13px;
  color: #718093;
  margin: 0;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.loading-dots span {
  width: 9px;
  height: 9px;
  background-color: #3367DA;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

/* Watermark & Versi */
.splash-footer-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.watermark-text {
  font-size: 13px;
  color: #57606f;
  font-weight: bold;
  letter-spacing: 0.4px;
}

.version-text {
  font-size: 11px;
  color: #718093;
  font-weight: 500;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>