# Visor de Backup - Hermaco

Visor sencillo para explorar archivos de backup almacenados en el servidor.

## 🚀 Servidor de Desarrollo

**Vue usa Vite como servidor de desarrollo por defecto** - es extremadamente rápido y tiene HMR (Hot Module Replacement).

### Iniciar el proyecto completo (Frontend + Backend):

```sh
npm run dev:all
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

### Comandos individuales:

```sh
npm run dev          # Solo frontend
npm run dev:server   # Solo backend
```

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
