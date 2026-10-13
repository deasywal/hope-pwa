<script setup>
import { ref, computed, onMounted } from 'vue'

// ===== State Data =====
const productList = ref([])
const transactionList = ref([])
const aktifTab = ref('statistik') // 'statistik' atau 'terlaris'

// State Tanggal Filter (Default hari ini)
const tanggalFilter = ref(new Date().toISOString().slice(0, 10))

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
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format Tanggal untuk Teks Filter
const formatFilterTeks = computed(() => {
  if (!tanggalFilter.value) return 'Pilih Tanggal'
  const [y, m, d] = tanggalFilter.value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
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

// ===== Perhitungan Statistik Bulan Ini =====
const totalPenjualanBulanIni = computed(() => {
  return transactionList.value.reduce((sum, t) => sum + (t.total || 0), 0)
})

const totalProdukTerjual = computed(() => {
  let count = 0
  transactionList.value.forEach(t => {
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
  transactionList.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(trxItem => {
        const prod = productList.value.find(p => p.id === trxItem.produkId)
        if (prod) {
          const modalSatuan = Number(prod.modal || prod.cost || (prod.price ? prod.price * 0.6 : 0))
          totalModal += modalSatuan * Number(trxItem.jumlah || 0)
        }
      })
    }
  })
  return totalModal
})

const totalKeuntunganBulanIni = computed(() => {
  return totalPenjualanBulanIni.value - totalPengeluaranBulanIni.value
})

// ===== Perhitungan Produk Terlaris =====
const produkTerlarisList = computed(() => {
  const penjualanMap = {}

  transactionList.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        const key = `${item.nama}-${item.varian}`
        if (!penjualanMap[key]) {
          penjualanMap[key] = {
            nama: item.nama,
            varian: item.varian,
            totalTerjual: 0,
            image: item.image || '/images/icons8-new-product-50.png'
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

    <!-- KONTEN TAB 1: STATISTIK BULANAN -->
    <div v-if="aktifTab === 'statistik'">
      
      <!-- Filter Tanggal (Tanpa Tanda Panah Dropdown) -->
      <div class="filter-card-display">
        <span class="filter-text">{{ formatFilterTeks }}</span>
        <div class="filter-right-wrapper">
          <div class="icon-date-container">
            <img src="/images/icons8-date-50.png" alt="Tanggal" class="icon-asset-small" />
            <input 
              type="date" 
              v-model="tanggalFilter" 
              class="hidden-date-input"
            />
          </div>
        </div>
      </div>

      <!-- BANNER UTAMA PENDAPATAN (Tanpa Ikon Uang di Kanan) -->
      <div class="main-revenue-banner-white">
        <div class="banner-top">
          <span class="banner-title">Total Pendapatan Bulan Ini</span>
        </div>
        <h1 class="banner-amount-dark">{{ rupiah(totalPenjualanBulanIni) }}</h1>
        <div class="banner-date-text">
          <span>{{ tanggalHariIniStr }}</span>
        </div>
      </div>

      <!-- RINGKASAN KARTU KECIL DI BAWAH BANNER -->
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

      <!-- BAGIAN BAWAH: RINCIAN TRANSAKSI TERBARU -->
      <div class="section-container mt-16">
        <h3 class="section-title">Riwayat Transaksi Bulan Ini</h3>
        <p v-if="transactionList.length === 0" class="empty-info">Belum ada transaksi tercatat pada bulan ini.</p>
        
        <div v-for="trx in transactionList" :key="trx.id" class="trx-history-item">
          <div class="trx-info">
            <span class="trx-date">{{ formatTanggal(trx.tanggal) }}</span>
            <span class="trx-items-count">{{ trx.items?.length || 0 }} jenis produk dibeli</span>
          </div>
          <div class="trx-total-price">
            <strong>{{ rupiah(trx.total) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- KONTEN TAB 2: PRODUK TERLARIS -->
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
        <div class="rank-number" :class="'rank-' + (index + 1)">
          {{ index === 0 ? '👑' : index + 1 }}
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
  background: #f8f6f2;
  max-width: 600px;
  margin: 0 auto;
  color: #111;
  font-family: Arial, sans-serif;
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
  width: 26px;
  height: 26px;
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

.rank-number.rank-1 {
  background: #fff3cd;
  color: #856404;
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