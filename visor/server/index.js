import archiver from 'archiver'
import cors from 'cors'
import express from 'express'
import fs from 'fs/promises'
import { networkInterfaces } from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0' // 0.0.0.0 permite conexiones externas
const NODE_ENV = process.env.NODE_ENV || 'development'
const IS_ELECTRON = process.env.ELECTRON_APP === 'true'

// Función para determinar la ruta del backup
function getBackupPath() {
  // 1. Variable de entorno (tiene prioridad)
  if (process.env.BACKUP_PATH) {
    return process.env.BACKUP_PATH
  }

  // 2. Si viene de Electron y hay una carpeta Backup junto al ejecutable
  if (IS_ELECTRON) {
    // La ruta será inyectada por Electron
    const electronBackupPath = path.join(__dirname, '..', '..', 'Backup')
    return electronBackupPath
  }

  // 3. Desarrollo: ruta específica para desarrollo local
  if (NODE_ENV === 'development') {
    return 'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup'
  }

  // 4. Producción: ruta del servidor Windows Server 2019
  return 'C:/zeta2/Henri/Copia de seguridad de facturas(No borrar)/Backup'
}

// Ruta del backup - ahora dinámica
const BACKUP_PATH = getBackupPath()

console.log('📂 Configuración de rutas:')
console.log('   - NODE_ENV:', NODE_ENV)
console.log('   - IS_ELECTRON:', IS_ELECTRON)
console.log('   - BACKUP_PATH:', BACKUP_PATH)
console.log('   - __dirname:', __dirname)

// Sistema de caché
let cache = {
  structure: null,
  stats: null,
  lastUpdate: null,
  isLoading: false,
}

// Tiempo de caché en milisegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000

// CORS - En producción, servir frontend desde el mismo servidor
if (NODE_ENV === 'development') {
  app.use(cors())
}

app.use(express.json())

// Servir archivos estáticos del frontend en producción
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  console.log(`📦 Sirviendo frontend desde: ${distPath}`)

  app.use(express.static(distPath))
}

// Función para obtener información de un archivo
async function getFileInfo(filePath, fileName) {
  try {
    const stats = await fs.stat(filePath)
    const ext = path.extname(fileName).toLowerCase().slice(1)

    return {
      name: fileName,
      path: filePath,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      type: getFileType(ext),
      extension: ext,
      isDirectory: stats.isDirectory(),
      modifiedDate: stats.mtime,
      createdDate: stats.birthtime,
    }
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error)
    return null
  }
}

// Función para formatear bytes a formato legible
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Función para determinar el tipo de archivo
function getFileType(ext) {
  const types = {
    pdf: 'pdf',
    json: 'json',
    xml: 'xml',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    txt: 'text',
    doc: 'document',
    docx: 'document',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
  }
  return types[ext] || 'other'
}

// Función para cargar datos del backup (con caché)
async function loadBackupData(force = false) {
  const now = Date.now()

  // Si hay caché válida y no se fuerza recarga, retornarla
  if (!force && cache.structure && cache.lastUpdate && now - cache.lastUpdate < CACHE_DURATION) {
    console.log('📦 Usando datos en caché')
    return cache
  }

  // Si ya se está cargando, esperar
  if (cache.isLoading) {
    console.log('⏳ Esperando carga en progreso...')
    while (cache.isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return cache
  }

  // Iniciar carga
  console.log('🔄 Cargando datos del backup...')
  cache.isLoading = true

  try {
    const structure = {
      path: BACKUP_PATH,
      folders: [],
      totalFiles: 0,
      totalSize: 0,
    }

    // Leer la carpeta principal
    const mainDir = await fs.readdir(BACKUP_PATH, { withFileTypes: true })

    // Procesar cada subcarpeta (excluir descargas_gastos y descargas_remisiones)
    for (const entry of mainDir) {
      if (
        entry.isDirectory() &&
        entry.name !== 'descargas_gastos' &&
        entry.name !== 'descargas_remisiones'
      ) {
        const folderPath = path.join(BACKUP_PATH, entry.name)
        const files = []
        let folderSize = 0

        try {
          const folderContents = await fs.readdir(folderPath)

          for (const fileName of folderContents) {
            const filePath = path.join(folderPath, fileName)
            const fileInfo = await getFileInfo(filePath, fileName)

            if (fileInfo && !fileInfo.isDirectory) {
              files.push(fileInfo)
              folderSize += fileInfo.size
              structure.totalSize += fileInfo.size
            }
          }
        } catch (error) {
          console.error(`Error reading folder ${entry.name}:`, error)
        }

        structure.folders.push({
          name: entry.name,
          path: folderPath,
          fileCount: files.length,
          files: files,
          size: folderSize,
          sizeFormatted: formatBytes(folderSize),
        })

        structure.totalFiles += files.length
      }
    }

    structure.totalSizeFormatted = formatBytes(structure.totalSize)

    // Calcular estadísticas
    const stats = await calculateStats(structure)

    // Guardar en caché
    cache.structure = structure
    cache.stats = stats
    cache.lastUpdate = Date.now()
    cache.isLoading = false

    console.log('✅ Datos cargados y cacheados')
    return cache
  } catch (error) {
    cache.isLoading = false
    throw error
  }
}

// Función para calcular estadísticas
async function calculateStats(structure) {
  const stats = {
    pdf: 0,
    json: 0,
    xml: 0,
    images: 0,
    other: 0,
    total: 0,
    totalSize: structure.totalSize,
    totalSizeFormatted: structure.totalSizeFormatted,
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
  }

  const dteMap = new Map()
  const dteMapByFolder = {
    SA: new Map(),
    SM: new Map(),
    SS: new Map(),
    gastos: new Map(),
    remisiones: new Map(),
    notas_de_credito: new Map(),
  }

  // Contadores simples por carpeta (para contar TODOS los archivos)
  const fileCountByFolder = {
    SA: { pdf: 0, json: 0 },
    SM: { pdf: 0, json: 0 },
    SS: { pdf: 0, json: 0 },
    gastos: { pdf: 0, json: 0 },
    remisiones: { pdf: 0, json: 0 },
    notas_de_credito: { pdf: 0, json: 0 },
  }

  // Mapa especial para contar anuladas (usar mismo método que otras carpetas)
  const anuladasCount = {
    pdf: 0,
    json: 0,
  }

  // Calcular fecha de ayer (para archivos recientes)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Procesar archivos
  console.log('📂 Procesando carpetas...')
  for (const folder of structure.folders) {
    const folderName = folder.name
    console.log(`  - Carpeta: ${folderName}, Archivos: ${folder.files.length}`)

    for (const file of folder.files) {
      // Contar por tipo
      if (file.type === 'pdf') stats.pdf++
      else if (file.type === 'json') stats.json++
      else if (file.type === 'xml') stats.xml++
      else if (file.type === 'image') stats.images++
      else stats.other++

      stats.total++

      // Archivos recientes (solo de ayer)
      const fileDate = new Date(file.modifiedDate)
      fileDate.setHours(0, 0, 0, 0)
      if (fileDate.getTime() === yesterday.getTime()) {
        stats.recentFiles++
      }

      // Contar archivos por carpeta (TODOS los archivos PDF y JSON)
      if (fileCountByFolder[folderName]) {
        if (file.extension === 'pdf') {
          fileCountByFolder[folderName].pdf++
        } else if (file.extension === 'json') {
          fileCountByFolder[folderName].json++
        }
      }

      // Contar facturas anuladas por separado
      if (folderName === 'anuladas') {
        if (file.extension === 'pdf') {
          anuladasCount.pdf++
        } else if (file.extension === 'json') {
          anuladasCount.json++
        }
      }

      // Parejas DTE
      const dteMatch = file.name.match(/DTE-\d+-[A-Z]\d+[A-Z]\d+-\d+/)
      if (dteMatch) {
        const dte = dteMatch[0]

        if (!dteMap.has(dte)) {
          dteMap.set(dte, { pdf: false, json: false })
        }

        if (file.extension === 'pdf') {
          dteMap.get(dte).pdf = true
        } else if (file.extension === 'json') {
          dteMap.get(dte).json = true
        }

        // Por carpeta
        if (dteMapByFolder[folderName]) {
          if (!dteMapByFolder[folderName].has(dte)) {
            dteMapByFolder[folderName].set(dte, { pdf: false, json: false })
          }

          if (file.extension === 'pdf') {
            dteMapByFolder[folderName].get(dte).pdf = true
          } else if (file.extension === 'json') {
            dteMapByFolder[folderName].get(dte).json = true
          }
        }
      }
    }
  }

  // Contar parejas completas
  stats.pairedInvoices = Array.from(dteMap.values()).filter((pair) => pair.pdf && pair.json).length

  // Contar facturas anuladas (parejas completas, no total de archivos)
  stats.anuladas = Math.min(anuladasCount.pdf, anuladasCount.json)

  // Usar conteo simple de archivos por carpeta (total de archivos / 2 para parejas)
  stats.pairedByFolder = {
    SA: Math.floor(Math.min(fileCountByFolder.SA.pdf, fileCountByFolder.SA.json)),
    SM: Math.floor(Math.min(fileCountByFolder.SM.pdf, fileCountByFolder.SM.json)),
    SS: Math.floor(Math.min(fileCountByFolder.SS.pdf, fileCountByFolder.SS.json)),
    gastos: Math.floor(Math.min(fileCountByFolder.gastos.pdf, fileCountByFolder.gastos.json)),
    remisiones: Math.floor(
      Math.min(fileCountByFolder.remisiones.pdf, fileCountByFolder.remisiones.json),
    ),
    notas_de_credito: Math.floor(
      Math.min(fileCountByFolder.notas_de_credito.pdf, fileCountByFolder.notas_de_credito.json),
    ),
  }

  console.log('📊 Conteo de archivos por carpeta:')
  console.log(
    '  SA: PDF=',
    fileCountByFolder.SA.pdf,
    'JSON=',
    fileCountByFolder.SA.json,
    'Parejas=',
    stats.pairedByFolder.SA,
  )
  console.log(
    '  SM: PDF=',
    fileCountByFolder.SM.pdf,
    'JSON=',
    fileCountByFolder.SM.json,
    'Parejas=',
    stats.pairedByFolder.SM,
  )
  console.log(
    '  SS: PDF=',
    fileCountByFolder.SS.pdf,
    'JSON=',
    fileCountByFolder.SS.json,
    'Parejas=',
    stats.pairedByFolder.SS,
  )
  console.log(
    '  gastos: PDF=',
    fileCountByFolder.gastos.pdf,
    'JSON=',
    fileCountByFolder.gastos.json,
    'Parejas=',
    stats.pairedByFolder.gastos,
  )
  console.log(
    '  remisiones: PDF=',
    fileCountByFolder.remisiones.pdf,
    'JSON=',
    fileCountByFolder.remisiones.json,
    'Parejas=',
    stats.pairedByFolder.remisiones,
  )
  console.log(
    '  notas_de_credito: PDF=',
    fileCountByFolder.notas_de_credito.pdf,
    'JSON=',
    fileCountByFolder.notas_de_credito.json,
    'Parejas=',
    stats.pairedByFolder.notas_de_credito,
  )
  console.log(
    '  anuladas: PDF=',
    anuladasCount.pdf,
    'JSON=',
    anuladasCount.json,
    'Parejas=',
    stats.anuladas,
  )

  return stats
}

// Endpoint para obtener la estructura completa del backup
app.get('/api/backup/structure', async (req, res) => {
  try {
    const data = await loadBackupData()

    res.json({
      success: true,
      data: data.structure,
    })
  } catch (error) {
    console.error('Error reading backup structure:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener archivos de una carpeta específica
app.get('/api/backup/folder/:folderName', async (req, res) => {
  try {
    const { folderName } = req.params

    // Usar caché
    const data = await loadBackupData()
    const folder = data.structure.folders.find((f) => f.name === folderName)

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Carpeta no encontrada',
      })
    }

    res.json({
      success: true,
      data: {
        folder: folderName,
        path: folder.path,
        files: folder.files,
        count: folder.files.length,
      },
    })
  } catch (error) {
    console.error('Error reading folder:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener estadísticas de tipos de archivo
// Endpoint para obtener estadísticas
app.get('/api/backup/stats', async (req, res) => {
  try {
    const force = req.query.force === 'true'
    const data = await loadBackupData(force)

    res.json({
      success: true,
      data: data.stats,
    })
  } catch (error) {
    console.error('Error generating stats:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint universal para abrir cualquier archivo
app.post('/api/backup/open-file', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporciono la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // Obtener extension del archivo
    const ext = path.extname(filePath).toLowerCase()

    // Leer el archivo
    const fileBuffer = await fs.readFile(filePath)
    const fileName = path.basename(filePath)

    // Determinar el Content-Type segun la extension
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error opening file:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para abrir PDF en el navegador (mantener por compatibilidad)
app.post('/api/backup/open-pdf', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // Leer el archivo y enviarlo como respuesta
    const fileBuffer = await fs.readFile(filePath)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error opening PDF:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para abrir JSON en bloc de notas
app.post('/api/backup/open-notepad', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // En Windows, abrir con notepad
    const { exec } = await import('child_process')
    exec(`notepad "${filePath}"`, (error) => {
      if (error) {
        console.error('Error opening notepad:', error)
      }
    })

    res.json({
      success: true,
      message: 'Archivo abierto en Bloc de Notas',
    })
  } catch (error) {
    console.error('Error opening file in notepad:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para descargar carpetas completas en ZIP
app.post('/api/backup/download-folders', async (req, res) => {
  try {
    const { folders } = req.body

    if (!folders || !Array.isArray(folders) || folders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron carpetas para empaquetar',
      })
    }

    // Configurar el archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Nivel máximo de compresión
    })

    // Configurar headers
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="backup-folders-${Date.now()}.zip"`)

    // Pipe del archivo al response
    archive.pipe(res)

    // Agregar cada carpeta al ZIP
    for (const folderName of folders) {
      const folderPath = path.join(BACKUP_PATH, folderName)

      try {
        await fs.access(folderPath)
        // Agregar directorio completo al ZIP
        archive.directory(folderPath, folderName)
      } catch (error) {
        console.error(`Error accessing folder ${folderName}:`, error)
      }
    }

    // Finalizar el archivo
    await archive.finalize()
  } catch (error) {
    console.error('Error creating ZIP:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para descargar archivos específicos en ZIP
app.post('/api/backup/download-files', async (req, res) => {
  try {
    const { files, folderName } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos para empaquetar',
      })
    }

    // Configurar el archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    // Configurar headers
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${folderName || 'files'}-${Date.now()}.zip"`,
    )

    // Pipe del archivo al response
    archive.pipe(res)

    // Agregar cada archivo al ZIP
    for (const filePath of files) {
      try {
        await fs.access(filePath)
        const fileName = path.basename(filePath)
        archive.file(filePath, { name: fileName })
      } catch (error) {
        console.error(`Error accessing file ${filePath}:`, error)
      }
    }

    // Finalizar el archivo
    await archive.finalize()
  } catch (error) {
    console.error('Error creating ZIP:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint de health check
// Endpoint para obtener clientes con anuladas
// Endpoint para obtener clientes (con caché)
app.get('/api/clientes', async (req, res) => {
  try {
    // Ruta del archivo de clientes
    const clientesPath =
      NODE_ENV === 'development'
        ? 'J:/Henri/Clientes/lista_clientes.json'
        : 'C:/zeta2/Henri/Clientes/lista_clientes.json'

    // Leer archivo de clientes
    const clientesData = await fs.readFile(clientesPath, 'utf-8')
    const clientesJson = JSON.parse(clientesData)

    // Obtener lista de clientes
    const clientes = clientesJson.clientes || []

    // Contar anuladas por cliente
    const clientesConAnuladas = []

    // Cargar datos de facturas anuladas
    const anuladasPath = path.join(BACKUP_PATH, 'anuladas')

    try {
      await fs.access(anuladasPath)
      const anuladasFiles = await fs.readdir(anuladasPath)

      // Crear mapa de anuladas por cliente
      const anuladasPorCliente = new Map()

      for (const fileName of anuladasFiles) {
        if (fileName.endsWith('.json')) {
          try {
            const filePath = path.join(anuladasPath, fileName)
            const fileContent = await fs.readFile(filePath, 'utf-8')
            const jsonData = JSON.parse(fileContent)

            // Obtener nombre del receptor
            const nombreCliente = jsonData.receptor?.nombre

            if (nombreCliente) {
              const count = anuladasPorCliente.get(nombreCliente) || 0
              anuladasPorCliente.set(nombreCliente, count + 1)
            }
          } catch (err) {
            // Ignorar archivos con errores
            console.error(`Error leyendo archivo ${fileName}:`, err.message)
          }
        }
      }

      // Crear lista de clientes con conteo de anuladas
      for (const cliente of clientes) {
        clientesConAnuladas.push({
          nombre: cliente,
          anuladas: anuladasPorCliente.get(cliente) || 0,
        })
      }

      // Ordenar por número de anuladas (descendente)
      clientesConAnuladas.sort((a, b) => b.anuladas - a.anuladas)
    } catch (err) {
      console.warn('No se pudo acceder a la carpeta anuladas:', err.message)
      // Si no existe la carpeta, solo devolver clientes sin anuladas
      for (const cliente of clientes) {
        clientesConAnuladas.push({
          nombre: cliente,
          anuladas: 0,
        })
      }
    }

    res.json({
      success: true,
      data: clientesConAnuladas,
    })
  } catch (err) {
    console.error('Error loading clientes:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    cacheStatus: {
      loaded: cache.structure !== null,
      lastUpdate: cache.lastUpdate ? new Date(cache.lastUpdate).toISOString() : null,
      isLoading: cache.isLoading,
    },
  })
})

// Endpoint para contar archivos directamente en carpeta SA
app.get('/api/count-files-sa', async (req, res) => {
  try {
    const saPath = path.join(BACKUP_PATH, 'SA')
    console.log('📊 Contando archivos en SA:', saPath)

    // Verificar que existe la carpeta
    try {
      await fs.access(saPath)
    } catch (err) {
      return res.json({
        success: false,
        error: 'Carpeta SA no encontrada',
        path: saPath,
      })
    }

    // Leer todos los archivos
    const files = await fs.readdir(saPath)

    let pdfCount = 0
    let jsonCount = 0
    let otherCount = 0
    const sampleFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = path.extname(file).toLowerCase()

      if (ext === '.pdf') {
        pdfCount++
        if (pdfCount <= 3) sampleFiles.push(file)
      } else if (ext === '.json') {
        jsonCount++
        if (jsonCount <= 3) sampleFiles.push(file)
      } else {
        otherCount++
      }
    }

    const result = {
      success: true,
      carpeta: 'SA (H1)',
      ruta: saPath,
      totalArchivos: files.length,
      conteos: {
        pdf: pdfCount,
        json: jsonCount,
        otros: otherCount,
      },
      parejasCompletas: Math.min(pdfCount, jsonCount),
      muestrasArchivos: sampleFiles,
    }

    console.log('✅ Resultado conteo SA:', result)

    res.json(result)
  } catch (error) {
    console.error('❌ Error contando archivos SA:', error)
    res.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
})

// Endpoint para limpiar caché manualmente
app.post('/api/cache/clear', (req, res) => {
  cache = {
    structure: null,
    stats: null,
    lastUpdate: null,
    isLoading: false,
  }

  console.log('🗑️ Caché limpiada manualmente')

  res.json({
    success: true,
    message: 'Caché limpiada correctamente',
  })
})

// Endpoint para forzar recarga de caché
app.post('/api/cache/reload', async (req, res) => {
  try {
    // Limpiar caché
    cache = {
      structure: null,
      stats: null,
      lastUpdate: null,
      isLoading: false,
    }

    // Recargar datos
    console.log('🔄 Recargando caché...')
    await loadBackupData()

    res.json({
      success: true,
      message: 'Caché recargada correctamente',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint adicional para diagnóstico
app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    data: {
      nodeEnv: NODE_ENV,
      isElectron: IS_ELECTRON,
      backupPath: BACKUP_PATH,
      serverDir: __dirname,
      platform: process.platform,
      cwd: process.cwd(),
    },
  })
})

// Ruta catch-all para SPA (debe estar al final, después de todas las rutas API)
if (NODE_ENV === 'production' || IS_ELECTRON) {
  app.use((req, res) => {
    // Solo servir index.html si no es una ruta de API
    if (!req.url.startsWith('/api')) {
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
      console.log(`📄 Sirviendo: ${req.url} -> index.html`)
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Error sirviendo ${req.url}:`, err.message)
          res.status(500).send('Error al cargar la aplicacion')
        }
      })
    } else {
      res.status(404).json({ success: false, error: 'Endpoint no encontrado' })
    }
  })
}

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  console.log(`🌐 Accesible desde: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`📁 Backup path: ${BACKUP_PATH}`)

  // Mostrar todas las IPs disponibles
  console.log('\n📡 Accesible desde las siguientes IPs:')
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Solo IPv4 y no loopback
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   - http://${net.address}:${PORT} (${name})`)
      }
    }
  }
  console.log('')

  // Verificar si la ruta existe
  try {
    await fs.access(BACKUP_PATH)
    console.log('✅ Ruta de backup accesible')
  } catch (error) {
    console.warn('⚠️  ADVERTENCIA: La ruta de backup no existe o no es accesible')
    console.warn('   Asegúrate de que la carpeta "Backup" esté junto al ejecutable')
  }

  console.log('⏳ Precargando datos en caché...')

  // Precargar datos al iniciar
  try {
    await loadBackupData()
    console.log('✅ Datos precargados exitosamente')
  } catch (error) {
    console.error('❌ Error al precargar datos:', error.message)
  }
})
