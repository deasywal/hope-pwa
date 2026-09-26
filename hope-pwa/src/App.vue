<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

// Mengecek apakah halaman saat ini adalah halaman login atau register
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
</script>

<template>
  <div class="layout-utama">
    <!-- Navbar hanya akan muncul jika BUKAN halaman login atau register -->
    <header v-if="!isAuthPage" class="navbar">
      <div class="logo">
        <h2>HOPE UMKM</h2>
      </div>
      <nav class="menu">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/produk">Produk</RouterLink>
        <RouterLink to="/transaksi">Transaksi</RouterLink>
        <RouterLink to="/laporan">Laporan</RouterLink>
      </nav>
    </header>

    <!-- Tempat konten halaman berganti-ganti -->
    <main :class="{ 'konten-halaman': !isAuthPage }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* CSS Dasar untuk merapikan posisi menu supaya tidak berantakan */
.layout-utama {
  font-family: sans-serif;
}

.navbar {
  background-color: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.logo h2 {
  margin: 0;
}

.menu {
  display: flex;
  gap: 15px;
}

.menu a {
  color: #bdc3c7;
  text-decoration: none;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
}

.menu a:hover, .menu a.router-link-exact-active {
  background-color: #34495e;
  color: white;
}

.konten-halaman {
  padding: 20px;
}
</style>