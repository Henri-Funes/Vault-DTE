<template>
  <div class="relative min-h-screen z-10">
    <!-- Fondo de burbujas suaves -->
    <div class="bubbles-background"></div>

    <div class="relative z-20 space-y-6 p-6">
      <!-- Header con acción -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 :size="32" class="text-navy" />
            Estadísticas
          </h2>
          <p v-if="lastUpdate" class="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Clock :size="14" />
            Última actualización: {{ lastUpdate }}
          </p>
        </div>
        <button
          @click="loadStats(true)"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-light text-navy rounded-lg hover:bg-navy-hover transition-all font-medium border border-navy-border"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
          Actualizar
        </button>
      </div>

      <!-- Estado de carga -->
      <div
        v-if="loading && !statsLoaded"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm"
      >
        <Loader2 :size="48" class="text-navy animate-spin mb-4" />
        <p class="text-slate-600 font-medium">Cargando estadísticas...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4 shadow-sm"
      >
        <AlertCircle :size="24" class="text-red-600 flex-shrink-0 mt-1" />
        <div>
          <p class="text-red-900 font-semibold text-lg mb-1">Error al cargar estadísticas</p>
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div v-else-if="statsLoaded" class="space-y-6">
        <!-- Métricas Principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Facturas -->
          <Card class="border-l-4 border-l-navy hover:shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <FileText :size="16" />
                    Total Facturas
                  </p>
                  <p class="text-3xl font-bold text-slate-900">
                    {{ stats.pairedInvoices.toLocaleString() }}
                  </p>
                  <div class="flex items-center gap-2 text-xs">
                    <div class="flex items-center gap-1 text-green-600">
                      <TrendingUp :size="14" />
                      <span class="font-medium">{{ recentPercentage }}%</span>
                    </div>
                    <span class="text-slate-500">recientes</span>
                  </div>
                </div>
                <div
                  class="h-12 w-12 rounded-lg bg-navy-light flex items-center justify-center flex-shrink-0"
                >
                  <FileText :size="24" class="text-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Archivos PDF -->
          <Card class="border-l-4 border-l-red-500 hover:shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <FileType :size="16" />
                    Archivos PDF
                  </p>
                  <p class="text-3xl font-bold text-slate-900">{{ stats.pdf.toLocaleString() }}</p>
                  <div class="flex items-center gap-2 text-xs">
                    <div
                      class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium"
                    >
                      {{ pdfPercentage }}%
                    </div>
                    <span class="text-slate-500">del total</span>
                  </div>
                </div>
                <div
                  class="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"
                >
                  <FileType :size="24" class="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Archivos JSON -->
          <Card class="border-l-4 border-l-yellow-500 hover:shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Code :size="16" />
                    Archivos JSON
                  </p>
                  <p class="text-3xl font-bold text-slate-900">{{ stats.json.toLocaleString() }}</p>
                  <div class="flex items-center gap-2 text-xs">
                    <div
                      class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium"
                    >
                      {{ jsonPercentage }}%
                    </div>
                    <span class="text-slate-500">del total</span>
                  </div>
                </div>
                <div
                  class="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0"
                >
                  <Code :size="24" class="text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Facturas Anuladas -->
          <Card class="border-l-4 border-l-red-600 hover:shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <XCircle :size="16" />
                    Facturas Anuladas
                  </p>
                  <p class="text-3xl font-bold text-slate-900">{{ stats.anuladas.toLocaleString() }}</p>
                  <div class="flex items-center gap-2 text-xs">
                    <div
                      class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium"
                    >
                      {{ anuladasPercentage }}%
                    </div>
                    <span class="text-slate-500">del total</span>
                  </div>
                </div>
                <div
                  class="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"
                >
                  <XCircle :size="24" class="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Distribución por Sucursal (3 cards grandes) -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Building2 :size="24" />
              Distribución por Sucursal
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- H1 - Santa Ana -->
              <Card class="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow">
                <CardContent class="p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <Store :size="24" class="text-cyan-600" />
                    <div>
                      <h3 class="font-bold text-lg text-slate-900">H1 - Santa Ana</h3>
                      <p class="text-sm text-slate-500">Total: {{ stats.detallePorSucursal['H1 - Santa Ana'].total }}</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <!-- Facturas -->
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <FileText :size="16" class="text-navy" />
                        <span class="text-sm font-medium text-slate-700">Facturas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H1 - Santa Ana'].facturas }}</span>
                    </div>

                    <!-- Gastos -->
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <DollarSign :size="16" class="text-orange-600" />
                        <span class="text-sm font-medium text-slate-700">Gastos</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H1 - Santa Ana'].gastos }}</span>
                    </div>

                    <!-- Remisiones -->
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <Truck :size="16" class="text-pink-600" />
                        <span class="text-sm font-medium text-slate-700">Remisiones</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H1 - Santa Ana'].remisiones }}</span>
                    </div>

                    <!-- Notas de Crédito -->
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <CreditCard :size="16" class="text-indigo-600" />
                        <span class="text-sm font-medium text-slate-700">Notas Crédito</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H1 - Santa Ana'].notas_credito }}</span>
                    </div>

                    <!-- Anuladas -->
                    <div class="flex items-center justify-between py-2">
                      <div class="flex items-center gap-2">
                        <XCircle :size="16" class="text-red-600" />
                        <span class="text-sm font-medium text-slate-700">Anuladas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H1 - Santa Ana'].anuladas }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- H2 - San Miguel -->
              <Card class="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
                <CardContent class="p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <Store :size="24" class="text-teal-600" />
                    <div>
                      <h3 class="font-bold text-lg text-slate-900">H2 - San Miguel</h3>
                      <p class="text-sm text-slate-500">Total: {{ stats.detallePorSucursal['H2 - San Miguel'].total }}</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <FileText :size="16" class="text-navy" />
                        <span class="text-sm font-medium text-slate-700">Facturas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H2 - San Miguel'].facturas }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <DollarSign :size="16" class="text-orange-600" />
                        <span class="text-sm font-medium text-slate-700">Gastos</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H2 - San Miguel'].gastos }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <Truck :size="16" class="text-pink-600" />
                        <span class="text-sm font-medium text-slate-700">Remisiones</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H2 - San Miguel'].remisiones }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <CreditCard :size="16" class="text-indigo-600" />
                        <span class="text-sm font-medium text-slate-700">Notas Crédito</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H2 - San Miguel'].notas_credito }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                      <div class="flex items-center gap-2">
                        <XCircle :size="16" class="text-red-600" />
                        <span class="text-sm font-medium text-slate-700">Anuladas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H2 - San Miguel'].anuladas }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- H4 - San Salvador -->
              <Card class="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <CardContent class="p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <Store :size="24" class="text-emerald-600" />
                    <div>
                      <h3 class="font-bold text-lg text-slate-900">H4 - San Salvador</h3>
                      <p class="text-sm text-slate-500">Total: {{ stats.detallePorSucursal['H4 - San Salvador'].total }}</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <FileText :size="16" class="text-navy" />
                        <span class="text-sm font-medium text-slate-700">Facturas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H4 - San Salvador'].facturas }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <DollarSign :size="16" class="text-orange-600" />
                        <span class="text-sm font-medium text-slate-700">Gastos</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H4 - San Salvador'].gastos }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <Truck :size="16" class="text-pink-600" />
                        <span class="text-sm font-medium text-slate-700">Remisiones</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H4 - San Salvador'].remisiones }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-slate-100">
                      <div class="flex items-center gap-2">
                        <CreditCard :size="16" class="text-indigo-600" />
                        <span class="text-sm font-medium text-slate-700">Notas Crédito</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H4 - San Salvador'].notas_credito }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                      <div class="flex items-center gap-2">
                        <XCircle :size="16" class="text-red-600" />
                        <span class="text-sm font-medium text-slate-700">Anuladas</span>
                      </div>
                      <span class="text-lg font-bold text-slate-900">{{ stats.detallePorSucursal['H4 - San Salvador'].anuladas }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <!-- NUEVO: Gráficos de Ventas y Anuladas -->
        <Card>
          <CardHeader class="pb-3 flex items-center justify-between">
            <CardTitle class="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp :size="24" />
              Análisis por Sucursal
            </CardTitle>
            <div class="flex gap-2">
              <button
                v-for="mes in [1, 6, 12]"
                :key="mes"
                @click="cambiarPeriodo(mes)"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  periodoSeleccionado === mes
                    ? 'bg-navy text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                {{ mes === 1 ? '1 mes' : mes + ' meses' }}
              </button>
            </div>
          </CardHeader>
          <CardContent class="p-6">
            <div v-show="loadingVentas" class="flex justify-center py-8">
              <Loader2 :size="32" class="text-navy animate-spin" />
            </div>
            <div v-show="!loadingVentas" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Gráfico de Ventas -->
              <div class="bg-slate-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp :size="20" class="text-green-600" />
                  Ventas por Sucursal (Últimos {{ periodoSeleccionado }} meses)
                </h3>
                <div class="h-64">
                  <Bar :key="`ventas-${periodoSeleccionado}`" :data="ventasChartData" :options="chartOptions" />
                </div>
                <div class="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-cyan-600">H1</p>
                    <p class="text-slate-600">${{ ventasData?.ventasPorSucursal['H1 - Santa Ana']?.totalVentas.toLocaleString() || 0 }}</p>
                  </div>
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-teal-600">H2</p>
                    <p class="text-slate-600">${{ ventasData?.ventasPorSucursal['H2 - San Miguel']?.totalVentas.toLocaleString() || 0 }}</p>
                  </div>
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-emerald-600">H4</p>
                    <p class="text-slate-600">${{ ventasData?.ventasPorSucursal['H4 - San Salvador']?.totalVentas.toLocaleString() || 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Gráfico de Anuladas -->
              <div class="bg-slate-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <XCircle :size="20" class="text-red-600" />
                  Anuladas y Devoluciones (Últimos {{ periodoSeleccionado }} meses)
                </h3>
                <div class="h-64">
                  <Bar :key="`anuladas-${periodoSeleccionado}`" :data="anuladasChartData" :options="chartOptions" />
                </div>
                <div class="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-cyan-600">H1</p>
                    <p class="text-slate-600">{{ ventasData?.ventasPorSucursal['H1 - Santa Ana']?.anuladas || 0 }} anuladas</p>
                    <p class="text-red-600 text-xs">${{ ventasData?.ventasPorSucursal['H1 - Santa Ana']?.devuelto.toLocaleString() || 0 }}</p>
                  </div>
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-teal-600">H2</p>
                    <p class="text-slate-600">{{ ventasData?.ventasPorSucursal['H2 - San Miguel']?.anuladas || 0 }} anuladas</p>
                    <p class="text-red-600 text-xs">${{ ventasData?.ventasPorSucursal['H2 - San Miguel']?.devuelto.toLocaleString() || 0 }}</p>
                  </div>
                  <div class="bg-white rounded p-2">
                    <p class="font-bold text-emerald-600">H4</p>
                    <p class="text-slate-600">{{ ventasData?.ventasPorSucursal['H4 - San Salvador']?.anuladas || 0 }} anuladas</p>
                    <p class="text-red-600 text-xs">${{ ventasData?.ventasPorSucursal['H4 - San Salvador']?.devuelto.toLocaleString() || 0 }}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBackupStats, getVentasPorSucursal } from '@/services/api'
import { computed, onMounted, ref, nextTick } from 'vue'
import {
  BarChart3,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  TrendingUp,
  FileType,
  Code,
  XCircle,
  Building2,
  Store,
  DollarSign,
  Truck,
  CreditCard,
} from 'lucide-vue-next'

import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardTitle from '@/components/ui/CardTitle.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const loading = ref(false)
const loadingVentas = ref(false)
const error = ref<string | null>(null)
const statsLoaded = ref(false)
const lastUpdate = ref<string>('')
const periodoSeleccionado = ref(12)
const ventasData = ref<any>(null)

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
  anuladas: 0,
  pairedByFolder: {
    SA: 0,
    SM: 0,
    SS: 0,
    gastos: 0,
    remisiones: 0,
    notas_de_credito: 0,
  },
  detallePorSucursal: {
    'H1 - Santa Ana': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
    'H2 - San Miguel': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
    'H4 - San Salvador': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 }
  }
})

async function loadStats(forceRefresh = false) {
  loading.value = true
  error.value = null

  try {
    const shouldForce = forceRefresh || !statsLoaded.value
    const data = await getBackupStats(undefined, undefined, shouldForce)
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
      anuladas: data.anuladas || 0,
      pairedByFolder: data.pairedByFolder,
      detallePorSucursal: data.detallePorSucursal || {
        'H1 - Santa Ana': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
        'H2 - San Miguel': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
        'H4 - San Salvador': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 }
      }
    }
    statsLoaded.value = true

    const now = new Date()
    lastUpdate.value = now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch (err) {
    console.error('Error loading stats:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

async function loadVentas() {
  loadingVentas.value = true
  try {
    const data = await getVentasPorSucursal(periodoSeleccionado.value)
    ventasData.value = data
  } catch (err) {
    console.error('Error loading ventas:', err)
  } finally {
    loadingVentas.value = false
  }
}

async function cambiarPeriodo(meses: number) {
  // Evitar cambios si ya está seleccionado
  if (periodoSeleccionado.value === meses) return

  // Guardar posición actual del scroll
  const scrollPosition = window.scrollY

  periodoSeleccionado.value = meses

  // Cargar datos sin bloquear UI
  await loadVentas()

  // Restaurar scroll después de que Vue termine de renderizar
  await nextTick()
  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollPosition,
      left: 0,
      behavior: 'auto' // 'auto' funciona mejor en Firefox
    })
  })
}

onMounted(() => {
  loadStats(true)
  loadVentas()
})

// Computed percentages
const recentPercentage = computed(() => {
  if (stats.value.pairedInvoices === 0) return 0
  return Math.round((stats.value.recentFiles / stats.value.pairedInvoices) * 100)
})

const pdfPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.pdf / stats.value.total) * 100)
})

const jsonPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.json / stats.value.total) * 100)
})

const anuladasPercentage = computed(() => {
  if (stats.value.pairedInvoices === 0) return 0
  return Math.round((stats.value.anuladas / stats.value.pairedInvoices) * 100)
})

// Chart data para ventas
const ventasChartData = computed(() => ({
  labels: ['H1 - Santa Ana', 'H2 - San Miguel', 'H4 - San Salvador'],
  datasets: [
    {
      label: 'Ventas ($)',
      data: [
        ventasData.value?.ventasPorSucursal['H1 - Santa Ana']?.totalVentas || 0,
        ventasData.value?.ventasPorSucursal['H2 - San Miguel']?.totalVentas || 0,
        ventasData.value?.ventasPorSucursal['H4 - San Salvador']?.totalVentas || 0,
      ],
      backgroundColor: ['#06b6d4', '#14b8a6', '#10b981'],
      borderColor: ['#0891b2', '#0d9488', '#059669'],
      borderWidth: 2,
    }
  ]
}))

// Chart data para anuladas
const anuladasChartData = computed(() => ({
  labels: ['H1 - Santa Ana', 'H2 - San Miguel', 'H4 - San Salvador'],
  datasets: [
    {
      label: 'Facturas Anuladas',
      data: [
        ventasData.value?.ventasPorSucursal['H1 - Santa Ana']?.anuladas || 0,
        ventasData.value?.ventasPorSucursal['H2 - San Miguel']?.anuladas || 0,
        ventasData.value?.ventasPorSucursal['H4 - San Salvador']?.anuladas || 0,
      ],
      backgroundColor: ['#ef4444', '#dc2626', '#b91c1c'],
      borderColor: ['#dc2626', '#b91c1c', '#991b1b'],
      borderWidth: 2,
    },
    {
      label: 'Monto Devuelto ($)',
      data: [
        ventasData.value?.ventasPorSucursal['H1 - Santa Ana']?.devuelto || 0,
        ventasData.value?.ventasPorSucursal['H2 - San Miguel']?.devuelto || 0,
        ventasData.value?.ventasPorSucursal['H4 - San Salvador']?.devuelto || 0,
      ],
      backgroundColor: ['#fca5a5', '#f87171', '#ef4444'],
      borderColor: ['#f87171', '#ef4444', '#dc2626'],
      borderWidth: 2,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
/* Colores navy personalizados */
.text-navy {
  color: #1e3a8a;
}

.bg-navy {
  background-color: #1e3a8a;
}

.bg-navy-light {
  background-color: #dbeafe;
}

.bg-navy-hover {
  background-color: #bfdbfe;
}

.border-navy {
  border-color: #1e3a8a;
}

.border-navy-border {
  border-color: #93c5fd;
}

/* Fondo de burbujas suaves */
.bubbles-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  pointer-events: none; /* No bloquea clicks */
}

.bubbles-background::before,
.bubbles-background::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.bubbles-background::before {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #1e3a8a 0%, transparent 70%);
  top: -300px;
  right: -200px;
  animation: float 20s ease-in-out infinite;
}

.bubbles-background::after {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

/* Añadir más burbujas pequeñas */
.bubbles-background {
  background-image:
    radial-gradient(circle at 20% 30%, rgba(30, 58, 138, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
}
</style>
