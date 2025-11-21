<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📂 Explorador de Facturas</h2>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar factura..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔍
        </button>
      </div>
    </div>

    <!-- Breadcrumb de navegación -->
    <div class="flex items-center gap-2 mb-4 text-sm text-slate-600">
      <span class="cursor-pointer hover:text-blue-600">🏠 Inicio</span>
      <span>/</span>
      <span class="cursor-pointer hover:text-blue-600">Backups</span>
      <span>/</span>
      <span class="text-slate-800 font-medium">Facturas 2025</span>
    </div>

    <!-- Lista de archivos -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- Header -->
      <div
        class="bg-slate-100 border-b border-gray-200 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-semibold text-slate-700"
      >
        <div class="col-span-1">
          <input type="checkbox" class="w-4 h-4" />
        </div>
        <div class="col-span-5">Nombre</div>
        <div class="col-span-2">Tipo</div>
        <div class="col-span-2">Tamaño</div>
        <div class="col-span-2">Fecha</div>
      </div>

      <!-- Archivos -->
      <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          @dblclick="openFile(file)"
          class="px-4 py-3 grid grid-cols-12 gap-4 hover:bg-blue-50 cursor-pointer transition-colors items-center"
        >
          <div class="col-span-1">
            <input type="checkbox" class="w-4 h-4" />
          </div>
          <div class="col-span-5 flex items-center gap-2">
            <span class="text-2xl">{{ getFileIcon(file.type) }}</span>
            <span class="text-slate-700 font-medium truncate">{{ file.name }}</span>
          </div>
          <div class="col-span-2">
            <span
              :class="getTypeBadgeClass(file.type)"
              class="px-2 py-1 rounded text-xs font-semibold"
            >
              {{ file.type.toUpperCase() }}
            </span>
          </div>
          <div class="col-span-2 text-slate-600 text-sm">{{ file.size }}</div>
          <div class="col-span-2 text-slate-600 text-sm">{{ file.date }}</div>
        </div>
      </div>
    </div>

    <!-- Información -->
    <div class="mt-4 text-sm text-slate-600">
      Mostrando {{ filteredFiles.length }} archivos - Doble click para abrir
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface File {
  id: number
  name: string
  type: string
  size: string
  date: string
}

const searchQuery = ref('')

// Datos de ejemplo - esto se reemplazará con datos reales del backend
const files = ref<File[]>([
  { id: 1, name: 'Factura_001_2025.pdf', type: 'pdf', size: '245 KB', date: '2025-01-15' },
  { id: 2, name: 'Factura_002_2025.pdf', type: 'pdf', size: '189 KB', date: '2025-01-16' },
  { id: 3, name: 'metadata_001.json', type: 'json', size: '12 KB', date: '2025-01-15' },
  { id: 4, name: 'Factura_003_2025.pdf', type: 'pdf', size: '302 KB', date: '2025-01-17' },
  { id: 5, name: 'reporte_2025.xml', type: 'xml', size: '45 KB', date: '2025-01-18' },
  { id: 6, name: 'Factura_004_2025.pdf', type: 'pdf', size: '178 KB', date: '2025-01-19' },
  { id: 7, name: 'logo_empresa.png', type: 'image', size: '89 KB', date: '2025-01-10' },
  { id: 8, name: 'Factura_005_2025.pdf', type: 'pdf', size: '256 KB', date: '2025-01-20' },
])

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  return files.value.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const getFileIcon = (type: string) => {
  const icons: Record<string, string> = {
    pdf: '📄',
    json: '📋',
    xml: '📝',
    image: '🖼️',
  }
  return icons[type] || '📄'
}

const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    pdf: 'bg-red-100 text-red-700',
    json: 'bg-yellow-100 text-yellow-700',
    xml: 'bg-green-100 text-green-700',
    image: 'bg-purple-100 text-purple-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

const openFile = (file: File) => {
  // Aquí implementarás la lógica para abrir el archivo
  console.log('Abriendo archivo:', file.name)
  alert(`Abriendo: ${file.name}`)
}
</script>
