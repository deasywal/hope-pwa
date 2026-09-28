<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const brandName = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Buat tombol lihat/sembunyi password
const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Fungsi validasi format email
const isValidEmail = (emailStr) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

const handleRegister = () => {
  errorMessage.value = ''
  successMessage.value = ''

  // 1. Buat validasi
  if (!brandName.value.trim() || !email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Semua kolom wajib diisi!'
    return
  }

  // 2. Buat validasi format email
  if (!isValidEmail(email.value)) {
    errorMessage.value = 'Format email tidak valid! Masukkan email yang benar.'
    return
  }

  // 3. Ini buat validasi panjang password minimal 6 karakter
  if (password.value.length < 6) {
    errorMessage.value = 'Password terlalu pendek! Minimal harus 6 karakter.'
    return
  }

  //Ini buat simpan data akun ke localStorage
  const accountData = {
    brandName: brandName.value.trim(),
    email: email.value.trim(),
    password: password.value
  }
  localStorage.setItem('registeredAccount', JSON.stringify(accountData))

  successMessage.value = 'Akun berhasil dibuat! Mengalihkan ke halaman login...'

  // Mengarahkan kembali ke halaman login 
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
    <p v-if="errorMessage" style="color: #c0392b; background: #fadbd8; padding: 10px; border-radius: 4px; font-size: 14px;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: #27ae60; background: #d4efdf; padding: 10px; border-radius: 4px; font-size: 14px;">{{ successMessage }}</p>

    <div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nama Brand / Toko</label>
        <input 
          type="text" 
          v-model="brandName" 
          placeholder="Contoh: HOPE Elektronik" 
          style="width: 100%; padding: 10px; box-sizing: border-box;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
        <input 
          type="text" 
          v-model="email" 
          placeholder="nama@email.com" 
          style="width: 100%; padding: 10px; box-sizing: border-box;"
        />
      </div>

      <!-- Input Password dengan Tombol Lihat/Sembunyi -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Password</label>
        <div style="position: relative; display: flex; align-items: center;">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            placeholder="Minimal 6 karakter" 
            style="width: 100%; padding: 10px; padding-right: 75px; box-sizing: border-box;"
          />
          <button 
            type="button" 
            @click="togglePasswordVisibility" 
            style="position: absolute; right: 8px; background: #ecf0f1; border: 1px solid #bdc3c7; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; color: #34495e;"
          >
            {{ showPassword ? 'Sembunyi' : 'Lihat' }}
          </button>
        </div>
      </div>

      <button 
        type="button" 
        @click="handleRegister" 
        style="width: 100%; padding: 12px; background-color: #27ae60; color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 4px;"
      >
        Daftar
      </button>
    </div>

    <p style="margin-top: 20px; text-align: center;">
      Sudah punya akun? <router-link to="/login" style="color: #3498db; text-decoration: none; font-weight: bold;">Masuk</router-link>
    </p>
  </div>
</template>