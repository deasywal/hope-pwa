<script setup>
import { ref, onMounted } from 'vue'

const currentDate = ref('')
const selectedDate = ref('')
const totalPemasukan = ref(0)
const totalKeuntungan = ref(0)
const totalModal = ref(0)
const hasTransactions = ref(false)

// ===== Helper tanggal lokal (anti-UTC shift) =====
function tanggalLokal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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

// ===== Fungsi Load & Hitung Keuangan Berdasarkan HPP Asli =====
function loadDashboardData(dateStr) {
  try {
    const savedTransactions = localStorage.getItem('transactionsList')
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : []

    const savedProducts = localStorage.getItem('productsList')
    const products = savedProducts ? JSON.parse(savedProducts) : []

    if (Array.isArray(transactions) && transactions.length > 0) {
      hasTransactions.value = true

      const selectedTransactions = transactions.filter(t => t.tanggal === dateStr)
      
      let pemasukanHariIni = 0
      let modalHariIni = 0

      selectedTransactions.forEach(t => {
        pemasukanHariIni += Number(t.total) || 0

        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(item => {
            const product = products.find(p => p.id === item.produkId || (p.name === item.nama && p.variant === item.varian))
            if (product) {
              const modalSatuan = Number(product.costing?.totalCost || product.modal || product.cost || 0)
              modalHariIni += modalSatuan * (Number(item.jumlah || item.qty) || 0)
            }
          })
        }
      })

      totalPemasukan.value = pemasukanHariIni
      totalModal.value = modalHariIni
      totalKeuntungan.value = pemasukanHariIni - modalHariIni

      calculateChart(dateStr, transactions)
    } else {
      hasTransactions.value = false
      totalPemasukan.value = 0
      totalKeuntungan.value = 0
      totalModal.value = 0
    }
  } catch (e) {
    console.error('Gagal memuat data dashboard:', e)
  }
}

// ===== Hitung Grafik Statistik =====
function calculateChart(dateStr, transactions) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const namaHari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  const selisihKeSenin = (new Date(y, m - 1, d).getDay() + 6) % 7

  const hari = namaHari.map((nama, i) => {
    const dt = new Date(y, m - 1, d - selisihKeSenin + i)
    return { key: tanggalLokal(dt), day: nama, total: 0 }
  })

  transactions.forEach(t => {
    const target = hari.find(h => h.key === t.tanggal)
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
        <p class="empty-text">Belum ada data penjualan. Grafik akan naik otomatis saat ada transaksi.</p>
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
        <h4 class="card-value">Rp 0</h4>
        <span class="card-trend">Belum ada pengeluaran</span>
      </div>

      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Keuntungan</span>
          <img src="/images/icons8-profit-50.png" alt="Keuntungan" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalKeuntungan.toLocaleString('id-ID') }}</h4>
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
  background-color: #ffffff; /* Background disamakan putih bersih */
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
  color: #111;
}

.date-card {
  background: #ffffff;
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
  border: 2px solid #e0e3eb;
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
  background-color: #5352ed;
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
  font-size: 11px;
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
  color: #1e272e;
}

.card-trend {
  font-size: 11px;
  color: #718093;
}

.card-trend.up {
  color: #2ed573;
  font-weight: bold;
}
</style>