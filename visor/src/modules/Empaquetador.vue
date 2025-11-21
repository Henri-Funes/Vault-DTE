<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📦 Empaquetador de Archivos</h2>
      <div class="flex gap-2">
        <select
          v-model="format"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="zip">ZIP</option>
          <option value="rar">RAR</option>
        </select>
      </div>
    </div>

    <!-- Área de selección -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Archivos disponibles -->
      <div>
        <h3 class="text-lg font-semibold text-slate-700 mb-3">Archivos Disponibles</h3>
        <div class="border border-gray-200 rounded-lg p-4 bg-slate-50 max-h-80 overflow-y-auto">
          <div class="space-y-2">
            <div
              v-for="file in availableFiles"
              :key="file.id"
              @click="addToPackage(file)"
              class="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ getFileIcon(file.type) }}</span>
                  <div>
                    <div class="text-sm font-medium text-slate-700">{{ file.name }}</div>
                    <div class="text-xs text-slate-500">{{ file.size }}</div>
                  </div>
                </div>
                <button class="text-blue-600 hover:text-blue-700 text-xl">➕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Archivos seleccionados -->
      <div>
        <h3 class="text-lg font-semibold text-slate-700 mb-3">
          Archivos Seleccionados ({{ selectedFiles.length }})
        </h3>
        <div class="border border-blue-200 rounded-lg p-4 bg-blue-50 max-h-80 overflow-y-auto">
          <div v-if="selectedFiles.length === 0" class="text-center py-8 text-slate-500">
            <div class="text-4xl mb-2">📭</div>
            <p>No hay archivos seleccionados</p>
            <p class="text-sm">Haz click en los archivos de la izquierda</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="file in selectedFiles"
              :key="file.id"
              class="p-3 bg-white rounded-lg border border-blue-300 transition-all"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ getFileIcon(file.type) }}</span>
                  <div>
                    <div class="text-sm font-medium text-slate-700">{{ file.name }}</div>
                    <div class="text-xs text-slate-500">{{ file.size }}</div>
                  </div>
                </div>
                <button
                  @click="removeFromPackage(file.id)"
                  class="text-red-600 hover:text-red-700 text-xl"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen y acciones -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="text-sm text-slate-600">
            <strong>Total archivos:</strong> {{ selectedFiles.length }}
          </div>
          <div class="text-sm text-slate-600">
            <strong>Tamaño estimado:</strong> {{ totalSize }}
          </div>
          <div class="text-sm text-slate-600">
            <strong>Formato:</strong> {{ format.toUpperCase() }}
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="clearSelection"
            :disabled="selectedFiles.length === 0"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
          <button
            @click="downloadPackage"
            :disabled="selectedFiles.length === 0"
            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>⬇️</span>
            Descargar {{ format.toUpperCase() }}
          </button>
        </div>
      </div>
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
  sizeBytes: number
}

const format = ref<'zip' | 'rar'>('zip')
const selectedFiles = ref<File[]>([])

// Datos de ejemplo - esto se reemplazará con datos reales del backend
const availableFiles = ref<File[]>([
  { id: 1, name: 'Factura_001_2025.pdf', type: 'pdf', size: '245 KB', sizeBytes: 251000 },
  { id: 2, name: 'Factura_002_2025.pdf', type: 'pdf', size: '189 KB', sizeBytes: 193000 },
  { id: 3, name: 'metadata_001.json', type: 'json', size: '12 KB', sizeBytes: 12000 },
  { id: 4, name: 'Factura_003_2025.pdf', type: 'pdf', size: '302 KB', sizeBytes: 309000 },
  { id: 5, name: 'reporte_2025.xml', type: 'xml', size: '45 KB', sizeBytes: 46000 },
  { id: 6, name: 'Factura_004_2025.pdf', type: 'pdf', size: '178 KB', sizeBytes: 182000 },
])

const totalSize = computed(() => {
  const bytes = selectedFiles.value.reduce((acc, file) => acc + file.sizeBytes, 0)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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

const addToPackage = (file: File) => {
  if (!selectedFiles.value.find((f) => f.id === file.id)) {
    selectedFiles.value.push(file)
  }
}

const removeFromPackage = (fileId: number) => {
  selectedFiles.value = selectedFiles.value.filter((f) => f.id !== fileId)
}

const clearSelection = () => {
  selectedFiles.value = []
}

const downloadPackage = () => {
  // Aquí implementarás la lógica para descargar el paquete
  console.log('Descargando paquete:', format.value, selectedFiles.value)
  alert(
    `Preparando descarga de ${selectedFiles.value.length} archivos en formato ${format.value.toUpperCase()}`,
  )
}
</script>
