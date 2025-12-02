# Script para compilar la aplicación Visor de Backups Hermaco
# ================================================================
# Este script genera el ejecutable portable con todas las optimizaciones

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📦 Compilación Visor de Backups Hermaco" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  ADVERTENCIA: No existe archivo .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Se recomienda configurar el .env antes de compilar:" -ForegroundColor White
    Write-Host "   1. Ejecuta: .\configure.ps1" -ForegroundColor Gray
    Write-Host "   2. O copia .env.example a .env y configura la ruta" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "¿Continuar de todos modos? (S/N)"
    if (($continue -ne "S") -and ($continue -ne "s")) {
        Write-Host "❌ Compilación cancelada" -ForegroundColor Red
        exit 0
    }
}

# Verificar node_modules
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}

# Limpiar builds anteriores
Write-Host ""
Write-Host "🧹 Limpiando builds anteriores..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   ✓ Carpeta dist eliminada" -ForegroundColor Gray
}

if (Test-Path "dist-electron") {
    Remove-Item -Recurse -Force "dist-electron"
    Write-Host "   ✓ Carpeta dist-electron eliminada" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Paso 1/3: Compilando Frontend Vue.js" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR al compilar el frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Paso 2/3: Verificando Type Check" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

# Ejecutar type check (opcional, pero recomendado)
Write-Host "⏩ Omitiendo type check (opcional)" -ForegroundColor Gray

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Paso 3/3: Empaquetando con Electron Builder" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Esto puede tomar varios minutos..." -ForegroundColor Yellow
Write-Host ""

# Generar portable
npm run electron:build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR al empaquetar con Electron" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ ¡COMPILACIÓN EXITOSA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Mostrar archivos generados
if (Test-Path "dist-electron") {
    Write-Host "📦 Archivos generados:" -ForegroundColor Cyan
    Write-Host ""
    Get-ChildItem -Path "dist-electron" -Filter "*.exe" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   ✓ $($_.Name)" -ForegroundColor White
        Write-Host "     Tamaño: $size MB" -ForegroundColor Gray
        Write-Host "     Ubicación: dist-electron\$($_.Name)" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 Próximos Pasos" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📂 Localiza el ejecutable:" -ForegroundColor White
Write-Host "   dist-electron\*.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 📋 Copia junto con el .env:" -ForegroundColor White
Write-Host "   - Copia el .exe" -ForegroundColor Gray
Write-Host "   - Copia el archivo .env al mismo directorio" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 Ejecuta desde cualquier PC:" -ForegroundColor White
Write-Host "   - El .env debe tener la ruta correcta del backup" -ForegroundColor Gray
Write-Host "   - Ejemplo: BACKUP_PATH=J:/Henri/Copia de seguridad.../Backup" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 💡 Sistema de caché activado:" -ForegroundColor White
Write-Host "   - Primera carga: lee del disco" -ForegroundColor Gray
Write-Host "   - Después: respuestas instantáneas desde RAM" -ForegroundColor Gray
Write-Host "   - Actualización automática cada 5 minutos" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentación adicional:" -ForegroundColor Cyan
Write-Host "   - PORTABLE-QUICKSTART.md - Guía rápida" -ForegroundColor Gray
Write-Host "   - CONFIGURACION-RED.md - Configuración de rutas" -ForegroundColor Gray
Write-Host "   - CACHE-SYSTEM.md - Sistema de caché" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ ¡Listo para usar!" -ForegroundColor Green
Write-Host ""
