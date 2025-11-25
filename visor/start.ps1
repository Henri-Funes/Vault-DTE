# Script para iniciar el Visor de Backup

Write-Host "🚀 Iniciando Visor de Backup..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe la carpeta de backup
if (Test-Path "C:\Dashboard\Backup") {
    Write-Host "✅ Carpeta de backup encontrada: C:\Dashboard\Backup" -ForegroundColor Green
} else {
    Write-Host "❌ ADVERTENCIA: No se encontró la carpeta C:\Dashboard\Backup" -ForegroundColor Yellow
    Write-Host "   Por favor, verifica la ruta en server/index.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🎯 Iniciando servicios..." -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173 (o 5174 si 5173 está ocupado)" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "💡 Presiona Ctrl+C para detener los servicios" -ForegroundColor Yellow
Write-Host ""

npm run dev:all
