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

// Tombol lihat/sembunyi password utama
const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Tombol lihat/sembunyi konfirmasi password
const showConfirmPassword = ref(false)
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Fungsi validasi format email
const isValidEmail = (emailStr) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

const handleRegister = () => {
  errorMessage.value = ''
  successMessage.value = ''

  // 1. Validasi semua kolom wajib diisi
  if (!ownerName.value.trim() || !brandName.value.trim() || !email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
    errorMessage.value = 'Semua kolom wajib diisi!'
    return
  }

  // 2. Validasi format email
  if (!isValidEmail(email.value)) {
    errorMessage.value = 'Format email tidak valid! Masukkan email yang benar.'
    return
  }

  // 3. Validasi panjang password minimal 6 karakter
  if (password.value.length < 6) {
    errorMessage.value = 'Password terlalu pendek! Minimal harus 6 karakter.'
    return
  }

  // 4. Validasi apakah password dan konfirmasi password sama (*match*)
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password tidak cocok! Silakan periksa kembali.'
    return
  }

  // Simpan data akun ke localStorage
  const accountData = {
    ownerName: ownerName.value.trim(),
    brandName: brandName.value.trim(),
    email: email.value.trim(),
    password: password.value
  }
  localStorage.setItem('registeredAccount', JSON.stringify(accountData))

  // Simpan juga nama brand agar sinkron dengan Dashboard
  localStorage.setItem('umkmBrandName', brandName.value.trim())

  successMessage.value = 'Akun berhasil dibuat! Mengalihkan ke halaman login...'

  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      
      <!-- Header Brand -->
      <div class="brand-section">
        <h1 class="brand-title">HOPE</h1>
        <p class="brand-subtitle">Hitung Omset dan Penjualan Elektronik</p>
      </div>

      <h2 class="form-title">Buat Akun HOPE</h2>
      <p class="form-desc">Kelola penjualan dan keuangan usaha dengan lebih mudah.</p>

      <!-- Pesan Peringatan atau Sukses -->
      <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-box success">{{ successMessage }}</div>

      <div class="form-control-group">
        
        <!-- Input Nama Pemilik dengan Ikon Customer -->
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

        <!-- Input Nama Brand / Usaha dengan Ikon Market -->
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

        <!-- Input Email dengan Ikon Gmail -->
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

        <!-- Input Password dengan Ikon Password & Tombol Lihat -->
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
            <div class="input-icon-wrapper right cursor-pointer" @click="togglePasswordVisibility" title="Lihat/Sembunyikan Password">
              <img src="/images/icons8-eye.gif" alt="Toggle Password" class="input-icon eye-icon" />
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
            <div class="input-icon-wrapper right cursor-pointer" @click="toggleConfirmPasswordVisibility" title="Lihat/Sembunyikan Password">
              <img src="/images/icons8-eye.gif" alt="Toggle Password" class="input-icon eye-icon" />
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

.brand-section {
  text-align: center;
  margin-bottom: 25px;
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 5px;
  margin-bottom: 0;
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
}

.text-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.password-input {
  padding-right: 40px;
}

.text-input:focus {
  border-color: #27ae60;
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
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.login-nav-link:hover {
  text-decoration: underline;
}
</style>