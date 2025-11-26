# Script para iniciar modo desarrollo con Electron
# Uso: .\dev-electron.ps1

Write-Host "Iniciando Visor Hermaco en modo desarrollo..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Se abriran:" -ForegroundColor Yellow
Write-Host "   - Vite dev server (http://localhost:5173)" -ForegroundColor White
Write-Host "   - Ventana de Electron con DevTools" -ForegroundColor White
Write-Host ""
Write-Host "Tip: Los cambios en el codigo se recargaran automaticamente" -ForegroundColor Green
Write-Host ""

# Ejecutar en modo desarrollo
npm run electron:dev
