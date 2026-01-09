# Visor de Backups Hermaco

Sistema web para visualización y gestión de facturas de respaldo.

## 🚀 Requisitos

- Node.js 18+
- MongoDB 5.0+
- npm o pnpm

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

Crea un archivo `.env` con:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
BACKUP_PATH=J:/Henri/Copia de seguridad de facturas(No borrar)/Backup
MONGODB_URI=mongodb://adminHenri:123456@hermacoserver:27017/facturas-hermaco?authSource=admin
```

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev:all
```

Esto inicia:
- Frontend en `http://localhost:5173`
- Backend en `http://localhost:3001`

### Producción

```bash
npm run build
npm start
```

## 📁 Estructura

```
visor/
├── src/              # Código frontend (Vue 3)
│   ├── components/   # Componentes reutilizables
│   ├── modules/      # Módulos principales
│   ├── router/       # Rutas
│   ├── services/     # Servicios API
│   └── stores/       # Estado global (Pinia)
├── server/           # Código backend (Express)
│   ├── config/       # Configuración DB
│   ├── models/       # Modelos MongoDB
│   └── index.js      # Servidor principal
└── public/           # Archivos estáticos
```

## 🛠️ Tecnologías

- **Frontend**: Vue 3, TypeScript, UnoCSS, Vite
- **Backend**: Express, MongoDB, Mongoose
- **Utilidades**: Archiver (ZIP), CORS

## 📝 Scripts

- `npm run dev` - Servidor de desarrollo frontend
- `npm run dev:server` - Servidor backend
- `npm run dev:all` - Ambos servidores
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run format` - Formatear código

## 🔑 Características

- ✅ Visualización de facturas (PDF/JSON)
- ✅ Búsqueda y filtrado por fechas
- ✅ Gestión de clientes
- ✅ Facturas anuladas y notas de crédito
- ✅ Empaquetador (ZIP)
- ✅ Paginación configurable
- ✅ MongoDB para consultas rápidas
- ✅ Visor PDF integrado

## 📄 Licencia

Hermaco © 2026
