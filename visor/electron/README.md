# 📁 Carpeta Electron

Esta carpeta contiene los archivos principales de Electron para convertir la app Vue en una aplicación de escritorio.

## Archivos

### `main.js` - Proceso Principal

**Función:** Proceso principal de Electron (backend de la app de escritorio)

**Responsabilidades:**

- Detectar ubicación del ejecutable
- Buscar carpeta `Backup` junto al .exe
- Iniciar servidor Express con ruta detectada
- Crear ventana principal (BrowserWindow)
- Gestionar ciclo de vida de la app
- Cerrar servidor al salir

**APIs expuestas:**

- `get-backup-path` → Retorna ruta de Backup detectada
- `get-app-version` → Retorna versión de la app

### `preload.js` - Script de Preload

**Función:** Puente seguro entre Main y Renderer process

**Responsabilidades:**

- Exponer APIs seguras al renderer (Vue)
- Implementar Context Isolation
- Comunicación IPC segura

**APIs disponibles en renderer:**

```javascript
window.electronAPI.getBackupPath() // → string
window.electronAPI.getAppVersion() // → string
window.electronAPI.platform // → 'win32' | 'darwin' | 'linux'
```

### `icon.ico` - Ícono de la Aplicación

**Función:** Ícono del ejecutable y ventana

**Notas:**

- Actualmente es un placeholder
- Reemplazar con ícono real antes de distribución
- Formato: `.ico` (Windows)
- Tamaño recomendado: 256x256 o superior
- Herramientas: [Convertio](https://convertio.co/png-ico/), [ICO Convert](https://icoconvert.com/)

## Flujo de Ejecución

```
1. Usuario ejecuta .exe
   │
   ├─► Electron inicia
   │
2. main.js se ejecuta
   │
   ├─► Detecta ubicación del .exe
   │   └─► getAppDataPath()
   │
   ├─► Inicia servidor Express
   │   └─► spawn('node', ['server/index.js'])
   │       └─► env: BACKUP_PATH = ruta detectada
   │
   └─► Crea ventana (BrowserWindow)
       │
       ├─► Carga preload.js
       │   └─► Expone electronAPI
       │
       └─► Carga http://localhost:3001
           └─► Muestra frontend Vue
```

## Configuración de Seguridad

```javascript
webPreferences: {
  nodeIntegration: false,      // ✅ Node.js no disponible en renderer
  contextIsolation: true,      // ✅ Sandbox habilitado
  preload: path.join(__dirname, 'preload.js')  // ✅ APIs controladas
}
```

## Variables de Entorno Inyectadas

El main process inyecta estas variables al servidor Express:

```javascript
{
  NODE_ENV: 'production',      // Modo producción
  BACKUP_PATH: ruta_detectada, // Ruta de la carpeta Backup
  PORT: '3001',                // Puerto del servidor
  ELECTRON_APP: 'true'         // Flag para indicar que es Electron
}
```

## Detección de Rutas

### En Desarrollo (`!app.isPackaged`)

```javascript
return 'C:/Dashboard/Backup' // Ruta hardcodeada
```

### En Portable (`app.isPackaged`)

```javascript
return path.join(
  path.dirname(app.getPath('exe')), // Directorio del .exe
  'Backup', // Buscar carpeta Backup
)
```

**Ejemplo:**

```
Si el .exe está en: C:\Temp\VisorTest\Visor.exe
Buscará Backup en: C:\Temp\VisorTest\Backup
```

## Modificaciones Comunes

### Cambiar puerto del servidor

```javascript
// main.js línea ~40
PORT: '3001' // Cambiar a otro puerto
```

### Agregar nueva API IPC

```javascript
// 1. En main.js
ipcMain.handle('nombre-de-api', (event, args) => {
  return tuLogica(args)
})

// 2. En preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  tuAPI: (args) => ipcRenderer.invoke('nombre-de-api', args),
})

// 3. Usar en Vue
const resultado = await window.electronAPI.tuAPI(parametros)
```

### Cambiar tamaño de ventana

```javascript
// main.js línea ~50
mainWindow = new BrowserWindow({
  width: 1400,  // Cambiar ancho
  height: 900,  // Cambiar alto
  ...
})
```

### Habilitar/deshabilitar DevTools

```javascript
// main.js línea ~70
if (!app.isPackaged) {
  mainWindow.webContents.openDevTools() // Solo en dev
}

// Para habilitar en producción también:
mainWindow.webContents.openDevTools() // Descomentar
```

## Debugging

### Ver logs del main process

Los `console.log()` en `main.js` aparecen en:

- Terminal donde ejecutaste el .exe
- O en la consola de Electron si está habilitada

### Ver logs del renderer process

Abrir DevTools en la ventana:

- `F12`
- `Ctrl+Shift+I`

### Ver variables de entorno inyectadas

En el servidor (server/index.js):

```javascript
console.log('BACKUP_PATH:', process.env.BACKUP_PATH)
console.log('IS_ELECTRON:', process.env.ELECTRON_APP)
```

## Archivos Relacionados

- `../electron-builder.json` - Configuración de empaquetado
- `../server/index.js` - Backend que recibe BACKUP_PATH
- `../package.json` - Scripts y configuración principal

## Recursos

- [Electron Docs](https://www.electronjs.org/docs/latest/)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [electron-builder](https://www.electron.build/)

## Notas

- **No modificar** sin entender Context Isolation
- **Siempre probar** en modo desarrollo antes de compilar
- **Logs importantes** ayudan al debugging en producción
- **Ícono** actualizar antes de distribuir
