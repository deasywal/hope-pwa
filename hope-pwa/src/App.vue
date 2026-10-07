<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const route = useRoute()
const router = useRouter()

const showProfileMenu = ref(false)
const showProfileModal = ref(false)
const profileWrapper = ref(null)
const brandName = ref(localStorage.getItem('umkmBrandName') || 'Bananif')
const phoneNum = ref(localStorage.getItem('umkmPhone') || '')

const editForm = ref({
  brandName: brandName.value,
  phone: phoneNum.value,
  password: ''
})

// Update brand name secara langsung
function onStorage() {
  brandName.value = localStorage.getItem('umkmBrandName') || 'Bananif'
}

// Tutup dropdown kalau klik di luar menu
function onClickOutside(e) {
  if (profileWrapper.value && !profileWrapper.value.contains(e.target)) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('storage', onStorage)
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('click', onClickOutside)
})

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const openProfilePage = () => {
  showProfileMenu.value = false
  router.push('/profil')
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

const logout = () => {
  showProfileMenu.value = false
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

// Menghilangkan Navbar dan Header saat di halaman Login / Register
const hideNav = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <div class="app-container">

    <!-- Header Global (muncul di semua halaman kecuali Login/Register) -->
    <header v-if="!hideNav" class="app-header">
      <div class="welcome-header-text">
        <h2>Halo, Pemilik UMKM {{ brandName }}</h2>
        <p>Semangat terus mengembangkan usahamu!</p>
      </div>

      <div class="profile-wrapper" ref="profileWrapper">
        <button @click="toggleProfileMenu" class="profile-btn">
          <span>Menu</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <div v-if="showProfileMenu" class="profile-dropdown">
          <button @click="openProfilePage" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profil
          </button>

          <button @click="openProfileModal" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Pengaturan Akun
          </button>

          <button @click="logout" class="dropdown-item logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </header>

    <!-- Konten Halaman (Dashboard, Produk, Transaksi, Laporan, Profil) -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Modal Pengaturan Akun Global -->
    <div v-if="showProfileModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Pengaturan UMKM &amp; Profil</h3>

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

    <!-- Navbar Bawah -->
    <nav v-if="!hideNav" class="bottom-nav">
      <router-link to="/dashboard" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-market-50.png" alt="Beranda" class="nav-icon" />
        <span>Beranda</span>
      </router-link>

      <router-link to="/produk" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-product-50.png" alt="Produk" class="nav-icon" />
        <span>Produk</span>
      </router-link>

      <router-link to="/transaksi" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-sales-50.png" alt="Penjualan" class="nav-icon" />
        <span>Penjualan</span>
      </router-link>

      <router-link to="/laporan" class="nav-item" exact-active-class="active">
        <img src="/images/icons8-report-50.png" alt="Laporan" class="nav-icon" />
        <span>Laporan</span>
      </router-link>
    </nav>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f5f6fa;
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 100vh;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 75px;
  border-left: 1px solid #dcdde1;
  border-right: 1px solid #dcdde1;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 0 16px;
  margin-bottom: 12px;
  background-color: #ffffff;
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
  width: 170px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  text-align: left;
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #2f3640;
  font-weight: bold;
  border-bottom: 1px solid #f1f2f6;
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dropdown-item:hover {
  background-color: #f1f2f6;
}

.dropdown-item.logout {
  color: #e74c3c;
  border-bottom: none;
}

.main-content {
  width: 100%;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-top: 1px solid #dcdde1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: 65px;
  box-sizing: border-box;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #718093;
  font-size: 11px;
  font-weight: bold;
  gap: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.6;
}

.nav-item:hover {
  background-color: #f5f6fa;
}

.nav-item.active {
  color: #2f3640;
  background-color: #f5f6fa;
  border-top: 2px solid #2f3640;
}

.nav-item.active .nav-icon {
  opacity: 1;
}

/* Modal Styles */
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
  z-index: 2000;
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