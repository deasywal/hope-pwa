<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

// Setup router & state form
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Show/hide password
const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Fitur Lupa Password
const showForgotPasswordModal = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const foundAccountInfo = ref(null)

// Cek udah login belum pas pertama buka
onMounted(() => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    router.replace('/dashboard')
  }
})

// Proses Login
const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email dan password wajib diisi!'
    return
  }

  try {
    const inputEmail = email.value.trim().toLowerCase()

    // Cek email di Firestore
    const q = query(collection(db, 'users'), where('email', '==', inputEmail))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      errorMessage.value = 'Email belum terdaftar. Daftar dulu ya!'
      return
    }

    let userData = null
    querySnapshot.forEach((docSnap) => {
      userData = docSnap.data()
    })

    // Cek password
    if (userData.password !== password.value) {
      errorMessage.value = 'Password salah, cek lagi ya!'
      return
    }

    // Simpan sesi login ke localStorage
    localStorage.clear()
    localStorage.setItem('isLoggedIn', 'true')
    if (userData.ownerName) localStorage.setItem('umkmOwnerName', userData.ownerName)
    if (userData.brandName) localStorage.setItem('umkmBrandName', userData.brandName)
    if (userData.email) localStorage.setItem('umkmPhone', userData.email)

    successMessage.value = 'Login Berhasil! Masuk ke Dashboard...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)

  } catch (err) {
    console.error('Error login:', err)
    errorMessage.value = 'Koneksi error, cek internet kamu.'
  }
}

// Cek akun buat Lupa Password
const handleCekAkunLupaPassword = async () => {
  resetError.value = ''
  foundAccountInfo.value = null

  if (!resetEmail.value.trim()) {
    resetError.value = 'Masukkan email dulu!'
    return
  }

  try {
    const inputEmail = resetEmail.value.trim().toLowerCase()
    const q = query(collection(db, 'users'), where('email', '==', inputEmail))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      resetError.value = 'Email tidak ditemukan!'
      return
    }

    let userData = null
    querySnapshot.forEach((docSnap) => {
      userData = docSnap.data()
    })

    foundAccountInfo.value = {
      email: userData.email,
      password: userData.password
    }
  } catch (err) {
    console.error('Gagal ambil data:', err)
    resetError.value = 'Terjadi kesalahan sistem.'
  }
}
</script>

<template>
  <!-- Container Halaman Login -->
  <div class="login-container">
    <div class="login-card">
      
      <!-- Bagian Logo & Header -->
      <div class="brand-section">
        <img src="/images/hompis1.png" alt="HOMPIS Logo" class="brand-logo-img" />
        <p class="brand-subtitle">Hitung Omzet dan Penjualan Kripik Pisang Bananif</p>
      </div>

      <h2 class="form-title">Masuk ke Akun</h2>
      <p class="form-desc">Silakan masukkan data akun Anda yang terdaftar.</p>

      <!-- Alert Error/Sukses -->
      <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-box success">{{ successMessage }}</div>

      <!-- Form Login Utama -->
      <div v-if="!showForgotPasswordModal" class="form-control-group">
        
        <!-- Input Email -->
        <div class="input-block">
          <label class="input-label">Email</label>
          <div class="input-wrapper">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-gmail-50.png" alt="Gmail Icon" class="input-icon" />
            </div>
            <input type="text" v-model="email" placeholder="nama@Gmail.com" class="text-input" />
          </div>
        </div>

        <!-- Input Password -->
        <div class="input-block">
          <label class="input-label">Password</label>
          <div class="input-wrapper password-box">
            <div class="input-icon-wrapper left">
              <img src="/images/icons8-password-50.png" alt="Password Icon" class="input-icon" />
            </div>
            
            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Masukkan password" class="text-input password-input" />
            
            <!-- Tombol Lihat/Sembunyikan Password -->
            <div v-if="password.length > 0" class="input-icon-wrapper right cursor-pointer" @click="togglePasswordVisibility">
              <img :src="showPassword ? '/images/icons8-eye-50.png' : '/images/icons8-hide-50.png'" alt="Toggle Password" class="input-icon eye-icon" />
            </div>
          </div>
        </div>

        <!-- Link Lupa Password -->
        <div class="forgot-wrapper">
          <a href="#" @click.prevent="() => { showForgotPasswordModal = true; resetEmail = ''; resetError = ''; foundAccountInfo = null; }" class="forgot-text">Lupa Password?</a>
        </div>

        <!-- Tombol Masuk -->
        <button type="button" @click="handleLogin" class="login-btn">Masuk</button>

        <div class="divider">
          <span>atau</span>
        </div>

        <!-- Link ke Pendaftaran -->
        <p class="footer-text">
          Belum punya akun? <router-link to="/register" class="register-nav-link">Daftar di sini</router-link>
        </p>
      </div>

      <!-- Form Lupa Password -->
      <div v-else class="form-control-group">
        <h3 class="step-title">Cek Validasi Akun</h3>
        <p class="step-desc">Masukkan email terdaftar untuk melihat kembali password Anda.</p>

        <div v-if="resetError" class="alert-box error">{{ resetError }}</div>

        <!-- Kotak Hasil Akun Ditemukan -->
        <div v-if="foundAccountInfo" class="account-popup-box">
          <p class="popup-title">Akun Ditemukan</p>
          <div class="popup-detail">
            <span><strong>Email:</strong> {{ foundAccountInfo.email }}</span>
            <span><strong>Password:</strong> <span class="highlight-pass">{{ foundAccountInfo.password }}</span></span>
          </div>
        </div>

        <!-- Input Email Lupa Password -->
        <div v-if="!foundAccountInfo" class="input-block">
          <label class="input-label">Email Terdaftar</label>
          <input type="text" v-model="resetEmail" placeholder="nama@Gmail.com" class="text-input full-pad" />
        </div>

        <button v-if="!foundAccountInfo" type="button" @click="handleCekAkunLupaPassword" class="login-btn">Cek Password Saya</button>
        <button type="button" @click="showForgotPasswordModal = false" class="back-btn">Kembali ke Menu Login</button>
      </div>

    </div>
  </div>
</template>

<style scoped>

/* Kotak pop-up hasil akun berhasil ditemukan */
.account-popup-box {
  background-color: #ebf5fb;
  border: 1px solid #3498db;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.popup-title {
  font-size: 14px;
  font-weight: bold;
  color: #2980b9;
  margin: 0 0 8px 0;
}

.popup-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #2c3e50;
}

.highlight-pass {
  background-color: #d4efdf;
  color: #27ae60;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

/* Judul & teks deskripsi step lupa password */
.step-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.step-desc {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0 0 16px 0;
}

.full-pad {
  padding-left: 14px !important;
}

/* Tombol kembali ke login */
.back-btn {
  width: 100%;
  padding: 10px;
  background-color: #f1f2f6;
  color: #57606f;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 6px;
}

.back-btn:hover {
  background-color: #dfe4ea;
}

/* Layout utama & card tengah layar */
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

/* Bagian logo & brand */
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

/* Kotak alert pesan error/sukses */
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

/* Grup form & input */
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
  transition: opacity 0.2s;
}

/* Desain kotak input teks */
.text-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  color: #2c3e50;
}

.password-input {
  padding-right: 40px;
}

/* Teks lupa password */
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

/* Tombol utama masuk */
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

/* Garis pemisah */
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

/* Footer & link register */
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

/* Sembunyikan ikon */
.password-input::-ms-reveal,
.password-input::-ms-clear {
  display: none;
}

.password-input::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  position: absolute;
  right: 0;
}

</style>