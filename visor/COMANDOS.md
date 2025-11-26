# ⚡ Comandos Rápidos - Visor Portable

## 🚀 Inicio Rápido

```powershell
# Desarrollo con Electron (recomendado)
.\dev-electron.ps1

# Compilar portable
.\build-portable.ps1
```

---

## 📋 Todos los Comandos Disponibles

### Desarrollo

```powershell
# Iniciar todo (Vite + Electron)
npm run electron:dev

# Solo frontend Vue (puerto 5173)
npm run dev

# Solo backend Express (puerto 3001)
npm run dev:server

# Frontend + Backend (sin Electron)
npm run dev:all

# Scripts PowerShell
.\dev-electron.ps1          # Desarrollo con Electron
.\start.ps1                 # Servidor legacy
```

### Compilación

```powershell
# Compilar frontend
npm run build

# Compilar portable
npm run electron:build

# Compilar instalador
npm run electron:build-installer

# Todo en uno (recomendado)
.\build-portable.ps1
```

### Utilidades

```powershell
# Verificar tipos TypeScript
npm run type-check

# Formatear código
npm run format

# Preview del build
npm run preview
```

---

## 🧪 Testing y Debugging

### Probar portable localmente

```powershell
# 1. Crear carpeta de prueba
$testPath = "C:\Temp\VisorTest"
New-Item -ItemType Directory -Path $testPath -Force

# 2. Copiar ejecutable
Copy-Item "dist-electron\*.exe" $testPath

# 3. Crear estructura de prueba
New-Item -ItemType Directory -Path "$testPath\Backup" -Force
New-Item -ItemType Directory -Path "$testPath\Backup\SA" -Force
New-Item -ItemType Directory -Path "$testPath\Backup\SM" -Force

# 4. Copiar algunos archivos de ejemplo (ajustar ruta)
Copy-Item "C:\Dashboard\Backup\SA\*.pdf" "$testPath\Backup\SA\" -ErrorAction SilentlyContinue

# 5. Ejecutar
cd $testPath
& ".\Visor Hermaco-1.0.0-Portable.exe"
```

### Ver información del sistema

```powershell
# Dentro de la app, ir a:
# http://localhost:3001/api/system/info

# O desde terminal (con la app corriendo):
Invoke-RestMethod -Uri "http://localhost:3001/api/system/info" | ConvertTo-Json
```

### Logs de Electron

```powershell
# En la ventana de Electron:
# Presionar F12 para abrir DevTools
# Ver pestaña Console
```

---

## 🔧 Mantenimiento

### Limpiar builds

```powershell
# Limpiar todo
Remove-Item -Recurse -Force dist, dist-electron -ErrorAction SilentlyContinue

# Limpiar y reconstruir
Remove-Item -Recurse -Force dist, dist-electron, node_modules -ErrorAction SilentlyContinue
npm install
.\build-portable.ps1
```

### Actualizar dependencias

```powershell
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (cuidado)
npm update

# Actualizar una específica
npm install electron@latest --save-dev
```

### Verificar instalación

```powershell
# Verificar Node.js
node --version          # Debe ser >= 18.0.0

# Verificar npm
npm --version

# Verificar Electron
npx electron --version

# Listar dependencias instaladas
npm list --depth=0
```

---

## 📦 Distribución

### Preparar para distribución

```powershell
# 1. Compilar versión final
.\build-portable.ps1

# 2. Verificar archivo generado
Get-ChildItem dist-electron\*.exe

# 3. Copiar al servidor compartido
$destino = "\\servidor\compartido\VisorHermaco"
New-Item -ItemType Directory -Path $destino -Force
Copy-Item "dist-electron\*.exe" $destino

# 4. Copiar carpeta Backup
Copy-Item "C:\Dashboard\Backup" "$destino\Backup" -Recurse -Force

# 5. Verificar estructura
Get-ChildItem -Path $destino -Recurse | Select-Object FullName
```

### Crear versión con instalador

```powershell
# Generar instalador NSIS (además del portable)
npm run electron:build-installer

# Se generarán dos archivos:
# - Visor Hermaco-1.0.0-Portable.exe (sin instalación)
# - Visor Hermaco-1.0.0-Setup.exe (con instalador)
```

---

## 🎯 Comandos por Escenario

### "Quiero desarrollar"

```powershell
.\dev-electron.ps1
```

### "Quiero crear el portable"

```powershell
.\build-portable.ps1
```

### "Tengo errores, quiero empezar de cero"

```powershell
Remove-Item -Recurse -Force node_modules, dist, dist-electron
npm install
.\build-portable.ps1
```

### "Quiero probar en otra carpeta"

```powershell
# Ver sección "Probar portable localmente" arriba
```

### "Quiero distribuir a los usuarios"

```powershell
# 1. Compilar
.\build-portable.ps1

# 2. Copiar a red
Copy-Item "dist-electron\*.exe" "\\servidor\compartido\VisorHermaco\"
Copy-Item "C:\Dashboard\Backup" "\\servidor\compartido\VisorHermaco\Backup" -Recurse

# 3. Informar a usuarios de la ruta:
# \\servidor\compartido\VisorHermaco\Visor Hermaco-1.0.0-Portable.exe
```

---

## 🆘 Troubleshooting Rápido

### Error: "Cannot find module"

```powershell
npm install
```

### Error: "Port 3001 already in use"

```powershell
# Matar proceso en puerto 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Error: "electron-builder not found"

```powershell
npm install electron-builder --save-dev
```

### Error al ejecutar .exe: "Windows protected your PC"

```powershell
# Click en "More info" → "Run anyway"
# O desbloquear:
Unblock-File "dist-electron\*.exe"
```

### El portable no encuentra Backup

```powershell
# Verificar estructura
cd ruta\del\portable
Get-ChildItem

# Debe mostrar:
#   Backup/ (carpeta)
#   Visor Hermaco-1.0.0-Portable.exe
```

---

## 📊 Información Útil

### Puertos usados

- **3001**: Servidor Express (backend API)
- **5173**: Vite dev server (solo desarrollo)

### Archivos importantes

- `electron/main.js`: Proceso principal
- `server/index.js`: Backend API
- `dist/`: Build del frontend
- `dist-electron/`: Portable compilado

### Tamaños aproximados

- `node_modules/`: ~500 MB
- `dist/`: ~2-5 MB
- Portable .exe: ~150-200 MB

---

## 🔗 Enlaces Rápidos a Documentación

- [CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md) - Resumen completo
- [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md) - Guía rápida
- [ELECTRON-README.md](ELECTRON-README.md) - Documentación técnica
- [TESTING-GUIDE.md](TESTING-GUIDE.md) - Guía de pruebas
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema

---

**💡 Tip:** Mantén este archivo abierto como referencia rápida
