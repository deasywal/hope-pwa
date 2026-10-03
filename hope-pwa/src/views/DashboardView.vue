<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showProfileMenu = ref(false)
const showProfileModal = ref(false)
const currentDate = ref('')
const selectedDate = ref('')
const totalPemasukan = ref(0)
const totalKeuntungan = ref(0)
const totalModal = ref(0)
const hasTransactions = ref(false)

const brandName = ref(localStorage.getItem('umkmBrandName') || 'Bananif')
const phoneNum = ref(localStorage.getItem('umkmPhone') || '')

const editForm = ref({
  brandName: brandName.value,
  phone: phoneNum.value,
  password: ''
})

onMounted(() => {
  const today = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  currentDate.value = today.toLocaleDateString('id-ID', options)
  selectedDate.value = today.toISOString().split('T')[0]

  try {
    const savedTransactions = localStorage.getItem('transactionsList')
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions)
      if (Array.isArray(transactions) && transactions.length > 0) {
        hasTransactions.value = true
        totalPemasukan.value = transactions.reduce((acc, curr) => acc + (curr.total || 0), 0)
        totalKeuntungan.value = totalPemasukan.value * 0.3
        totalModal.value = totalPemasukan.value * 0.7
      }
    }
  } catch (e) {
    console.error('Gagal memuat data transaksi:', e)
  }
})

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const openProfileModal = () => {
  editForm.value.brandName = brandName.value
  editForm.value.phone = phoneNum.value
  showProfileMenu.value = false
  showProfileModal.value = true
}

const saveProfileChanges = () => {
  brandName.value = editForm.value.brandName
  phoneNum.value = editForm.value.phone
  
  localStorage.setItem('umkmBrandName', brandName.value)
  localStorage.setItem('umkmPhone', phoneNum.value)
  if (editForm.value.password) {
    localStorage.setItem('umkmPassword', editForm.value.password)
  }

  showProfileModal.value = false
  alert('Informasi usaha berhasil diperbarui!')
}

const onDateChange = (event) => {
  const chosen = new Date(event.target.value)
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  currentDate.value = chosen.toLocaleDateString('id-ID', options)
}

const logout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header Sejajar (Sapaan Kiri & Menu Kanan) -->
    <header class="app-header">
      <div class="welcome-header-text">
        <h2>Halo, Pemilik UMKM {{ brandName }}</h2>
        <p>Semangat terus mengembangkan usahamu!</p>
      </div>

      <div class="profile-wrapper">
        <button @click="toggleProfileMenu" class="profile-btn">
          <span>Menu</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <div v-if="showProfileMenu" class="profile-dropdown">
          <button @click="openProfileModal" class="dropdown-item">Pengaturan Akun</button>
          <button @click="logout" class="dropdown-item logout">Keluar</button>
        </div>
      </div>
    </header>

    <!-- Kotak Tanggal dengan Tombol Ikon (Hanya area ikon yang interaktif) -->
    <section class="date-card">
      <div class="date-content">
        <span class="date-title">Tanggal:</span>
        <span class="date-value">{{ currentDate }}</span>
      </div>
      
      <!-- Bungkus Ikon Tanggal dengan Wrapper agar input transparan hanya di area ini -->
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
        <p class="active-text">Grafik Penjualan Aktif</p>
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

    <!-- Modal Pengaturan Akun -->
    <div v-if="showProfileModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Pengaturan UMKM & Profil</h3>
        
        <div class="input-group">
          <label>Nama Usaha / Brand</label>
          <input v-model="editForm.brandName" type="text" placeholder="Contoh: HOPE Elektronik" />
        </div>

        <div class="input-group">
          <label>Nomor Telepon / WhatsApp</label>
          <input v-model="editForm.phone" type="text" placeholder="Contoh: 081234567890" />
        </div>

        <div class="input-group">
          <label>Password Baru (Opsional)</label>
          <input v-model="editForm.password" type="password" placeholder="Kosongkan jika tidak diubah" />
        </div>

        <div class="modal-actions">
          <button @click="showProfileModal = false" class="btn-cancel">Batal</button>
          <button @click="saveProfileChanges" class="btn-save">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 16px;
  padding-bottom: 90px;
  font-family: sans-serif;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.welcome-header-text h2 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #2f3640;
}

.welcome-header-text p {
  margin: 0;
  font-size: 12px;
  color: #718093;
}

.profile-wrapper {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #dcdde1;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #2f3640;
}

.dropdown-arrow {
  font-size: 10px;
  color: #718093;
}

.profile-dropdown {
  position: absolute;
  right: 0;
  top: 40px;
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 150px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #2f3640;
  font-weight: bold;
  border-bottom: 1px solid #f1f2f6;
}

.dropdown-item:hover {
  background-color: #f1f2f6;
}

.dropdown-item.logout {
  color: #e74c3c;
  border-bottom: none;
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

/* Wrapper Khusus Area Ikon Saja yang Interaktif & Ada Hover */
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

/* Efek hover hanya aktif ketika kursor diarahkan ke area ikon tanggal */
.date-icon-wrapper:hover .date-icon-btn {
  background-color: #dfe4ea;
}

.date-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
  object-fit: contain;
}

/* Input date transparan hanya menutupi area tombol ikon di ujung */
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
  gap: 12px;
  height: 60px;
  width: 100%;
  margin-bottom: 12px;
  border-bottom: 1px dashed #dcdde1;
  padding-bottom: 4px;
}

.bar.placeholder {
  width: 16px;
  background-color: #dfe4ea;
  border-radius: 4px 4px 0 0;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #2f3640;
}

.input-group {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  font-size: 11px;
  color: #718093;
  font-weight: bold;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn-cancel {
  background: #f1f2f6;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  color: #718093;
  cursor: pointer;
}

.btn-save {
  background: #2f3640;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;
}
</style>