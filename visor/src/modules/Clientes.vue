<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">👥 Clientes</h2>
        <p class="text-sm text-slate-600 mt-1">Total: {{ clientesConAnuladas.length }} clientes</p>
      </div>
      <button
        @click="loadClientes"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        🔄 Recargar
      </button>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        @input="onSearchChange"
        type="text"
        placeholder="Buscar cliente..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
      />
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-slate-600">Cargando clientes...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">❌</div>
      <p class="text-red-700 font-semibold mb-2">Error al cargar clientes</p>
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <!-- Lista de clientes -->
    <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- Sin clientes -->
      <div v-if="clientesFiltrados.length === 0" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-2">🔍</div>
        <p>No se encontraron clientes</p>
      </div>

      <!-- Clientes -->
      <div v-else class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        <div
          v-for="(cliente, index) in clientesPaginados"
          :key="index"
          class="px-6 py-4 hover:bg-blue-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <div
                class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold"
              >
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-800">{{ cliente.nombre }}</h3>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="cliente.anuladas > 0 ? 'text-red-600' : 'text-green-600'"
                class="font-bold text-lg"
              >
                {{ cliente.anuladas }}
              </span>
              <span
                v-if="cliente.anuladas > 0"
                class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
              >
                ❌ Anuladas
              </span>
              <span
                v-else
                class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
              >
                ✓ Sin anuladas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="!loading && !error && totalPages > 1" class="flex items-center justify-between mt-6">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Anterior
      </button>

      <span class="text-slate-700 font-semibold">
        Página {{ currentPage }} de {{ totalPages }}
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const searchQuery = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 70

interface ClienteConAnuladas {
  nombre: string
  anuladas: number
}

const clientesConAnuladas = ref<ClienteConAnuladas[]>([])

// Clientes filtrados por búsqueda
const clientesFiltrados = computed(() => {
  if (!searchQuery.value) {
    return clientesConAnuladas.value
  }
  return clientesConAnuladas.value.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Clientes paginados
const clientesPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return clientesFiltrados.value.slice(start, end)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(clientesFiltrados.value.length / itemsPerPage)
})

// Funciones de navegación
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset página cuando cambia búsqueda
function onSearchChange() {
  currentPage.value = 1
}

// Cargar clientes
async function loadClientes() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/clientes')
    if (!response.ok) {
      throw new Error('Error al cargar los clientes')
    }

    const data = await response.json()
    if (data.success) {
      clientesConAnuladas.value = data.data
    } else {
      throw new Error(data.error || 'Error desconocido')
    }
  } catch (err) {
    console.error('Error loading clientes:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClientes()
})
</script>
