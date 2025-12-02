# Script para compilar la aplicacion Visor de Backups Hermaco
# ================================================================

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Compilacion Visor de Backups Hermaco" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar node_modules
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudieron instalar las dependencias" -ForegroundColor Red
        exit 1
    }
}

# Limpiar builds anteriores
Write-Host ""
Write-Host "Limpiando builds anteriores..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "   OK: Carpeta dist eliminada" -ForegroundColor Gray
}

if (Test-Path "dist-electron") {
    Remove-Item -Recurse -Force "dist-electron" -ErrorAction SilentlyContinue
    Write-Host "   OK: Carpeta dist-electron eliminada" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Paso 1/2: Compilando Frontend Vue.js" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: No se pudo compilar el frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK: Frontend compilado exitosamente" -ForegroundColor Green

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Paso 2/2: Empaquetando con Electron Builder" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTA: Esto puede tomar varios minutos..." -ForegroundColor Yellow
Write-Host ""

npm run electron:build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: No se pudo empaquetar con Electron" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  COMPILACION EXITOSA!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

# Mostrar archivos generados
if (Test-Path "dist-electron") {
    Write-Host "Archivos generados:" -ForegroundColor Cyan
    Write-Host ""
    $exeFiles = Get-ChildItem -Path "dist-electron" -Filter "*.exe"
    foreach ($file in $exeFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        Write-Host "   OK: $($file.Name)" -ForegroundColor White
        Write-Host "     Tamanio: $size MB" -ForegroundColor Gray
        Write-Host "     Ubicacion: dist-electron\$($file.Name)" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Proximos Pasos" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Localiza el ejecutable:" -ForegroundColor White
Write-Host "   dist-electron\*.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copia junto con el .env:" -ForegroundColor White
Write-Host "   - Copia el .exe" -ForegroundColor Gray
Write-Host "   - Copia el archivo .env al mismo directorio" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ejecuta desde cualquier PC:" -ForegroundColor White
Write-Host "   - El .env debe tener la ruta correcta del backup" -ForegroundColor Gray
Write-Host "   - Ejemplo: BACKUP_PATH=J:/Henri/Copia de seguridad.../Backup" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Caracteristicas incluidas:" -ForegroundColor White
Write-Host "   - Sistema de cache inteligente" -ForegroundColor Gray
Write-Host "   - Actualizacion automatica cada 5 minutos" -ForegroundColor Gray
Write-Host "   - Pantalla de carga profesional" -ForegroundColor Gray
Write-Host "   - Configuracion flexible desde .env" -ForegroundColor Gray
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentacion:" -ForegroundColor Cyan
Write-Host "   - BUILD-GUIDE.md - Guia completa" -ForegroundColor Gray
Write-Host "   - CONFIGURACION-RED.md - Configuracion de rutas" -ForegroundColor Gray
Write-Host "   - CACHE-SYSTEM.md - Sistema de cache" -ForegroundColor Gray
Write-Host ""
Write-Host "Listo para distribuir!" -ForegroundColor Green
Write-Host ""
