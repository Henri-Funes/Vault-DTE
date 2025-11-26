# 📦 Visor de Backups Hermaco - Versión Portable

## 🎯 ¿Qué es esto?

Esta es la versión portable del Visor de Backups Hermaco, empaquetada con Electron para funcionar como una aplicación de escritorio autónoma.

## 🚀 Uso del Portable

### Estructura de Carpetas Requerida

Para que el portable funcione correctamente en el disco compartido, debe tener esta estructura:

```
DiscoCompartido/
├── Visor Hermaco-1.0.0-Portable.exe    ← El ejecutable
└── Backup/                              ← Carpeta de datos (IMPORTANTE)
    ├── SA/
    ├── SM/
    ├── SS/
    ├── gastos/
    └── remisiones/
```

### ⚠️ IMPORTANTE

1. **La carpeta `Backup` debe estar junto al ejecutable** en la misma carpeta
2. El ejecutable buscará automáticamente la carpeta `Backup` en su ubicación
3. **No necesita instalación** - solo copia el .exe y la carpeta Backup
4. Funciona desde cualquier PC que tenga acceso al disco compartido

### Pasos para usar:

1. Copiar el ejecutable `Visor Hermaco-1.0.0-Portable.exe` al disco compartido
2. Asegurarse de que la carpeta `Backup` esté en la misma ubicación
3. Ejecutar el .exe desde cualquier PC con acceso al disco compartido
4. La aplicación abrirá automáticamente y leerá los datos de la carpeta Backup

## 🛠️ Desarrollo

### Instalar dependencias

```powershell
npm install
```

### Modo desarrollo (con Electron)

```powershell
# Terminal 1: Iniciar Vite dev server
npm run dev

# Terminal 2: Iniciar Electron (en otra terminal)
npm run electron:dev
```

O usar el comando combinado:

```powershell
npm run electron:dev
```

### Compilar y empaquetar

```powershell
# 1. Compilar el frontend
npm run build

# 2. Generar el portable
npm run electron:build

# O todo en uno:
npm run electron:build
```

El portable se generará en la carpeta `dist-electron/`.

### Generar instalador (opcional)

Si prefieres un instalador en lugar de portable:

```powershell
npm run electron:build-installer
```

## 📁 Estructura del Proyecto

```
visor/
├── electron/               ← Archivos de Electron
│   ├── main.js            ← Proceso principal de Electron
│   ├── preload.js         ← Script de preload
│   └── icon.ico           ← Ícono de la aplicación
├── server/                ← Backend Express
│   └── index.js           ← Servidor con rutas dinámicas
├── src/                   ← Frontend Vue.js
├── dist/                  ← Build del frontend (generado)
├── dist-electron/         ← Portable empaquetado (generado)
├── package.json
└── electron-builder.json  ← Configuración del empaquetado
```

## 🔧 Cómo funciona el sistema de rutas

### En Desarrollo

- Usa la ruta hardcodeada `C:/Dashboard/Backup`
- El servidor corre en puerto 3001
- Vite dev server en puerto 5173

### En Portable

- El ejecutable detecta automáticamente su ubicación
- Busca la carpeta `Backup` en el mismo directorio
- Todo el servidor y frontend van empaquetados
- No requiere instalación de Node.js

### Ejemplo de uso en red:

```
\\servidor\compartido\VisorHermaco\
├── Visor Hermaco-1.0.0-Portable.exe
└── Backup\
    └── ... (tus carpetas de facturas)

Cualquier PC puede ejecutar:
\\servidor\compartido\VisorHermaco\Visor Hermaco-1.0.0-Portable.exe
```

## 🐛 Solución de problemas

### El portable no encuentra la carpeta Backup

1. Verificar que `Backup` esté en la misma carpeta que el .exe
2. Verificar permisos de lectura en la carpeta compartida
3. Ver logs en la consola de Electron (F12 o Ctrl+Shift+I)

### Errores al compilar

```powershell
# Limpiar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Ver logs del servidor

El servidor muestra logs en la consola de Electron:

- Ruta de backup detectada
- Estado de carga de datos
- Errores de acceso a archivos

## 📝 Notas Adicionales

- **Tamaño del portable**: ~150-200 MB (incluye Chromium + Node.js)
- **Requisitos**: Windows 10/11 x64
- **Red**: Funciona en red local y discos compartidos
- **Seguridad**: No requiere privilegios de administrador

## 🎨 Personalización

### Cambiar ícono

Reemplaza `electron/icon.ico` con tu propio ícono (formato .ico)

### Cambiar nombre del producto

Edita `package.json`:

```json
{
  "name": "tu-nombre",
  "author": "Tu Empresa",
  "description": "Tu descripción"
}
```

## 📞 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
