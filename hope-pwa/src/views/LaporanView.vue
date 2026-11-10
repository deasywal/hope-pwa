<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

// ===== state data =====
const productList = ref([])
const transactionList = ref([])
const expenseList = ref([])
const aktifTab = ref('statistik') // 'statistik' atau 'terlaris'
const bukaCatatan = ref(false) // dropdown catatan pengeluaran
const bukaRiwayat = ref(false) // dropdown riwayat transaksi

// helper tanggal lokal
function tanggalLokal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const hariIni = tanggalLokal()

// state tanggal filter
const tanggalFilter = ref(hariIni)

// format tanggal hari ini
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

// format tanggal indonesia
function formatTanggal(iso) {
  if (!iso) return ''
  const parts = String(iso).split('-').map(Number)
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// state bulan yang dipilih
const bulanFilter = computed(() => (tanggalFilter.value || hariIni).slice(0, 7))
const isBulanIni = computed(() => bulanFilter.value === hariIni.slice(0, 7))

// format teks filter bulan
const formatFilterTeks = computed(() => {
  const parts = bulanFilter.value.split('-').map(Number)
  if (parts.length < 2 || !parts[0] || !parts[1]) return 'Pilih Tanggal'
  const [y, m] = parts
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

// format rupiah
function rupiah(angka) {
  const n = Number(angka || 0)
  return (n < 0 ? '-Rp ' : 'Rp ') + Math.abs(n).toLocaleString('id-ID')
}

// total pcs terjual dalam satu transaksi
function totalPcsTransaksi(trx) {
  if (!trx.items || !Array.isArray(trx.items)) return 0
  return trx.items.reduce((sum, item) => sum + (Number(item.jumlah || item.qty) || 0), 0)
}

// format ringkasan nama produk dalam 1 transaksi
function formatNamaProdukTrx(trx) {
  if (!trx.items || !Array.isArray(trx.items) || trx.items.length === 0) {
    return formatTanggal(trx.tanggal)
  }
  const listNama = trx.items.map(item => item.nama || item.name || 'Produk').join(', ')
  return listNama
}

// nominal & nama pengeluaran
const nominalExp = e => Number(e.nominal ?? e.jumlah ?? e.amount ?? e.harga ?? 0) || 0
const namaExp = e => e.nama || e.keterangan || e.name || e.catatan || 'Pengeluaran'

// ambil data dari cloud firestore saat pertama buka
onMounted(async () => {
  const activeEmail = (localStorage.getItem('umkmPhone') || '').trim().toLowerCase()
  if (!activeEmail) return

  // fungsi helper ambil koleksi berdasarkan email
  const ambil = async (nama) => {
    const q = query(collection(db, nama), where('userEmail', '==', activeEmail))
    const snap = await getDocs(q)
    return snap.docs.map(docSnap => ({
      firebaseId: docSnap.id,
      ...docSnap.data()
    }))
  }

  try {
    productList.value = await ambil('products')
    transactionList.value = await ambil('transactions')
  } catch (e) {
    console.error('Gagal memuat data laporan dari Firestore:', e)
  }

  try {
    expenseList.value = await ambil('expenses')
  } catch (err) {
    console.log('Koleksi pengeluaran belum ada di Firestore, diabaikan.')
  }
})

// filter transaksi valid
const transaksiValid = computed(() =>
  transactionList.value.filter(t => t.tanggal)
)

// transaksi pada bulan yang dipilih
const transaksiBulan = computed(() =>
  transaksiValid.value.filter(t => String(t.tanggal).trim().substring(0, 7) === bulanFilter.value)
)

// pengeluaran pada bulan yang dipilih
const pengeluaranBulan = computed(() =>
  expenseList.value.filter(e => {
    if (!e.tanggal) return false
    const tgl = String(e.tanggal).trim()
    return tgl.substring(0, 7) === bulanFilter.value
  })
)

// urutkan catatan pengeluaran bulan ini
const pengeluaranBulanUrut = computed(() =>
  [...pengeluaranBulan.value].sort((a, b) =>
    String(b.tanggal).localeCompare(String(a.tanggal))
  )
)

// urutkan riwayat transaksi bulan ini
const transaksiBulanUrut = computed(() =>
  [...transaksiBulan.value].sort((a, b) =>
    String(b.tanggal).localeCompare(String(a.tanggal)) || (b.id || 0) - (a.id || 0)
  )
)

// hitung hpp per pcs produk
function hppSatuan(item) {
  const snapshot = Number(item.hpp ?? item.hppPerPcs ?? 0)
  if (snapshot > 0) return snapshot

  const trxName = (item.nama || item.name || '').trim().toLowerCase()
  const trxVar = (item.varian || item.variant || 'original').trim().toLowerCase()
  const itemId = item.produkId ?? item.productId

  const prod = productList.value.find(p => {
    const pName = (p.name || p.nama || '').trim().toLowerCase()
    const pVar = (p.variant || p.varian || 'original').trim().toLowerCase()
    
    const matchId = itemId != null && (String(p.id) === String(itemId) || p.firebaseId === itemId)
    const matchNameVar = (pName === trxName && pVar === trxVar)

    return matchId || matchNameVar
  })
  if (!prod) return 0

  return Number(prod.costing?.totalCost ?? prod.modal ?? prod.cost ?? 0) || 0
}

// total penjualan bulan ini
const totalPenjualanBulanIni = computed(() => {
  return transaksiBulan.value.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
})

// total produk terjual bulan ini
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

// total modal dari produk terjual
const totalModalBulanIni = computed(() => {
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

// total pengeluaran operasional bulan ini
const totalPengeluaranBulanIni = computed(() => {
  return pengeluaranBulan.value.reduce((sum, e) => sum + nominalExp(e), 0)
})

// total keuntungan bersih bulan ini
const totalKeuntunganBulanIni = computed(() => {
  return totalPenjualanBulanIni.value - totalModalBulanIni.value - totalPengeluaranBulanIni.value
})

// perhitungan produk terlaris
const produkTerlarisList = computed(() => {
  const penjualanMap = {}

  transaksiBulan.value.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        const cleanName = (item.nama || item.name || '').trim().toLowerCase()
        const cleanVar = (item.varian || item.variant || 'Original').trim().toLowerCase()
        const key = `${cleanName}-${cleanVar}`

        if (!penjualanMap[key]) {
          const prod = productList.value.find(p => String(p.id) === String(item.produkId ?? item.productId) || p.firebaseId === (item.produkId ?? item.productId))
          penjualanMap[key] = {
            nama: item.nama || item.name,
            varian: item.varian || item.variant || 'Original',
            totalTerjual: 0,
            totalOmzet: 0,
            image: prod?.image || item.image || '/images/icons8-new-product-50.png'
          }
        }

        const qty = Number(item.jumlah || item.qty || 0)
        const subtotal = Number(item.subtotal) || qty * (Number(item.harga ?? item.price) || 0)

        penjualanMap[key].totalTerjual += qty
        penjualanMap[key].totalOmzet += subtotal
      })
    }
  })

  return Object.values(penjualanMap).sort((a, b) => b.totalTerjual - a.totalTerjual)
})
</script>

<template>
  <div class="laporan-container">
    <!-- header laporan -->
    <div class="header-section">
      <h2>Laporan</h2>
      <p class="subtitle">Lihat ringkasan keuangan dan penjualan produk.</p>
    </div>

    <!-- tombol tab pilihan (statistik / terlaris) -->
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

    <!-- filter bulan -->
    <div class="filter-card-display">
      <span class="filter-text">{{ formatFilterTeks }}</span>
      <div class="filter-right-wrapper">
        <div class="icon-date-container">
          <img src="/images/icons8-plus-1-month-50.png" alt="Bulan" class="icon-asset-small" />
          <input
            type="date"
            v-model="tanggalFilter"
            :max="hariIni"
            class="hidden-date-input"
          />
        </div>
      </div>
    </div>

    <!-- statistik bulanan -->
    <div v-if="aktifTab === 'statistik'">

      <!-- banner utama pendapatan -->
      <div class="main-revenue-banner-white">
        <div class="banner-top">
          <span class="banner-title">{{ isBulanIni ? 'Total Pendapatan Bulan Ini' : 'Total Pendapatan ' + formatFilterTeks }}</span>
        </div>
        <h1 class="banner-amount-dark">{{ rupiah(totalPenjualanBulanIni) }}</h1>
        <div class="banner-date-text">
          <span>{{ isBulanIni ? tanggalHariIniStr : formatFilterTeks }}</span>
        </div>
      </div>

      <!-- data penjualan bulanan (grid box) -->
      <div class="summary-grid">
        <!-- total keuntungan -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Keuntungan</span>
            <img src="/images/icons8-profit-50.png" alt="Keuntungan" class="icon-asset-small" />
          </div>
          <h3 class="box-value profit-value" :class="{ negatif: totalKeuntunganBulanIni < 0 }">
            {{ rupiah(totalKeuntunganBulanIni) }}
          </h3>
          <span class="box-sub" :class="{ 'box-sub-negatif': totalKeuntunganBulanIni < 0 }">Estimasi bersih</span>
        </div>

        <!-- total produk terjual -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Produk Terjual</span>
            <img src="/images/icons8-product1-50.png" alt="Produk" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ totalProdukTerjual }} pcs</h3>
          <span class="box-sub">Akumulasi penjualan</span>
        </div>

        <!-- total modal -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Modal</span>
            <img src="/images/icons8-stock-50.png" alt="Modal" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ rupiah(totalModalBulanIni) }}</h3>
          <span class="box-sub">Biaya modal/produk</span>
        </div>

        <!-- total pengeluaran -->
        <div class="summary-box">
          <div class="box-header">
            <span class="box-label">Total Pengeluaran</span>
            <img src="/images/icons8-bill-50.png" alt="Pengeluaran" class="icon-asset-small" />
          </div>
          <h3 class="box-value">{{ rupiah(totalPengeluaranBulanIni) }}</h3>
          <span class="box-sub">{{ totalPengeluaranBulanIni > 0 ? 'Biaya operasional' : 'Belum ada pengeluaran' }}</span>
        </div>
      </div>

      <!-- bagian catatan pengeluaran -->
      <div class="simple-expense-section">
        <div class="simple-expense-clickable" @click="bukaCatatan = !bukaCatatan">
          <span class="simple-title-blue">Catatan Pengeluaran Bulan Ini</span>
        </div>

        <!-- dropdown rincian pengeluaran -->
        <div v-if="bukaCatatan" class="expense-dropdown-clean">
          <p v-if="pengeluaranBulanUrut.length === 0" class="empty-info-clean">
            Belum ada catatan pengeluaran pada bulan ini.
          </p>
          
          <!-- list rincian item pengeluaran -->
          <div
            v-for="(e, i) in pengeluaranBulanUrut"
            :key="e.firebaseId ?? e.id ?? i"
            class="expense-row-item"
          >
            <div class="trx-info-spaced">
              <span class="expense-row-name">{{ namaExp(e) }}</span>
              <span class="expense-row-date">{{ formatTanggal(String(e.tanggal).trim().substring(0, 10)) }}</span>
            </div>
            <strong class="expense-row-nominal">{{ rupiah(nominalExp(e)) }}</strong>
          </div>

          <!-- total di bawah list pengeluaran -->
          <div v-if="pengeluaranBulanUrut.length > 0" class="expense-total-footer-row">
            <span class="expense-total-label">Total Pengeluaran</span>
            <strong class="expense-total-amount">{{ rupiah(totalPengeluaranBulanIni) }}</strong>
          </div>
        </div>
      </div>

      <!-- bagian riwayat transaksi bulan ini -->
      <div class="simple-expense-section mt-16">
        <div class="simple-expense-clickable" @click="bukaRiwayat = !bukaRiwayat">
          <span class="simple-title-blue">
            {{ isBulanIni ? 'Riwayat Transaksi Bulan Ini' : 'Riwayat Transaksi ' + formatFilterTeks }}
          </span>
        </div>

        <!-- dropdown rincian riwayat transaksi -->
        <div v-if="bukaRiwayat" class="expense-dropdown-clean">
          <p v-if="transaksiBulanUrut.length === 0" class="empty-info-clean">
            Belum ada transaksi tercatat pada bulan ini.
          </p>

          <!-- list riwayat transaksi -->
          <div
            v-for="trx in transaksiBulanUrut"
            :key="trx.firebaseId || trx.id"
            class="expense-row-item"
          >
            <div class="trx-info-spaced">
              <span class="expense-row-name">{{ formatNamaProdukTrx(trx) }}</span>
              <span class="expense-row-date">
                {{ formatTanggal(trx.tanggal) }} · {{ totalPcsTransaksi(trx) }} pcs terjual
              </span>
            </div>
            <strong class="trx-item-nominal">{{ rupiah(trx.total) }}</strong>
          </div>

          <!-- total pendapatan di bawah riwayat -->
          <div v-if="transaksiBulanUrut.length > 0" class="expense-total-footer-row">
            <span class="expense-total-label">Total Pendapatan</span>
            <strong class="trx-total-amount">{{ rupiah(totalPenjualanBulanIni) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- tab produk terlaris -->
    <div v-else class="terlaris-section">
      <div class="section-header-row">
        <h3 class="section-title">Produk / Varian Terlaris</h3>
        <span class="section-sub">Berdasarkan jumlah terjual</span>
      </div>

      <div v-if="produkTerlarisList.length === 0" class="empty-card">
        <p>Belum ada data penjualan produk pada {{ isBulanIni ? 'bulan ini' : formatFilterTeks }}.</p>
      </div>

      <!-- list ranking produk terlaris -->
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
          <span class="rank-omzet">Omzet {{ rupiah(prod.totalOmzet) }}</span>
        </div>
        <div class="rank-total">
          <strong>{{ prod.totalTerjual }} pcs</strong>
          <span class="rank-total-label">terjual</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* style dasar & reset */
* {
  -webkit-tap-highlight-color: transparent;
}

input:focus, button:focus, *:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* container utama laporan */
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

/* header section */
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

/* tab switch container */
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
  background: #3367DA;
  color: white;
  box-shadow: 0 2px 6px rgba(83, 82, 237, 0.3);
}

/* filter bulan card */
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
  color: #3367DA;
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

/* banner pendapatan utama */
.main-revenue-banner-white {
  background: white;
  border: 2px solid #3367DA;
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

/* dropdown catatan & riwayat */
.simple-expense-section {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.simple-expense-clickable {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  text-align: center;
}

.simple-title-blue {
  font-size: 14px;
  font-weight: bold;
  color: #3367DA;
}

.expense-dropdown-clean {
  margin-top: 14px;
  border-top: 1px solid #f1f2f6;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expense-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f1f2f6;
}

.trx-info-spaced {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 12px;
}

.expense-row-name {
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
}

.expense-row-date {
  font-size: 12px;
  color: #718093;
}

.expense-row-nominal {
  font-size: 13px;
  color: #e74c3c;
  flex-shrink: 0;
}

.trx-item-nominal {
  font-size: 13px;
  color: #27ae60;
  flex-shrink: 0;
}

.expense-total-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 2px solid #e0e3eb;
}

.expense-total-label {
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
}

.expense-total-amount {
  font-size: 15px;
  font-weight: bold;
  color: #e74c3c;
}

.trx-total-amount {
  font-size: 15px;
  font-weight: bold;
  color: #27ae60;
}

.empty-info-clean {
  font-size: 12px;
  color: #718093;
  text-align: center;
  padding: 10px 0;
  margin: 0;
}

/* grid box statistik */
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

.box-value.negatif {
  color: #e74c3c;
}

.box-sub-negatif {
  color: #e74c3c;
}

.mt-16 {
  margin-top: 16px;
}

/* section header produk terlaris */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  margin: 0;
  color: #1e272e;
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

/* card ranking produk terlaris */
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

.rank-omzet {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  font-weight: bold;
  color: #27ae60;
}

.rank-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
  font-weight: bold;
  color: #3367DA;
  flex-shrink: 0;
}

.rank-total-label {
  font-size: 10px;
  font-weight: normal;
  color: #718093;
  margin-top: 2px;
}
</style>