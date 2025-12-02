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

  // 3. Desarrollo: ruta relativa desde el proyecto
  if (NODE_ENV === 'development') {
    // Buscar carpeta Backup en el directorio raíz del proyecto o padre
    const projectRoot = path.join(__dirname, '..')
    const localBackup = path.join(projectRoot, 'Backup')

    // Si existe localmente, usarla
    return localBackup
  }

  // 4. Fallback: ruta hardcodeada para el servidor de producción
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
async function loadBackupData() {
  const now = Date.now()

  // Si hay caché válida, retornarla
  if (cache.structure && cache.lastUpdate && now - cache.lastUpdate < CACHE_DURATION) {
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

    // Procesar cada subcarpeta
    for (const entry of mainDir) {
      if (entry.isDirectory()) {
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
    pairedByFolder: {
      SA: 0,
      SM: 0,
      SS: 0,
      gastos: 0,
      remisiones: 0,
    },
  }

  const dteMap = new Map()
  const dteMapByFolder = {
    SA: new Map(),
    SM: new Map(),
    SS: new Map(),
    gastos: new Map(),
    remisiones: new Map(),
  }

  const recentDate = new Date()
  recentDate.setDate(recentDate.getDate() - 7)

  // Procesar archivos
  for (const folder of structure.folders) {
    const folderName = folder.name

    for (const file of folder.files) {
      // Contar por tipo
      if (file.type === 'pdf') stats.pdf++
      else if (file.type === 'json') stats.json++
      else if (file.type === 'xml') stats.xml++
      else if (file.type === 'image') stats.images++
      else stats.other++

      stats.total++

      // Archivos recientes
      const fileDate = new Date(file.modifiedDate)
      if (fileDate >= recentDate) {
        stats.recentFiles++
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

  stats.pairedByFolder = {
    SA: Array.from(dteMapByFolder.SA.values()).filter((pair) => pair.pdf && pair.json).length,
    SM: Array.from(dteMapByFolder.SM.values()).filter((pair) => pair.pdf && pair.json).length,
    SS: Array.from(dteMapByFolder.SS.values()).filter((pair) => pair.pdf && pair.json).length,
    gastos: Array.from(dteMapByFolder.gastos.values()).filter((pair) => pair.pdf && pair.json)
      .length,
    remisiones: Array.from(dteMapByFolder.remisiones.values()).filter(
      (pair) => pair.pdf && pair.json,
    ).length,
  }

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
    const data = await loadBackupData()

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

// Endpoint para abrir PDF en el navegador
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
