<script setup>
import { ref, computed, onMounted } from 'vue'

// State Data
const productList = ref([])
const transactionList = ref([])
const aktifTab = ref('statistik') // 'statistik' atau 'terlaris'

// Helper tanggal lokal (YYYY-MM-DD), bukan UTC supaya tidak mundur sehari dini hari
function tanggalLokal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const hariIni = tanggalLokal()

// State Tanggal Filter (Default hari ini)
const tanggalFilter = ref(hariIni)

// Helper Tanggal Hari Ini
function formatTanggalHariIni() {
  const d = new Date()
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const tanggalHariIniStr = formatTanggalHariIni()

function formatTanggal(iso) {
  if (!iso) return ''
  const parts = iso.split('-').map(Number)
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Bulan yang dipilih (YYYY-MM) dari tanggal filter
const bulanFilter = computed(() => (tanggalFilter.value || hariIni).slice(0, 7))
const isBulanIni = computed(() => bulanFilter.value === hariIni.slice(0, 7))

// Format Tanggal 
const formatFilterTeks = computed(() => {
  const parts = bulanFilter.value.split('-').map(Number)
  if (parts.length < 2 || !parts[0] || !parts[1]) return 'Pilih Tanggal'
  const [y, m] = parts
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

// Format Rupiah
function rupiah(angka) {
  return 'Rp ' + Number(angka || 0).toLocaleString('id-ID')
}

// Ambil data dari localStorage saat komponen dimuat
onMounted(() => {
  const savedProducts = localStorage.getItem('productsList')
  if (savedProducts) {
    try {
      productList.value = JSON.parse(savedProducts)
    } catch (e) {
      console.error(e)
    }
  }

  const savedTransactions = localStorage.getItem('transactionsList')
  if (savedTransactions) {
    try {
      transactionList.value = JSON.parse(savedTransactions)
    } catch (e) {
      console.error(e)
    }
  }
})

// Transaksi valid = tidak bertanggal di masa depan
const transaksiValid = computed(() =>
  transactionList.value.filter(t => t.tanggal && String(t.tanggal).trim().substring(0, 10) <= hariIni)
)

// Transaksi pada bulan yang dipilih
const transaksiBulan = computed(() =>
  transaksiValid.value.filter(t => String(t.tanggal).trim().substring(0, 7) === bulanFilter.value)
)

// Riwayat bulan ini, terbaru di atas (tanggal, lalu id)
const transaksiBulanUrut = computed(() =>
  [...transaksiBulan.value].sort((a, b) =>
    String(b.tanggal).localeCompare(String(a.tanggal)) || (b.id || 0) - (a.id || 0)
  )
)

// HPP per pcs: snapshot di item -> data produk -> 0 (sama dengan hitungan di Beranda)
function hppSatuan(item) {
  const snapshot = Number(item.hpp ?? item.hppPerPcs ?? 0)
  if (snapshot > 0) return snapshot

  const trxName = (item.nama || item.name || '').trim().toLowerCase()
  const trxVar = (item.varian || item.variant || 'original').trim().toLowerCase()

  const prod = productList.value.find(p => {
    const pName = (p.name || p.nama || '').trim().toLowerCase()
    const pVar = (p.variant || p.varian || 'original').trim().toLowerCase()
    const itemId = item.produkId ?? item.productId
    return (itemId != null && p.id === itemId) || (pName === trxName && pVar === trxVar)
  })
  if (!prod) return 0

  return Number(prod.costing?.totalCost ?? prod.modal ?? prod.cost ?? 0) || 0
}

// Perhitungan Statistik Bulan Ini
const totalPenjualanBulanIni = computed(() => {
  return transaksiBulan.value.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
})

const totalProdukTerjual = computed(() => {
  let count = 0
  transaksiBulan.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        count += Number(item.jumlah || item.qty || 0)
      })
    }
  })
  return count
})

// Total Pengeluaran / Modal dari produk yang terjual
const totalPengeluaranBulanIni = computed(() => {
  let totalModal = 0
  transaksiBulan.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(trxItem => {
        const qty = Number(trxItem.jumlah || trxItem.qty || 0)
        totalModal += hppSatuan(trxItem) * qty
      })
    }
  })
  return Math.round(totalModal)
})

const totalKeuntunganBulanIni = computed(() => {
  return totalPenjualanBulanIni.value - totalPengeluaranBulanIni.value
})

// Perhitungan Produk Terlaris
const produkTerlarisList = computed(() => {
  const penjualanMap = {}

  transaksiValid.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        const cleanName = (item.nama || item.name || '').trim().toLowerCase()
        const cleanVar = (item.varian || item.variant || 'Original').trim().toLowerCase()
        const key = `${cleanName}-${cleanVar}`

        if (!penjualanMap[key]) {
          // Gambar diambil dari data produk (item transaksi tidak menyimpan gambar)
          const prod = productList.value.find(p => p.id === (item.produkId ?? item.productId))
          penjualanMap[key] = {
            nama: item.nama || item.name,
            varian: item.varian || item.variant || 'Original',
            totalTerjual: 0,
            image: prod?.image || item.image || '/images/icons8-new-product-50.png'
          }
        }
        penjualanMap[key].totalTerjual += Number(item.jumlah || item.qty || 0)
      })
    }
  })

  return Object.values(penjualanMap).sort((a, b) => b.totalTerjual - a.totalTerjual)
})
</script>

<template>
  <div class="laporan-container">
    <!-- Header Laporan -->
    <div class="header-section">
      <h2>Laporan</h2>
      <p class="subtitle">Lihat ringkasan keuangan dan performa produk.</p>
    </div>

    <!-- Tombol Tab Pilihan -->
    <div class="tab-switch-container">
      <button 
        class="tab-btn" 
        :class="{ active: aktifTab === 'statistik' }"
        @click="aktifTab = 'statistik'"
      >
        Statistik Bulanan
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: aktifTab === 'terlaris' }"
        @click="aktifTab = 'terlaris'"
      >
        Produk Terlaris
      </button>
    </div>

    <!-- Statistik Bulanan -->
    <div v-if="aktifTab === 'statistik'">
      
      <!-- Filter Tanggal -->
      <div class="filter-card-display">
        <span class="filter-text">{{ formatFilterTeks }}</span>
        <div class="filter-right-wrapper">
          <div class="icon-date-container">
            <img src="/images/icons8-plus-1-month-50.png" alt="Bulan" class="icon-asset-small" />
            <input 
              type="date" 
              v-model="tanggalFilter" 
              class="hidden-date-input"
            />
          </div>
        </div>
      </div>

      <!-- Banner Utama Pendapatan -->
      <div class="main-revenue-banner-white">
        <div class="banner-top">
          <span class="banner-title">{{ isBulanIni ? 'Total Pendapatan Bulan Ini' : 'Total Pendapatan ' + formatFilterTeks }}</span>
        </div>
        <h1 class="banner-amount-dark">{{ rupiah(totalPenjualanBulanIni) }}</h1>
        <div class="banner-date-text">
          <span>{{ isBulanIni ? tanggalHariIniStr : formatFilterTeks }}</span>
        </div>
      </div>

      <!-- Data Penjualan Bulanan -->
      <div class="summary-grid">
        <!-- Total Penjualan -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Penjualan</span>
            <img src="/images/icons8-money-50.png" alt="Penjualan" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ rupiah(totalPenjualanBulanIni) }}</h3>
          <span class="box-sub">Dari transaksi terbaru</span>
        </div>

        <!-- Total Produk Terjual -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Produk Terjual</span>
            <img src="/images/icons8-stock-50.png" alt="Produk" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ totalProdukTerjual }} pcs</h3>
          <span class="box-sub">Akumulasi penjualan</span>
        </div>

        <!-- Total Pengeluaran -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Pengeluaran</span>
            <img src="/images/icons8-bill-50.png" alt="Pengeluaran" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ rupiah(totalPengeluaranBulanIni) }}</h3>
          <span class="box-sub">Biaya modal/produk</span>
        </div>

        <!-- Total Keuntungan -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Keuntungan</span>
            <img src="/images/icons8-profit-50.png" alt="Keuntungan" class="icon-asset-small" />
          </div>
          <h3 class="box-value profit-value">{{ rupiah(totalKeuntunganBulanIni) }}</h3>
          <span class="box-sub">Estimasi bersih</span>
        </div>
      </div>

      <!-- Rincian Transaksi Terbaru -->
      <div class="section-container mt-16">
        <h3 class="section-title">{{ isBulanIni ? 'Riwayat Transaksi Bulan Ini' : 'Riwayat Transaksi ' + formatFilterTeks }}</h3>
        <p v-if="transaksiBulanUrut.length === 0" class="empty-info">Belum ada transaksi tercatat pada bulan ini.</p>
        
        <div v-for="trx in transaksiBulanUrut" :key="trx.id" class="trx-history-item">
          <div class="trx-info">
            <span class="trx-date">{{ formatTanggal(trx.tanggal) }}</span>
            <span class="trx-items-count">{{ trx.items ? trx.items.length : 0 }} jenis produk dibeli</span>
          </div>
          <div class="trx-total-price">
            <strong>{{ rupiah(trx.total) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Produk Terlaris -->
    <div v-else class="terlaris-section">
      <div class="section-header-row">
        <h3 class="section-title">Produk / Varian Terlaris</h3>
        <span class="section-sub">Berdasarkan jumlah terjual</span>
      </div>

      <div v-if="produkTerlarisList.length === 0" class="empty-card">
        <p>Belum ada data penjualan produk.</p>
      </div>

      <div 
        v-for="(prod, index) in produkTerlarisList" 
        :key="index" 
        class="card product-rank-card"
      >
        <div class="rank-number" :class="{ 'rank-1-box': index === 0 }">
          <img v-if="index === 0" src="/images/icons8-best-seller-50.png" alt="Best Seller" class="best-seller-icon" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <img :src="prod.image" alt="Produk" class="rank-thumb" />
        <div class="rank-info">
          <h4 class="rank-name">{{ prod.nama }} - {{ prod.varian }}</h4>
        </div>
        <div class="rank-total">
          <strong>{{ prod.totalTerjual }} pcs</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}

input:focus, button:focus, *:focus {
  outline: none !important;
  box-shadow: none !important;
}

.laporan-container {
  padding: 16px 20px 100px;
  min-height: 100vh;
  background: #ffffff;
  max-width: 600px;
  margin: 0 auto;
  color: #111;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.header-section h2 {
  font-size: 20px;
  margin: 0 0 4px;
  color: #1e272e;
}

.subtitle {
  color: #57606f;
  margin: 0 0 16px;
  font-size: 13px;
}

.tab-switch-container {
  display: flex;
  background: white;
  border: 2px solid #e0e3eb;
  padding: 6px;
  border-radius: 14px;
  gap: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: bold;
  color: #696d74;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #5352ed;
  color: white;
  box-shadow: 0 2px 6px rgba(83, 82, 237, 0.3);
}

.filter-card-display {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.filter-text {
  font-weight: bold;
  font-size: 15px;
  color: #31517d;
}

.filter-right-wrapper {
  display: flex;
  align-items: center;
}

.icon-date-container {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.icon-asset-small {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.main-revenue-banner-white {
  background: white;
  border: 2px solid #7477ee;
  border-radius: 16px;
  padding: 20px;
  color: #111;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.banner-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.banner-title {
  font-size: 13px;
  font-weight: bold;
  color: #696d74;
}

.banner-amount-dark {
  font-size: 28px;
  font-weight: bold;
  margin: 4px 0 6px 0;
  letter-spacing: 0.5px;
  color: #1e272e;
}

.banner-date-text {
  font-size: 12px;
  color: #57606f;
  font-weight: 500;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-box {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.box-label {
  font-size: 12px;
  color: #696d74;
  font-weight: bold;
}

.box-value {
  font-size: 16px;
  font-weight: bold;
  color: #111;
  margin: 4px 0 2px;
}

.box-sub {
  font-size: 11px;
  color: #2ed573;
  font-weight: 500;
}

.profit-value {
  color: #2ed573;
}

.section-container {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 16px;
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #1e272e;
}

.empty-info {
  font-size: 12px;
  color: #718093;
  text-align: center;
  padding: 10px 0;
  margin: 0;
}

.trx-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f6;
}

.trx-history-item:last-child {
  border-bottom: none;
}

.trx-info {
  display: flex;
  flex-direction: column;
}

.trx-date {
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
}

.trx-items-count {
  font-size: 11px;
  color: #718093;
}

.trx-total-price {
  font-size: 13px;
  color: #27ae60;
  font-weight: bold;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-sub {
  font-size: 11px;
  color: #718093;
}

.empty-card {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #718093;
  font-size: 13px;
}

.product-rank-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dcdde1;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.rank-number {
  width: 28px;
  height: 28px;
  background: #f1f2f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #57606f;
  flex-shrink: 0;
}

.rank-number.rank-1-box {
  background: transparent;
  width: 32px;
  height: 32px;
}

.best-seller-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.rank-thumb {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 8px;
  background: #f1f2f6;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  margin: 0;
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-total {
  font-size: 13px;
  font-weight: bold;
  color: #5352ed;
  flex-shrink: 0;
}
</style>