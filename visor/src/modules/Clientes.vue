<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <!-- Vista de lista de clientes -->
    <div v-if="!selectedCliente">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">👥 Clientes</h2>
          <p class="text-sm text-slate-600 mt-1">Total: {{ clientesActuales.length }} clientes</p>
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

      <!-- Selector de tipo (Anuladas / Notas de Crédito) -->
      <div class="mb-6 flex gap-2">
        <button
          @click="tipoDocumento = 'anuladas'"
          :class="[
            'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
            tipoDocumento === 'anuladas'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          ]"
        >
          ❌ Anuladas
        </button>
        <button
          @click="tipoDocumento = 'notas_de_credito'"
          :class="[
            'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
            tipoDocumento === 'notas_de_credito'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          ]"
        >
          📝 Notas de Crédito
        </button>
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
            @click="selectCliente(cliente)"
            class="px-6 py-4 hover:bg-blue-50 transition-colors cursor-pointer"
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
                  :class="getCount(cliente) > 0 ? 'text-red-600' : 'text-green-600'"
                  class="font-bold text-lg"
                >
                  {{ getCount(cliente) }}
                </span>
                <span
                  v-if="getCount(cliente) > 0"
                  :class="
                    tipoDocumento === 'anuladas'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  "
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {{ tipoDocumento === 'anuladas' ? '❌ Anuladas' : '📝 Notas de Crédito' }}
                </span>
                <span
                  v-else
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                >
                  ✓ Sin {{ tipoDocumento === 'anuladas' ? 'anuladas' : 'notas de crédito' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div
        v-if="!loading && !error && totalPages > 1"
        class="flex items-center justify-between mt-6"
      >
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

    <!-- Vista de facturas anuladas del cliente -->
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <div>
          <button
            @click="backToClientes"
            class="mb-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Volver a clientes
          </button>
          <h2 class="text-2xl font-bold text-slate-800">{{ selectedCliente.nombre }}</h2>
          <p class="text-sm text-slate-600 mt-1">
            {{
              tipoDocumento === 'anuladas'
                ? `Facturas anuladas: ${facturasAnuladas.length}`
                : `Notas de crédito: ${facturasAnuladas.length}`
            }}
          </p>
        </div>
      </div>

      <!-- Estado de carga de facturas -->
      <div v-if="loadingFacturas" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-slate-600">Cargando facturas...</p>
      </div>

      <!-- Sin facturas -->
      <div
        v-else-if="facturasAnuladas.length === 0"
        class="text-center py-12 text-slate-500 border border-gray-200 rounded-lg"
      >
        <div class="text-4xl mb-2">📭</div>
        <p>
          Este cliente no tiene
          {{ tipoDocumento === 'anuladas' ? 'facturas anuladas' : 'notas de crédito' }}
        </p>
      </div>

      <!-- Lista de facturas -->
      <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          <div
            v-for="factura in facturasAnuladas"
            :key="factura.path"
            @click="openFile(factura)"
            class="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1">
                <div class="text-2xl">{{ getFileIcon(factura.type) }}</div>
                <div class="flex-1">
                  <h3 class="text-sm font-semibold text-slate-800">{{ factura.name }}</h3>
                  <div class="flex gap-4 text-xs text-slate-600 mt-1">
                    <span v-if="factura.emissionDate">📅 {{ factura.emissionDate }}</span>
                    <span>📦 {{ factura.sizeFormatted }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="getTypeBadgeClass(factura.type)"
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                >
                  {{ factura.extension }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const searchQuery = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 70
const selectedCliente = ref<ClienteConDocumentos | null>(null)
const loadingFacturas = ref(false)
const facturasAnuladas = ref<any[]>([])
const tipoDocumento = ref<'anuladas' | 'notas_de_credito'>('anuladas')

interface ClienteConDocumentos {
  nombre: string
  anuladas: number
  notas_de_credito: number
}

const clientesConAnuladas = ref<ClienteConDocumentos[]>([])
const clientesConNotasCredito = ref<ClienteConDocumentos[]>([])

// Clientes actuales según el tipo de documento seleccionado
const clientesActuales = computed(() => {
  return tipoDocumento.value === 'anuladas'
    ? clientesConAnuladas.value
    : clientesConNotasCredito.value
})

// Obtener el conteo según el tipo de documento
const getCount = (cliente: ClienteConDocumentos) => {
  return tipoDocumento.value === 'anuladas' ? cliente.anuladas : cliente.notas_de_credito
}

// Clientes filtrados por búsqueda
const clientesFiltrados = computed(() => {
  if (!searchQuery.value) {
    return clientesActuales.value
  }
  return clientesActuales.value.filter((cliente) =>
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

// Seleccionar cliente y cargar sus facturas
async function selectCliente(cliente: ClienteConDocumentos) {
  selectedCliente.value = cliente
  loadingFacturas.value = true
  facturasAnuladas.value = []

  try {
    const endpoint =
      tipoDocumento.value === 'anuladas'
        ? `/api/clientes/${encodeURIComponent(cliente.nombre)}/anuladas`
        : `/api/clientes/${encodeURIComponent(cliente.nombre)}/notas-credito`

    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error('Error al cargar las facturas')
    }

    const data = await response.json()
    if (data.success) {
      facturasAnuladas.value = data.data.facturas
    } else {
      throw new Error(data.error || 'Error desconocido')
    }
  } catch (err) {
    console.error('Error loading facturas:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loadingFacturas.value = false
  }
}

// Volver a la lista de clientes
function backToClientes() {
  selectedCliente.value = null
  facturasAnuladas.value = []
}

// Abrir archivo
async function openFile(file: any) {
  try {
    const response = await fetch(`/api/file/open?path=${encodeURIComponent(file.path)}`)
    const result = await response.json()

    if (!result.success) {
      console.error('Error al abrir archivo:', result.error)
      alert('Error al abrir el archivo: ' + result.error)
    }
  } catch (error) {
    console.error('Error opening file:', error)
    alert('Error al abrir el archivo')
  }
}

// Obtener icono del archivo
const getFileIcon = (type: string) => {
  const icons: Record<string, string> = {
    pdf: '📄',
    json: '📋',
    xml: '📝',
    image: '🖼️',
    text: '📝',
    document: '📃',
    spreadsheet: '📊',
    other: '📄',
  }
  return icons[type] || '📄'
}

// Obtener clase de badge según tipo
const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    pdf: 'bg-red-100 text-red-700',
    json: 'bg-yellow-100 text-yellow-700',
    xml: 'bg-green-100 text-green-700',
    image: 'bg-purple-100 text-purple-700',
    text: 'bg-blue-100 text-blue-700',
    document: 'bg-indigo-100 text-indigo-700',
    spreadsheet: 'bg-emerald-100 text-emerald-700',
    other: 'bg-gray-100 text-gray-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
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

// Cargar notas de crédito
async function loadNotasCredito() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/clientes/notas-credito')
    if (!response.ok) {
      throw new Error('Error al cargar las notas de crédito')
    }

    const data = await response.json()
    if (data.success) {
      clientesConNotasCredito.value = data.data
    } else {
      throw new Error(data.error || 'Error desconocido')
    }
  } catch (err) {
    console.error('Error loading notas de credito:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Observar cambios en el tipo de documento
watch(tipoDocumento, (newTipo) => {
  currentPage.value = 1
  selectedCliente.value = null
  facturasAnuladas.value = []

  if (newTipo === 'notas_de_credito' && clientesConNotasCredito.value.length === 0) {
    loadNotasCredito()
  }
})

onMounted(() => {
  loadClientes()
})
</script>
