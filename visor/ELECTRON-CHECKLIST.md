# ✅ CHECKLIST - Conversión a Portable Electron

## Archivos Creados/Modificados

### ✅ Nuevos Archivos

- [x] `electron/main.js` - Proceso principal de Electron
- [x] `electron/preload.js` - Script de preload seguro
- [x] `electron/icon.ico` - Placeholder para ícono (reemplazar con real)
- [x] `electron-builder.json` - Configuración de empaquetado
- [x] `ELECTRON-README.md` - Documentación técnica completa
- [x] `PORTABLE-QUICKSTART.md` - Guía rápida para usuarios
- [x] `build-portable.ps1` - Script de compilación
- [x] `dev-electron.ps1` - Script para desarrollo
- [x] `resources/` - Carpeta para recursos adicionales

### ✅ Archivos Modificados

- [x] `package.json` - Agregadas dependencias y scripts de Electron
- [x] `server/index.js` - Sistema de rutas dinámicas
- [x] `.gitignore` - Ignorar builds de Electron
- [x] `README.md` - Documentación actualizada

## Dependencias Agregadas

```json
{
  "devDependencies": {
    "electron": "^33.2.0",
    "electron-builder": "^25.1.8",
    "wait-on": "^8.0.1"
  }
}
```

## Scripts NPM Disponibles

```bash
# Desarrollo
npm run electron:dev              # Modo desarrollo con Electron

# Producción
npm run electron:build            # Generar portable
npm run electron:build-installer  # Generar instalador NSIS

# Scripts PowerShell
.\build-portable.ps1              # Compilar todo
.\dev-electron.ps1                # Desarrollo rápido
```

## Sistema de Rutas Dinámicas

### Desarrollo

```
Ruta: C:/Dashboard/Backup (hardcodeada)
```

### Portable

```
Ruta: [Ubicación del .exe]/Backup (detectada automáticamente)
```

### Jerarquía de detección (server/index.js):

1. Variable de entorno `BACKUP_PATH` (prioridad)
2. Electron: busca carpeta junto al ejecutable
3. Desarrollo: ruta relativa al proyecto
4. Fallback: `C:/Dashboard/Backup`

## Estructura del Portable

```
DiscoCompartido/
├── Visor Hermaco-1.0.0-Portable.exe
└── Backup/
    ├── SA/
    ├── SM/
    ├── SS/
    ├── gastos/
    └── remisiones/
```

## Próximos Pasos

### 1. Instalar Dependencias

```powershell
npm install
```

### 2. Reemplazar Ícono

- Colocar archivo `.ico` real en `electron/icon.ico`
- Recomendado: 256x256 o superior

### 3. Probar en Desarrollo

```powershell
.\dev-electron.ps1
```

### 4. Compilar Portable

```powershell
.\build-portable.ps1
```

### 5. Probar el Portable

- Copiar `.exe` de `dist-electron/` a una carpeta temporal
- Crear carpeta `Backup` junto al .exe con datos de prueba
- Ejecutar y verificar

### 6. Distribuir

- Copiar al disco compartido
- Asegurar que `Backup` esté presente
- Documentar ubicación para usuarios

## Características del Portable

✅ **Ventajas:**

- No requiere instalación
- No requiere Node.js instalado
- Funciona desde red compartida
- Detecta rutas automáticamente
- Incluye todo lo necesario (~150-200 MB)

✅ **Compatible con:**

- Windows 10/11 x64
- Discos compartidos de red
- Ejecución sin permisos de administrador

⚠️ **Requisitos:**

- Carpeta `Backup` debe estar junto al .exe
- Permisos de lectura en la red
- 200 MB de espacio libre

## Solución de Problemas Comunes

### El portable no inicia

- Verificar que no esté bloqueado por Windows (click derecho > Propiedades > Desbloquear)
- Verificar antivirus

### No encuentra archivos

- Verificar que `Backup` esté en la misma carpeta
- Verificar permisos de lectura
- Ver logs: F12 en la ventana de Electron

### Error al compilar

```powershell
Remove-Item -Recurse -Force node_modules
npm install
.\build-portable.ps1
```

## Notas Técnicas

### Electron Main Process

- Inicia servidor Express en puerto 3001
- Pasa variable `BACKUP_PATH` al servidor
- Gestiona ventana principal
- Cierra servidor al salir

### Preload Script

- Expone APIs seguras al renderer
- Funciones: `getBackupPath()`, `getAppVersion()`

### Server Backend

- Detecta contexto (desarrollo/Electron/producción)
- Usa rutas dinámicas en lugar de hardcodeadas
- Endpoint `/api/system/info` para diagnóstico

## Testing

### Escenarios de prueba:

1. ✅ Desarrollo local (sin Electron)
2. ✅ Desarrollo con Electron
3. ⏳ Portable en misma PC
4. ⏳ Portable en otra PC (red)
5. ⏳ Portable en disco compartido

### Verificar:

- [x] Frontend carga correctamente
- [x] API responde
- [ ] Lee archivos de Backup
- [ ] Estadísticas se calculan
- [ ] Empaquetador funciona
- [ ] Explorador navega carpetas

---

**Estado:** ✅ Configuración completa - Listo para instalar dependencias y probar

**Última actualización:** 2025-11-26
