const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let serverProcess

// Determinar la ruta base para datos
// En desarrollo: carpeta del proyecto
// En producción portable: carpeta donde está el ejecutable
function getAppDataPath() {
  if (app.isPackaged) {
    // Portable: buscar carpeta "Backup" junto al ejecutable
    return path.join(path.dirname(app.getPath('exe')), 'Backup')
  } else {
    // Desarrollo: usar ruta hardcodeada por ahora
    return 'C:/Dashboard/Backup'
  }
}

// Función para iniciar el servidor Express
function startServer() {
  const serverPath = path.join(__dirname, '..', 'server', 'index.js')
  const backupPath = getAppDataPath()

  console.log('🚀 Iniciando servidor...')
  console.log('📂 Ruta de datos:', backupPath)
  console.log('📄 Servidor:', serverPath)

  // Iniciar servidor con variable de entorno
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BACKUP_PATH: backupPath,
      PORT: '3001',
      ELECTRON_APP: 'true',
    },
    stdio: 'inherit',
  })

  serverProcess.on('error', (error) => {
    console.error('❌ Error al iniciar servidor:', error)
  })

  serverProcess.on('close', (code) => {
    console.log(`🔴 Servidor cerrado con código: ${code}`)
  })
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
    // En producción, cargar desde servidor local
    // Esperar un poco para que el servidor inicie
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3001')
    }, 2000)
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
  if (serverProcess) {
    console.log('🔴 Cerrando servidor...')
    serverProcess.kill()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})

// IPC para obtener rutas
ipcMain.handle('get-backup-path', () => {
  return getAppDataPath()
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})
