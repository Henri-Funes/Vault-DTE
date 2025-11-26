# 📊 Visor de Backups Hermaco

Aplicación para visualizar y gestionar backups de facturas con soporte para:

- Explorador de archivos
- Estadísticas en tiempo real
- Empaquetador de facturas
- **Versión portable para Windows** ⭐

---

## 🚀 Inicio Rápido

### ⭐ Versión Portable (Recomendado para producción)

```powershell
# 1. Instalar dependencias
npm install

# 2. Compilar portable
.\build-portable.ps1

# 3. El .exe estará en dist-electron/
# Copiar junto con la carpeta Backup al disco compartido
```

**Ver [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md) para instrucciones de uso.**

---

## 🛠️ Desarrollo

### Modo Desarrollo Web (sin Electron)

```sh
npm run dev:all
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

### Modo Desarrollo con Electron

```powershell
.\dev-electron.ps1
# o
npm run electron:dev
```

Abre una ventana de Electron con DevTools y hot-reload.

### Comandos individuales:

```sh
npm run dev          # Solo frontend (Vite)
npm run dev:server   # Solo backend (Express)
```

---

## 📦 Portable para Producción

### Estructura Requerida

```
DiscoCompartido/
├── Visor Hermaco-1.0.0-Portable.exe    ← Ejecutable
└── Backup/                              ← Datos (IMPORTANTE)
    ├── SA/
    ├── SM/
    ├── SS/
    ├── gastos/
    └── remisiones/
```

**⚠️ La carpeta `Backup` DEBE estar junto al .exe**

### Compilar Portable

```powershell
# Método 1: Script automático
.\build-portable.ps1

# Método 2: Manual
npm run build
npm run electron:build
```

### Uso en Red

```
\\servidor\compartido\VisorHermaco\
├── Visor Hermaco-1.0.0-Portable.exe
└── Backup\

# Ejecutar desde cualquier PC:
\\servidor\compartido\VisorHermaco\Visor Hermaco-1.0.0-Portable.exe
```

---

## 🎨 Stack Tecnológico

### Frontend:

- **Vue 3** - Framework frontend
- **TypeScript** - Tipado estático
- **UnoCSS** - Estilos utility-first (como Tailwind)
- **Vue Router** - Navegación
- **Pinia** - State management
- **Vite** - Build tool y dev server (⚡ súper rápido)

### Backend:

- **Express** - Mini servidor Node.js
- **CORS** - Comunicación frontend-backend
- **Archiver** - Generación de archivos ZIP
- **Sistema de Caché** - Caché inteligente de 5 minutos para alto rendimiento

### Desktop:

- **Electron** - App de escritorio multiplataforma
- **electron-builder** - Empaquetado portable
- **Sistema de rutas dinámicas** - Detecta ubicación automáticamente

---

## 📁 Estructura del Proyecto

```
visor/
├── src/
│   ├── views/
│   │   └── Home.vue           # Dashboard principal
│   ├── modules/
│   │   ├── Estadisticas.vue   # Módulo de estadísticas
│   │   ├── Explorer.vue       # Explorador de archivos
│   │   └── Empaquetador.vue   # Descarga ZIP/RAR
│   ├── services/
│   │   └── api.ts             # Cliente API
│   ├── router/
│   └── main.ts
├── server/
│   ├── index.js               # Backend Express
│   └── README.md              # Documentación API
└── package.json
```

## 📦 Comandos Disponibles

```sh
npm run dev:all      # Frontend + Backend
npm run dev          # Solo frontend
npm run dev:server   # Solo backend
npm run build        # Build de producción
npm run preview      # Preview del build
npm run format       # Formatear código
```

## 📂 Estructura de Backup Leída

El sistema lee archivos de: `C:\Dashboard\Backup\`

```
Backup/
├── gastos/                 - Facturas de gastos
├── notas_de_credito/       - Notas de crédito
├── remisiones/             - Facturas de remisión
├── SA/                     - Facturas Santa Ana
├── SM/                     - Facturas San Miguel
└── SS/                     - Facturas San Salvador
```

## 🐳 Docker

Para producción, la aplicación está completamente dockerizada:

```bash
# Construir y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

**Características Docker:**

- ✅ Frontend + Backend en un solo contenedor
- ✅ Puerto único: 3001
- ✅ Volumen montado en modo lectura (protege tus archivos)
- ✅ Healthcheck automático
- ✅ Caché persistente de 5 minutos
- ✅ Actualización automática de datos

📖 **Guía completa:** Ver [DOCKER.md](./DOCKER.md)

## 🔧 Características Implementadas

✅ Dashboard moderno con pestañas
✅ Módulo de estadísticas por tipo de archivo y ubicación (H1-SA, H2-SM, H4-SS, Gastos, Remisiones)
✅ Explorador con búsqueda y doble click
✅ Apertura de PDFs en navegador (doble click)
✅ Apertura de JSONs en Bloc de Notas (doble click)
✅ Empaquetador con selección de carpetas completas
✅ Empaquetador con navegación dentro de carpetas
✅ Selección múltiple de archivos con checkboxes
✅ Generación de archivos ZIP para descarga
✅ Búsqueda de archivos dentro de carpetas
✅ Backend Express para leer carpetas y generar ZIPs
✅ **Sistema de caché inteligente (5 minutos) para alto rendimiento**
✅ **Precarga de datos al iniciar el servidor**
✅ API REST completa con endpoints de apertura y descarga
✅ Diseño pantalla completa
✅ Paleta de colores azul suave
✅ Conteo de facturas pareadas (PDF + JSON con mismo DTE)
✅ Panel de tamaño total en footer

## 🎯 Próximos Pasos

1. ✅ ~~Crear el mini-backend para leer carpetas~~
2. ✅ ~~Crear componentes para listar archivos~~
3. ✅ ~~Conectar componentes con API real~~
4. ✅ ~~Implementar apertura de archivos (PDFs y JSONs)~~
5. ✅ ~~Preparar Dockerfile y configuración Docker~~
6. 🔄 Generar imagen Docker y desplegar

## 📚 Documentación Adicional

- [DOCKER.md](./DOCKER.md) - Guía completa de Docker
- [QUICKSTART-DOCKER.md](./QUICKSTART-DOCKER.md) - Inicio rápido con Docker
- [server/README.md](./server/README.md) - Documentación de la API
