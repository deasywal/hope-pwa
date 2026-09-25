<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout-utama">
    <!-- Bagian Navigasi Atas (Header) -->
    <header class="navbar">
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

    <!-- Tempat halaman akan berganti-ganti (Dashboard, Produk, dll akan muncul di dalam sini) -->
    <main class="konten-halaman">
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