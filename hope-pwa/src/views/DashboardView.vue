<script setup>
import { ref, onMounted } from 'vue'

const currentDate = ref('')
const selectedDate = ref('')
const totalPemasukan = ref(0)
const totalKeuntungan = ref(0)
const totalModal = ref(0)
const hasTransactions = ref(false)

// ===== Helper tanggal (waktu lokal, bukan UTC) =====
function tanggalLokal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// ===== State untuk data grafik 7 hari terakhir =====
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

// ===== Fungsi Load & Hitung Data Dashboard =====
function loadDashboardData(dateStr) {
  try {
    const savedTransactions = localStorage.getItem('transactionsList')
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : []

    if (Array.isArray(transactions) && transactions.length > 0) {
      hasTransactions.value = true

      // Hitung data untuk tanggal terpilih
      const selectedTransactions = transactions.filter(t => t.tanggal === dateStr)
      const pemasukanHariIni = selectedTransactions.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)

      totalPemasukan.value = pemasukanHariIni
      totalKeuntungan.value = pemasukanHariIni * 0.3
      totalModal.value = pemasukanHariIni * 0.7

      // Hitung grafik minggu dari tanggal terpilih
      calculateChart(dateStr, transactions)
    } else {
      hasTransactions.value = false
      totalPemasukan.value = 0
      totalKeuntungan.value = 0
      totalModal.value = 0
    }
  } catch (e) {
    console.error('Gagal memuat data transaksi:', e)
  }
}

// ===== Hitung Statistik Grafik (urutan tetap Sen - Min, minggu dari tanggal terpilih) =====
function calculateChart(dateStr, transactions) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const namaHari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  // Cari hari Senin di minggu tanggal terpilih
  const selisihKeSenin = (new Date(y, m - 1, d).getDay() + 6) % 7

  const hari = namaHari.map((nama, i) => {
    const dt = new Date(y, m - 1, d - selisihKeSenin + i)
    return { key: tanggalLokal(dt), day: nama, total: 0 }
  })

  // Jumlahkan transaksi sesuai tanggal aslinya
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

// ===== Handler Ubah Tanggal =====
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
    
    <!-- Kotak Tanggal dengan Tombol Ikon -->
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
            :title="item.day + ': Rp ' + item.total.toLocaleString()"
          ></div>
        </div>
        <div class="chart-labels">
          <span v-for="(item, idx) in weeklyChartData" :key="idx">{{ item.day }}</span>
        </div>
      </div>
    </section>

    <!-- Kartu Informasi Keuangan dengan Ikon -->
    <section class="financial-grid">
      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Pemasukan Hari Ini</span>
          <img src="/images/icons8-money-50.png" alt="Pemasukan" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalPemasukan.toLocaleString() }}</h4>
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
        <h4 class="card-value">Rp {{ totalKeuntungan.toLocaleString() }}</h4>
        <span class="card-trend up">Estimasi bersih</span>
      </div>

      <div class="card info-card">
        <div class="card-header-flex">
          <span class="card-title">Modal</span>
          <img src="/images/icons8-stock-50.png" alt="Modal" class="card-icon" />
        </div>
        <h4 class="card-value">Rp {{ totalModal.toLocaleString() }}</h4>
        <span class="card-trend">Dari produk</span>
      </div>
    </section>

  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 16px;
  font-family: sans-serif;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

/* Kotak Tanggal */
.date-card {
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
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
  color: #718093;
  font-weight: bold;
}

.date-value {
  font-size: 13px;
  font-weight: bold;
  color: #2f3640;
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
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.date-icon-wrapper:hover .date-icon-btn {
  background-color: #dfe4ea;
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
  border: 1px solid #dcdde1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.stats-header h3 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #2f3640;
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
  font-size: 11px;
  color: #718093;
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
  font-size: 15px;
  font-weight: 800;
  color: #2f3640;
}

.card-trend {
  font-size: 10px;
  color: #718093;
}

.card-trend.up {
  color: #2ed573;
  font-weight: bold;
}
</style>