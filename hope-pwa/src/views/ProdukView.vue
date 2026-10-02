<script setup>
import { ref, computed, onMounted } from 'vue'

const productList = ref([])
const showForm = ref(false)
const showFilterDropdown = ref(false)
const selectedCategoryFilter = ref('')

// Daftar pilihan kategori & varian
const categoryOptions = ref(['Makanan', 'Minuman', 'Cemilan'])
const variantOptions = ref(['Original', 'Coklat', 'Stroberi', 'Matcha', 'Keju'])

// Untuk menambahkan produk terbaru
const isAddingCategory = ref(false)
const newCategoryInput = ref('')

const isAddingVariant = ref(false)
const newVariantInput = ref('')

const form = ref({
  image: '',
  name: '',
  category: '',
  variant: '',
  price: '',
  cost: '',
  stock: '',
  minStock: ''
})

onMounted(() => {
  const savedProducts = localStorage.getItem('productsList')
  if (savedProducts) {
    productList.value = JSON.parse(savedProducts)
  }
})

// Untuk upload gambar produk di Form Tambah
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = URL.createObjectURL(file)
  }
}

// Mengganti gambar langsung dari daftar produk yang sudah tersimpan
const triggerUpdateImage = (productId, event) => {
  const file = event.target.files[0]
  if (file) {
    const newImageUrl = URL.createObjectURL(file)
    const product = productList.value.find(p => p.id === productId)
    if (product) {
      product.image = newImageUrl
      localStorage.setItem('productsList', JSON.stringify(productList.value))
    }
  }
}

// Untuk menyimpan katagori yang dipilih
const handleCategoryChange = (event) => {
  if (event.target.value === 'ADD_NEW') {
    isAddingCategory.value = true
    form.value.category = ''
  } else {
    isAddingCategory.value = false
  }
}

// Untuk menyimpan Kategori Baru dari input tambahan
const saveNewCategory = () => {
  if (newCategoryInput.value.trim() !== '') {
    const formatted = newCategoryInput.value.trim()
    if (!categoryOptions.value.includes(formatted)) {
      categoryOptions.value.push(formatted)
    }
    form.value.category = formatted
    newCategoryInput.value = ''
    isAddingCategory.value = false
  }
}

// Untuk memilih varian yang dipilih
const handleVariantChange = (event) => {
  if (event.target.value === 'ADD_NEW') {
    isAddingVariant.value = true
    form.value.variant = ''
  } else {
    isAddingVariant.value = false
  }
}

// Untuk menyimpan varian terbaru
const saveNewVariant = () => {
  if (newVariantInput.value.trim() !== '') {
    const formatted = newVariantInput.value.trim()
    if (!variantOptions.value.includes(formatted)) {
      variantOptions.value.push(formatted)
    }
    form.value.variant = formatted
    newVariantInput.value = ''
    isAddingVariant.value = false
  }
}

// Daftar kategori untuk filter produk
const availableCategories = computed(() => {
  const categories = productList.value.map(p => p.category).filter(Boolean)
  return [...new Set(categories)]
})

// Filter produk berdasarkan kategori yang dipilih
const filteredProducts = computed(() => {
  if (!selectedCategoryFilter.value) {
    return productList.value
  }
  return productList.value.filter(p => p.category.toLowerCase() === selectedCategoryFilter.value.toLowerCase())
})

const saveProduct = () => {
  if (!form.value.name || !form.value.price) {
    alert('Mohon isi minimal Nama Produk dan Harga Jual!')
    return
  }

  const newProduct = {
    id: Date.now(),
    image: form.value.image,
    name: form.value.name,
    category: form.value.category.trim() || 'Umum',
    variant: form.value.variant.trim() || 'Original',
    price: Number(String(form.value.price).replace(/\D/g, '')),
    cost: Number(String(form.value.cost).replace(/\D/g, '')),
    stock: Number(form.value.stock) || 0,
    minStock: Number(form.value.minStock) || 0
  }

  productList.value.push(newProduct)
  localStorage.setItem('productsList', JSON.stringify(productList.value))

  // Reset form dan data
  form.value = { image: '', name: '', category: '', variant: '', price: '', cost: '', stock: '', minStock: '' }
  isAddingCategory.value = false
  isAddingVariant.value = false
  showForm.value = false
}

const deleteProduct = (id) => {
  productList.value = productList.value.filter(p => p.id !== id)
  localStorage.setItem('productsList', JSON.stringify(productList.value))
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Header Nav & Tombol Filter -->
    <div class="header-nav">
      <h3 class="page-title">← Tambah Produk</h3>
      <div class="header-actions">
        <div class="filter-wrapper">
          <button @click="showFilterDropdown = !showFilterDropdown" class="filter-btn" title="Filter Kategori">
            <img src="/images/icons8-filter-50.png" alt="Filter" class="icon-asset-small" />
          </button>
          
          <div v-if="showFilterDropdown" class="filter-dropdown-menu">
            <div 
              class="filter-item" 
              :class="{ active: selectedCategoryFilter === '' }"
              @click="selectedCategoryFilter = ''; showFilterDropdown = false"
            >
              Semua Kategori
            </div>
            <div 
              v-for="cat in availableCategories" 
              :key="cat"
              class="filter-item"
              :class="{ active: selectedCategoryFilter === cat }"
              @click="selectedCategoryFilter = cat; showFilterDropdown = false"
            >
              {{ cat }}
            </div>
          </div>
        </div>

        <button @click="showForm = !showForm" class="action-btn">
          {{ showForm ? 'Batal' : '+ Tambah Produk' }}
        </button>
      </div>
    </div>

    <!-- Filter katagori -->
    <div v-if="selectedCategoryFilter" class="filter-status-bar">
      <span>Menampilkan kategori: <strong>{{ selectedCategoryFilter }}</strong></span>
      <button @click="selectedCategoryFilter = ''" class="reset-filter-btn">Reset</button>
    </div>

    <!-- Untuk menambahkan Produk -->
    <div v-if="showForm" class="card form-box">
      <!-- Upload Gambar -->
      <div class="upload-box" @click="$refs.fileInput.click()">
        <div v-if="!form.image" class="upload-placeholder">
          <img src="/images/icons8-camera-50.png" alt="Kamera" class="icon-asset-large" />
          <p class="upload-text">Tambah Gambar Produk</p>
          <p class="upload-hint">JPG, PNG (maks. 2MB)</p>
        </div>
        <div v-else class="preview-container">
          <img :src="form.image" alt="Preview" class="img-preview" />
          <p class="change-hint">Klik untuk ganti gambar</p>
        </div>
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/png, image/jpeg" 
          class="hidden-input" 
          @change="handleImageUpload" 
        />
      </div>

      <!-- Nama Produk -->
      <div class="input-group">
        <label>Nama Produk</label>
        <input v-model="form.name" type="text" placeholder="Contoh: Keripik Pisang" class="input-field" />
      </div>

      <!-- Kategori Produk -->
      <div class="input-group">
        <label>Jenis / Kategori Produk</label>
        <select v-model="form.category" @change="handleCategoryChange" class="input-field">
          <option disabled value="">Pilih Jenis Produk</option>
          <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
          <option value="ADD_NEW" class="add-new-option">+ Tambah Kategori Baru...</option>
        </select>

        <div v-if="isAddingCategory" class="sub-input-box">
          <input v-model="newCategoryInput" type="text" placeholder="Ketik jenis produk baru..." class="input-field sub-field" />
          <button type="button" @click="saveNewCategory" class="sub-save-btn">Tambah</button>
        </div>
      </div>

      <!-- Varian Rasa -->
      <div class="input-group">
        <label>Varian Rasa</label>
        <select v-model="form.variant" @change="handleVariantChange" class="input-field">
          <option disabled value="">Pilih Varian Rasa</option>
          <option v-for="v in variantOptions" :key="v" :value="v">{{ v }}</option>
          <option value="ADD_NEW" class="add-new-option">+ Tambah Varian Baru...</option>
        </select>

        <div v-if="isAddingVariant" class="sub-input-box">
          <input v-model="newVariantInput" type="text" placeholder="Ketik varian rasa baru..." class="input-field sub-field" />
          <button type="button" @click="saveNewVariant" class="sub-save-btn">Tambah</button>
        </div>
      </div>

      <!-- Harga Jual -->
      <div class="input-group">
        <label>Harga Jual</label>
        <input v-model="form.price" type="text" placeholder="Rp 0" class="input-field" />
      </div>

      <!-- Modal Produksi -->
      <div class="input-group">
        <label>Modal / Biaya Produksi</label>
        <input v-model="form.cost" type="text" placeholder="Rp 0" class="input-field" />
      </div>

      <!-- Stok & Batas Stok -->
      <div class="row-group">
        <div class="input-group half">
          <label>Stok</label>
          <input v-model="form.stock" type="number" placeholder="0" class="input-field" />
        </div>
        <div class="input-group half">
          <label>Batas Stok</label>
          <input v-model="form.minStock" type="number" placeholder="0" class="input-field" />
        </div>
      </div>

      <button @click="saveProduct" class="save-btn">Simpan</button>
    </div>

    <!-- Daftar Produk -->
    <div class="product-list-section">
      <h4 class="section-title">Daftar Produk Tersimpan</h4>
      
      <div v-if="filteredProducts.length === 0" class="card content-box">
        <p class="info-text">Belum ada produk yang sesuai.</p>
      </div>

      <div v-for="product in filteredProducts" :key="product.id" class="card product-card">
        <div class="product-info-wrapper">
          
          <!-- Area gambar produk yang sudah di input -->
          <div class="prod-thumb-container" @click="$refs['fileInputList_' + product.id][0].click()" title="Klik untuk ganti gambar">
            <img v-if="product.image" :src="product.image" class="prod-thumb" />
            <div v-else class="prod-thumb-placeholder">
              <img src="/images/icons8-new-product-50.png" alt="New Product" class="prod-default-icon" />
            </div>
          </div>

          <!-- Input gambar pada Masing-masing Produk -->
          <input 
            :ref="'fileInputList_' + product.id" 
            type="file" 
            accept="image/png, image/jpeg" 
            class="hidden-input" 
            @change="(e) => triggerUpdateImage(product.id, e)" 
          />

          <div class="prod-text-content">
            <h4 class="prod-name">
              {{ product.name }} 
            </h4>
            <span class="badge">({{ product.category }} - {{ product.variant }})</span>
            <p class="prod-detail">Jual: Rp {{ product.price.toLocaleString() }} | Modal: Rp {{ product.cost.toLocaleString() }}</p>
            <p class="prod-detail">Stok: <strong>{{ product.stock }}</strong> (Min: {{ product.minStock }})</p>
          </div>
        </div>
        <button @click="deleteProduct(product.id)" class="delete-btn">Hapus</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  padding: 16px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #fbf9f5;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 90px;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #1e272e;
}

.filter-wrapper {
  position: relative;
}

.filter-dropdown-menu {
  position: absolute;
  right: 0;
  top: 38px;
  background: white;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 160px;
  z-index: 100;
  overflow: hidden;
}

.filter-item {
  padding: 10px 14px;
  font-size: 12px;
  color: #1e272e;
  cursor: pointer;
  border-bottom: 1px solid #f1f2f6;
}

.filter-item:hover {
  background-color: #f5f6fa;
}

.filter-item.active {
  background-color: #5352ed;
  color: white;
  font-weight: bold;
}

.filter-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e8f4f8;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #2f3640;
  margin-bottom: 12px;
}

.reset-filter-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
}

.card {
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.upload-box {
  border: 2px dashed #70a1ff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  background-color: #f0f8ff;
  cursor: pointer;
  margin-bottom: 16px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-asset-large {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-bottom: 6px;
}

.filter-btn {
  background: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-asset-small {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.upload-text {
  margin: 0;
  font-size: 13px;
  font-weight: bold;
  color: #1e272e;
}

.upload-hint {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #718093;
}

.hidden-input {
  display: none;
}

.img-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 4px;
}

.change-hint {
  font-size: 11px;
  color: #718093;
  margin: 0;
}

.form-box {
  background-color: #ffffff;
  margin-bottom: 20px;
  border: 1px solid #dcdde1;
}

.input-group {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: #1e272e;
  margin-bottom: 6px;
  font-weight: bold;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 13px;
  background-color: #fff;
  color: #1e272e;
}

.add-new-option {
  font-weight: bold;
  color: #5352ed;
  background-color: #f0f8ff;
}

.sub-input-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.sub-field {
  background-color: #f9f9f9;
}

.sub-save-btn {
  background-color: #2ed573;
  color: white;
  border: none;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.row-group {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

.action-btn {
  background-color: #5352ed;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.save-btn {
  width: 100%;
  background-color: #5352ed;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 6px;
}

.section-title {
  font-size: 14px;
  color: #1e272e;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.content-box {
  text-align: center;
  padding: 24px;
}

.info-text {
  font-size: 13px;
  color: #718093;
  margin: 0;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.product-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* Container Gambar Thumbnail */
.prod-thumb-container {
  width: 45px;
  height: 45px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.prod-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prod-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: #f1f2f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prod-default-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.prod-text-content {
  min-width: 0;
  flex: 1;
}

.prod-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  color: #1e272e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  font-size: 11px;
  color: #718093;
  font-weight: normal;
  margin-bottom: 2px;
}

.prod-detail {
  margin: 2px 0;
  font-size: 12px;
  color: #57606f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
}
</style>