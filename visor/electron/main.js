const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
require('dotenv').config()

let mainWindow
let expressServer
let currentBackupPath = null // Ruta dinámica seleccionada por el usuario

// ============================================
// Sistema de Caché para optimizar rendimiento
// ============================================
let cache = {
  structure: null,
  stats: null,
  folders: null,
  folderFiles: {}, // { folderName: [...files] }
  lastUpdate: null,
  isLoading: false,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos
let cacheUpdateInterval = null

// Función auxiliar para formatear bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Función auxiliar para determinar tipo de archivo
function getFileType(extension) {
  const types = {
    '.pdf': 'pdf',
    '.json': 'json',
    '.xml': 'xml',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.txt': 'text',
    '.zip': 'archive',
    '.rar': 'archive',
  }
  return types[extension] || 'other'
}

// Función para buscar dinámicamente la carpeta Backup
function findBackupFolder() {
  console.log('🔍 Buscando carpeta Backup...')

  // 1. Verificar si hay una ruta configurada en .env
  if (process.env.BACKUP_PATH) {
    const envPath = process.env.BACKUP_PATH.replace(/\\/g, '/')
    console.log('📋 Ruta configurada en .env:', envPath)

    try {
      if (fs.existsSync(envPath)) {
        const stats = fs.statSync(envPath)
        if (stats.isDirectory()) {
          console.log('✅ Carpeta Backup encontrada desde .env:', envPath)
          return envPath
        }
      } else {
        console.log('⚠️ La ruta del .env no existe:', envPath)
      }
    } catch (error) {
      console.error('❌ Error al verificar ruta del .env:', error.message)
    }
  }

  // 2. Lista de ubicaciones posibles para buscar
  const searchLocations = [
    // Junto al ejecutable (para portable)
    app.isPackaged ? path.join(path.dirname(app.getPath('exe')), 'Backup') : null,

    // Desarrollo local
    'C:/Dashboard/Backup',

    // Unidades de red comunes (J:, K:, L:, M:, N:, Z:)
    'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup',
    'J:/Backup',
    'K:/Backup',
    'L:/Backup',
    'M:/Backup',
    'N:/Backup',
    'Z:/Backup',

    // Rutas de red UNC
    '//servidor/compartido/Backup',
    '//nas/Backup',
  ]

  // Buscar en cada ubicación
  for (const location of searchLocations) {
    if (!location) continue

    try {
      if (fs.existsSync(location)) {
        const stats = fs.statSync(location)
        if (stats.isDirectory()) {
          console.log('✅ Carpeta Backup encontrada:', location)
          return location
        }
      }
    } catch (error) {
      // Ignorar errores (unidades no disponibles, permisos, etc.)
      continue
    }
  }

  // Si no encuentra nada, buscar en todas las unidades disponibles
  console.log('⚠️ No se encontró en ubicaciones predefinidas, buscando en todas las unidades...')

  const drives = []
  for (let i = 67; i <= 90; i++) {
    // C a Z
    drives.push(String.fromCharCode(i) + ':')
  }

  for (const drive of drives) {
    try {
      if (!fs.existsSync(drive)) continue

      // Buscar en la raíz de la unidad
      const rootBackup = path.join(drive, 'Backup')
      if (fs.existsSync(rootBackup)) {
        console.log('✅ Carpeta Backup encontrada:', rootBackup)
        return rootBackup
      }

      // Buscar en subdirectorios comunes
      const commonPaths = [
        path.join(drive, 'Henri', 'Copia de seguridad de facturas(No borrar)', 'Backup'),
        path.join(drive, 'Backups', 'Backup'),
        path.join(drive, 'Datos', 'Backup'),
      ]

      for (const testPath of commonPaths) {
        if (fs.existsSync(testPath)) {
          console.log('✅ Carpeta Backup encontrada:', testPath)
          return testPath
        }
      }
    } catch (error) {
      continue
    }
  }

  // Fallback: crear carpeta junto al ejecutable
  const fallbackPath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), 'Backup')
    : 'C:/Dashboard/Backup'

  console.log('❌ No se encontró carpeta Backup, usando fallback:', fallbackPath)
  return fallbackPath
}

// Determinar la ruta base para datos
function getAppDataPath() {
  return findBackupFolder()
}

// ============================================
// Funciones de Caché
// ============================================

// Cargar estructura completa del backup en caché
async function loadBackupStructure(backupPath) {
  console.log('📦 Cargando estructura del backup...')

  if (!fs.existsSync(backupPath)) {
    return {
      path: backupPath,
      folders: [],
      totalFiles: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
    }
  }

  const folders = fs
    .readdirSync(backupPath)
    .filter((file) => fs.statSync(path.join(backupPath, file)).isDirectory())
    .map((folderName) => {
      const folderPath = path.join(backupPath, folderName)
      const files = fs
        .readdirSync(folderPath)
        .filter((file) => fs.statSync(path.join(folderPath, file)).isFile())
        .map((fileName) => {
          const filePath = path.join(folderPath, fileName)
          const stats = fs.statSync(filePath)
          const ext = path.extname(fileName).toLowerCase()

          // Leer fecha de emisión del JSON si existe
          let emissionDate = null
          if (ext === '.json') {
            try {
              const jsonContent = fs.readFileSync(filePath, 'utf-8')
              const jsonData = JSON.parse(jsonContent)
              emissionDate = jsonData.fecEmi || null
            } catch (error) {
              console.error(`Error leyendo JSON ${fileName}:`, error.message)
            }
          }

          return {
            name: fileName,
            path: filePath,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            type: getFileType(ext),
            extension: ext,
            isDirectory: false,
            modifiedDate: stats.mtime.toISOString(),
            createdDate: stats.birthtime.toISOString(),
            emissionDate: emissionDate, // Fecha de emisión desde el JSON
          }
        })

      const folderSize = files.reduce((acc, file) => acc + file.size, 0)

      // Guardar archivos de la carpeta en caché
      cache.folderFiles[folderName] = files

      return {
        name: folderName,
        path: folderPath,
        fileCount: files.length,
        files: files,
        size: folderSize,
        sizeFormatted: formatBytes(folderSize),
      }
    })
    .sort((a, b) => b.name.localeCompare(a.name))

  const totalFiles = folders.reduce((acc, folder) => acc + folder.fileCount, 0)
  const totalSize = folders.reduce((acc, folder) => acc + folder.size, 0)

  return {
    path: backupPath,
    folders: folders,
    totalFiles: totalFiles,
    totalSize: totalSize,
    totalSizeFormatted: formatBytes(totalSize),
  }
}

// Cargar estadísticas en caché con filtro de fechas opcional
async function loadBackupStats(backupPath, dateFrom = null, dateTo = null) {
  console.log('📊 Cargando estadísticas...', { dateFrom, dateTo })

  if (!fs.existsSync(backupPath)) {
    return {
      pdf: 0,
      json: 0,
      xml: 0,
      images: 0,
      other: 0,
      total: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
      recentFiles: 0,
      pairedInvoices: 0,
      pairedByFolder: { SA: 0, SM: 0, SS: 0, gastos: 0, remisiones: 0, notas_de_credito: 0 },
    }
  }

  const stats = {
    pdf: 0,
    json: 0,
    xml: 0,
    images: 0,
    other: 0,
    total: 0,
    totalSize: 0,
    recentFiles: 0,
    pairedInvoices: 0,
    pairedByFolder: { SA: 0, SM: 0, SS: 0, gastos: 0, remisiones: 0, notas_de_credito: 0 },
  }

  const folders = fs
    .readdirSync(backupPath)
    .filter((file) => fs.statSync(path.join(backupPath, file)).isDirectory())

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  // Convertir fechas de filtro a timestamps
  const filterFrom = dateFrom ? new Date(dateFrom).getTime() : null
  const filterTo = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null

  // Cuando hay filtro de fechas, crear un mapa de archivos válidos por fecha de emisión
  const validJsonFiles = new Set()

  folders.forEach((folder) => {
    const folderPath = path.join(backupPath, folder)
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => fs.statSync(path.join(folderPath, file)).isFile())

    // Si hay filtro de fechas, primero identificar JSONs válidos por fecha de emisión
    if (filterFrom || filterTo) {
      files.forEach((file) => {
        const ext = path.extname(file).toLowerCase()
        if (ext === '.json') {
          try {
            const filePath = path.join(folderPath, file)
            const jsonContent = fs.readFileSync(filePath, 'utf-8')
            const jsonData = JSON.parse(jsonContent)

            if (jsonData.fecEmi) {
              const emissionTime = new Date(jsonData.fecEmi).getTime()
              if (emissionTime >= filterFrom && emissionTime <= filterTo) {
                const baseName = path.basename(file, '.json')
                validJsonFiles.add(`${folder}/${baseName}`)
              }
            }
          } catch (error) {
            // Ignorar errores de lectura de JSON
          }
        }
      })
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file)
      const fileStats = fs.statSync(filePath)
      const ext = path.extname(file).toLowerCase()
      const fileModTime = fileStats.mtime.getTime()
      const baseName = path.basename(file, ext)

      // Si hay filtro de fechas, solo contar archivos válidos
      if (filterFrom || filterTo) {
        const fileKey = `${folder}/${baseName}`
        if (!validJsonFiles.has(fileKey)) return
      }

      stats.total++
      stats.totalSize += fileStats.size

      // Contar por tipo
      if (ext === '.pdf') stats.pdf++
      else if (ext === '.json') stats.json++
      else if (ext === '.xml') stats.xml++
      else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) stats.images++
      else stats.other++

      // Archivos recientes (últimos 30 días) - usar fecha de modificación
      if (!filterFrom && !filterTo && fileModTime > thirtyDaysAgo) {
        stats.recentFiles++
      }
    })

    // Contar facturas emparejadas (PDF + XML o JSON con mismo nombre)
    const pdfFiles = files.filter((f) => f.endsWith('.pdf'))
    pdfFiles.forEach((pdfFile) => {
      const baseName = path.basename(pdfFile, '.pdf')
      const fileKey = `${folder}/${baseName}`

      // Si hay filtro de fechas, verificar si está en archivos válidos
      if ((filterFrom || filterTo) && !validJsonFiles.has(fileKey)) return

      const xmlFile = baseName + '.xml'
      const jsonFile = baseName + '.json'
      if (files.includes(xmlFile) || files.includes(jsonFile)) {
        stats.pairedInvoices++

        // Contar por carpeta
        if (folder.includes('SA')) stats.pairedByFolder.SA++
        else if (folder.includes('SM')) stats.pairedByFolder.SM++
        else if (folder.includes('SS')) stats.pairedByFolder.SS++
        else if (folder.toLowerCase().includes('gastos')) stats.pairedByFolder.gastos++
        else if (folder.toLowerCase().includes('remisiones')) stats.pairedByFolder.remisiones++
        else if (folder.toLowerCase().includes('notas_de_credito'))
          stats.pairedByFolder.notas_de_credito++
      }
    })
  })

  stats.totalSizeFormatted = formatBytes(stats.totalSize)

  return stats
}

// Actualizar toda la caché
async function updateCache(backupPath) {
  if (cache.isLoading) {
    console.log('⏳ Caché ya se está actualizando, omitiendo...')
    return
  }

  cache.isLoading = true
  console.log('🔄 Actualizando caché...')

  try {
    // Cargar lista de carpetas
    cache.folders = fs.existsSync(backupPath)
      ? fs
          .readdirSync(backupPath)
          .filter((file) => fs.statSync(path.join(backupPath, file)).isDirectory())
          .sort((a, b) => b.localeCompare(a))
      : []

    // Cargar estructura completa
    cache.structure = await loadBackupStructure(backupPath)

    // Cargar estadísticas
    cache.stats = await loadBackupStats(backupPath)

    cache.lastUpdate = Date.now()
    console.log('✅ Caché actualizada:', {
      carpetas: cache.folders.length,
      archivos: cache.structure.totalFiles,
      tamaño: cache.structure.totalSizeFormatted,
    })
  } catch (error) {
    console.error('❌ Error al actualizar caché:', error)
  } finally {
    cache.isLoading = false
  }
}

// Verificar si la caché está vigente
function isCacheValid() {
  if (!cache.lastUpdate) return false
  return Date.now() - cache.lastUpdate < CACHE_DURATION
}

// Iniciar actualización automática de caché
function startCacheAutoUpdate(backupPath) {
  // Actualizar inmediatamente
  updateCache(backupPath)

  // Configurar actualización cada 5 minutos
  if (cacheUpdateInterval) {
    clearInterval(cacheUpdateInterval)
  }

  cacheUpdateInterval = setInterval(() => {
    console.log('⏰ Actualización automática de caché (cada 5 minutos)...')
    updateCache(backupPath)
  }, CACHE_DURATION)

  console.log('✅ Actualización automática de caché configurada (cada 5 minutos)')
}

// Función para iniciar el servidor Express integrado
function startServer() {
  const backupPath = currentBackupPath || getAppDataPath()
  console.log('🚀 Iniciando servidor Express integrado...')
  console.log('📂 Ruta de datos:', backupPath)

  const expressApp = express()

  expressApp.use(cors())
  expressApp.use(express.json())

  // Servir archivos estáticos del frontend en producción
  if (app.isPackaged) {
    const distPath = path.join(__dirname, '..', 'dist')
    expressApp.use(express.static(distPath))
    console.log('📦 Sirviendo archivos estáticos desde:', distPath)
  }

  // Función auxiliar para obtener la ruta actual (permite override dinámico)
  const getCurrentBackupPath = (req) => {
    return req.query.path || currentBackupPath || backupPath
  }

  // ============================================
  // API Endpoints con Caché
  // ============================================

  // Endpoint: Lista de carpetas (usa caché)
  expressApp.get('/api/folders', (req, res) => {
    try {
      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      res.json(cache.folders || [])
    } catch (error) {
      console.error('Error al leer carpetas:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Endpoint: Archivos de una carpeta (usa caché)
  expressApp.get('/api/files/:folder', (req, res) => {
    try {
      const folder = req.params.folder

      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      // Buscar en caché
      if (cache.folderFiles[folder]) {
        const files = cache.folderFiles[folder].map((file) => ({
          name: file.name,
          size: file.size,
          modified: file.modifiedDate,
        }))
        return res.json(files)
      }

      res.json([])
    } catch (error) {
      console.error('Error al leer archivos:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Endpoint: Descargar archivo
  expressApp.get('/api/download/:folder/:file', (req, res) => {
    try {
      const activePath = getCurrentBackupPath(req)
      const { folder, file } = req.params
      const filePath = path.join(activePath, folder, file)

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Archivo no encontrado')
      }

      res.download(filePath, file)
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      res.status(500).send('Error al descargar archivo')
    }
  })

  // Endpoint: Estadísticas básicas (usa caché)
  expressApp.get('/api/stats', (req, res) => {
    try {
      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      if (cache.structure) {
        return res.json({
          totalFolders: cache.folders.length,
          totalFiles: cache.structure.totalFiles,
          totalSize: cache.structure.totalSize,
          lastBackup: new Date().toISOString(),
        })
      }

      res.json({
        totalFolders: 0,
        totalFiles: 0,
        totalSize: 0,
        lastBackup: null,
      })
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Health check
  expressApp.get('/api/health', (req, res) => {
    const activePath = getCurrentBackupPath(req)
    res.json({
      success: true,
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      backupPath: activePath,
    })
  })

  // API endpoint: estructura completa del backup (usa caché)
  expressApp.get('/api/backup/structure', (req, res) => {
    try {
      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      res.json(
        cache.structure || {
          path: getCurrentBackupPath(req),
          folders: [],
          totalFiles: 0,
          totalSize: 0,
          totalSizeFormatted: '0 B',
        },
      )
    } catch (error) {
      console.error('Error al obtener estructura:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // API endpoint: archivos de una carpeta específica (usa caché)
  expressApp.get('/api/backup/folder/:folderName', (req, res) => {
    try {
      const folderName = req.params.folderName

      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      // Buscar en caché
      if (cache.folderFiles[folderName]) {
        return res.json({
          folder: folderName,
          path: path.join(getCurrentBackupPath(req), folderName),
          files: cache.folderFiles[folderName],
          count: cache.folderFiles[folderName].length,
        })
      }

      res.json({
        folder: folderName,
        path: path.join(getCurrentBackupPath(req), folderName),
        files: [],
        count: 0,
      })
    } catch (error) {
      console.error('Error al leer carpeta:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // API endpoint: estadísticas detalladas (usa caché o calcula en tiempo real con filtros)
  expressApp.get('/api/backup/stats', async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query

      // Si hay filtro de fechas, calcular en tiempo real
      if (dateFrom || dateTo) {
        console.log('🔍 Calculando estadísticas con filtro de fechas:', { dateFrom, dateTo })
        const filteredStats = await loadBackupStats(getCurrentBackupPath(req), dateFrom, dateTo)
        return res.json(filteredStats)
      }

      // Sin filtros, usar caché
      if (!isCacheValid()) {
        console.log('⚠️ Caché expirada, actualizando...')
        updateCache(getCurrentBackupPath(req))
      }

      res.json(
        cache.stats || {
          pdf: 0,
          json: 0,
          xml: 0,
          images: 0,
          other: 0,
          total: 0,
          totalSize: 0,
          totalSizeFormatted: '0 B',
          recentFiles: 0,
          pairedInvoices: 0,
          pairedByFolder: { SA: 0, SM: 0, SS: 0, gastos: 0, remisiones: 0, notas_de_credito: 0 },
        },
      )
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // API endpoint: Abrir archivo PDF en el navegador
  expressApp.post('/api/backup/open-file', express.json(), (req, res) => {
    try {
      const { filePath } = req.body

      if (!filePath) {
        return res.status(400).json({ error: 'Ruta de archivo no proporcionada' })
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo no encontrado' })
      }

      const extension = path.extname(filePath).toLowerCase()

      // Servir PDF
      if (extension === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline')
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
      }
      // Servir JSON
      else if (extension === '.json') {
        res.setHeader('Content-Type', 'application/json')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        res.send(fileContent)
      }
      // Servir XML
      else if (extension === '.xml') {
        res.setHeader('Content-Type', 'application/xml')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        res.send(fileContent)
      }
      // Otros archivos de texto
      else if (['.txt', '.log', '.md'].includes(extension)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        res.send(fileContent)
      } else {
        return res.status(400).json({ error: 'Tipo de archivo no soportado' })
      }
    } catch (error) {
      console.error('Error al abrir archivo:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Iniciar servidor
  expressServer = expressApp.listen(3001, () => {
    console.log('✅ Servidor Express corriendo en http://localhost:3001')
  })

  expressServer.on('error', (error) => {
    console.error('❌ Error en servidor Express:', error)
  })

  // Iniciar actualización automática de caché
  startCacheAutoUpdate(backupPath)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    title: 'Visor de Backups Hermaco',
  })

  // En desarrollo, cargar desde Vite
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // En producción, esperar un momento y cargar
    console.log('⏳ Esperando al servidor Express...')
    setTimeout(() => {
      console.log('✅ Cargando aplicación...')
      mainWindow.loadURL('http://localhost:3001')
    }, 1500)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Iniciar aplicación
app.whenReady().then(() => {
  // Iniciar servidor Express
  startServer()

  // Crear ventana principal
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Cerrar servidor al salir
app.on('window-all-closed', () => {
  if (expressServer) {
    console.log('🔴 Cerrando servidor...')
    expressServer.close()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  // Limpiar interval de caché
  if (cacheUpdateInterval) {
    clearInterval(cacheUpdateInterval)
    console.log('🔴 Caché automática detenida')
  }

  if (expressServer) {
    expressServer.close()
  }
})

// IPC para obtener rutas
ipcMain.handle('get-backup-path', () => {
  return currentBackupPath || getAppDataPath()
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})
