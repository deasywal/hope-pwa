<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ownerName = ref('')
const brandName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const showConfirmPassword = ref(false)
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const isValidEmail = (emailStr) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!ownerName.value.trim() || !brandName.value.trim() || !email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
    errorMessage.value = 'Semua kolom wajib diisi!'
    return
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = 'Format email tidak valid! Masukkan email yang benar.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password terlalu pendek! Minimal harus 6 karakter.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password tidak cocok! Silakan periksa kembali.'
    return
  }

  // 1. Simpan data ke localStorage
  const accountData = {
    ownerName: ownerName.value.trim(),
    brandName: brandName.value.trim(),
    email: email.value.trim(),
    password: password.value
  }
  localStorage.setItem('registeredAccount', JSON.stringify(accountData))
  localStorage.setItem('umkmBrandName', brandName.value.trim())
  localStorage.setItem('umkmOwnerName', ownerName.value.trim())
  localStorage.setItem('umkmPhone', email.value.trim())

  // 2. Send Real Email
  try {
    await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        subject: 'Pendaftaran Akun Berhasil - HOPE App',
        message: `Halo ${ownerName.value}, terima kasih telah mendaftar di aplikasi HOPE untuk brand ${brandName.value}. Akun Anda berhasil dibuat!`
      })
    })
  } catch (err) {
    console.log('Gagal menghubungi server email, tapi data lokal tetap tersimpan.', err)
  }

  successMessage.value = 'Akun berhasil dibuat & email konfirmasi dikirim! Mengalihkan...'

  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      
      <!-- Header Brand dengan Logo Gambar Asli (Rata Tengah & Pas) -->
      <div class="brand-section">
        <img src="/images/Hope_logo.png" alt="HOPE Logo" class="brand-logo-img" />
        <p class="brand-subtitle">Hitung Omset dan Penjualan Elektronik</p>
      </div>

      <h2 class="form-title">Buat Akun HOPE</h2>
      <p class="form-desc">Kelola penjualan dan keuangan usaha anda dengan lebih mudah.</p>

      <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-box success">{{ successMessage }}</div>

      <div class="form-control-group">
        
        <!-- Input Nama Pemilik -->
        <div class="input-block">
          <label class="input-label">Nama Pemilik</label>
          <div class="input-wrapper">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-customer-50.png" alt="Owner Icon" class="input-icon" />
            </div>
            <input 
              type="text" 
              v-model="ownerName" 
              placeholder="Contoh: Budi Santoso" 
              class="text-input"
            />
          </div>
        </div>

        <!-- Input Nama Usaha -->
        <div class="input-block">
          <label class="input-label">Nama Usaha / Brand</label>
          <div class="input-wrapper">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-market-50.png" alt="Market Icon" class="input-icon" />
            </div>
            <input 
              type="text" 
              v-model="brandName" 
              placeholder="Contoh: HOPE Elektronik" 
              class="text-input"
            />
          </div>
        </div>

        <!-- Input Email -->
        <div class="input-block">
          <label class="input-label">Email</label>
          <div class="input-wrapper">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-gmail-50.png" alt="Gmail Icon" class="input-icon" />
            </div>
            <input 
              type="text" 
              v-model="email" 
              placeholder="nama@Gmail.com" 
              class="text-input"
            />
          </div>
        </div>

        <!-- Input Password -->
        <div class="input-block">
          <label class="input-label">Password</label>
          <div class="input-wrapper password-box">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-password-50.png" alt="Password Icon" class="input-icon" />
            </div>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Minimal 6 karakter" 
              class="text-input password-input"
            />
            <!-- Ikon Mata Password: Muncul HANYA JIKA password sudah diketik -->
            <div 
              v-if="password.length > 0" 
              class="input-icon-wrapper right cursor-pointer" 
              @click="togglePasswordVisibility" 
              :title="showPassword ? 'Sembunyikan Password' : 'Lihat Password'"
            >
              <img 
                :src="showPassword ? '/images/icons8-eye-50.png' : '/images/icons8-hide-50.png'" 
                alt="Toggle Password" 
                class="input-icon eye-icon" 
              />
            </div>
          </div>
        </div>

        <!-- Input Konfirmasi Password -->
        <div class="input-block">
          <label class="input-label">Konfirmasi Password</label>
          <div class="input-wrapper password-box">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-password-50.png" alt="Password Icon" class="input-icon" />
            </div>
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              v-model="confirmPassword" 
              placeholder="Ulangi password" 
              class="text-input password-input"
            />
            <!-- Ikon Mata Konfirmasi Password: Muncul HANYA JIKA konfirmasi password sudah diketik -->
            <div 
              v-if="confirmPassword.length > 0" 
              class="input-icon-wrapper right cursor-pointer" 
              @click="toggleConfirmPasswordVisibility" 
              :title="showConfirmPassword ? 'Sembunyikan Password' : 'Lihat Password'"
            >
              <img 
                :src="showConfirmPassword ? '/images/icons8-eye-50.png' : '/images/icons8-hide-50.png'" 
                alt="Toggle Password" 
                class="input-icon eye-icon" 
              />
            </div>
          </div>
        </div>

        <button 
          type="button" 
          @click="handleRegister" 
          class="register-btn"
        >
          Daftar
        </button>
      </div>

      <p class="footer-text">
        Sudah punya akun? <router-link to="/login" class="login-nav-link">Masuk</router-link>
      </p>

    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f7f6;
  padding: 20px;
  box-sizing: border-box;
  font-family: sans-serif;
}

.register-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

/* Styling Brand & Logo Center */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 25px;
}

.brand-logo-img {
  height: 54px;
  width: auto;
  object-fit: contain;
  margin-bottom: 6px;
}

.brand-subtitle {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
}

.form-title {
  font-size: 18px;
  color: #34495e;
  margin-bottom: 5px;
  margin-top: 0;
}

.form-desc {
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 20px;
  margin-top: 0;
}

.alert-box {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.alert-box.error {
  background-color: #fadbd8;
  color: #c0392b;
}

.alert-box.success {
  background-color: #d4efdf;
  color: #27ae60;
}

.form-control-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrapper.left {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.input-icon-wrapper.right {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.input-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}

.eye-icon {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.eye-icon:hover {
  opacity: 1;
}

.text-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.password-input {
  padding-left: 40px;
  padding-right: 40px;
}

/* Mematikan ikon bawaan browser */
.password-input::-ms-reveal,
.password-input::-ms-clear {
  display: none;
}

.password-input::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  position: absolute;
  right: 0;
}

.text-input:focus {
  border-color: #27ae60;
  outline: none;
}

.cursor-pointer {
  cursor: pointer;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 4px;
}

.register-btn:hover {
  background-color: #219653;
}

.footer-text {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 0;
}

.login-nav-link {
  color: #3367DA;
  text-decoration: none;
  font-weight: bold;
}

.login-nav-link:hover {
  text-decoration: underline;
}
</style>