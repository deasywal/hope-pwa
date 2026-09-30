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

    <!-- Navigasi Bawah Menggunakan File Gambar Asli dari Folder -->
    <nav v-if="!hideNav" class="bottom-nav">
      <router-link to="/dashboard" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-market-50.png" alt="Beranda" class="nav-icon" />
        <span>Beranda</span>
      </router-link>

      <router-link to="/produk" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-product-50.png" alt="Produk" class="nav-icon" />
        <span>Produk</span>
      </router-link>

      <router-link to="/transaksi" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-sales-50.png" alt="Penjualan" class="nav-icon" />
        <span>Penjualan</span>
      </router-link>

      <router-link to="/laporan" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-report-50.png" alt="Laporan" class="nav-icon" />
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
  padding-bottom: 75px;
  border-left: 1px solid #dcdde1;
  border-right: 1px solid #dcdde1;
}

.main-content {
  width: 100%;
}

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
  height: 65px;
  box-sizing: border-box;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #718093;
  font-size: 11px;
  font-weight: bold;
  gap: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.6;
}

.nav-item:hover {
  background-color: #f5f6fa;
}

.nav-item.active {
  color: #2f3640;
  background-color: #f5f6fa;
  border-top: 2px solid #2f3640;
}

.nav-item.active .nav-icon {
  opacity: 1;
}
</style>