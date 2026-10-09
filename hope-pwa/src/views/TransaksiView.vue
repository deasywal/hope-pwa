<script setup>
import { ref, computed } from 'vue'

// ===== Helper tanggal (waktu lokal, bukan UTC) =====
function tanggalLokal() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatTanggal(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function rupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID')
}

const hariIni = tanggalLokal()

// ===== State navigasi =====
const halaman = ref('transaksi')
const tabAktif = ref('hari-ini')

// ===== Data produk =====
const produkList = ref([
  { id: 1, nama: 'Keripik Pisang', varian: 'Strawberry', harga: 5000, stok: 20 },
  { id: 2, nama: 'Keripik Pisang', varian: 'Coklat', harga: 5000, stok: 15 },
  { id: 3, nama: 'Keripik Pisang', varian: 'Matcha', harga: 5000, stok: 25 }
])

// ===== Riwayat penjualan (tanggal format YYYY-MM-DD) =====
const transaksiList = ref([
  {
    id: 1,
    tanggal: '2026-09-23',
    items: [
      { produkId: 1, nama: 'Keripik Pisang', varian: 'Strawberry', jumlah: 5, harga: 5000, subtotal: 25000 }
    ],
    total: 25000
  }
])

// ===== State form catat penjualan =====
const tanggal = ref(hariIni)
const produkDipilihId = ref(1)
const jumlah = ref(1)
const keranjang = ref([])
const editId = ref(null) // null = catat baru, isi = sedang edit transaksi

// ===== Computed =====
const produkSekarang = computed(() =>
  produkList.value.find(p => p.id === Number(produkDipilihId.value))
)

const harga = computed(() => produkSekarang.value?.harga || 0)
const qty = computed(() => Math.floor(Number(jumlah.value)) || 0)
const subtotal = computed(() => harga.value * qty.value)

const totalTransaksi = computed(() =>
  keranjang.value.reduce((total, item) => total + item.subtotal, 0)
)

const transaksiHariIni = computed(() =>
  transaksiList.value.filter(t => t.tanggal === hariIni)
)

const transaksiTampil = computed(() =>
  tabAktif.value === 'hari-ini' ? transaksiHariIni.value : transaksiList.value
)

const jumlahHariIni = computed(() => transaksiHariIni.value.length)
const totalHariIni = computed(() =>
  transaksiHariIni.value.reduce((total, item) => total + item.total, 0)
)

// ===== Methods =====
// Stok yang boleh dipakai. Saat edit, jumlah dari transaksi lama dihitung kembali.
function stokTersedia(produkId) {
  const produk = produkList.value.find(p => p.id === produkId)
  if (!produk) return 0
  let tersedia = produk.stok
  if (editId.value !== null) {
    const lama = transaksiList.value.find(t => t.id === editId.value)
    if (lama) {
      tersedia += lama.items
        .filter(i => i.produkId === produkId)
        .reduce((total, i) => total + i.jumlah, 0)
    }
  }
  return tersedia
}

const stokMaks = computed(() => stokTersedia(Number(produkDipilihId.value)))

function kembalikanStok(transaksi) {
  transaksi.items.forEach(item => {
    const produk = produkList.value.find(p => p.id === item.produkId)
    if (produk) produk.stok += item.jumlah
  })
}

function tambahJumlah() {
  if (qty.value < stokMaks.value) jumlah.value = qty.value + 1
}

function kurangiJumlah() {
  if (qty.value > 1) jumlah.value = qty.value - 1
}

// Dipanggil saat kolom jumlah selesai diketik
function rapikanJumlah() {
  if (qty.value < 1) jumlah.value = 1
  else if (stokMaks.value > 0 && qty.value > stokMaks.value) jumlah.value = stokMaks.value
  else jumlah.value = qty.value
}

function tambahItem() {
  const produk = produkSekarang.value
  if (!produk) return

  if (qty.value < 1) {
    alert('Jumlah minimal 1!')
    return
  }

  const totalDalamKeranjang = keranjang.value
    .filter(item => item.produkId === produk.id)
    .reduce((total, item) => total + item.jumlah, 0)

  if (totalDalamKeranjang + qty.value > stokTersedia(produk.id)) {
    alert('Jumlah melebihi stok yang tersedia!')
    return
  }

  keranjang.value.push({
    produkId: produk.id,
    nama: produk.nama,
    varian: produk.varian,
    jumlah: qty.value,
    harga: produk.harga,
    subtotal: subtotal.value
  })

  jumlah.value = 1
}

function hapusItemKeranjang(index) {
  keranjang.value.splice(index, 1)
}

function simpanTransaksi() {
  if (keranjang.value.length === 0) {
    alert('Tambahkan minimal satu produk!')
    return
  }

  // Validasi stok per produk
  for (const item of keranjang.value) {
    const totalItem = keranjang.value
      .filter(i => i.produkId === item.produkId)
      .reduce((total, i) => total + i.jumlah, 0)

    if (totalItem > stokTersedia(item.produkId)) {
      alert(`Stok tidak mencukupi untuk ${item.nama} - ${item.varian}!`)
      return
    }
  }

  const sedangEdit = editId.value !== null

  // Saat edit, kembalikan dulu stok dari transaksi lama
  if (sedangEdit) {
    const lama = transaksiList.value.find(t => t.id === editId.value)
    if (lama) kembalikanStok(lama)
  }

  // Kurangi stok sesuai isi keranjang
  keranjang.value.forEach(item => {
    const produk = produkList.value.find(p => p.id === item.produkId)
    if (produk) produk.stok -= item.jumlah
  })

  const data = {
    tanggal: tanggal.value,
    items: keranjang.value.map(i => ({ ...i })),
    total: totalTransaksi.value
  }

  if (sedangEdit) {
    const idx = transaksiList.value.findIndex(t => t.id === editId.value)
    if (idx !== -1) transaksiList.value[idx] = { id: editId.value, ...data }
  } else {
    transaksiList.value.unshift({ id: Date.now(), ...data })
  }

  tutupForm(tanggal.value === hariIni ? 'hari-ini' : 'riwayat')
  alert(sedangEdit ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil dicatat!')
}

function hapusTransaksi(transaksi) {
  if (!confirm('Hapus transaksi ini? Stok produk akan dikembalikan.')) return
  kembalikanStok(transaksi)
  transaksiList.value = transaksiList.value.filter(t => t.id !== transaksi.id)
}

function bukaForm() {
  editId.value = null
  keranjang.value = []
  jumlah.value = 1
  tanggal.value = hariIni
  halaman.value = 'form'
}

function mulaiEdit(transaksi) {
  editId.value = transaksi.id
  keranjang.value = transaksi.items.map(i => ({ ...i }))
  tanggal.value = transaksi.tanggal
  produkDipilihId.value = produkList.value[0]?.id ?? 1
  jumlah.value = 1
  halaman.value = 'form'
}

function tutupForm(tab) {
  editId.value = null
  keranjang.value = []
  jumlah.value = 1
  halaman.value = 'transaksi'
  if (tab) tabAktif.value = tab
}
</script>

<template>
  <div class="transaksi-container">

    <!-- HALAMAN DAFTAR TRANSAKSI -->
    <template v-if="halaman === 'transaksi'">
      <h1>Transaksi</h1>
      <p class="subtitle">Catat penjualan dan lihat riwayat.</p>

      <div class="tabs">
        <button
          :class="{ active: tabAktif === 'hari-ini' }"
          @click="tabAktif = 'hari-ini'"
        >
          Penjualan Hari Ini
        </button>
        <button
          :class="{ active: tabAktif === 'riwayat' }"
          @click="tabAktif = 'riwayat'"
        >
          Riwayat
        </button>
      </div>

      <div v-if="tabAktif === 'hari-ini'" class="summary-card">
        <h3 class="summary-title">
          <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Penjualan Hari Ini
        </h3>
        <p>{{ formatTanggal(hariIni) }}</p>

        <div class="summary-info">
          <div>
            <small>Jumlah Transaksi</small>
            <h2>{{ jumlahHariIni }}</h2>
          </div>
          <div>
            <small>Total Penjualan</small>
            <h2>{{ rupiah(totalHariIni) }}</h2>
          </div>
        </div>
      </div>

      <div v-else class="summary-card">
        <h3>Riwayat Penjualan</h3>
        <p>Daftar keseluruhan transaksi yang tercatat.</p>
      </div>

      <h3 class="section-title">Detail Penjualan</h3>

      <p v-if="transaksiTampil.length === 0" class="empty-info">
        Belum ada transaksi.
      </p>

      <div
        v-for="transaksi in transaksiTampil"
        :key="transaksi.id"
        class="transaction-card"
      >
        <div
          v-for="(item, i) in transaksi.items"
          :key="i"
          class="item-info item-row"
        >
          <div class="product-placeholder"></div>
          <div class="product-detail">
            <strong>{{ item.nama }} - {{ item.varian }}</strong>
            <p>{{ item.jumlah }} pcs × {{ rupiah(item.harga) }}</p>
            <strong class="price">{{ rupiah(item.subtotal) }}</strong>
          </div>
        </div>
        <small class="date-info">
          Tanggal: {{ formatTanggal(transaksi.tanggal) }} | Total: <strong>{{ rupiah(transaksi.total) }}</strong>
        </small>

        <div class="card-actions">
          <button class="btn-edit" @click="mulaiEdit(transaksi)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            Edit
          </button>
          <button class="btn-hapus" @click="hapusTransaksi(transaksi)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      <button class="primary-button" @click="bukaForm">
        + Catat Penjualan
      </button>
    </template>

    <!-- HALAMAN FORM CATAT PENJUALAN -->
    <template v-else>
      <button class="back-button" @click="tutupForm()">
        ← Kembali
      </button>

      <h2>{{ editId !== null ? 'Edit Penjualan' : 'Catat Penjualan' }}</h2>

      <label>Tanggal</label>
      <input type="date" v-model="tanggal" />

      <label>Pilih Produk &amp; Varian</label>
      <select v-model.number="produkDipilihId" @change="jumlah = 1">
        <option v-for="produk in produkList" :key="produk.id" :value="produk.id">
          {{ produk.nama }} - {{ produk.varian }} (Stok: {{ stokTersedia(produk.id) }})
        </option>
      </select>

      <label>Jumlah</label>
      <div class="quantity-control">
        <button @click="kurangiJumlah">−</button>
        <input
          v-model.number="jumlah"
          type="number"
          inputmode="numeric"
          min="1"
          :max="stokMaks"
          class="qty-input"
          @blur="rapikanJumlah"
        />
        <button @click="tambahJumlah">+</button>
        <span>pcs</span>
      </div>

      <div class="price-card">
        <p>Harga Satuan <strong>{{ rupiah(harga) }}</strong></p>
        <p>Subtotal <strong>{{ rupiah(subtotal) }}</strong></p>
      </div>

      <button class="primary-button" @click="tambahItem">
        + Tambah Item ke Keranjang
      </button>

      <div v-if="keranjang.length" class="cart-card">
        <h3>Item Penjualan</h3>
        <div
          v-for="(item, index) in keranjang"
          :key="index"
          class="cart-item"
        >
          <div>
            <span>{{ item.nama }} - {{ item.varian }} ({{ item.jumlah }} pcs)</span>
            <strong>{{ rupiah(item.subtotal) }}</strong>
          </div>
          <button class="delete-btn" @click="hapusItemKeranjang(index)">Hapus</button>
        </div>
      </div>

      <div class="total-card">
        <strong>Total Transaksi</strong>
        <strong>{{ rupiah(totalTransaksi) }}</strong>
      </div>

      <button class="primary-button" @click="simpanTransaksi">
        {{ editId !== null ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
      </button>
    </template>

  </div>
</template>

<style scoped>
.transaksi-container {
  padding: 16px 20px 100px; /* bawah diberi ruang untuk navbar */
  min-height: 100vh;
  background: #f8f6f2; /* beda dari header putih, sama seperti Profil */
  max-width: 600px;
  margin: 0 auto;
  color: #111;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 20px;
  margin: 0 0 4px;
}

h2 {
  margin: 0 0 8px;
}

.subtitle {
  color: #444;
  margin: 0 0 16px;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.tabs button {
  flex: 1;
  padding: 12px 8px;
  border: 2px solid #d9dce5;
  border-radius: 10px;
  background: white;
  color: #31517d;
  font-weight: bold;
  cursor: pointer;
}

.tabs button.active {
  background: #7878ec;
  color: white;
  border-color: #7777ed;
}

.summary-card,
.transaction-card,
.price-card,
.total-card,
.cart-card {
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 14px;
}

.summary-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-icon {
  width: 20px;
  height: 20px;
  color: #7878ec;
  flex-shrink: 0;
}

.summary-card p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #444;
}

.summary-info {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.summary-info small {
  color: #666;
}

.summary-info h2 {
  font-size: 20px;
  margin: 4px 0 0;
}

.section-title {
  margin: 16px 0 10px;
  font-size: 16px;
}

.empty-info {
  color: #696d74;
  font-size: 14px;
  margin: 8px 0 16px;
}

.item-info {
  display: flex;
  gap: 14px;
  align-items: center;
}

.item-row {
  margin-bottom: 10px;
}

.product-placeholder {
  background: #fff0e8;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
}

.product-detail p {
  margin: 3px 0;
  color: #696d74;
  font-size: 14px;
}

.price {
  color: #020202;
}

.date-info {
  display: block;
  margin-top: 10px;
  color: #696d74;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.card-actions svg {
  width: 16px;
  height: 16px;
}

.btn-edit {
  background: #f1efff;
  border: 1px solid #cfccf7;
  color: #5a57d6;
}

.btn-hapus {
  background: #fff5f5;
  border: 1px solid #f0c4c4;
  color: #d94b4b;
}

.primary-button {
  width: 100%;
  background: linear-gradient(100deg, #7477ee, #9b7bea);
  border: none;
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  margin: 12px 0;
  cursor: pointer;
}

.back-button {
  border: none;
  background: none;
  color: #090a0a;
  font-size: 16px;
  padding: 0;
  margin-bottom: 8px;
  cursor: pointer;
}

label {
  display: block;
  font-weight: bold;
  margin: 14px 0 6px;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  border: 2px solid #d9dce5;
  border-radius: 10px;
  background: white;
  color: #48494b;
  font-size: 14px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid #d9dce5;
  border-radius: 10px;
  padding: 10px;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  border: 2px solid #d9dce5;
  border-radius: 50%;
  background: white;
  font-size: 20px;
  color: #48494b;
  cursor: pointer;
}

.quantity-control .qty-input {
  width: 80px;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #111;
  -moz-appearance: textfield;
  appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-control span {
  color: #696d74;
}

.price-card {
  margin-top: 16px;
  background: #f9faff;
}

.price-card p,
.total-card {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.price-card p {
  margin: 6px 0;
}

.cart-card h3 {
  margin: 0 0 8px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.delete-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.total-card {
  margin-top: 14px;
  font-size: 17px;
}
</style>