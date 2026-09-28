<script setup>
import { ref, onMounted } from 'vue'

// Variabel untuk nama Brand dan informasi user 
const brandName = ref('Nama Usaha')
const ownerEmail = ref('')

onMounted(() => {
  // Data dari localStorage yang disimpan saat Register
  const savedData = localStorage.getItem('registeredAccount')
  if (savedData) {
    const account = JSON.parse(savedData)
    brandName.value = account.brandName || 'Nama Usaha'
    ownerEmail.value = account.email || ''
  }
})

// Tanggal hari ini
const tanggalHariIni = 'Senin, 28 September 2026'
</script>

<template>
  <div class="dashboard-container">
    
    <!-- Bagian Header: Halo & Nama Usaha -->
    <div class="header-card">
      <h2 class="welcome-title">Halo, {{ brandName }}</h2>
      <p class="sub-text">Pemilik UMKM</p>
    </div>

    <!-- Tanggal -->
    <div class="date-text">
      {{ tanggalHariIni }}
    </div>

    <!-- Ringkasan Keuangan (Grid 2x2) -->
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-label">Pemasukan Hari Ini</span>
        <span class="stat-value">Rp 0</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Pengeluaran Hari Ini</span>
        <span class="stat-value">Rp 0</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Keuntungan</span>
        <span class="stat-value">Rp 0</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Modal</span>
        <span class="stat-value">Rp 0</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f4f7f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: sans-serif;
  box-sizing: border-box;
}

/* Kartu Header */
.header-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.welcome-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.sub-text {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
}

.date-text {
  font-size: 13px;
  color: #95a5a6;
  padding-left: 4px;
}

/* Grid Keuangan */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-box {
  background: #ffffff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 1px 4px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

/* Navbar 4 Menu */
.menu-utama-section {
  margin-top: 8px;
}

.menu-utama-title {
  font-size: 15px;
  font-weight: bold;
  color: #3c5369;
  margin-bottom: 10px;
}

.menu-grid {
  display: flex;
  gap: 8px; 
  width: 100%;
}

.menu-item {
  flex: 1;
  background: #ffffff;
  padding: 14px 6px; 
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  color: #34495e;
  font-weight: 600;
  font-size: 13px; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #ecf0f1;
  color: #2980b9;
}
</style>