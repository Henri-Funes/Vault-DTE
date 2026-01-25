<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">📂 Explorador de Facturas</h2>
        <p v-if="lastUpdate" class="text-xs text-slate-500 mt-1">
          Última actualización: {{ lastUpdate }} • 🔄 Auto-refresh activo (30s)
        </p>
      </div>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Ingrese un DTE"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 text-slate-800 placeholder:text-slate-400 placeholder:opacity-60"
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
          📁 {{ formatFolderName(folder.name) }} ({{ folder.fileCount }})
        </button>
      </div>
    </div>

    <!-- Filtro de fechas y límite -->
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
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-800">📋 Mostrar:</label>
          <select
            v-model="limit"
            @change="changePage(1)"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-slate-800"
          >
            <option :value="100">100</option>
            <option :value="300">300</option>
            <option :value="500">500</option>
          </select>
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
      <span class="text-slate-800 font-medium">{{
        selectedFolder ? formatFolderName(selectedFolder) : 'Todas las carpetas'
      }}</span>
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
            <span
              v-if="selectedFolder === 'anuladas'"
              class="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold"
            >
              ANULADA
            </span>
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

    <!-- Paginación -->
    <div
      v-if="!loading && !error && pagination"
      class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4"
    >
      <div class="text-sm text-slate-600">
        Mostrando {{ filteredFiles.length }} archivos de {{ pagination.totalFiles }} totales ({{
          pagination.totalFacturas
        }}
        facturas) • Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
      </div>
      <div class="flex gap-2">
        <button
          @click="changePage(pagination.currentPage - 1)"
          :disabled="!pagination.hasPrevPage"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          ← Anterior
        </button>
        <button
          @click="changePage(pagination.currentPage + 1)"
          :disabled="!pagination.hasNextPage"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- Información (para casos sin paginación) -->
    <div
      v-if="!loading && !error && !pagination"
      class="mt-4 flex items-center justify-between text-sm text-slate-600"
    >
      <span>Mostrando {{ filteredFiles.length }} de {{ allFiles.length }} archivos</span>
      <span v-if="selectedFolder" class="text-blue-600">
        📁 {{ formatFolderName(selectedFolder) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBackupStructure, getFolderFiles, searchFacturas, type FileInfo, type FolderInfo } from '@/services/api'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const searchQuery = ref('')
const searchResults = ref<FileInfo[]>([])
const isSearching = ref(false)
const selectedFolder = ref<string>('')
const folders = ref<FolderInfo[]>([])
const allFiles = ref<FileInfo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const isBackendFiltered = ref(false) // Indica si los archivos ya vienen filtrados del backend
const limit = ref(100) // Límite de archivos por página
const currentPage = ref(1) // Página actual
const pagination = ref<any>(null) // Información de paginación del backend
const lastUpdate = ref<string>('')

// Auto-refresh
const AUTO_REFRESH_INTERVAL = 30000 // 30 segundos
let autoRefreshTimer: number | null = null

// Función para formatear nombres de carpetas
const formatFolderName = (folderName: string): string => {
  const folderMap: Record<string, string> = {
    SA: 'H1',
    SM: 'H2',
    SS: 'H4',
  }
  return folderMap[folderName] || folderName
}

// Archivos filtrados por búsqueda, carpeta seleccionada y fechas de emisión
const filteredFiles = computed(() => {
  if (isSearching.value && searchQuery.value.trim().length > 0) {
    return searchResults.value
  }

  let files = allFiles.value

  // Filtrar por rango de fechas de EMISIÓN (solo si NO vienen ya filtrados del backend)
  if ((dateFrom.value || dateTo.value) && !isBackendFiltered.value) {
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

    // Actualizar timestamp
    const now = new Date()
    lastUpdate.value = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

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
async function loadFolderFiles() {
  if (!selectedFolder.value || folders.value.length === 0) {
    allFiles.value = []
    return
  }

  try {
    loading.value = true
    // Siempre llamar al backend para obtener archivos actualizados desde MongoDB con paginación
    const folderData = await getFolderFiles(
      selectedFolder.value,
      dateFrom.value || undefined,
      dateTo.value || undefined,
      limit.value,
      currentPage.value,
    )
    allFiles.value = folderData.files
    pagination.value = folderData.pagination // Guardar info de paginación
    isBackendFiltered.value = !!(dateFrom.value || dateTo.value) // Marcar si vienen filtrados
    loading.value = false
  } catch (err) {
    console.error('Error cargando archivos:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    loading.value = false
  }
}

// Observar cambios en la carpeta seleccionada
watch(selectedFolder, () => {
  // Resetear página al cambiar carpeta
  currentPage.value = 1
  // Solo recargar automáticamente si NO hay filtro de fechas
  if (!dateFrom.value && !dateTo.value) {
    loadFolderFiles()
  }
})

// Aplicar filtro de fechas
async function applyDateFilter() {
  if (!dateFrom.value && !dateTo.value) {
    return
  }

  currentPage.value = 1
  await loadFolderFiles()
}

function clearDateFilter() {
  dateFrom.value = ''
  dateTo.value = ''
  isBackendFiltered.value = false
  currentPage.value = 1
  loadFolderFiles()
}

let searchTimeout: number | null = null

async function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const query = searchQuery.value.trim()

  if (query.length === 0) {
    isSearching.value = false
    searchResults.value = []
    return
  }

  searchTimeout = window.setTimeout(async () => {
    try {
      isSearching.value = true
      loading.value = true
      const response = await searchFacturas(query)
      searchResults.value = response.files
      loading.value = false
    } catch (err) {
      console.error('Error en búsqueda:', err)
      error.value = 'Error al buscar facturas'
      loading.value = false
    }
  }, 500)
}

// Cambiar de página
function changePage(page: number) {
  currentPage.value = page
  loadFolderFiles()
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
  try {
    const extension = file.extension.toLowerCase().replace(/^\./, '')

    // Verificar si es un tipo de archivo soportado
    if (['pdf', 'json', 'xml', 'txt'].includes(extension)) {
      // Construir parámetros para el endpoint
      const params = new URLSearchParams()

      // Para PDF y JSON, incluir siempre ambos parámetros si están disponibles
      if (extension === 'pdf' || extension === 'json') {
        // Incluir codigoGeneracion si está disponible
        if (file.codigoGeneracion) {
          params.append('codigoGeneracion', file.codigoGeneracion)
        }
        // Incluir path si está disponible
        if (file.path) {
          params.append('path', file.path)
        }

        // Validar que al menos uno esté presente
        if (!file.codigoGeneracion && !file.path) {
          throw new Error('No se puede abrir el archivo: falta path o codigoGeneracion')
        }
      } else {
        // Para otros tipos (xml, txt), preferir codigoGeneracion si está disponible, sino usar path
        if (file.codigoGeneracion) {
          params.append('codigoGeneracion', file.codigoGeneracion)
        } else if (file.path) {
          params.append('path', file.path)
        } else {
          throw new Error('No se puede abrir el archivo: falta path o codigoGeneracion')
        }
      }

      // Para PDF, usar visor personalizado con PDF.js
      if (extension === 'pdf') {
        // Obtener el PDF como blob
        const response = await fetch(`/api/file/content?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Error al cargar PDF: ${response.statusText}`)
        }

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        // Crear una nueva ventana con un visor PDF usando PDF.js
        const pdfWindow = window.open('', '_blank')
        if (pdfWindow) {
          pdfWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${file.name}</title>
              <meta charset="UTF-8">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #525252;
                  font-family: Arial, sans-serif;
                }
                #pdf-container {
                  width: 100%;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  overflow: auto;
                }
                #pdf-viewer {
                  background-color: white;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                  margin: 20px;
                }
                #toolbar {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  background-color: #333;
                  color: white;
                  padding: 10px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  z-index: 1000;
                }
                button {
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  cursor: pointer;
                  border-radius: 4px;
                  margin: 0 5px;
                }
                button:hover {
                  background-color: #45a049;
                }
                button:disabled {
                  background-color: #666;
                  cursor: not-allowed;
                }
                #page-info {
                  margin: 0 20px;
                }
                #canvas-container {
                  margin-top: 60px;
                }
              </style>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
            </head>
            <body>
              <div id="toolbar">
                <div>
                  <button id="prev-page">← Anterior</button>
                  <span id="page-info">Página <span id="page-num"></span> de <span id="page-count"></span></span>
                  <button id="next-page">Siguiente →</button>
                </div>
                <div>
                  <button id="zoom-in">Zoom +</button>
                  <button id="zoom-out">Zoom -</button>
                  <button id="download">📥 Descargar</button>
                </div>
              </div>
              <div id="pdf-container">
                <div id="canvas-container"></div>
              </div>
              <script>
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const pdfUrl = '${blobUrl}';
                let pdfDoc = null;
                let pageNum = 1;
                let pageRendering = false;
                let pageNumPending = null;
                let scale = 1.5;

                const canvasContainer = document.getElementById('canvas-container');
                const pageNumSpan = document.getElementById('page-num');
                const pageCountSpan = document.getElementById('page-count');
                const prevButton = document.getElementById('prev-page');
                const nextButton = document.getElementById('next-page');
                const zoomInButton = document.getElementById('zoom-in');
                const zoomOutButton = document.getElementById('zoom-out');
                const downloadButton = document.getElementById('download');

                function renderPage(num) {
                  pageRendering = true;
                  pdfDoc.getPage(num).then(function(page) {
                    const viewport = page.getViewport({ scale: scale });
                    const canvas = document.createElement('canvas');
                    canvas.id = 'pdf-viewer';
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    canvasContainer.innerHTML = '';
                    canvasContainer.appendChild(canvas);

                    const renderContext = {
                      canvasContext: context,
                      viewport: viewport
                    };

                    const renderTask = page.render(renderContext);
                    renderTask.promise.then(function() {
                      pageRendering = false;
                      if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                      }
                    });
                  });

                  pageNumSpan.textContent = num;
                  prevButton.disabled = (num <= 1);
                  nextButton.disabled = (num >= pdfDoc.numPages);
                }

                function queueRenderPage(num) {
                  if (pageRendering) {
                    pageNumPending = num;
                  } else {
                    renderPage(num);
                  }
                }

                prevButton.addEventListener('click', function() {
                  if (pageNum <= 1) return;
                  pageNum--;
                  queueRenderPage(pageNum);
                });

                nextButton.addEventListener('click', function() {
                  if (pageNum >= pdfDoc.numPages) return;
                  pageNum++;
                  queueRenderPage(pageNum);
                });

                zoomInButton.addEventListener('click', function() {
                  scale += 0.25;
                  queueRenderPage(pageNum);
                });

                zoomOutButton.addEventListener('click', function() {
                  if (scale > 0.5) {
                    scale -= 0.25;
                    queueRenderPage(pageNum);
                  }
                });

                downloadButton.addEventListener('click', function() {
                  const a = document.createElement('a');
                  a.href = pdfUrl;
                  a.download = '${file.name}';
                  a.click();
                });

                pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
                  pdfDoc = pdfDoc_;
                  pageCountSpan.textContent = pdfDoc.numPages;
                  renderPage(pageNum);
                }).catch(function(error) {
                  console.error('Error al cargar PDF:', error);
                  canvasContainer.innerHTML = '<p style="color: white; padding: 20px;">Error al cargar el PDF: ' + error.message + '</p>';
                });
              <\/script>
            </body>
            </html>
          `)
          pdfWindow.document.close()
        }
        return // Salir temprano
      }

      // Para otros tipos, hacer fetch y procesar la respuesta
      const response = await fetch(`/api/file/content?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error al cargar archivo: ${response.statusText}`)
      }

      if (extension === 'json') {
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

// Iniciar auto-refresh
function startAutoRefresh() {
  // Limpiar timer anterior si existe
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }

  // Configurar nuevo timer
  autoRefreshTimer = window.setInterval(() => {
    console.log('🔄 Auto-refresh: actualizando datos...')
    loadData()
  }, AUTO_REFRESH_INTERVAL)
}

// Detener auto-refresh
function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  loadData()
  startAutoRefresh()
})

// Limpiar timer al desmontar
onUnmounted(() => {
  stopAutoRefresh()
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>
