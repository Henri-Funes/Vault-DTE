<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📂 Explorador de Facturas</h2>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar factura..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 text-slate-800"
        />
        <button
          @click="loadData"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Recargar
        </button>
      </div>
    </div>

    <!-- Selector de carpetas -->
    <div class="mb-6">
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="folder in folders"
          :key="folder.name"
          @click="selectedFolder = folder.name"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            selectedFolder === folder.name
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          ]"
        >
          📁 {{ folder.name }} ({{ folder.fileCount }})
        </button>
      </div>
    </div>

    <!-- Filtro de fechas -->
    <div class="mb-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
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
          📌 Filtro activo: {{ filteredFiles.length }} archivos
        </span>
      </div>
    </div>

    <!-- Breadcrumb de navegación -->
    <div class="flex items-center gap-2 mb-4 text-sm text-slate-600">
      <span class="cursor-pointer hover:text-blue-600">🏠 Backup</span>
      <span>/</span>
      <span class="text-slate-800 font-medium">{{ selectedFolder || 'Todas las carpetas' }}</span>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-slate-600">Cargando archivos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">❌</div>
      <p class="text-red-700 font-semibold mb-2">Error al cargar archivos</p>
      <p class="text-red-600 text-sm">{{ error }}</p>
      <button
        @click="loadData"
        class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Lista de archivos -->
    <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
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

      <!-- Sin archivos -->
      <div v-if="filteredFiles.length === 0" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-2">📭</div>
        <p>No se encontraron archivos</p>
        <p class="text-sm">Selecciona una carpeta o verifica el servidor</p>
      </div>

      <!-- Archivos -->
      <div v-else class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        <div
          v-for="file in filteredFiles"
          :key="file.name"
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
              {{ file.extension.toUpperCase() }}
            </span>
          </div>
          <div class="col-span-2 text-slate-600 text-sm">{{ file.sizeFormatted }}</div>
          <div class="col-span-2 text-slate-600 text-sm">{{ formatDate(file.modifiedDate) }}</div>
        </div>
      </div>
    </div>

    <!-- Información -->
    <div
      v-if="!loading && !error"
      class="mt-4 flex items-center justify-between text-sm text-slate-600"
    >
      <span>Mostrando {{ filteredFiles.length }} de {{ allFiles.length }} archivos</span>
      <span v-if="selectedFolder" class="text-blue-600">📁 {{ selectedFolder }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBackupStructure, type FileInfo, type FolderInfo } from '@/services/api'
import { computed, onMounted, ref, watch } from 'vue'

const searchQuery = ref('')
const selectedFolder = ref<string>('')
const folders = ref<FolderInfo[]>([])
const allFiles = ref<FileInfo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')

// Archivos filtrados por búsqueda, carpeta seleccionada y fechas de emisión
const filteredFiles = computed(() => {
  let files = allFiles.value

  // Filtrar por búsqueda
  if (searchQuery.value) {
    files = files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // Filtrar por rango de fechas de EMISIÓN
  if (dateFrom.value || dateTo.value) {
    const fromTime = dateFrom.value ? new Date(dateFrom.value).getTime() : 0
    const toTime = dateTo.value ? new Date(dateTo.value).setHours(23, 59, 59, 999) : Infinity

    // Crear un Set con los nombres base de los archivos JSON que cumplen el filtro
    const validJsonBaseNames = new Set<string>()

    // Primero, filtrar JSONs por fecha de emisión
    files.forEach((file) => {
      if (file.extension === '.json' && file.emissionDate) {
        const emissionTime = new Date(file.emissionDate).getTime()
        if (emissionTime >= fromTime && emissionTime <= toTime) {
          // Guardar el nombre base sin extensión
          const baseName = file.name.replace(/\.json$/i, '')
          validJsonBaseNames.add(baseName)
        }
      }
    })

    // Filtrar archivos: incluir JSONs válidos y sus PDFs parejas
    files = files.filter((file) => {
      const baseName = file.name.replace(/\.(json|pdf)$/i, '')

      // Si es JSON, verificar si está en el Set de válidos
      if (file.extension === '.json') {
        return validJsonBaseNames.has(baseName)
      }

      // Si es PDF, verificar si su JSON pareja está en el Set
      if (file.extension === '.pdf') {
        return validJsonBaseNames.has(baseName)
      }

      // Otros tipos de archivo no se filtran por fecha de emisión
      return false
    })
  }

  return files
})

// Cargar datos del backend
async function loadData() {
  loading.value = true
  error.value = null

  try {
    const structure = await getBackupStructure()
    folders.value = structure.folders

    // Por defecto, seleccionar la primera carpeta si existe
    if (structure.folders.length > 0 && !selectedFolder.value && structure.folders[0]) {
      selectedFolder.value = structure.folders[0].name
    }

    loadFolderFiles()
  } catch (err) {
    console.error('Error loading backup structure:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Cargar archivos de la carpeta seleccionada
function loadFolderFiles() {
  if (!selectedFolder.value || folders.value.length === 0) {
    allFiles.value = []
    return
  }

  const folder = folders.value.find((f) => f.name === selectedFolder.value)
  if (folder) {
    allFiles.value = folder.files
  }
}

// Observar cambios en la carpeta seleccionada
watch(selectedFolder, () => {
  loadFolderFiles()
})

// Aplicar filtro de fechas
function applyDateFilter() {
  // El filtro se aplica automáticamente a través del computed
  console.log('Filtro de fechas aplicado:', { dateFrom: dateFrom.value, dateTo: dateTo.value })
}

// Limpiar filtro de fechas
function clearDateFilter() {
  dateFrom.value = ''
  dateTo.value = ''
}

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

const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    pdf: 'bg-red-100 text-red-700',
    json: 'bg-yellow-100 text-yellow-700',
    xml: 'bg-green-100 text-green-700',
    image: 'bg-purple-100 text-purple-700',
    text: 'bg-blue-100 text-blue-700',
    document: 'bg-indigo-100 text-indigo-700',
    spreadsheet: 'bg-teal-100 text-teal-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const openFile = async (file: FileInfo) => {
  console.log('Abriendo archivo:', file)

  try {
    // Normalizar extensión: quitar punto y convertir a minúsculas
    const extension = file.extension.toLowerCase().replace(/^\./, '')

    console.log('Extension detectada:', extension)

    // Verificar si es un tipo de archivo soportado
    if (['pdf', 'json', 'xml', 'txt'].includes(extension)) {
      // Llamar al backend para obtener el archivo
      const response = await fetch('/api/backup/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.path }),
      })

      if (!response.ok) {
        throw new Error('Error al cargar el archivo')
      }

      if (extension === 'pdf') {
        // Abrir PDF en nueva pestaña
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')

        // Liberar el objeto URL después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      } else if (extension === 'json') {
        // Mostrar JSON formateado en nueva ventana
        const jsonData = await response.json()
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${file.name}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  padding: 20px;
                  background-color: #1e1e1e;
                  color: #d4d4d4;
                }
                pre {
                  background-color: #252526;
                  padding: 20px;
                  border-radius: 8px;
                  overflow-x: auto;
                  line-height: 1.5;
                }
                .json-key { color: #9cdcfe; }
                .json-string { color: #ce9178; }
                .json-number { color: #b5cea8; }
                .json-boolean { color: #569cd6; }
                .json-null { color: #569cd6; }
              </style>
            </head>
            <body>
              <h2>${file.name}</h2>
              <pre>${JSON.stringify(jsonData, null, 2)}</pre>
            </body>
            </html>
          `)
          newWindow.document.close()
        }
      } else if (extension === 'xml' || extension === 'txt') {
        // Mostrar texto/XML en nueva ventana
        const textContent = await response.text()
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${file.name}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  padding: 20px;
                  background-color: #ffffff;
                  color: #000000;
                }
                pre {
                  background-color: #f5f5f5;
                  padding: 20px;
                  border-radius: 8px;
                  overflow-x: auto;
                  line-height: 1.5;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
              </style>
            </head>
            <body>
              <h2>${file.name}</h2>
              <pre>${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
            </html>
          `)
          newWindow.document.close()
        }
      }
    } else {
      alert(
        `Tipo de archivo no soportado: .${extension}\n\nSolo se pueden abrir: PDF, JSON, XML, TXT`,
      )
    }
  } catch (error) {
    console.error('Error abriendo archivo:', error)
    alert('Error al abrir el archivo. Verifica que el archivo existe.')
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  loadData()
})
</script>
