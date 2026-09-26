<script setup>
import { ref } from 'vue'

// Buat data dummy produk sementara
const daftarProduk = ref([
  { id: 1, nama: 'Kopi Susu Gula Aren', harga: 15000, stok: 20 },
  { id: 2, nama: 'Roti Bakar Coklat', harga: 12000, stok: 15 }
])

const namaProdukBaru = ref('')
const hargaProdukBaru = ref('')
const stokProdukBaru = ref('')

const tambahProduk = () => {
  if (namaProdukBaru.value !== '' && hargaProdukBaru.value !== '') {
    daftarProduk.value.push({
      id: Date.now(),
      nama: namaProdukBaru.value,
      harga: Number(hargaProdukBaru.value),
      stok: Number(stokProdukBaru.value)
    })
    
    namaProdukBaru.value = ''
    hargaProdukBaru.value = ''
    stokProdukBaru.value = ''
  }
}
</script>

<template>
  <main class="produk-container">
    <h1>Manajemen Produk UMKM</h1>
    <p><em>(Kerangka fungsional - Menunggu desain</em></p>

    <!-- Kotak Form Tambah Produk -->
    <div class="form-tambah">
      <h3>Tambah Produk Baru</h3>
      <input v-model="namaProdukBaru" type="text" placeholder="Nama Produk" />
      <input v-model="hargaProdukBaru" type="number" placeholder="Harga Barang" />
      <input v-model="stokProdukBaru" type="number" placeholder="Jumlah Stok" />
      <button @click="tambahProduk">Simpan Produk</button>
    </div>

    <!-- Kotak Daftar Produk yang sudah ada -->
    <div class="list-produk">
      <h3>Daftar Barang Tersedia</h3>
      <ul>
        <li v-for="produk in daftarProduk" :key="produk.id">
          <strong>{{ produk.nama }}</strong> 
          - Rp {{ produk.harga.toLocaleString('id-ID') }} 
          <span class="stok">(Sisa Stok: {{ produk.stok }})</span>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.produk-container {
  padding: 20px;
  max-width: 600px;
  font-family: sans-serif;
}

.form-tambah {
  margin-bottom: 20px;
  padding: 15px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-tambah input {
  padding: 8px;
  border: 1px solid #aaa;
  border-radius: 4px;
}

.form-tambah button {
  padding: 10px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.form-tambah button:hover {
  background-color: #1a252f;
}

.list-produk ul {
  list-style-type: none;
  padding: 0;
}

.list-produk li {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stok {
  color: #d35400;
  font-size: 0.9em;
}
</style>