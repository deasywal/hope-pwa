<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

onMounted(() => {
  // Cek apakah sudah login, jika ya langsung arahkan ke dashboard
  if (localStorage.getItem('isLoggedIn') === 'true') {
    router.replace('/dashboard')
  }
})

const handleLogin = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email dan password wajib diisi!'
    return
  }

  const savedData = localStorage.getItem('registeredAccount')
  
  if (!savedData) {
    // Jika belum ada akun terdaftar sama sekali, buatkan akun baru otomatis dari input login
    const newAccount = {
      email: email.value.trim().toLowerCase(),
      password: password.value,
      namaPemilik: 'Pemilik UMKM',
      namaUsaha: 'Bananif'
    }
    localStorage.setItem('registeredAccount', JSON.stringify(newAccount))
    localStorage.setItem('umkmOwnerName', newAccount.namaPemilik)
    localStorage.setItem('umkmBrandName', newAccount.namaUsaha)
    localStorage.setItem('umkmPhone', newAccount.email)
    localStorage.setItem('isLoggedIn', 'true')

    successMessage.value = 'Login Berhasil! Mengalihkan...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
    return
  }

  const account = JSON.parse(savedData)

  // Validasi email (mengabaikan perbedaan huruf besar/kecil) dan password
  const inputEmail = email.value.trim().toLowerCase()
  const registeredEmail = (account.email || '').trim().toLowerCase()

  if (inputEmail !== registeredEmail || password.value !== account.password) {
    errorMessage.value = 'Email atau password salah!'
    return
  }

  // Sinkronisasi data akun yang tersimpan ke profil & status login
  localStorage.setItem('isLoggedIn', 'true')
  if (account.namaPemilik) localStorage.setItem('umkmOwnerName', account.namaPemilik)
  if (account.namaUsaha) localStorage.setItem('umkmBrandName', account.namaUsaha)
  if (account.email) localStorage.setItem('umkmPhone', account.email)

  successMessage.value = 'Login Berhasil! Mengalihkan...'
  setTimeout(() => {
    router.push('/dashboard')
  }, 800)
}

const handleForgotPassword = () => {
  const savedData = localStorage.getItem('registeredAccount')
  if (!savedData) {
    alert('Belum ada akun yang terdaftar di perangkat ini.')
    return
  }
  const account = JSON.parse(savedData)
  alert(`--- BANTUAN LUPA PASSWORD ---\n\nEmail: ${account.email}\nPassword Anda: ${account.password}`)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      
      <!-- Header Brand dengan Gambar Logo Asli (Rata Tengah & Pas) -->
      <div class="brand-section">
        <img src="/images/Hope_logo.png" alt="HOPE Logo" class="brand-logo-img" />
        <p class="brand-subtitle">Hitung Omset dan Penjualan Elektronik</p>
      </div>

      <h2 class="form-title">Masuk ke Akun</h2>
      <p class="form-desc">Silakan masukkan data akun Anda yang terdaftar.</p>

      <!-- Pesan Notifikasi -->
      <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-box success">{{ successMessage }}</div>

      <!-- Form Utama -->
      <div class="form-control-group">
        
        <!-- Input Gmail -->
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
              placeholder="Masukkan password" 
              class="text-input password-input"
            />
            <div class="input-icon-wrapper right cursor-pointer" @click="togglePasswordVisibility" title="Lihat/Sembunyikan Password">
              <img src="/images/icons8-eye-50.png" alt="Toggle Password" class="input-icon eye-icon" />
            </div>
          </div>
        </div>

        <div class="forgot-wrapper">
          <a href="#" @click.prevent="handleForgotPassword" class="forgot-text">Lupa Password?</a>
        </div>

        <button 
          type="button" 
          @click="handleLogin" 
          class="login-btn"
        >
          Masuk
        </button>

      </div>

      <!-- Garis Pemisah "atau" -->
      <div class="divider">
        <span>atau</span>
      </div>

      <p class="footer-text">
        Belum punya akun? <router-link to="/register" class="register-nav-link">Daftar di sini</router-link>
      </p>

    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f7f6;
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
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
  gap: 16px;
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
  color: #2c3e50;
}

.password-input {
  padding-right: 40px;
}

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
  border-color: #3498db;
}

.cursor-pointer {
  cursor: pointer;
}

.forgot-wrapper {
  text-align: right;
  margin-top: -4px;
}

.forgot-text {
  font-size: 12px;
  color: #e67e22;
  text-decoration: none;
  font-weight: 600;
}

.forgot-text:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #3367DA;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 4px;
}

.login-btn:hover {
  background-color: #2851b8;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dcdde1;
}

.divider span {
  padding: 0 10px;
  font-size: 12px;
  color: #7f8c8d;
}

.footer-text {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 0;
}

.register-nav-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: bold;
}

.register-nav-link:hover {
  text-decoration: underline;
}
</style>