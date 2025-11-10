<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-gray-700">🛒 Supermarket - Upload Produk</h1>

    <div
        v-if="errorMsg || Object.keys(errors).length"
        class="bg-red-100 text-red-700 p-3 mb-4 rounded-lg border border-red-300"
    >
      <p v-if="errorMsg">{{ errorMsg }}</p>
      <ul v-else>
        <li v-for="(msg, field) in errors" :key="field">
          <strong>{{ field }}</strong>: {{ msg[0] }}
        </li>
      </ul>
    </div>

    <div
        v-if="successMsg"
        class="bg-green-100 text-green-700 p-3 mb-4 rounded-lg border border-green-300"
    >
      {{ successMsg }}
    </div>

    <form
        @submit.prevent="submitForm"
        class="bg-white shadow p-4 rounded-lg mb-8 space-y-3"
    >
      <div>
        <label class="block text-gray-600 font-medium mb-1">Nama Barang *</label>
        <input
            v-model="form.name"
            placeholder="Nama Barang"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
        />
      </div>

      <div>
        <label class="block text-gray-600 font-medium mb-1">Harga *</label>
        <input
            v-model="form.price"
            placeholder="Harga"
            type="number"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
            min="1"
        />
      </div>

      <div>
        <label class="block text-gray-600 font-medium mb-1">Stok *</label>
        <input
            v-model="form.stock"
            placeholder="Stok"
            type="number"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
            min="1"
        />
      </div>

      <div>
        <label class="block text-gray-600 font-medium mb-1">Gambar (JPG/PNG) *</label>
        <input
            type="file"
            ref="fileInput"
            @change="onFileChange"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            accept=".jpg,.png"
            required
        />
      </div>

      <button
          type="submit"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:bg-blue-300"
      >
        {{ loading ? 'Mengunggah...' : 'Upload Barang' }}
      </button>
    </form>

    <div v-if="loadingProducts" class="text-gray-500 text-center py-4">
      ⏳ Memuat daftar produk...
    </div>

    <div
        v-else-if="products.data && products.data.length === 0"
        class="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border"
    >
      Belum ada produk tersedia.
    </div>

    <div v-else>
      <h2 class="text-xl font-semibold mb-2">Daftar Barang (stok > 0)</h2>
      <table class="w-full border text-sm text-left">
        <thead class="bg-gray-100">
        <tr>
          <th class="p-2">No</th>
          <th class="p-2">Nama</th>
          <th class="p-2">Harga</th>
          <th class="p-2">Stok</th>
          <th class="p-2">Gambar</th>
          <th class="p-2">Kode</th>
          <th class="p-2 text-center">Action</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(p, i) in products.data" :key="p.id" class="border-t">
          <td class="p-2">{{ i + 1 }}</td>
          <td class="p-2">{{ p.name }}</td>
          <td class="p-2">Rp {{ p.price.toLocaleString() }}</td>
          <td class="p-2">{{ p.stock }}</td>
          <td class="p-2">
            <img :src="imgUrl(p.image)" class="h-12 rounded" alt="product" />
          </td>
          <td class="p-2">{{ p.code }}</td>
          <td class="p-2 text-center">
            <button
                @click="buy(p.id)"
                class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Beli
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="flex justify-between mt-4">
        <button
            v-if="products.prev_page_url"
            @click="fetchProducts(products.current_page - 1)"
            class="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
        >
          Prev
        </button>
        <button
            v-if="products.next_page_url"
            @click="fetchProducts(products.current_page + 1)"
            class="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>

    <router-link
        to="/cart"
        class="block text-center mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Lihat Shopping Cart
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api, { apiUpload } from '../api'

const form = ref({ name: '', price: '', stock: '', image: null })
const fileInput = ref(null)
const products = ref({ data: [] })
const errors = ref({})
const successMsg = ref('')
const errorMsg = ref('')
const loading = ref(false)
const loadingProducts = ref(false)

function onFileChange(e) {
  form.value.image = e.target.files[0]
}

async function submitForm() {
  errors.value = {}
  successMsg.value = ''
  errorMsg.value = ''
  loading.value = true

  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => fd.append(k, v))
    await apiUpload.post('/products', fd)

    successMsg.value = 'Barang berhasil diupload!'
    setTimeout(() => (successMsg.value = ''), 3000)

    form.value = {name: '', price: '', stock: '', image: null}
    if (fileInput.value) fileInput.value.value = ''

    fetchProducts()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message
    } else {
      errorMsg.value = 'Gagal mengupload produk. Coba lagi nanti.'
    }
  } finally {
    loading.value = false
  }
}

async function fetchProducts(page = 1) {
  loadingProducts.value = true
  errorMsg.value = ''
  try {
    const {data} = await api.get(`/products?page=${page}`)
    products.value = data
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat produk.'
  } finally {
    loadingProducts.value = false
  }
}

async function buy(id) {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await api.post(`/cart/add/${id}`)
    successMsg.value = 'Barang ditambahkan ke cart!'
    await fetchProducts()
    setTimeout(() => (successMsg.value = ''), 2500)
  } catch (err) {
    errorMsg.value =
        err.response?.data?.message || 'Gagal menambahkan barang ke cart.'
    setTimeout(() => (errorMsg.value = ''), 2500)
  }
}

function imgUrl(file) {
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/products/${file}`
}

onMounted(fetchProducts)
</script>
