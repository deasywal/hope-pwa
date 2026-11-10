<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()

// Konfigurasi durasi splash screen
const SPLASH_DURATION = 3000 

onMounted(async () => {
  const waktuAkses = new Date()
  const jamAksesStr = waktuAkses.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const tanggalAksesStr = waktuAkses.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  // 1. Hitung frekuensi akses
  let totalAkses = Number(localStorage.getItem('hompisAppVisits') || 0) + 1
  localStorage.setItem('hompisAppVisits', totalAkses)

  // 2. Ambil informasi nama pemilik / user dari Cloud Firestore
  let namaPengguna = 'Tamu / Pemilik UMKM'
  try {
    const userSnapshot = await getDocs(collection(db, 'users'))
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data()
      namaPengguna = userData.ownerName || userData.namaPemilik || 'Asywal'
    }
  } catch (e) {
    console.error('Gagal memuat profil user di splash:', e)
  }

  // 3. Tampilkan log l
  console.log(
    `[HOMPIS PWA SPLASH LOG]\n` +
    `• Jam Akses      : ${jamAksesStr} (${tanggalAksesStr})\n` +
    `• Durasi Loading : ${SPLASH_DURATION / 1000} Detik\n` +
    `• Frekuensi Buka : Sudah ${totalAkses} kali dibuka\n` +
    `• Pengguna (User): ${namaPengguna}`
  )

  // 4. Proses pengecekan login & navigasi setelah durasi selesai
  setTimeout(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, SPLASH_DURATION)
})
</script>

<template>
  <div class="splash-container">
    <div class="splash-content">
      <!-- Logo -->
      <img src="/images/hompis1.png" alt="HOMPIS Logo" class="splash-logo" />
      
      <!-- Kata - kata Hari Ini -->
      <div class="splash-text-group">
        <h2 class="splash-title">Hitung Omzet dan Penjualan Kripik Pisang Bananif</h2>
        <p class="splash-subtitle">Halo, Pemilik UMKM Bananif, Semangat terus mengembangkan usahamu!</p>
      </div>
      
      <!-- Efek Loading -->
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- Watermark & Versi -->
    <div class="splash-footer-inline">
      <span class="watermark-text">© Capston Project 44/B</span>
      <span class="version-text">v0.1.0.0</span>
    </div>
  </div>
</template>

<style scoped>

.splash-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  box-sizing: border-box;
  border-left: 1px solid #dcdde1;
  border-right: 1px solid #dcdde1;
  padding: 20px;
  overflow: hidden;
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
  width: 180px;
  height: auto;
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
  font-size: 15px;
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
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 20px calc(24px + env(safe-area-inset-bottom, 0px));
}

.watermark-text {
  font-size: 13px;
  color: #57606f;
  font-weight: bold;
  letter-spacing: 0.4px;
}

.version-text {
  font-size: 12px;
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