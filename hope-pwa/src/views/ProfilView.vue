<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const namaPemilik = ref(localStorage.getItem('umkmOwnerName') || 'Asywal')
const namaUsaha = ref(localStorage.getItem('umkmBrandName') || 'BANANIF')
const kontak = ref(localStorage.getItem('umkmPhone') || 'bananif@example.com')
const fotoProfil = ref(localStorage.getItem('umkmAvatar') || '')

// ===== State Edit Profil / Usaha =====
const showEditProfile = ref(false)
const formProfile = ref({
  namaPemilik: namaPemilik.value,
  namaUsaha: namaUsaha.value,
  kontak: kontak.value
})

// ===== Keamanan akun =====
const showSecurity = ref(false)
const adaPassword = ref(false)
const formSecurity = ref({ passwordLama: '', passwordBaru: '', konfirmasi: '' })
const error = ref('')

onMounted(() => {
  window.addEventListener('storage', () => {
    namaPemilik.value = localStorage.getItem('umkmOwnerName') || 'Asywal'
    namaUsaha.value = localStorage.getItem('umkmBrandName') || 'BANANIF'
    kontak.value = localStorage.getItem('umkmPhone') || 'bananif@example.com'
    fotoProfil.value = localStorage.getItem('umkmAvatar') || ''
  })
})

function bantuan() {
  window.open(
    'https://mail.google.com/mail/?view=cm&to=deasywall1203@gmail.com',
    '_blank'
  )
}

function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoProfil.value = e.target.result
      localStorage.setItem('umkmAvatar', fotoProfil.value)
    }
    reader.readAsDataURL(file)
  }
}

function bukaEditProfil() {
  formProfile.value = {
    namaPemilik: namaPemilik.value,
    namaUsaha: namaUsaha.value,
    kontak: kontak.value
  }
  showEditProfile.value = true
}

function simpanProfilUsaha() {
  if (!formProfile.value.namaPemilik.trim() || !formProfile.value.namaUsaha.trim()) {
    alert('Nama pemilik dan nama usaha tidak boleh kosong!')
    return
  }

  namaPemilik.value = formProfile.value.namaPemilik.trim()
  namaUsaha.value = formProfile.value.namaUsaha.trim()
  kontak.value = formProfile.value.kontak.trim()

  localStorage.setItem('umkmOwnerName', namaPemilik.value)
  localStorage.setItem('umkmBrandName', namaUsaha.value)
  localStorage.setItem('umkmPhone', kontak.value)

  window.dispatchEvent(new Event('storage'))

  showEditProfile.value = false
  alert('Informasi profil dan usaha berhasil diperbarui!')
}

function keamanan() {
  formSecurity.value = { passwordLama: '', passwordBaru: '', konfirmasi: '' }
  adaPassword.value = !!localStorage.getItem('umkmPassword')
  error.value = ''
  showSecurity.value = true
}

function simpanKeamanan() {
  const ubahPassword = formSecurity.value.passwordBaru !== '' || formSecurity.value.konfirmasi !== ''

  if (ubahPassword) {
    if (adaPassword.value && formSecurity.value.passwordLama !== localStorage.getItem('umkmPassword')) {
      error.value = 'Password saat ini salah.'
      return
    }
    if (formSecurity.value.passwordBaru.length < 6) {
      error.value = 'Password baru minimal 6 karakter.'
      return
    }
    if (formSecurity.value.passwordBaru !== formSecurity.value.konfirmasi) {
      error.value = 'Konfirmasi password tidak sama.'
      return
    }
    localStorage.setItem('umkmPassword', formSecurity.value.passwordBaru)
  } else {
    error.value = 'Silakan isi password baru.'
    return
  }

  showSecurity.value = false
  alert('Password akun berhasil diperbarui!')
}

function kembali() {
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
    <div class="profile-card" @click="$refs.avatarInput.click()" title="Klik untuk ganti foto profil">
      <div class="avatar-container">
        <img v-if="fotoProfil" :src="fotoProfil" alt="Avatar" class="avatar-img" />
        <div v-else class="avatar">
          {{ namaPemilik.charAt(0) }}
        </div>
      </div>
      <input 
        ref="avatarInput" 
        type="file" 
        accept="image/png, image/jpeg" 
        class="hidden-input" 
        @change="handleAvatarUpload" 
      />

      <div class="profile-text-flex">
        <div>
          <h2>{{ namaPemilik }}</h2>
          <p>{{ namaUsaha }}</p>
        </div>
        <button class="btn-edit-profile" @click.stop="bukaEditProfil">Edit Profil</button>
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
          <small>Email / No. WhatsApp</small>
          <strong>{{ kontak }}</strong>
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
          <small>Ubah password</small>
        </div>

        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

    </div>

    <!-- Modal Edit Profil & Usaha -->
    <div v-if="showEditProfile" class="modal-overlay" @click.self="showEditProfile = false">
      <div class="modal-box">
        <h3>Edit Profil & Usaha</h3>

        <label>Nama Pemilik UMKM</label>
        <input v-model="formProfile.namaPemilik" type="text" placeholder="Nama Pemilik" />

        <label class="input-gap">Nama Usaha / Brand</label>
        <input v-model="formProfile.namaUsaha" type="text" placeholder="Nama Brand" />

        <label class="input-gap">Email / No. WhatsApp</label>
        <input v-model="formProfile.kontak" type="text" placeholder="Email atau No HP" />

        <div class="modal-actions">
          <button class="btn-cancel" @click="showEditProfile = false">Batal</button>
          <button class="btn-save" @click="simpanProfilUsaha">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Keamanan Akun -->
    <div v-if="showSecurity" class="modal-overlay" @click.self="showSecurity = false">
      <div class="modal-box">
        <h3>Keamanan Akun</h3>

        <label v-if="adaPassword">Password Saat Ini</label>
        <input
          v-if="adaPassword"
          v-model="formSecurity.passwordLama"
          type="password"
          placeholder="Password saat ini"
        />

        <label :class="{ 'input-gap': adaPassword }">Password Baru (min. 6 karakter)</label>
        <input
          v-model="formSecurity.passwordBaru"
          type="password"
          placeholder="Password baru"
        />

        <label class="input-gap">Ulangi Password Baru</label>
        <input
          v-model="formSecurity.konfirmasi"
          type="password"
          placeholder="Konfirmasi password baru"
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
  padding: 16px 20px 100px;
  min-height: 100vh;
  background: #ffffff; 
  font-family: Arial, sans-serif;
  color: #1e272e;
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
  font-size: 20px;
  color: #1e272e;
}

.header p {
  margin: 3px 0 0;
  color: #57606f;
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
  color: #1e272e;
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
  background: #ffffff;
  border: 1px solid #dcdde1;
  margin-bottom: 18px;
  cursor: pointer;
}

.avatar-container {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  background: #5352ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden-input {
  display: none;
}

.profile-text-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.profile-card h2 {
  margin: 0;
  font-size: 16px;
  color: #1e272e;
}

.profile-card p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #57606f;
}

.btn-edit-profile {
  background-color: #5352ed;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

h3 {
  margin: 18px 0 10px;
  font-size: 15px;
  color: #1e272e;
}

/* ===== Kartu daftar ===== */
.info-card,
.menu-card {
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 16px;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f2f6;
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
  background: #f0f8ff;
  color: #5352ed;
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
  color: #718093;
  font-size: 12px;
}

.info-item strong {
  font-size: 13px;
  color: #1e272e;
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
  border-bottom: 1px solid #f1f2f6;
  background: white;
  color: #1e272e;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f5f6fa;
}

.menu-item div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-item strong {
  font-size: 13px;
  color: #1e272e;
}

.chevron {
  width: 20px;
  height: 20px;
  color: #718093;
  flex-shrink: 0;
}

/* ===== Modal ===== */
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
  color: #1e272e;
}

.modal-box label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #1e272e;
  margin: 14px 0 6px;
}

.modal-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  font-size: 13px;
  color: #1e272e;
  background: #fff;
}

.input-gap {
  margin-top: 10px;
}

.error-text {
  margin: 12px 0 0;
  font-size: 13px;
  color: #ff4757;
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
  color: #57606f;
}

.btn-save {
  background: #2ed573;
  color: white;
}
</style>