<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📊 Estadísticas</h2>
      <button
        class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
      >
        Actualizar
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <!-- XML -->
      <div
        class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
      >
        <div class="text-green-600 text-3xl mb-2">📝</div>
        <div class="text-2xl font-bold text-green-700">{{ stats.xml }}</div>
        <div class="text-sm text-green-600">Archivos XML</div>
      </div>

      <!-- Imágenes -->
      <div
        class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
      >
        <div class="text-purple-600 text-3xl mb-2">🖼️</div>
        <div class="text-2xl font-bold text-purple-700">{{ stats.images }}</div>
        <div class="text-sm text-purple-600">Imágenes</div>
      </div>

      <!-- Total -->
      <div
        class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 col-span-2"
      >
        <div class="text-blue-600 text-3xl mb-2">📦</div>
        <div class="text-2xl font-bold text-blue-700">{{ stats.total }}</div>
        <div class="text-sm text-blue-600">Total de Archivos</div>
      </div>

      <!-- Tamaño Total -->
      <div
        class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200 col-span-2"
      >
        <div class="text-indigo-600 text-3xl mb-2">💾</div>
        <div class="text-2xl font-bold text-indigo-700">{{ stats.totalSize }}</div>
        <div class="text-sm text-indigo-600">Tamaño Total</div>
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Datos de ejemplo - esto se reemplazará con datos reales del backend
const stats = ref({
  pdf: 1234,
  json: 567,
  xml: 890,
  images: 432,
  total: 3123,
  totalSize: '2.4 GB',
})

const chartData = computed(() => {
  const total = stats.value.pdf + stats.value.json + stats.value.xml + stats.value.images
  return {
    pdf: Math.round((stats.value.pdf / total) * 100),
    json: Math.round((stats.value.json / total) * 100),
    xml: Math.round((stats.value.xml / total) * 100),
    images: Math.round((stats.value.images / total) * 100),
  }
})

const getBarColor = (type: string) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500',
    json: 'bg-yellow-500',
    xml: 'bg-green-500',
    images: 'bg-purple-500',
  }
  return colors[type] || 'bg-blue-500'
}
</script>
