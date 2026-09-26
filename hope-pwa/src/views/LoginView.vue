<script setup>
import { ref } from 'vue'
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

const handleLogin = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email dan password wajib diisi!'
    return
  }

  const savedData = localStorage.getItem('registeredAccount')
  
  if (!savedData) {
    errorMessage.value = 'Belum ada akun terdaftar! Silakan daftar terlebih dahulu.'
    return
  }

  const account = JSON.parse(savedData)

  if (email.value.trim() !== account.email || password.value !== account.password) {
    errorMessage.value = 'Email atau password salah!'
    return
  }

  successMessage.value = 'Login Berhasil! Mengalihkan...'
  setTimeout(() => {
    router.push('/')
  }, 1000)
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
      
      <!-- Header Brand -->
      <div class="brand-section">
        <h1 class="brand-title">HOPE</h1>
        <p class="brand-subtitle">Hitung Omset dan Penjualan Elektronik</p>
      </div>

      <h2 class="form-title">Masuk ke Akun</h2>
      <p class="form-desc">Silakan masukkan data akun Anda yang terdaftar.</p>

      <!-- Pesan Notifikasi -->
      <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-box success">{{ successMessage }}</div>

      <!-- Form Utama -->
      <div class="form-control-group">
        
        <div class="input-block">
          <label class="input-label">Email</label>
          <input 
            type="text" 
            v-model="email" 
            placeholder="nama@email.com" 
            class="text-input"
          />
        </div>

        <div class="input-block">
          <label class="input-label">Password</label>
          <div class="password-box">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Masukkan password" 
              class="text-input password-input"
            />
            <button 
              type="button" 
              @click="togglePasswordVisibility" 
              class="eye-btn"
            >
              {{ showPassword ? 'Sembunyi' : 'Lihat' }}
            </button>
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
  min-height: calc(100vh - 80px);
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

.text-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #3498db;
}

.password-box {
  position: relative;
  width: 100%;
}

.password-input {
  padding-right: 80px;
}

.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #ecf0f1;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  color: #57606f;
}

.eye-btn:hover {
  background: #dfe4ea;
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
  background-color: #3498db;
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
  background-color: #2980b9;
}

.footer-text {
  margin-top: 20px;
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