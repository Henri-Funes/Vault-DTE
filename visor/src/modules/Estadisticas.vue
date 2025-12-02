<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📊 Estadísticas</h2>
      <button
        @click="loadStats"
        class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
      >
        🔄 Actualizar
      </button>
    </div>

    <!-- Filtro de fechas -->
    <div class="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-800">📅 Desde:</label>
          <input
            v-model="dateFrom"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-slate-800"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-800">📅 Hasta:</label>
          <input
            v-model="dateTo"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-slate-800"
          />
        </div>
        <button
          @click="applyDateFilter"
          :disabled="!dateFrom && !dateTo"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          🔍 Filtrar
        </button>
        <button
          v-if="dateFrom || dateTo"
          @click="clearDateFilter"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          ✕ Limpiar
        </button>
        <span v-if="dateFrom || dateTo" class="text-sm text-blue-600 font-medium">
          📌 Filtro activo
        </span>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-slate-600">Cargando estadísticas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">❌</div>
      <p class="text-red-700 font-semibold mb-2">Error al cargar estadísticas</p>
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <!-- Contenido -->
    <div v-else>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <!-- PDF -->
        <div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div class="text-red-600 text-3xl mb-2">📄</div>
          <div class="text-2xl font-bold text-red-700">{{ stats.pdf }}</div>
          <div class="text-sm text-red-600">Archivos PDF</div>
        </div>

        <!-- JSON -->
        <div
          class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200"
        >
          <div class="text-yellow-600 text-3xl mb-2">📋</div>
          <div class="text-2xl font-bold text-yellow-700">{{ stats.json }}</div>
          <div class="text-sm text-yellow-600">Archivos JSON</div>
        </div>

        <!-- Facturas Pareadas -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
        >
          <div class="text-green-600 text-3xl mb-2">📊</div>
          <div class="text-2xl font-bold text-green-700">{{ stats.pairedInvoices }}</div>
          <div class="text-sm text-green-600">Total Facturas</div>
        </div>

        <!-- Agregados Recientemente -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
        >
          <div class="text-purple-600 text-3xl mb-2">🆕</div>
          <div class="text-2xl font-bold text-purple-700">{{ stats.recentFiles }}</div>
          <div class="text-sm text-purple-600">Agregados Recientemente</div>
        </div>

        <!-- Total Archivos -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
        >
          <div class="text-blue-600 text-3xl mb-2">📦</div>
          <div class="text-2xl font-bold text-blue-700">{{ stats.total }}</div>
          <div class="text-sm text-blue-600">Total de Archivos</div>
        </div>
      </div>

      <!-- Paneles por Ubicación -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
        <!-- H1 - Santa Ana (SA) -->
        <div
          class="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200"
        >
          <div class="text-cyan-600 text-3xl mb-2">🏢</div>
          <div class="text-2xl font-bold text-cyan-700">{{ stats.pairedByFolder.SA }}</div>
          <div class="text-sm text-cyan-600">H1 - Santa Ana</div>
        </div>

        <!-- H2 - San Miguel (SM) -->
        <div
          class="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200"
        >
          <div class="text-teal-600 text-3xl mb-2">🏢</div>
          <div class="text-2xl font-bold text-teal-700">{{ stats.pairedByFolder.SM }}</div>
          <div class="text-sm text-teal-600">H2 - San Miguel</div>
        </div>

        <!-- H4 - San Salvador (SS) -->
        <div
          class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200"
        >
          <div class="text-emerald-600 text-3xl mb-2">🏢</div>
          <div class="text-2xl font-bold text-emerald-700">{{ stats.pairedByFolder.SS }}</div>
          <div class="text-sm text-emerald-600">H4 - San Salvador</div>
        </div>

        <!-- Gastos -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
        >
          <div class="text-orange-600 text-3xl mb-2">💰</div>
          <div class="text-2xl font-bold text-orange-700">{{ stats.pairedByFolder.gastos }}</div>
          <div class="text-sm text-orange-600">Gastos</div>
        </div>

        <!-- Remisiones -->
        <div
          class="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200"
        >
          <div class="text-pink-600 text-3xl mb-2">📋</div>
          <div class="text-2xl font-bold text-pink-700">{{ stats.pairedByFolder.remisiones }}</div>
          <div class="text-sm text-pink-600">Remisiones</div>
        </div>

        <!-- Notas de Crédito -->
        <div
          class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200"
        >
          <div class="text-indigo-600 text-3xl mb-2">📝</div>
          <div class="text-2xl font-bold text-indigo-700">
            {{ stats.pairedByFolder.notas_de_credito }}
          </div>
          <div class="text-sm text-indigo-600">Notas de Crédito</div>
        </div>
      </div>

      <!-- Gráfico simple de barras -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="text-lg font-semibold text-slate-700 mb-4">Distribución por Tipo</h3>
        <div class="space-y-3">
          <div v-for="(value, key) in chartData" :key="key">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-slate-600">{{ key.toUpperCase() }}</span>
              <span class="text-sm text-slate-500">{{ value }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                :class="getBarColor(key)"
                class="h-2 rounded-full transition-all duration-500"
                :style="{ width: value + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBackupStats } from '@/services/api'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const error = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')

// Datos de estadísticas
const stats = ref({
  pdf: 0,
  json: 0,
  xml: 0,
  images: 0,
  other: 0,
  total: 0,
  totalSize: '0 B',
  recentFiles: 0,
  pairedInvoices: 0,
  pairedByFolder: {
    SA: 0,
    SM: 0,
    SS: 0,
    gastos: 0,
    remisiones: 0,
    notas_de_credito: 0,
  },
})

// Cargar estadísticas del backend
async function loadStats() {
  loading.value = true
  error.value = null

  try {
    const data = await getBackupStats(dateFrom.value || undefined, dateTo.value || undefined)
    stats.value = {
      pdf: data.pdf,
      json: data.json,
      xml: data.xml,
      images: data.images,
      other: data.other,
      total: data.total,
      totalSize: data.totalSizeFormatted,
      recentFiles: data.recentFiles,
      pairedInvoices: data.pairedInvoices,
      pairedByFolder: data.pairedByFolder,
    }
  } catch (err) {
    console.error('Error loading stats:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Aplicar filtro de fechas
function applyDateFilter() {
  loadStats()
}

// Limpiar filtro de fechas
function clearDateFilter() {
  dateFrom.value = ''
  dateTo.value = ''
  loadStats()
}

const chartData = computed(() => {
  const total = stats.value.pdf + stats.value.json
  if (total === 0) return { pdf: 0, json: 0, facturas: 0, recientes: 0 }

  return {
    pdf: Math.round((stats.value.pdf / total) * 100),
    json: Math.round((stats.value.json / total) * 100),
    facturas:
      stats.value.pairedInvoices > 0
        ? Math.round((stats.value.pairedInvoices / stats.value.total) * 100)
        : 0,
    recientes:
      stats.value.recentFiles > 0
        ? Math.round((stats.value.recentFiles / stats.value.total) * 100)
        : 0,
  }
})

const getBarColor = (type: string) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500',
    json: 'bg-yellow-500',
    facturas: 'bg-green-500',
    recientes: 'bg-purple-500',
  }
  return colors[type] || 'bg-blue-500'
}

// Cargar datos al montar
onMounted(() => {
  loadStats()
})
</script>
