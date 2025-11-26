# Script para compilar el portable de Visor Hermaco
# Uso: .\build-portable.ps1

Write-Host "Compilando Visor Hermaco Portable..." -ForegroundColor Cyan
Write-Host ""

# Limpiar builds anteriores
if (Test-Path "dist") {
    Write-Host "Limpiando build anterior del frontend..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

if (Test-Path "dist-electron") {
    Write-Host "Limpiando build anterior de Electron..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist-electron"
}

Write-Host ""
Write-Host "Paso 1: Compilando frontend Vue.js..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al compilar el frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Paso 2: Empaquetando con Electron..." -ForegroundColor Green

# Usar target 'dir' que no requiere firma
npx electron-builder --win dir

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al empaquetar con Electron" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Compilacion exitosa!" -ForegroundColor Green
Write-Host ""
Write-Host "El portable se encuentra en: dist-electron/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Copia el archivo .exe al disco compartido"
Write-Host "   2. Asegurate de que la carpeta 'Backup' este junto al .exe"
Write-Host "   3. Ejecuta el .exe desde cualquier PC"
Write-Host ""
Write-Host "Ver PORTABLE-QUICKSTART.md para mas informacion" -ForegroundColor Cyan
Write-Host ""

# Mostrar archivos generados
if (Test-Path "dist-electron") {
    Write-Host "Archivos generados:" -ForegroundColor Cyan
    Get-ChildItem -Path "dist-electron" -Filter "*.exe" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   - $($_.Name) ($size MB)" -ForegroundColor White
    }
}
