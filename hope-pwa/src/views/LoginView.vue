<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Fungsi saat tombol Masuk ditekan
const handleLogin = () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password harus diisi!'
    return
  }
  
  errorMessage.value = ''
  // Simulasi proses login berhasil (nanti kita hubungkan ke Firebase Auth)
  console.log('Mencoba masuk dengan:', email.value)
  successMessage.value = 'Berhasil masuk! Mengalihkan ke dashboard...'
  
  setTimeout(() => {
    router.push('/') // Mengarahkan ke halaman dashboard
  }, 1000)
}

// Fungsi untuk fitur Lupa Password
const handleForgotPassword = () => {
  if (!email.value) {
    alert('Silakan masukkan email terlebih dahulu untuk mereset password.')
    return
  }
  alert(`Instruksi pemulihan password telah dikirim ke: ${email.value}`)
}
</script>

<template>
  <div style="padding: 40px; font-family: sans-serif; max-width: 400px; margin: auto;">
    <h1>HOPE</h1>
    <p>Hitung Omset dan Penjualan Elektronik</p>

    <h2>Masuk ke akun kamu</h2>
    <p>Selamat datang kembali!</p>

    <!-- Pesan Error atau Sukses -->
    <p v-if="errorMessage" style="color: red; font-size: 14px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green; font-size: 14px;">{{ successMessage }}</p>

    <form @submit.prevent="handleLogin">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Email / Username</label>
        <input 
          type="text" 
          v-model="email" 
          placeholder="Masukkan email atau username" 
          style="width: 100%; padding: 8px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Password</label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="Masukkan password" 
          style="width: 100%; padding: 8px;"
        />
      </div>

      <div style="margin-bottom: 15px; text-align: right;">
        <a href="#" @click.prevent="handleForgotPassword" style="font-size: 13px; color: #3498db; cursor: pointer;">Lupa password?</a>
      </div>

      <button type="submit" style="width: 100%; padding: 10px; background-color: #2c3e50; color: white; border: none; cursor: pointer; font-weight: bold;">
        Masuk
      </button>
    </form>

    <p style="margin-top: 20px; text-align: center;">
      Belum punya akun? <router-link to="/register" style="color: #3498db;">Daftar</router-link>
    </p>
  </div>
</template>