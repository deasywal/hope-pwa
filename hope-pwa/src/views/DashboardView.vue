<script setup>
import { ref, onMounted } from 'vue'

const currentDate = ref('')
const selectedDate = ref('')
const totalPemasukan = ref(0)
const totalKeuntungan = ref(0)
const totalModal = ref(0)
const totalPengeluaran = ref(0)
const hasTransactions = ref(false)

// catat pengeluaran
const showExpenseForm = ref(false)
const expenseNote = ref('')
const expenseAmount = ref('')
const pengeluaranList = ref([])

// ===== Tanggal =====
function tanggalLokal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// ===== Format rupiah =====
function formatRupiah(angka) {
  const n = Number(angka) || 0
  return (n < 0 ? '-Rp ' : 'Rp ') + Math.abs(n).toLocaleString('id-ID')
}

// ===== Membaca localStorage array =====
function bacaList(key) {
  try {
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ===== Ambil qty item transaksi =====
function ambilQty(item) {
  return Number(item.jumlah ?? item.qty ?? item.quantity ?? item.pcs ?? 0) || 0
}

// ===== Perhitungan HPP per pcs dari item transaksi =====
function hppSatuan(item, products, adaItems) {
  const snapshot = Number(item.hpp ?? item.hppPerPcs ?? item.modal ?? item.cost ?? 0)
  if (snapshot > 0) return snapshot

  const itemId = item.produkId ?? item.productId ?? (adaItems ? item.id : null)
  const trxName = (item.nama || item.name || '').trim().toLowerCase()
  const trxVar = (item.varian || item.variant || 'original').trim().toLowerCase()

  const product = products.find(p => {
    const pName = (p.name || p.nama || '').trim().toLowerCase()
    const pVar = (p.variant || p.varian || 'original').trim().toLowerCase()
    return (itemId != null && p.id === itemId) || (pName === trxName && pVar === trxVar)
  })
  if (!product) return 0

  return Number(
    product.costing?.hppPerPcs ??
    product.costing?.totalCost ??
    product.modal ??
    product.cost ??
    0
  ) || 0
}

// State data grafik 7 hari terakhir
const weeklyChartData = ref([
  { day: 'Sen', total: 0, height: 10 },
  { day: 'Sel', total: 0, height: 10 },
  { day: 'Rab', total: 0, height: 10 },
  { day: 'Kam', total: 0, height: 10 },
  { day: 'Jum', total: 0, height: 10 },
  { day: 'Sab', total: 0, height: 10 },
  { day: 'Min', total: 0, height: 10 }
])

onMounted(() => {
  const today = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  currentDate.value = today.toLocaleDateString('id-ID', options)
  const todayIso = tanggalLokal(today)
  selectedDate.value = todayIso

  loadDashboardData(todayIso)
})

// ===== Fungsi Load & Hitung Keuangan =====
function loadDashboardData(dateStr) {
  try {
    const transactions = bacaList('transactionsList')
    const products = bacaList('productsList')
    const expenses = bacaList('expensesList')

    const pengeluaranTanggal = expenses.filter(
      e => e.tanggal && String(e.tanggal).trim().substring(0, 10) === dateStr
    )
    pengeluaranList.value = [...pengeluaranTanggal].reverse()
    totalPengeluaran.value = pengeluaranTanggal.reduce((acc, e) => acc + (Number(e.nominal) || 0), 0)

    if (transactions.length > 0) {
      hasTransactions.value = true

      const selectedTransactions = transactions.filter(t => {
        if (!t.tanggal) return false
        const tClean = String(t.tanggal).trim().substring(0, 10)
        return tClean === dateStr
      })
      
      let pemasukanHariIni = 0
      let modalHariIni = 0

      selectedTransactions.forEach(t => {
        pemasukanHariIni += Number(t.total) || 0

        const adaItems = Array.isArray(t.items) && t.items.length > 0
        const items = adaItems ? t.items : [t]

        items.forEach(trxItem => {
          const qty = ambilQty(trxItem)
          modalHariIni += hppSatuan(trxItem, products, adaItems) * qty
        })
      })

      totalPemasukan.value = pemasukanHariIni
      totalModal.value = Math.round(modalHariIni)
      totalKeuntungan.value = pemasukanHariIni - Math.round(modalHariIni) - totalPengeluaran.value

      calculateChart(dateStr, transactions)
    } else {
      hasTransactions.value = false
      totalPemasukan.value = 0
      totalModal.value = 0
      totalKeuntungan.value = 0 - totalPengeluaran.value
    }
  } catch (e) {
    console.error('Gagal memuat data dashboard:', e)
  }
}

// ===== Hitung Grafik Statistik =====
function calculateChart(dateStr, transactions) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const namaHari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  // Cari hari Senin di minggu tanggal terpilih
  const selisihKeSenin = (new Date(y, m - 1, d).getDay() + 6) % 7

  const hari = namaHari.map((nama, i) => {
    const dt = new Date(y, m - 1, d - selisihKeSenin + i)
    return { key: tanggalLokal(dt), day: nama, total: 0 }
  })

  transactions.forEach(t => {
    if (!t.tanggal) return
    const tClean = String(t.tanggal).trim().substring(0, 10)
    const target = hari.find(h => h.key === tClean)
    if (target) target.total += Number(t.total) || 0
  })

  const maxVal = Math.max(10000, ...hari.map(h => h.total))

  weeklyChartData.value = hari.map(h => ({
    day: h.day,
    total: h.total,
    height: Math.max(15, Math.round((h.total / maxVal) * 100))
  }))
}

const onDateChange = (event) => {
  const chosenStr = event.target.value
  if (!chosenStr) return
  selectedDate.value = chosenStr
  const [y, m, d] = chosenStr.split('-').map(Number)
  const chosen = new Date(y, m - 1, d)
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  currentDate.value = chosen.toLocaleDateString('id-ID', options)

  loadDashboardData(chosenStr)
}

// ===== Simpan pengeluaran =====
const simpanPengeluaran = () => {
  const nominal = Number(String(expenseAmount.value).replace(/\D/g, ''))
  if (!expenseNote.value.trim() || nominal <= 0) {
    alert('Isi keterangan dan nominal pengeluaran dengan benar!')
    return
  }

  const expenses = bacaList('expensesList')
  expenses.push({
    id: Date.now(),
    tanggal: selectedDate.value,
    keterangan: expenseNote.value.trim(),
    nominal
  })
  localStorage.setItem('expensesList', JSON.stringify(expenses))

  expenseNote.value = ''
  expenseAmount.value = ''
  showExpenseForm.value = false
  loadDashboardData(selectedDate.value)
}

// ===== Hapus catatan pengeluaran =====
const hapusPengeluaran = (id) => {
  if (!confirm('Hapus catatan pengeluaran hari ini?')) return
  const expenses = bacaList('expensesList').filter(e => e.id !== id)
  localStorage.setItem('expensesList', JSON.stringify(expenses))
  loadDashboardData(selectedDate.value)
}
</script>

<template>
  <div class="dashboard-container">
    
    <!-- Kotak Tanggal -->
    <section class="date-card">
      <div class="date-content">
        <span class="date-title">Tanggal:</span>
        <span class="date-value">{{ currentDate }}</span>
      </div>
      
      <div class="date-icon-wrapper" title="Klik untuk ubah tanggal">
        <div class="date-icon-btn">
          <img src="/images/icons8-date-50.png" alt="Date Icon" class="date-icon" />
        </div>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="onDateChange" 
          class="date-input-overlay" 
        />
      </div>
    </section>

    <!-- Grafik Statistik Penjualan -->
    <section class="card stats-section">
      <div class="stats-header">
        <h3>Statistik Penjualan (7 Hari Terakhir)</h3>
      </div>

      <div v-if="!hasTransactions" class="empty-chart">
        <div class="empty-chart-bars">
          <div class="bar placeholder" style="height: 20%;"></div>
          <div class="bar placeholder" style="height: 35%;"></div>
          <div class="bar placeholder" style="height: 25%;"></div>
          <div class="bar placeholder" style="height: 50%;"></div>
          <div class="bar placeholder" style="height: 40%;"></div>
          <div class="bar placeholder" style="height: 60%;"></div>
          <div class="bar placeholder" style="height: 30%;"></div>
        </div>
        <p class="empty-text">Grafik Penjualan</p>
      </div>

      <div v-else class="active-chart">
        <div class="empty-chart-bars">
          <div 
            v-for="(item, idx) in weeklyChartData" 
            :key="idx" 
            class="bar active-bar" 
            :style="{ height: item.height + '%' }"
            :title="item.day + ': Rp ' + item.total.toLocaleString('id-ID')"
          ></div>
        </div>
        <div class="chart-labels">
          <span v-for="(item, idx) in weeklyChartData" :key="idx">{{ item.day }}</span>
        </div>
      </div>
    </section>

    <!-- Informasi Keuangan -->
    <section class="financial-grid">
      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Pemasukan Hari Ini</span>
          <img src="/images/icons8-money-50.png" alt="Pemasukan" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalPemasukan.toLocaleString('id-ID') }}</h4>
        <span class="card-trend up">Dari transaksi terbaru</span>
      </div>

      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Pengeluaran Hari Ini</span>
          <img src="/images/icons8-bill-50.png" alt="Pengeluaran" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalPengeluaran.toLocaleString('id-ID') }}</h4>
        <span class="card-trend">{{ totalPengeluaran > 0 ? 'Biaya operasional' : 'Belum ada pengeluaran' }}</span>
      </div>

      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Keuntungan</span>
          <img src="/images/icons8-profit-50.png" alt="Keuntungan" class="card-icon" />
        </div>
        <h4 class="card-value">{{ formatRupiah(totalKeuntungan) }}</h4>
        <span class="card-trend up">Estimasi bersih</span>
      </div>

      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Modal</span>
          <img src="/images/icons8-stock-50.png" alt="Modal" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalModal.toLocaleString('id-ID') }}</h4>
        <span class="card-trend">Dari produk</span>
      </div>
    </section>

    <!-- Catat Pengeluaran -->
    <section class="expense-section">
      <button v-if="!showExpenseForm" @click="showExpenseForm = true" class="expense-toggle-btn">
        + Catat Pengeluaran
      </button>

      <div v-else class="card expense-form">
        <input
          v-model="expenseNote"
          type="text"
          placeholder="Keterangan (contoh: Plastik)"
          class="expense-input"
        />
        <input
          v-model="expenseAmount"
          type="text"
          inputmode="numeric"
          placeholder="Nominal (contoh: 15000)"
          class="expense-input"
        />
        <div class="expense-actions">
          <button @click="showExpenseForm = false" class="expense-cancel-btn">Batal</button>
          <button @click="simpanPengeluaran" class="expense-save-btn">Simpan</button>
        </div>
      </div>
    </section>

    <!-- Catatan Pengeluaran Dari Tanggal Yang Terpilih -->
    <section class="card expense-list-card">
      <h3 class="expense-list-title">Catatan Pengeluaran</h3>

      <p v-if="pengeluaranList.length === 0" class="expense-empty">
        Belum ada catatan pengeluaran pada hari ini.
      </p>

      <div v-for="e in pengeluaranList" :key="e.id" class="expense-item">
        <div class="expense-item-info">
          <span class="expense-item-note">{{ e.keterangan }}</span>
          <strong class="expense-item-amount">{{ formatRupiah(e.nominal) }}</strong>
        </div>
        <button class="expense-delete-btn" @click="hapusPengeluaran(e.id)">Hapus</button>
      </div>

      <div v-if="pengeluaranList.length > 0" class="expense-total">
        <span>Total Pengeluaran Hari Ini</span>
        <strong>{{ formatRupiah(totalPengeluaran) }}</strong>
      </div>
    </section>

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

.dashboard-container {
  padding: 16px 20px 100px;
  font-family: Arial, sans-serif;
  background-color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
  color: #111;
}

.date-card {
  background:  #ffffff;
  border: 2px solid #e0e3eb;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-title {
  font-size: 13px;
  color: #696d74;
  font-weight: bold;
}

.date-value {
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
}

.date-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.date-icon-btn {
  background: #f1f2f6;
  border: 1px solid #dcdde1;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
  object-fit: contain;
}

.date-input-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.card {
  background: #ffffff;
  border: 2px solid  #e0e3eb;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.stats-header h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1e272e;
}

.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.empty-chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  height: 75px;
  width: 100%;
  margin-bottom: 8px;
  border-bottom: 1px dashed #dcdde1;
  padding-bottom: 4px;
}

.bar.placeholder {
  width: 24px;
  background-color: #dfe4ea;
  border-radius: 6px 6px 0 0;
}

.bar.active-bar {
  width: 24px;
  background-color: #3367DA;
  border-radius: 6px 6px 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
  font-size: 11px;
  color: #718093;
  font-weight: bold;
}

.chart-labels span {
  width: 24px;
  text-align: center;
}

.empty-text {
  font-size: 12px;
  color: #718093;
  text-align: center;
  margin: 0;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-card {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title {
  font-size: 12px;
  color: #696d74;
  font-weight: bold;
  margin-bottom: 0;
}

.card-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.8;
}

.card-value {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 800;
}

.card-trend {
  font-size: 12px;
  color: #718093;
}

.card-trend.up {
  color: #2ed573;
  font-weight: bold;
}

/* ===== Catat Pengeluaran ===== */
.expense-section {
  margin-top: 16px;
}

.expense-toggle-btn {
  width: 100%;
  padding: 14px;
  background: #ffffff;
  border: 2px solid #e0e3eb;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  font-size: 14px;
  font-weight: bold;
  color: #3367DA;
  cursor: pointer;
}

.expense-form {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expense-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 2px solid #d9dce5;
  border-radius: 10px;
  font-size: 14px;
}

.expense-actions {
  dashboard-container {
    padding: 16px 20px 100px;
  }
  display: flex;
  gap: 10px;
}

.expense-cancel-btn,
.expense-save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.expense-cancel-btn {
  background: #f1f2f6;
  color: #2f3640;
}

.expense-save-btn {
  background: #3367DA;
  color: #ffffff;
}

/* ===== Catatan Pengeluaran ===== */
.expense-list-card {
  margin-top: 16px;
  margin-bottom: 0;
}

.expense-list-title {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #1e272e;
}

.expense-empty {
  margin: 0;
  font-size: 13px;
  color: #718093;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.expense-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.expense-item-note {
  font-size: 13px;
  color: #2f3640;
  word-break: break-word;
}

.expense-item-amount {
  font-size: 14px;
  color: #1e272e;
}

.expense-delete-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.expense-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 14px;
}
</style>