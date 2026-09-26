<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const brandName = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = () => {
  if (!brandName.value || !email.value || !password.value) {
    errorMessage.value = 'Semua kolom wajib diisi!'
    return
  }

  errorMessage.value = ''
  console.log('Mendaftarkan Brand:', brandName.value, 'dengan Email:', email.value)
  successMessage.value = 'Akun berhasil dibuat! Mengalihkan ke halaman login...'

  // Mengarahkan kembali ke halaman login setelah 1.5 detik
  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>

<template>
  <div style="padding: 40px; font-family: sans-serif; max-width: 400px; margin: auto;">
    <h1>HOPE</h1>
    <p>Hitung Omset dan Penjualan Elektronik</p>

    <h2>Buat Akun Baru</h2>
    <p>Daftarkan toko atau brand kamu sekarang!</p>

    <!-- Pesan Peringatan atau Sukses -->
    <p v-if="errorMessage" style="color: red; font-size: 14px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green; font-size: 14px;">{{ successMessage }}</p>

    <!-- Menggunakan div biasa pengganti form agar tidak auto-submit -->
    <div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Nama Brand / Toko</label>
        <input 
          type="text" 
          v-model="brandName" 
          placeholder="Contoh: HOPE Elektronik" 
          style="width: 100%; padding: 8px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Email</label>
        <input 
          type="email" 
          v-model="email" 
          placeholder="Masukkan email aktif" 
          style="width: 100%; padding: 8px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Password</label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="Buat password minimal 6 karakter" 
          style="width: 100%; padding: 8px;"
        />
      </div>

      <button 
        type="button" 
        @click="handleRegister" 
        style="width: 100%; padding: 10px; background-color: #27ae60; color: white; border: none; cursor: pointer; font-weight: bold;"
      >
        Daftar
      </button>
    </div>

    <p style="margin-top: 20px; text-align: center;">
      Sudah punya akun? <router-link to="/login" style="color: #3498db;">Masuk</router-link>
    </p>
  </div>
</template>