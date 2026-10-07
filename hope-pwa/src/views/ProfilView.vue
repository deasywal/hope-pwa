<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const namaPemilik = ref('Pemilik Bananif')
const namaUsaha = ref('Bananif')
const email = ref(localStorage.getItem('umkmEmail') || 'bananif@example.com')

// ===== Keamanan akun =====
const showSecurity = ref(false)
const adaPassword = ref(false)
const form = ref({ email: '', passwordLama: '', passwordBaru: '', konfirmasi: '' })
const error = ref('')

function bantuan() {
  window.open(
    'https://mail.google.com/mail/?view=cm&to=deasywall1203@gmail.com',
    '_blank'
  )
}

function keamanan() {
  form.value = { email: email.value, passwordLama: '', passwordBaru: '', konfirmasi: '' }
  adaPassword.value = !!localStorage.getItem('umkmPassword')
  error.value = ''
  showSecurity.value = true
}

function simpanKeamanan() {
  const emailBaru = form.value.email.trim()
  const ubahPassword = form.value.passwordBaru !== '' || form.value.konfirmasi !== ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBaru)) {
    error.value = 'Format email tidak valid.'
    return
  }

  if (ubahPassword) {
    if (adaPassword.value && form.value.passwordLama !== localStorage.getItem('umkmPassword')) {
      error.value = 'Password saat ini salah.'
      return
    }
    if (form.value.passwordBaru.length < 6) {
      error.value = 'Password baru minimal 6 karakter.'
      return
    }
    if (form.value.passwordBaru !== form.value.konfirmasi) {
      error.value = 'Konfirmasi password tidak sama.'
      return
    }
    localStorage.setItem('umkmPassword', form.value.passwordBaru)
  }

  email.value = emailBaru
  localStorage.setItem('umkmEmail', emailBaru)
  showSecurity.value = false
  alert('Keamanan akun berhasil diperbarui!')
}

function kembali() {
  // Kalau ada halaman sebelumnya, mundur. Kalau tidak (misal dibuka langsung), ke Beranda.
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="profile-container">

    <!-- Header -->
    <div class="header">
      <button class="back" @click="kembali" aria-label="Kembali">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div>
        <h1>Profil</h1>
        <p>Kelola informasi akun dan usaha</p>
      </div>
    </div>

    <!-- Kartu Profil -->
    <div class="profile-card">
      <div class="avatar">
        {{ namaPemilik.charAt(0) }}
      </div>

      <div>
        <h2>{{ namaPemilik }}</h2>
        <p>{{ namaUsaha }}</p>
      </div>
    </div>

    <!-- Informasi Akun -->
    <h3>Informasi Akun</h3>

    <div class="info-card">

      <div class="info-item">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>

        <div>
          <small>Nama Pemilik UMKM</small>
          <strong>{{ namaPemilik }}</strong>
        </div>
      </div>

      <div class="info-item">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 9l1.5-5h15L21 9" />
            <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            <path d="M5 12v8h14v-8" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </span>

        <div>
          <small>Nama Usaha / Brand</small>
          <strong>{{ namaUsaha }}</strong>
        </div>
      </div>

      <div class="info-item">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
          </svg>
        </span>

        <div>
          <small>Alamat Email</small>
          <strong>{{ email }}</strong>
        </div>
      </div>

    </div>

    <!-- Pengaturan -->
    <h3>Pengaturan</h3>

    <div class="menu-card">

      <button class="menu-item" @click="bantuan">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>

        <div>
          <strong>Bantuan Aplikasi</strong>
          <small>Hubungi bantuan</small>
        </div>

        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button class="menu-item" @click="keamanan">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>

        <div>
          <strong>Keamanan Akun</strong>
          <small>Ubah email dan password</small>
        </div>

        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

    </div>



    <!-- Modal Keamanan Akun -->
    <div v-if="showSecurity" class="modal-overlay" @click.self="showSecurity = false">
      <div class="modal-box">
        <h3>Keamanan Akun</h3>

        <label>Alamat Email</label>
        <input v-model="form.email" type="email" placeholder="nama@gmail.com" />

        <label>Ubah Password (opsional)</label>
        <input
          v-if="adaPassword"
          v-model="form.passwordLama"
          type="password"
          placeholder="Password saat ini"
        />
        <input
          v-model="form.passwordBaru"
          type="password"
          placeholder="Password baru (min. 6 karakter)"
          class="input-gap"
        />
        <input
          v-model="form.konfirmasi"
          type="password"
          placeholder="Ulangi password baru"
          class="input-gap"
        />

        <p v-if="error" class="error-text">{{ error }}</p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showSecurity = false">Batal</button>
          <button class="btn-save" @click="simpanKeamanan">Simpan</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px 20px 100px; /* bawah diberi ruang untuk navbar */
  min-height: 100vh;
  background: #f8f6f2; /* beda dari header putih, seperti halaman Produk */
  font-family: Arial, sans-serif;
  color: #111;
  box-sizing: border-box;
}

/* ===== Header ===== */
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
}

.header p {
  margin: 3px 0 0;
  color: #444;
  font-size: 13px;
}

.back {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #111;
  cursor: pointer;
}

.back svg {
  width: 22px;
  height: 22px;
}

/* ===== Kartu profil ===== */
.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #f1efff;
  margin-bottom: 18px;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #7774ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  flex-shrink: 0;
}

.profile-card h2 {
  margin: 0;
  font-size: 17px;
}

.profile-card p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #444;
}

h3 {
  margin: 18px 0 10px;
  font-size: 16px;
}

/* ===== Kartu daftar ===== */
.info-card,
.menu-card {
  background: #ffffff;
  border: 1px solid #e3e6ed;
  border-radius: 16px;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #eeeeee;
}

.info-item:last-child {
  border-bottom: none;
}

.icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1efff;
  color: #7774ed;
  flex-shrink: 0;
}

.icon svg {
  width: 20px;
  height: 20px;
}

.info-item div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.info-item small,
.menu-item small {
  color: #444;
  font-size: 12px;
}

.info-item strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

/* ===== Menu pengaturan ===== */
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid #eeeeee;
  background: white;
  color: #111;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f7f7ff;
}

.menu-item div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-item strong {
  font-size: 14px;
}

.chevron {
  width: 20px;
  height: 20px;
  color: #666;
  flex-shrink: 0;
}

/* ===== Modal keamanan ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  z-index: 2000;
}

.modal-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-box h3 {
  margin: 0 0 6px;
}

.modal-box label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  margin: 14px 0 6px;
}

.modal-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #d9dce5;
  border-radius: 8px;
  font-size: 14px;
  color: #111;
}

.input-gap {
  margin-top: 8px;
}

.error-text {
  margin: 12px 0 0;
  font-size: 13px;
  color: #d94b4b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

.btn-cancel,
.btn-save {
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f2f6;
  color: #444;
}

.btn-save {
  background: #7774ed;
  color: white;
}
</style>