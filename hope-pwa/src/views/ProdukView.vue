<script setup>
import { ref, onMounted } from 'vue'

const productList = ref([])
const showForm = ref(false)
const form = ref({
  name: '',
  price: '',
  stock: ''
})

onMounted(() => {
  const savedProducts = localStorage.getItem('productsList')
  if (savedProducts) {
    productList.value = JSON.parse(savedProducts)
  }
})

const saveProduct = () => {
  if (!form.value.name || !form.value.price || !form.value.stock) {
    alert('Mohon isi semua data produk!')
    return
  }

  const newProduct = {
    id: Date.now(),
    name: form.value.name,
    price: Number(form.value.price.replace(/\D/g, '')),
    stock: Number(form.value.stock.replace(/\D/g, ''))
  }

  productList.value.push(newProduct)
  localStorage.setItem('productsList', JSON.stringify(productList.value))

  form.value.name = ''
  form.value.price = ''
  form.value.stock = ''
  showForm.value = false
}

const deleteProduct = (id) => {
  productList.value = productList.value.filter(p => p.id !== id)
  localStorage.setItem('productsList', JSON.stringify(productList.value))
}
</script>

<template>
  <div class="page-wrapper">
    <div class="header-nav">
      <h3 class="page-title">Kelola Produk</h3>
      <button @click="showForm = !showForm" class="action-btn">
        {{ showForm ? 'Batal' : '+ Tambah Produk' }}
      </button>
    </div>

    <div v-if="showForm" class="card form-box">
      <h4 class="form-title">Tambah Produk Baru</h4>
      <div class="input-group">
        <label>Nama Produk</label>
        <input v-model="form.name" type="text" placeholder="Contoh: Makaroni Goreng" />
      </div>
      <div class="input-group">
        <label>Harga (Rp)</label>
        <!-- Menggunakan type="text" agar bersih tanpa panah atas-bawah -->
        <input v-model="form.price" type="text" placeholder="Contoh: 1000" />
      </div>
      <div class="input-group">
        <label>Stok</label>
        <input v-model="form.stock" type="text" placeholder="Contoh: 10" />
      </div>
      <button @click="saveProduct" class="save-btn">Simpan Produk</button>
    </div>

    <div class="product-list">
      <div v-if="productList.length === 0" class="card content-box">
        <p class="info-text">Belum ada produk yang ditambahkan.</p>
      </div>

      <div v-for="product in productList" :key="product.id" class="card product-card">
        <div>
          <h4 class="prod-name">{{ product.name }}</h4>
          <p class="prod-info">Harga: Rp {{ product.price.toLocaleString() }} | Stok: {{ product.stock }}</p>
        </div>
        <button @click="deleteProduct(product.id)" class="delete-btn">Hapus</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: sans-serif;
  background-color: #ffffff;
  min-height: 90vh;
  box-sizing: border-box;
  padding-bottom: 80px;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #2f3640;
}

.card {
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.content-box {
  text-align: center;
  padding: 30px;
}

.info-text {
  font-size: 13px;
  color: #718093;
  margin: 0;
}

.action-btn {
  background-color: #2f3640;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.form-box {
  background-color: #f5f6fa;
  margin-bottom: 20px;
}

.form-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #2f3640;
}

.input-group {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  font-size: 11px;
  color: #718093;
  margin-bottom: 4px;
  font-weight: bold;
}

.input-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 13px;
}

.save-btn {
  width: 100%;
  background-color: #2f3640;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prod-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2f3640;
}

.prod-info {
  margin: 0;
  font-size: 12px;
  color: #718093;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}
</style>