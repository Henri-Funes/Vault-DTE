# 🏗️ Arquitectura del Visor Portable

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON APP                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Electron Main Process                   │  │
│  │  (electron/main.js)                               │  │
│  │                                                    │  │
│  │  - Detecta ubicación del .exe                     │  │
│  │  - Busca carpeta Backup                           │  │
│  │  - Inicia servidor Express                        │  │
│  │  - Crea ventana principal                         │  │
│  │  - Gestiona IPC                                   │  │
│  └────────────────┬──────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐  │
│  │         Express Server (Backend)                  │  │
│  │  (server/index.js)                                │  │
│  │                                                    │  │
│  │  - Puerto 3001                                    │  │
│  │  - Sistema de rutas dinámicas                     │  │
│  │  - Caché inteligente (5 min)                      │  │
│  │  - Lee archivos de Backup/                        │  │
│  │  - APIs REST:                                     │  │
│  │    • /api/backup/structure                        │  │
│  │    • /api/backup/stats                            │  │
│  │    • /api/backup/folder/:name                     │  │
│  │    • /api/package/create                          │  │
│  │    • /api/system/info                             │  │
│  └────────────────┬──────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐  │
│  │      BrowserWindow (Renderer Process)             │  │
│  │  (Chromium + Vue.js App)                          │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │         Vue 3 Frontend                       │ │  │
│  │  │  (dist/ - Build de Vite)                     │ │  │
│  │  │                                              │ │  │
│  │  │  Components:                                 │ │  │
│  │  │  - Explorer.vue    (navegar archivos)       │ │  │
│  │  │  - Estadisticas.vue (gráficos)              │ │  │
│  │  │  - Empaquetador.vue (crear ZIPs)            │ │  │
│  │  │                                              │ │  │
│  │  │  Services:                                   │ │  │
│  │  │  - api.ts (consume backend)                 │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Lee archivos
                            ▼
              ┌──────────────────────────┐
              │    Carpeta Backup/       │
              │  (Junto al .exe)         │
              │                          │
              │  ├── SA/                 │
              │  ├── SM/                 │
              │  ├── SS/                 │
              │  ├── gastos/             │
              │  └── remisiones/         │
              └──────────────────────────┘
```

## Flujo de Datos

### 1. Inicio de Aplicación

```
Usuario ejecuta .exe
    │
    ▼
Electron Main Process
    │
    ├─► Detectar ubicación: process.cwd()
    │
    ├─► Buscar carpeta Backup
    │   └─► [exe_location]/Backup
    │
    ├─► Iniciar servidor Express
    │   └─► BACKUP_PATH = ruta detectada
    │
    └─► Crear ventana BrowserWindow
        └─► Cargar http://localhost:3001
```

### 2. Carga de Datos

```
Frontend Vue carga
    │
    ▼
Llama GET /api/backup/structure
    │
    ▼
Express Server
    │
    ├─► ¿Hay caché válida?
    │   ├─► SÍ: Retorna datos en caché
    │   └─► NO: Continúa ▼
    │
    ├─► fs.readdir(BACKUP_PATH)
    │
    ├─► Itera carpetas (SA, SM, SS, etc)
    │
    ├─► Lee archivos de cada carpeta
    │
    ├─► Calcula estadísticas
    │
    ├─► Guarda en caché (5 min)
    │
    └─► Retorna JSON al frontend
        │
        ▼
    Frontend renderiza datos
```

### 3. Detección de Rutas (server/index.js)

```javascript
function getBackupPath() {
  // Prioridad 1: Variable de entorno
  if (process.env.BACKUP_PATH) {
    return process.env.BACKUP_PATH
  }

  // Prioridad 2: Modo Electron
  if (IS_ELECTRON) {
    // Buscar junto al ejecutable
    return path.join(__dirname, '..', '..', 'Backup')
  }

  // Prioridad 3: Desarrollo
  if (NODE_ENV === 'development') {
    return path.join(__dirname, '..', 'Backup')
  }

  // Fallback: ruta hardcodeada
  return 'C:/Dashboard/Backup'
}
```

## Empaquetado con electron-builder

### Proceso de Build

```
npm run build
    │ (Vite compila Vue → dist/)
    │
    ▼
npm run electron:build
    │ (electron-builder)
    │
    ├─► Copia archivos:
    │   ├── dist/ (frontend compilado)
    │   ├── server/ (backend)
    │   ├── electron/ (main + preload)
    │   ├── node_modules/
    │   └── package.json
    │
    ├─► Empaqueta con Chromium + Node.js
    │
    ├─► Genera portable.exe
    │   └── [productName]-[version]-Portable.exe
    │
    └─► Output: dist-electron/
```

### Contenido del .exe

```
Visor Hermaco-1.0.0-Portable.exe
│
├── Chromium (motor de navegador)
├── Node.js runtime
├── electron/
│   ├── main.js
│   └── preload.js
├── server/
│   └── index.js
├── dist/
│   └── [Frontend Vue compilado]
└── node_modules/
    └── [Dependencias]
```

**Tamaño aproximado:** 150-200 MB

## Comunicación entre Procesos

### IPC (Inter-Process Communication)

```
Main Process          Preload            Renderer (Vue)
(main.js)            (preload.js)       (Frontend)
     │                    │                   │
     │◄───registerHandler──┤                  │
     │                    │                   │
     │                    │◄──invoke('get-backup-path')
     │◄────handle()───────┤                   │
     │                    │                   │
     ├──return path───────►                   │
     │                    ├──return──────────►│
     │                    │                   │
```

### Ejemplo de uso:

```javascript
// Main Process (main.js)
ipcMain.handle('get-backup-path', () => {
  return getAppDataPath()
})

// Preload (preload.js)
contextBridge.exposeInMainWorld('electronAPI', {
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),
})

// Renderer (Vue)
const backupPath = await window.electronAPI.getBackupPath()
```

## Seguridad

### Context Isolation

- ✅ `contextIsolation: true` - Sandbox habilitado
- ✅ `nodeIntegration: false` - Node.js no disponible en renderer
- ✅ Preload script expone solo APIs necesarias

### Comunicación Segura

- Frontend → Backend: HTTP REST (localhost:3001)
- Frontend → Main Process: IPC con APIs controladas
- Archivos: Acceso solo por backend, no directamente desde renderer

## Ventajas de esta Arquitectura

### ✅ Portabilidad

- Un solo .exe contiene todo
- No requiere instalación
- Incluye runtime completo

### ✅ Seguridad

- Sandbox de Chromium
- Context isolation
- APIs controladas

### ✅ Rutas Dinámicas

- Detecta ubicación automáticamente
- Funciona desde cualquier ruta
- Compatible con discos compartidos

### ✅ Rendimiento

- Caché inteligente
- HMR en desarrollo
- Build optimizado

### ✅ Mantenibilidad

- Código separado por capas
- Misma base de código para web y desktop
- Fácil de actualizar

## Comparación: Desarrollo vs Producción

| Aspecto      | Desarrollo       | Portable            |
| ------------ | ---------------- | ------------------- |
| Frontend     | Vite (port 5173) | Servido por Express |
| Backend      | Express (3001)   | Express (3001)      |
| Ruta Backup  | Hardcodeada      | Auto-detectada      |
| Hot Reload   | ✅ Sí            | ❌ No               |
| DevTools     | ✅ Abierto       | Cerrado (F12)       |
| Tamaño       | N/A              | ~150-200 MB         |
| Dependencias | node_modules/    | Empaquetadas        |

---

**Documentación técnica completa - Arquitectura Electron**
