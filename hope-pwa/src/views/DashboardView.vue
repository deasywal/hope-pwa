<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore'

// ===== SEMENTARA: pemilik data lama (yang belum punya userEmail) =====
// Isi dengan email akun pemilik data lama. Setelah dijalankan sekali,
// hapus baris ini, fungsi isiUserEmailLama, dan blok pemanggilnya di onMounted.
const EMAIL_PEMILIK_DATA_LAMA = 'deasywall1203@gmail.com'

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

// State penampung data dari Firestore khusus user aktif
const transactionList = ref([])
const productList = ref([])
const expenseList = ref([])

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
    return (itemId != null && (p.id === itemId || p.firebaseId === itemId)) || (pName === trxName && pVar === trxVar)
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

// ===== SEMENTARA: beri pemilik pada data lama yang belum punya userEmail =====
async function isiUserEmailLama(emailPemilik) {
  let jumlahDiperbarui = 0
  for (const nama of ['products', 'transactions', 'expenses']) {
    const snap = await getDocs(collection(db, nama))
    for (const d of snap.docs) {
      if (!d.data().userEmail) {
        await updateDoc(doc(db, nama, d.id), { userEmail: emailPemilik })
        jumlahDiperbarui++
      }
    }
  }
  if (jumlahDiperbarui > 0) {
    alert(`Selesai: ${jumlahDiperbarui} data lama sekarang milik ${emailPemilik}.`)
  }
}

onMounted(async () => {
  const today = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  currentDate.value = today.toLocaleDateString('id-ID', options)
  const todayIso = tanggalLokal(today)
  selectedDate.value = todayIso

  // SEMENTARA: hanya jalan kalau yang login adalah pemilik data lama
  const activeEmail = (localStorage.getItem('umkmPhone') || '').trim().toLowerCase()
  if (activeEmail && activeEmail === EMAIL_PEMILIK_DATA_LAMA.trim().toLowerCase()) {
    try {
      await isiUserEmailLama(activeEmail)
    } catch (e) {
      console.error('Gagal mengisi userEmail data lama:', e)
    }
  }

  await fetchUserDataFromCloud(todayIso)
})

// ===== Ambil Data dari Firestore berdasarkan Akun yang Login =====
async function fetchUserDataFromCloud(dateStr) {
  const activeEmail = (localStorage.getItem('umkmPhone') || '').trim().toLowerCase()
  if (!activeEmail) return

  // Ambil satu koleksi, hanya milik akun yang sedang login
  const ambil = async (nama) => {
    const q = query(collection(db, nama), where('userEmail', '==', activeEmail))
    const snap = await getDocs(q)
    return snap.docs.map(docSnap => ({ firebaseId: docSnap.id, ...docSnap.data() }))
  }

  try {
    transactionList.value = await ambil('transactions')
  } catch (e) {
    console.error('Gagal mengambil transaksi:', e)
    transactionList.value = []
  }

  try {
    productList.value = await ambil('products')
  } catch (e) {
    console.error('Gagal mengambil produk:', e)
    productList.value = []
  }

  try {
    expenseList.value = await ambil('expenses')
  } catch (e) {
    console.error('Gagal mengambil pengeluaran:', e)
    expenseList.value = []
  }

  loadDashboardData(dateStr)
}

// ===== Fungsi Load & Hitung Keuangan =====
function loadDashboardData(dateStr) {
  try {
    const transactions = transactionList.value
    const products = productList.value
    const expenses = expenseList.value

    const pengeluaranTanggal = expenses.filter(
      e => e.tanggal && String(e.tanggal).trim().substring(0, 10) === dateStr
    )
    pengeluaranList.value = [...pengeluaranTanggal].reverse()
    totalPengeluaran.value = pengeluaranTanggal.reduce((acc, e) => acc + (Number(e.nominal ?? e.jumlah ?? 0) || 0), 0)

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

// ===== Simpan pengeluaran ke Firestore =====
const simpanPengeluaran = async () => {
  const nominal = Number(String(expenseAmount.value).replace(/\D/g, ''))
  if (!expenseNote.value.trim() || nominal <= 0) {
    alert('Isi keterangan dan nominal pengeluaran dengan benar!')
    return
  }

  try {
    const activeEmail = (localStorage.getItem('umkmPhone') || '').trim().toLowerCase()
    const newExpense = {
      userEmail: activeEmail,
      tanggal: selectedDate.value,
      keterangan: expenseNote.value.trim(),
      nominal,
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'expenses'), newExpense)
    expenseList.value.push({ firebaseId: docRef.id, ...newExpense })

    expenseNote.value = ''
    expenseAmount.value = ''
    showExpenseForm.value = false
    loadDashboardData(selectedDate.value)
  } catch (e) {
    console.error('Gagal menyimpan pengeluaran ke Firestore:', e)
    alert('Gagal menyimpan pengeluaran ke server.')
  }
}

// ===== Hapus catatan pengeluaran dari Firestore =====
const hapusPengeluaran = async (firebaseId) => {
  if (!confirm('Hapus catatan pengeluaran hari ini?')) return
  try {
    if (firebaseId) {
      await deleteDoc(doc(db, 'expenses', firebaseId))
    }
    expenseList.value = expenseList.value.filter(e => e.firebaseId !== firebaseId)
    loadDashboardData(selectedDate.value)
  } catch (e) {
    console.error('Gagal menghapus pengeluaran dari Firestore:', e)
    alert('Gagal menghapus pengeluaran dari server.')
  }
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
          <span class="card-title">Omzet Hari Ini</span>
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

      <div v-for="e in pengeluaranList" :key="e.firebaseId || e.id" class="expense-item">
        <div class="expense-item-info">
          <span class="expense-item-note">{{ e.keterangan || e.nama }}</span>
          <strong class="expense-item-amount">{{ formatRupiah(e.nominal ?? e.jumlah) }}</strong>
        </div>
        <button class="expense-delete-btn" @click="hapusPengeluaran(e.firebaseId)">Hapus</button>
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
}

.expense-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 14px;
}
</style>