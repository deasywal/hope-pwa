<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Sembunyikan navbar bawah jika sedang di halaman Login atau Register
const hideNav = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <div class="app-container">
    <!-- Konten Halaman yang Berubah-ubah -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Navigasi Bawah Tetap (4 Menu Utama) -->
    <nav v-if="!hideNav" class="bottom-nav">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <span>Beranda</span>
      </router-link>
      <router-link to="/produk" class="nav-item" exact-active-class="active">
        <span>Produk</span>
      </router-link>
      <router-link to="/transaksi" class="nav-item" exact-active-class="active">
        <span>Penjualan</span>
      </router-link>
      <router-link to="/laporan" class="nav-item" exact-active-class="active">
        <span>Laporan</span>
      </router-link>
    </nav>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f5f6fa;
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 100vh;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 70px; /* Jarak agar konten tidak tertutup nav */
  border-left: 1px solid #dcdde1;
  border-right: 1px solid #dcdde1;
}

.main-content {
  width: 100%;
}

/* Desain Navigasi Bawah (Bottom Bar) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-top: 1px solid #dcdde1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: 60px;
  box-sizing: border-box;
  z-index: 1000;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #718093;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background-color: #f5f6fa;
}

/* Warna saat menu aktif/dipilih */
.nav-item.active {
  color: #2f3640;
  background-color: #f5f6fa;
  border-top: 2px solid #2f3640;
}
</style>