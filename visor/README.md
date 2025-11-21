# Visor de Backup - Hermaco

Visor sencillo para explorar archivos de backup almacenados en el servidor.

## 🚀 Servidor de Desarrollo

**Vue usa Vite como servidor de desarrollo por defecto** - es extremadamente rápido y tiene HMR (Hot Module Replacement).

### Iniciar el proyecto:

```sh
npm run dev
```

El servidor se levantará en `http://localhost:5173` por defecto.

## 🎨 Stack Tecnológico

- **Vue 3** - Framework frontend
- **TypeScript** - Tipado estático
- **UnoCSS** - Estilos utility-first (como Tailwind)
- **Vue Router** - Navegación
- **Pinia** - State management
- **Vite** - Build tool y dev server (⚡ súper rápido)

## 📦 Comandos Disponibles

```sh
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter
npm run format       # Formatear código
```

## 🐳 Docker

Para producción, montarás todo en Docker junto con el mini-backend.

## 📁 Estructura

```
src/
├── views/
│   └── Home.vue        # Vista principal del visor
├── components/         # Componentes reutilizables
├── stores/            # Estados de Pinia
├── router/            # Rutas
└── main.ts            # Entrada de la aplicación
```

## 🔧 Próximos Pasos

1. Crear el mini-backend para leer carpetas
2. Crear componentes para listar archivos
3. Implementar navegación de directorios
4. Preparar Dockerfile
