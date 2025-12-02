# Script para iniciar la aplicación en modo producción
# Para Windows Server

Write-Host "🚀 Iniciando Visor de Backup en modo PRODUCCIÓN" -ForegroundColor Green
Write-Host ""

# Verificar que exista la carpeta dist
if (-Not (Test-Path ".\dist")) {
    Write-Host "❌ Error: No existe la carpeta 'dist'" -ForegroundColor Red
    Write-Host "   Ejecuta primero: npm run build" -ForegroundColor Yellow
    exit 1
}

# Verificar que exista el servidor
if (-Not (Test-Path ".\server\index.js")) {
    Write-Host "❌ Error: No existe el archivo del servidor" -ForegroundColor Red
    exit 1
}

# Configurar variables de entorno
$env:NODE_ENV = "production"
$env:PORT = "3001"  # Cambiar si necesitas otro puerto

# Mostrar configuración
Write-Host "📋 Configuración:" -ForegroundColor Cyan
Write-Host "   - NODE_ENV: $env:NODE_ENV"
Write-Host "   - PORT: $env:PORT"
Write-Host ""

# Iniciar servidor
Write-Host "🌐 Servidor iniciando en http://localhost:$env:PORT" -ForegroundColor Green
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

node server/index.js
