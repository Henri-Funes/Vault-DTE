# 🚀 Mini Backend - Visor de Backup

Backend Express integrado para leer y servir archivos del sistema de backup.

## 📁 Estructura de Carpetas Leída

```
C:\Dashboard\Backup\
├── gastos/                 - Facturas de gastos/salidas
├── notas_de_credito/       - Notas de crédito
├── remisiones/             - Facturas de remisión
├── SA/                     - Facturas Santa Ana
├── SM/                     - Facturas San Miguel
└── SS/                     - Facturas San Salvador
```

## 🔌 Endpoints Disponibles

### 1. Health Check

```
GET /api/health
```

Verifica que el servidor esté funcionando.

### 2. Estructura Completa

```
GET /api/backup/structure
```

Retorna toda la estructura del backup con todas las carpetas y archivos.

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "path": "C:\\Dashboard\\Backup",
    "folders": [...],
    "totalFiles": 3123,
    "totalSize": 2567890123,
    "totalSizeFormatted": "2.4 GB"
  }
}
```

### 3. Archivos por Carpeta

```
GET /api/backup/folder/:folderName
```

Obtiene todos los archivos de una carpeta específica (SS, SA, SM, etc.).

**Ejemplo:**

```
GET /api/backup/folder/SS
```

### 4. Estadísticas

```
GET /api/backup/stats
```

Retorna estadísticas de tipos de archivos por carpeta.

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "pdf": 1234,
    "json": 567,
    "xml": 890,
    "images": 432,
    "total": 3123,
    "totalSizeFormatted": "2.4 GB",
    "pairedInvoices": 456,
    "recentFiles": 23,
    "pairedByFolder": {
      "SA": 120,
      "SM": 98,
      "SS": 145,
      "gastos": 67,
      "remisiones": 26
    }
  }
}
```

### 5. Abrir PDF en Navegador

```
POST /api/backup/open-pdf
```

Abre un archivo PDF en el navegador.

**Body:**

```json
{
  "filePath": "C:\\Dashboard\\Backup\\SA\\factura.pdf"
}
```

### 6. Abrir JSON en Bloc de Notas

```
POST /api/backup/open-notepad
```

Abre un archivo JSON en el Bloc de Notas de Windows.

**Body:**

```json
{
  "filePath": "C:\\Dashboard\\Backup\\SA\\metadata.json"
}
```

### 7. Descargar Carpetas en ZIP

```
POST /api/backup/download-folders
```

Genera un archivo ZIP con las carpetas completas seleccionadas.

**Body:**

```json
{
  "folders": ["SA", "SM", "gastos"]
}
```

**Respuesta:**
Archivo ZIP descargable con las carpetas completas.

### 8. Descargar Archivos en ZIP

```
POST /api/backup/download-files
```

Genera un archivo ZIP con archivos específicos seleccionados.

**Body:**

```json
{
  "files": ["C:\\Dashboard\\Backup\\SA\\factura1.pdf", "C:\\Dashboard\\Backup\\SA\\factura2.pdf"],
  "folderName": "SA"
}
```

**Respuesta:**
Archivo ZIP descargable con los archivos seleccionados.

### 9. Estado del Caché

```
GET /api/health
```

Verifica el estado del servidor y del sistema de caché.

**Respuesta:**

```json
{
  "success": true,
  "message": "Backend funcionando correctamente",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "cacheStatus": {
    "loaded": true,
    "lastUpdate": "2025-11-21T10:25:00.000Z",
    "isLoading": false
  }
}
```

### 10. Limpiar Caché

```
POST /api/cache/clear
```

Limpia el caché manualmente. Los datos se recargarán en la próxima petición.

### 11. Recargar Caché

```
POST /api/cache/reload
```

Fuerza la recarga inmediata de todos los datos y actualiza el caché.

## ⚡ Sistema de Caché

El backend implementa un **sistema de caché inteligente** para mejorar el rendimiento con grandes volúmenes de datos:

### Características:

- **Duración:** 5 minutos (configurable)
- **Precarga:** Los datos se cargan automáticamente al iniciar el servidor
- **Caché compartida:** Todos los endpoints (structure, stats, folder) usan la misma caché
- **Thread-safe:** Evita cargas duplicadas simultáneas
- **Endpoints de control:** Limpiar y recargar caché manualmente

### Ventajas:

- ✅ Respuesta instantánea después de la primera carga
- ✅ Reduce carga del sistema de archivos
- ✅ Ideal para grandes volúmenes de datos
- ✅ Navegación fluida entre vistas sin retrasos

### Configuración:

Ajusta la duración del caché en `server/index.js`:

```javascript
// Tiempo de caché en milisegundos (5 minutos por defecto)
const CACHE_DURATION = 5 * 60 * 1000
```

## 🏃 Ejecutar

### Solo el backend:

```bash
npm run dev:server
```

El servidor correrá en `http://localhost:3001`

### Frontend + Backend juntos:

```bash
npm run dev:all
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## 🔧 Configuración

La ruta del backup se configura en `server/index.js`:

```javascript
const BACKUP_PATH = 'C:\\Dashboard\\Backup'
```

## 📝 Tipos de Archivos Soportados

- **PDF** - Facturas en formato PDF
- **JSON** - Metadatos y datos estructurados
- **XML** - Documentos electrónicos
- **Imágenes** - PNG, JPG, JPEG, GIF, SVG
- **Otros** - TXT, DOC, XLS, etc.

## 🔐 CORS

El servidor tiene CORS habilitado para permitir peticiones desde el frontend en desarrollo.

para actualizar la app

# 1. Recompilar el frontend (si modificaste Vue/frontend)

npm run build

# 2. Reiniciar la app en PM2 (lee los nuevos archivos)

pm2 restart visor-backup

# O usar el script helper:

.\pm2-commands.ps1 restart
