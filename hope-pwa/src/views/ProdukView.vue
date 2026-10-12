<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const productList = ref([])
const showForm = ref(false)
const showFilterDropdown = ref(false)
const selectedCategoryFilter = ref('')
const editingProductId = ref(null)

const costInputMode = ref('total') 
const productIngredients = ref([])

const ingredientOptions = ref(['Pisang', 'Terigu', 'Minyak', 'Gula', 'Telur', 'Cokelat', 'Selai', 'Cup Agar', 'Standing Pouch'])
const isAddingIngredient = ref(false)
const newIngredientInput = ref('')

const tempIngredient = ref({ 
  name: '', 
  qtyUsed: '',     
  unit: 'pcs',     
  packPrice: '',   
  packCapacity: '',
  packUnit: 'pcs'  
})

const batchOutputQty = ref(1)

const categoryOptions = ref(['Makanan', 'Minuman', 'Cemilan'])
const variantOptions = ref(['Original', 'Coklat', 'Stroberi', 'Matcha', 'Keju'])
const unitOptions = ref(['pcs', 'kg', 'gr', 'ons', 'liter', 'ml', 'bungkus'])

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
    try {
      productList.value = JSON.parse(savedProducts)
    } catch (e) {
      console.error(e)
    }
  }
})

const handleIngredientChange = (event) => {
  if (event.target.value === 'ADD_NEW') {
    isAddingIngredient.value = true
    tempIngredient.value.name = ''
  } else {
    isAddingIngredient.value = false
  }
}

const saveNewIngredient = () => {
  if (newIngredientInput.value.trim() !== '') {
    const formatted = newIngredientInput.value.trim()
    if (!ingredientOptions.value.includes(formatted)) {
      ingredientOptions.value.push(formatted)
    }
    tempIngredient.value.name = formatted
    newIngredientInput.value = ''
    isAddingIngredient.value = false
  }
}

const calculateIngredientCost = (ing) => {
  const price = Number(ing.packPrice) || 0
  let capacity = Number(ing.packCapacity) || 1
  let used = Number(ing.qtyUsed) || 0

  if (ing.packUnit === 'kg' && ing.unit === 'gr') {
    capacity = capacity * 1000
  } else if (ing.packUnit === 'gr' && ing.unit === 'kg') {
    used = used * 1000
  } else if (ing.packUnit === 'liter' && ing.unit === 'ml') {
    capacity = capacity * 1000
  } else if (ing.packUnit === 'ml' && ing.unit === 'liter') {
    used = used * 1000
  }

  return (price / capacity) * used
}

const calculatedTotalCostFromDetails = computed(() => {
  return productIngredients.value.reduce((sum, ing) => sum + calculateIngredientCost(ing), 0)
})

const calculatedCostPerPcs = computed(() => {
  const total = calculatedTotalCostFromDetails.value
  const qty = Number(batchOutputQty.value) || 1
  return Math.round(total / qty)
})

const finalCost = computed(() => {
  if (costInputMode.value === 'detail') {
    return calculatedCostPerPcs.value
  }
  return Number(String(form.value.cost || '0').replace(/\D/g, ''))
})

const addIngredientToList = () => {
  if (!tempIngredient.value.name || !tempIngredient.value.qtyUsed || !tempIngredient.value.packPrice || !tempIngredient.value.packCapacity) {
    alert('Mohon lengkapi detail bahan, harga beli, total isi kemasan, dan jumlah pakai!')
    return
  }
  productIngredients.value.push({
    id: Date.now(),
    ...tempIngredient.value
  })
  tempIngredient.value = { name: '', qtyUsed: '', unit: 'pcs', packPrice: '', packCapacity: '', packUnit: 'pcs' }
  isAddingIngredient.value = false
}

const deleteIngredient = (id) => {
  productIngredients.value = productIngredients.value.filter(ing => ing.id !== id)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = URL.createObjectURL(file)
  }
}

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

const handleCategoryChange = (event) => {
  if (event.target.value === 'ADD_NEW') {
    isAddingCategory.value = true
    form.value.category = ''
  } else {
    isAddingCategory.value = false
  }
}

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

const handleVariantChange = (event) => {
  if (event.target.value === 'ADD_NEW') {
    isAddingVariant.value = true
    form.value.variant = ''
  } else {
    isAddingVariant.value = false
  }
}

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

const availableCategories = computed(() => {
  const categories = productList.value.map(p => p.category).filter(Boolean)
  return [...new Set(categories)]
})

const filteredProducts = computed(() => {
  if (!selectedCategoryFilter.value) {
    return productList.value
  }
  return productList.value.filter(p => p.category.toLowerCase() === selectedCategoryFilter.value.toLowerCase())
})

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
  }
}

const saveProduct = () => {
  if (!form.value.name || form.value.price === '') {
    alert('Mohon isi minimal Nama Produk dan Harga Jual!')
    return
  }

  const productData = {
    id: editingProductId.value || Date.now(),
    image: form.value.image || '/images/icons8-new-product-50.png',
    name: form.value.name,
    category: form.value.category.trim() || 'Umum',
    variant: form.value.variant.trim() || 'Original',
    price: Number(String(form.value.price).replace(/\D/g, '')) || 0,
    costing: {
      mode: costInputMode.value,
      totalCost: finalCost.value,
      batchQty: costInputMode.value === 'detail' ? batchOutputQty.value : 1,
      ingredients: costInputMode.value === 'detail' ? productIngredients.value : []
    },
    stock: Number(form.value.stock) || 0,
    minStock: Number(form.value.minStock) || 0
  }

  if (editingProductId.value) {
    const index = productList.value.findIndex(p => p.id === editingProductId.value)
    if (index !== -1) {
      productList.value[index] = productData
    }
  } else {
    productList.value.push(productData)
  }

  localStorage.setItem('productsList', JSON.stringify(productList.value))
  resetForm()
  alert('Produk berhasil disimpan!')
}

const resetForm = () => {
  form.value = { image: '', name: '', category: '', variant: '', price: '', cost: '', stock: '', minStock: '' }
  isAddingCategory.value = false
  isAddingVariant.value = false
  showForm.value = false
  editingProductId.value = null
  costInputMode.value = 'total'
  productIngredients.value = []
  tempIngredient.value = { name: '', qtyUsed: '', unit: 'pcs', packPrice: '', packCapacity: '', packUnit: 'pcs' }
  batchOutputQty.value = 1
  isAddingIngredient.value = false
}

const deleteProduct = (id) => {
  if (editingProductId.value === id) {
    alert('Sedang dalam mode edit, harap simpan atau batalkan terlebih dahulu.')
    return
  }
  productList.value = productList.value.filter(p => p.id !== id)
  localStorage.setItem('productsList', JSON.stringify(productList.value))
}

const editProduct = (product) => {
  editingProductId.value = product.id
  showForm.value = true
  
  form.value = {
    image: product.image && product.image !== '/images/icons8-new-product-50.png' ? product.image : '',
    name: product.name || '',
    category: product.category || '',
    variant: product.variant || '',
    price: product.price ? Number(product.price).toLocaleString('id-ID') : '',
    cost: product.costing ? Number(product.costing.totalCost || 0).toLocaleString('id-ID') : '',
    stock: product.stock || 0,
    minStock: product.minStock || 0
  }

  if (product.costing) {
    costInputMode.value = product.costing.mode || 'total'
    if (costInputMode.value === 'detail') {
      productIngredients.value = product.costing.ingredients || []
      batchOutputQty.value = product.costing.batchQty || 1
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => form.value.price, (newValue) => {
  if (newValue !== undefined && newValue !== null) {
    const cleanValue = String(newValue).replace(/\D/g, '')
    if (cleanValue === '') {
      form.value.price = ''
    } else {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(cleanValue))
      if (formatted !== newValue) {
        form.value.price = formatted
      }
    }
  }
})

watch(() => form.value.cost, (newValue) => {
  if (costInputMode.value === 'total' && newValue !== undefined && newValue !== null) {
    const cleanValue = String(newValue).replace(/\D/g, '')
    if (cleanValue === '') {
      form.value.cost = ''
    } else {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(cleanValue))
      if (formatted !== newValue) {
        form.value.cost = formatted
      }
    }
  }
})
</script>

<template>
  <div class="page-wrapper">
    <!-- Header Nav & Tombol Filter -->
    <div class="header-nav">
      <h3 class="page-title">Produk</h3>
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

        <button @click="toggleForm" class="action-btn">
          {{ showForm ? 'Batal' : '+ Tambah Produk' }}
        </button>
      </div>
    </div>

    <!-- Filter kategori -->
    <div v-if="selectedCategoryFilter" class="filter-status-bar">
      <span>Menampilkan kategori: <strong>{{ selectedCategoryFilter }}</strong></span>
      <button @click="selectedCategoryFilter = ''" class="reset-filter-btn">Reset</button>
    </div>

    <!-- Form Tambah / Edit Produk -->
    <div v-if="showForm" class="card form-box">
      <h2 class="form-header-title">{{ editingProductId ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
      
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

      <!-- Pilihan Kategori HPP -->
      <div class="card sub-card hpp-section">
        <label class="section-label">Modal / Biaya Produksi</label>
        
        <div class="hpp-button-group">
          <button 
            type="button" 
            class="hpp-tab-btn" 
            :class="{ active: costInputMode === 'total' }" 
            @click="costInputMode = 'total'"
          >
            Modal Total
          </button>
          <button 
            type="button" 
            class="hpp-tab-btn" 
            :class="{ active: costInputMode === 'detail' }" 
            @click="costInputMode = 'detail'"
          >
            HPP Terperinci (Bahan)
          </button>
        </div>

        <!-- Mode Total -->
        <div v-if="costInputMode === 'total'" class="input-group mt-12">
            <label>Jumlah Modal Total</label>
            <input v-model="form.cost" type="text" placeholder="Rp 0" class="input-field no-spinner" />
        </div>

        <!-- Mode Terperinci -->
        <div v-if="costInputMode === 'detail'" class="input-group mt-12 detail-box">
          <label>Daftar Bahan Baku & Kemasan</label>
          
          <div v-if="productIngredients.length > 0" class="ingredient-table">
            <div v-for="ing in productIngredients" :key="ing.id" class="ing-row">
              <div>
                <strong>{{ ing.name }}</strong> 
                <span class="ing-subtext">(Pakai: {{ ing.qtyUsed }} {{ ing.unit }} dari Total Isi {{ ing.packCapacity }} {{ ing.packUnit }} seharga Rp {{ Number(ing.packPrice || 0).toLocaleString('id-ID') }})</span>
              </div>
              <div class="ing-right">
                  <span class="ing-computed-price">Rp {{ Math.round(calculateIngredientCost(ing)).toLocaleString('id-ID') }}</span>
                  <button type="button" @click="deleteIngredient(ing.id)" class="ing-delete-btn">×</button>
              </div>
            </div>
            <div class="ing-total">
                <span>Total Modal Semua Bahan:</span>
                <strong>Rp {{ Math.round(calculatedTotalCostFromDetails).toLocaleString('id-ID') }}</strong>
            </div>
          </div>

          <!-- Form Input Bahan -->
          <div class="ingredient-input-container">
            <div class="input-group mb-8">
              <label class="sub-label">Pilih / Nama Bahan</label>
              <select v-model="tempIngredient.name" @change="handleIngredientChange" class="input-field">
                <option disabled value="">Pilih Bahan / Kemasan</option>
                <option v-for="ingOpt in ingredientOptions" :key="ingOpt" :value="ingOpt">{{ ingOpt }}</option>
                <option value="ADD_NEW" class="add-new-option">+ Tambah Bahan Baru...</option>
              </select>
            </div>

            <div v-if="isAddingIngredient" class="sub-input-box mb-8">
              <input v-model="newIngredientInput" type="text" placeholder="Ketik nama bahan baru..." class="input-field sub-field" />
              <button type="button" @click="saveNewIngredient" class="sub-save-btn">Simpan Bahan</button>
            </div>

            <!-- Harga Bahan dan Total Bahan -->
            <div class="row-group mb-8">
              <div class="input-group half">
                <label class="sub-label">Harga Bahan (Beli)</label>
                <input v-model="tempIngredient.packPrice" type="number" placeholder="Contoh: 10000" class="input-field no-spinner" />
              </div>
              <div class="input-group half">
                <label class="sub-label">Total Bahan (Isi Kemasan)</label>
                <div class="inline-flex">
                  <input v-model="tempIngredient.packCapacity" type="number" placeholder="Contoh: 1000" class="input-field no-spinner qty-input" />
                  <select v-model="tempIngredient.packUnit" class="unit-select compact-unit">
                    <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Pemakaian Sekali Buat -->
            <div class="input-group mb-8">
              <label class="sub-label">Pemakaian (Sekali Buat)</label>
              <div class="inline-flex">
                <input v-model="tempIngredient.qtyUsed" type="number" placeholder="Contoh: 250" class="input-field no-spinner qty-input" />
                <select v-model="tempIngredient.unit" class="unit-select compact-unit">
                  <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <!-- Tombol Tambah ke Daftar Bahan -->
            <button type="button" @click="addIngredientToList" class="save-btn">+ Masukkan ke Daftar Bahan</button>
          </div>

          <!-- Input Hasil Jadi Per Pcs -->
          <div class="batch-output-box mt-12">
            <label>Berapa Total Produk yang Dihasilkan dari Resep Ini?</label>
            <div class="batch-flex">
              <input v-model="batchOutputQty" type="number" min="1" placeholder="Contoh: 10" class="input-field no-spinner" />
              <span class="unit-pcs">Pcs</span>
            </div>
            <div class="result-hpp-preview mt-8">
              <span>Estimasi Modal / HPP per Pcs:</span>
              <strong class="highlight-cost">Rp {{ calculatedCostPerPcs.toLocaleString('id-ID') }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Harga Jual -->
      <div class="input-group">
        <label>Harga Jual</label>
        <input v-model="form.price" type="text" placeholder="Rp 0" class="input-field no-spinner" />
      </div>

      <!-- Stok & Batas Stok -->
      <div class="row-group">
        <div class="input-group half">
          <label>Stok</label>
          <input v-model="form.stock" type="number" placeholder="0" class="input-field no-spinner" />
        </div>
        <div class="input-group half">
          <label>Batas Stok</label>
          <input v-model="form.minStock" type="number" placeholder="0" class="input-field no-spinner" />
        </div>
      </div>

      <!-- Tombol Update Perubahan -->
      <button @click="saveProduct" class="save-btn">
        {{ editingProductId ? 'Update Perubahan' : 'Simpan Produk' }}
      </button>
    </div>

    <!-- Daftar Produk -->
    <div class="product-list-section">
      <h4 class="section-title">Daftar Produk Tersimpan</h4>
      
      <div v-if="filteredProducts.length === 0" class="card content-box">
        <p class="info-text">Belum ada produk yang sesuai.</p>
      </div>

      <div v-for="product in filteredProducts" :key="product.id" class="card product-card" :class="{ 'editing': editingProductId === product.id }">
        <div class="product-info-wrapper">
          <div class="prod-thumb-container" @click="$refs['fileInputList_' + product.id]?.[0]?.click()" title="Klik untuk ganti gambar">
            <img :src="product.image || '/images/icons8-new-product-50.png'" class="prod-thumb" />
          </div>

          <input 
            :ref="'fileInputList_' + product.id" 
            type="file" 
            accept="image/png, image/jpeg" 
            class="hidden-input" 
            @change="(e) => triggerUpdateImage(product.id, e)" 
          />

          <div class="prod-text-content">
            <h4 class="prod-name">{{ product.name }}</h4>
            <span class="badge">({{ product.category }} - {{ product.variant }})</span>
            <p class="prod-detail">
              Jual: Rp {{ Number(product.price || 0).toLocaleString('id-ID') }} | 
              Modal: Rp {{ Number(product.costing?.totalCost || 0).toLocaleString('id-ID') }}
            </p>
            <p class="prod-detail">Stok: <strong>{{ product.stock }}</strong> (Min: {{ product.minStock }})</p>
          </div>
        </div>
        <div class="card-actions">
          <button @click="editProduct(product)" class="edit-btn">Edit</button>
          <button @click="deleteProduct(product.id)" class="delete-btn">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input.no-spinner::-webkit-outer-spin-button,
input.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input.no-spinner {
  -moz-appearance: textfield;
}

.page-wrapper {
  padding: 16px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #ffffff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 90px;
  position: relative;
  z-index: 1;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 51;
  pointer-events: auto;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #1e272e;
}

.filter-wrapper {
  position: relative;
  z-index: 52;
  pointer-events: auto;
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
  pointer-events: auto;
}

.filter-item {
  padding: 10px 14px;
  font-size: 12px;
  color: #1e272e;
  cursor: pointer;
  border-bottom: 1px solid #f1f2f6;
  pointer-events: auto;
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
  pointer-events: auto;
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
  pointer-events: auto;
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
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto !important;
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

.form-header-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: bold;
  color: #5352ed;
  text-align: center;
  border-bottom: 1px solid #dcdde1;
  padding-bottom: 8px;
}

.input-group {
  margin-bottom: 12px;
}

.input-group.mb-8 {
  margin-bottom: 8px;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: #1e272e;
  margin-bottom: 6px;
  font-weight: bold;
}

.sub-label {
  font-size: 11px;
  color: #57606f;
  margin-bottom: 4px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  pointer-events: auto;
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
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;
}

.row-group {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

.inline-flex {
  display: flex;
  gap: 6px;
  align-items: center;
}

.qty-input {
  flex: 1;
  min-width: 0;
}

.compact-unit {
  width: 65px !important;
  flex-shrink: 0;
  padding: 10px 4px !important;
  font-size: 11px !important;
  text-align: center;
  pointer-events: auto;
}

.ingredient-input-container {
  background: #ffffff;
  border: 1px solid #dcdde1;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.action-btn {
  background-color: #5352ed;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto !important;
  position: relative;
  z-index: 2;
}

.save-btn {
  width: 100%;
  background-color: #2ed573;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin: 12px 0;
  pointer-events: auto;
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

.product-card.editing {
  background-color: #e8f4f8;
  border-color: #70a1ff;
}

.product-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.prod-thumb-container {
  width: 45px;
  height: 45px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f2f6;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.prod-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  pointer-events: auto;
}

.delete-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
}

.edit-btn {
  background-color: #2ed573;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
}

.mt-12 {
  margin-top: 12px;
}

.mt-8 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 4px;
}

.sub-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.hpp-section {
  padding: 16px;
}

.section-label {
  display: block;
  font-size: 12px;
  color: #1e272e;
  font-weight: bold;
  margin-bottom: 10px;
}

.hpp-button-group {
  display: flex;
  gap: 10px;
}

.hpp-tab-btn {
  flex: 1;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #dcdde1;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #57606f;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  pointer-events: auto;
}

.hpp-tab-btn:hover {
  background-color: #f1f2f6;
}

.hpp-tab-btn.active {
  background-color: #5352ed;
  color: #ffffff;
  border-color: #5352ed;
}

.ingredient-table {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #dcdde1;
  font-size: 12px;
}

.ing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f1f2f6;
}

.ing-subtext {
  display: block;
  font-size: 10px;
  color: #718093;
}

.ing-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ing-computed-price {
  font-weight: bold;
  color: #2f3640;
}

.ing-delete-btn {
  background: none;
  border: none;
  color: #ff4757;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  pointer-events: auto;
}

.ing-total {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #f0f8ff;
  font-weight: bold;
  color: #5352ed;
}

.batch-output-box {
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdde1;
}

.batch-flex {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.unit-pcs {
  font-size: 12px;
  font-weight: bold;
  color: #1e272e;
}

.result-hpp-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  background-color: #e8f4f8;
  padding: 8px 10px;
  border-radius: 6px;
}

.highlight-cost {
  color: #27ae60;
  font-size: 13px;
}

.hint-text {
  font-size: 10px;
  color: #718093;
  margin: 0;
}
</style>