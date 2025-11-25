<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">📦 Empaquetador de Archivos</h2>
      <div class="flex gap-2">
        <button
          @click="loadFolders"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Recargar
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-slate-600">Cargando carpetas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div class="text-4xl mb-4">❌</div>
      <p class="text-red-700 font-semibold mb-2">Error al cargar carpetas</p>
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Breadcrumb de navegación -->
      <div class="flex items-center gap-2 mb-4 text-sm text-slate-600">
        <span @click="currentFolder = null" class="cursor-pointer hover:text-blue-600 font-medium">
          🏠 Backup
        </span>
        <span v-if="currentFolder">/</span>
        <span v-if="currentFolder" class="text-slate-800 font-medium">{{
          getFolderDisplayName(currentFolder)
        }}</span>
      </div>

      <!-- Vista de carpetas principales -->
      <div v-if="!currentFolder">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">Seleccionar Carpetas para Empaquetar</h3>
          <button
            v-if="selectedFolders.length > 0"
            @click="selectAllFolders"
            class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {{
              selectedFolders.length === folders.length
                ? '❌ Deseleccionar Todo'
                : '✅ Seleccionar Todo'
            }}
          </button>
          <button
            v-else
            @click="selectAllFolders"
            class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            ✅ Seleccionar Todo
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="folder in folders"
            :key="folder.name"
            class="border-2 rounded-lg p-4 transition-all cursor-pointer"
            :class="[
              selectedFolders.includes(folder.name)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300',
            ]"
          >
            <div class="flex items-start justify-between">
              <div @click="openFolder(folder.name)" class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-3xl">📁</span>
                  <div>
                    <div class="font-semibold text-slate-800">
                      {{ getFolderDisplayName(folder.name) }}
                    </div>
                    <div class="text-xs text-slate-500">{{ folder.fileCount }} archivos</div>
                  </div>
                </div>
                <div class="text-xs text-slate-600 mt-2">{{ folder.sizeFormatted }}</div>
              </div>
              <input
                type="checkbox"
                :checked="selectedFolders.includes(folder.name)"
                @click.stop="toggleFolder(folder.name)"
                class="w-5 h-5 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        <!-- Botón de descarga de carpetas -->
        <div
          v-if="selectedFolders.length > 0"
          class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-slate-800">
                {{ selectedFolders.length }} carpeta(s) seleccionada(s)
              </div>
              <div class="text-sm text-slate-600">
                Click en "Descargar ZIP" para empaquetar las carpetas completas
              </div>
            </div>
            <button
              @click="downloadFolders"
              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>⬇️</span>
              Descargar ZIP
            </button>
          </div>
        </div>
      </div>

      <!-- Vista de archivos dentro de una carpeta -->
      <div v-else>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">
            Archivos en {{ getFolderDisplayName(currentFolder) }}
          </h3>
          <div class="flex gap-2">
            <button
              v-if="selectedFiles.length > 0"
              @click="selectAllFiles"
              class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {{
                selectedFiles.length === currentFiles.length
                  ? '❌ Deseleccionar Todo'
                  : '✅ Seleccionar Todo'
              }}
            </button>
            <button
              v-else
              @click="selectAllFiles"
              class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              ✅ Seleccionar Todo
            </button>
            <button
              @click="currentFolder = null"
              class="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              ⬅️ Volver
            </button>
          </div>
        </div>

        <!-- Buscador de archivos -->
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar archivos..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
          />
        </div>

        <!-- Lista de archivos -->
        <div class="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <div
            v-for="file in filteredFiles"
            :key="file.name"
            @click="toggleFile(file)"
            class="px-4 py-3 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100"
            :class="[selectedFiles.some((f) => f.name === file.name) ? 'bg-blue-50' : 'bg-white']"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :checked="selectedFiles.some((f) => f.name === file.name)"
                @click.stop="toggleFile(file)"
                class="w-5 h-5 text-blue-600 rounded"
              />
              <span class="text-2xl">{{ getFileIcon(file.type) }}</span>
              <div>
                <div class="text-sm font-medium text-slate-700">{{ file.name }}</div>
                <div class="text-xs text-slate-500">
                  {{ file.sizeFormatted }} • {{ file.extension.toUpperCase() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de descarga de archivos -->
        <div
          v-if="selectedFiles.length > 0"
          class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-slate-800">
                {{ selectedFiles.length }} archivo(s) seleccionado(s)
              </div>
              <div class="text-sm text-slate-600">Tamaño total: {{ getTotalSize() }}</div>
            </div>
            <div class="flex gap-2">
              <button
                @click="clearFileSelection"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
              <button
                @click="downloadFiles"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span>⬇️</span>
                Descargar ZIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBackupStructure, type FileInfo, type FolderInfo } from '@/services/api'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const error = ref<string | null>(null)
const folders = ref<FolderInfo[]>([])
const selectedFolders = ref<string[]>([])
const currentFolder = ref<string | null>(null)
const currentFiles = ref<FileInfo[]>([])
const selectedFiles = ref<FileInfo[]>([])
const searchQuery = ref('')

// Archivos filtrados por búsqueda
const filteredFiles = computed(() => {
  if (!searchQuery.value) return currentFiles.value

  return currentFiles.value.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Cargar carpetas del backend
async function loadFolders() {
  loading.value = true
  error.value = null

  try {
    const structure = await getBackupStructure()
    folders.value = structure.folders
  } catch (err) {
    console.error('Error loading folders:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Toggle selección de carpeta
function toggleFolder(folderName: string) {
  const index = selectedFolders.value.indexOf(folderName)
  if (index > -1) {
    selectedFolders.value.splice(index, 1)
  } else {
    selectedFolders.value.push(folderName)
  }
}

// Seleccionar/deseleccionar todas las carpetas
function selectAllFolders() {
  if (selectedFolders.value.length === folders.value.length) {
    selectedFolders.value = []
  } else {
    selectedFolders.value = folders.value.map((f) => f.name)
  }
}

// Abrir carpeta para ver archivos
function openFolder(folderName: string) {
  currentFolder.value = folderName
  const folder = folders.value.find((f) => f.name === folderName)
  if (folder) {
    currentFiles.value = folder.files
  }
  selectedFiles.value = []
  searchQuery.value = ''
}

// Toggle selección de archivo
function toggleFile(file: FileInfo) {
  const index = selectedFiles.value.findIndex((f) => f.name === file.name)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(file)
  }
}

// Seleccionar/deseleccionar todos los archivos
function selectAllFiles() {
  if (selectedFiles.value.length === currentFiles.value.length) {
    selectedFiles.value = []
  } else {
    selectedFiles.value = [...currentFiles.value]
  }
}

// Limpiar selección de archivos
function clearFileSelection() {
  selectedFiles.value = []
}

// Calcular tamaño total de archivos seleccionados
function getTotalSize() {
  const totalBytes = selectedFiles.value.reduce((acc, file) => acc + file.size, 0)
  return formatBytes(totalBytes)
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Descargar carpetas seleccionadas
async function downloadFolders() {
  if (selectedFolders.value.length === 0) return

  try {
    const response = await fetch('/api/backup/download-folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folders: selectedFolders.value }),
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-folders-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      alert('Error al generar el ZIP')
    }
  } catch (error) {
    console.error('Error downloading folders:', error)
    alert('Error al descargar las carpetas')
  }
}

// Descargar archivos seleccionados
async function downloadFiles() {
  if (selectedFiles.value.length === 0 || !currentFolder.value) return

  try {
    const response = await fetch('/api/backup/download-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: selectedFiles.value.map((f) => f.path),
        folderName: currentFolder.value,
      }),
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentFolder.value}-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      alert('Error al generar el ZIP')
    }
  } catch (error) {
    console.error('Error downloading files:', error)
    alert('Error al descargar los archivos')
  }
}

// Mapear nombres de carpetas a nombres maquillados
const getFolderDisplayName = (folderName: string): string => {
  const mapping: Record<string, string> = {
    SA: 'H1 - Santa Ana',
    SM: 'H2 - San Miguel',
    SS: 'H4 - San Salvador',
    gastos: 'Gastos',
    remisiones: 'Remisiones',
    notas_de_credito: 'Notas de Crédito',
    descargas_gastos: 'Descargas Gastos',
    descargas_remisiones: 'Descargas Remisiones',
  }
  return mapping[folderName] || folderName
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

// Cargar datos al montar el componente
onMounted(() => {
  loadFolders()
})
</script>
