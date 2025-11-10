<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-gray-700">🛍 Shopping Cart</h1>

    <div
        v-if="errorMsg"
        class="bg-red-100 text-red-700 p-3 mb-4 rounded-lg border border-red-300"
    >
      {{ errorMsg }}
    </div>

    <div
        v-if="successMsg"
        class="bg-green-100 text-green-700 p-3 mb-4 rounded-lg border border-green-300"
    >
      {{ successMsg }}
    </div>

    <div
        v-if="!loading && cart.items.length === 0"
        class="text-center text-gray-500 bg-gray-50 p-6 rounded-lg border"
    >
      🛒 Keranjang kosong — silakan tambahkan barang dari halaman utama.
    </div>

    <div v-if="loading" class="text-center text-gray-500 p-6">
      ⏳ Memuat data keranjang...
    </div>

    <table v-if="!loading && cart.items.length > 0" class="w-full border text-sm text-left">
      <thead class="bg-gray-100">
      <tr>
        <th class="p-2">Nama</th>
        <th class="p-2">Harga</th>
        <th class="p-2">Qty</th>
        <th class="p-2">Subtotal</th>
        <th class="p-2 text-center">Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in cart.items" :key="item.id" class="border-t">
        <td class="p-2">{{ item.product.name }}</td>
        <td class="p-2">Rp {{ item.product.price.toLocaleString() }}</td>
        <td class="p-2">{{ item.quantity }}</td>
        <td class="p-2">Rp {{ item.subtotal.toLocaleString() }}</td>
        <td class="p-2 text-center space-x-2">
          <button
              @click="plus(item.id)"
              class="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
              :disabled="loadingAction"
          >
            +
          </button>
          <button
              @click="minus(item.id)"
              class="bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
              :disabled="loadingAction"
          >
            -
          </button>
          <button
              @click="discard(item.id)"
              class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              :disabled="loadingAction"
          >
            ×
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div
        v-if="!loading && cart.items.length > 0"
        class="mt-6 text-right text-lg font-semibold"
    >
      Total: Rp {{ cart.total.toLocaleString() }}
    </div>

    <div class="flex justify-between mt-6">
      <router-link
          to="/"
          class="bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400"
      >
        ← Kembali
      </router-link>
      <button
          @click="checkout"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          :disabled="loadingAction || cart.items.length === 0"
      >
        Checkout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const cart = ref({ items: [], total: 0 })
const loading = ref(false)
const loadingAction = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function fetchCart() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.get('/cart')
    cart.value = data
  } catch (err) {
    console.error(err)
    errorMsg.value =
        err.response?.data?.message || 'Gagal memuat keranjang dari server.'
  } finally {
    loading.value = false
  }
}

async function plus(id) {
  loadingAction.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await api.post(`/cart/plus/${id}`)
    successMsg.value = 'Jumlah barang berhasil ditambah.'
    fetchCart()
  } catch (err) {
    if (err.response?.status === 400) {
      errorMsg.value = 'Stok tidak mencukupi.'
    } else {
      errorMsg.value = 'Gagal menambah jumlah barang.'
    }
  } finally {
    loadingAction.value = false
    setTimeout(() => (successMsg.value = ''), 2500)
  }
}

async function minus(id) {
  loadingAction.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await api.post(`/cart/minus/${id}`)
    successMsg.value = 'Jumlah barang berhasil dikurangi.'
    fetchCart()
  } catch {
    errorMsg.value = 'Gagal mengurangi barang.'
  } finally {
    loadingAction.value = false
    setTimeout(() => (successMsg.value = ''), 2500)
  }
}

async function discard(id) {
  loadingAction.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await api.delete(`/cart/discard/${id}`)
    successMsg.value = 'Barang dihapus dari keranjang.'
    fetchCart()
  } catch {
    errorMsg.value = 'Gagal menghapus barang.'
  } finally {
    loadingAction.value = false
    setTimeout(() => (successMsg.value = ''), 2500)
  }
}

async function checkout() {
  loadingAction.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    await api.post('/cart/checkout')
    successMsg.value = 'Checkout berhasil!'
    fetchCart()
  } catch {
    errorMsg.value = 'Checkout gagal. Coba lagi nanti.'
  } finally {
    loadingAction.value = false
    setTimeout(() => (successMsg.value = ''), 3000)
  }
}

onMounted(fetchCart)
</script>
