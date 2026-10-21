<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const showProfileMenu = ref(false)
const brandName = ref(localStorage.getItem('umkmBrandName') || 'Bananif')

// Untuk update brand name secara langsung
onMounted(() => {
  window.addEventListener('storage', () => {
    brandName.value = localStorage.getItem('umkmBrandName') || 'Bananif'
  })
})

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const goToProfile = () => {
  showProfileMenu.value = false
  router.push('/profil')
}

const logout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

// Buat Menghilangkan Navbar dan Header pas lagi dimenu Login / Register
const hideNav = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <div class="app-container">
    
    <!-- Header Global -->
    <header v-if="!hideNav" class="app-header">
      <!-- Logo pojok kiri atas -->
      <div class="header-logo">
        <div class="logo-crop">
          <img src="/images/Hope_logo.png" alt="HOPE" class="logo-img" />
        </div>
      </div>

      <div class="welcome-header-text">
        <h2>Halo, Pemilik UMKM {{ brandName }}</h2>
        <p>Semangat terus mengembangkan usahamu!</p>
      </div>

      <!-- Tombol Menu di Kanan Atas -->
      <div class="profile-wrapper">
        <button @click="toggleProfileMenu" class="profile-btn">
          <span>Menu</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <!-- Kotak Dropdown Menu yang Diperbesar -->
        <div v-if="showProfileMenu" class="profile-dropdown">
          <button @click="goToProfile" class="dropdown-item">Profil</button>
          <button @click="logout" class="dropdown-item logout">Keluar</button>
        </div>
      </div>
    </header>

    <!-- Konten Halaman (Dashboard, Produk, Transaksi, Laporan, Profil) -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Navbar Bawah -->
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

.app-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0 16px;
  margin-bottom: 12px;
  background-color: #ffffff;
}

.header-logo {
  width: 100%;
  margin-bottom: 8px;
}

.logo-crop {
  width: auto;
  height: auto;
}

.logo-img {
  display: block;
  height: 44px;
  width: auto;
  background: none;
}

.welcome-header-text h2 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #2f3640;
}

.welcome-header-text p {
  margin: 0;
  font-size: 12px;
  color: #718093;
}

.profile-wrapper {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #dcdde1;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: #2f3640;
}

.dropdown-arrow {
  font-size: 11px;
  color: #718093;
}

.profile-dropdown {
  position: absolute;
  right: 0;
  top: 48px;
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  width: 160px;
  z-index: 1000;
  overflow: hidden;
}

/* Title Profil & Keluar */
.dropdown-item {
  width: 100%;
  padding: 13px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #2f3640;
  font-weight: bold;
  border-bottom: 1px solid #f1f2f6;
}

.dropdown-item:hover {
  background-color: #f5f6fa;
}

.dropdown-item.logout {
  color: #e74c3c;
  border-bottom: none;
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