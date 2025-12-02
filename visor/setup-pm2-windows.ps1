# Script para configurar PM2 en Windows Server 2019
# Ejecutar como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACIÓN PM2 - WINDOWS SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js NO está instalado" -ForegroundColor Red
    Write-Host "   Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que exista dist/
Write-Host ""
Write-Host "2. Verificando carpeta dist/..." -ForegroundColor Yellow
if (-Not (Test-Path ".\dist")) {
    Write-Host "   ⚠️  Carpeta dist/ no encontrada" -ForegroundColor Yellow
    Write-Host "   Compilando frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al compilar" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✅ Carpeta dist/ existe" -ForegroundColor Green

# 3. Crear carpeta de logs
Write-Host ""
Write-Host "3. Creando carpeta de logs..." -ForegroundColor Yellow
if (-Not (Test-Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" | Out-Null
    Write-Host "   ✅ Carpeta logs/ creada" -ForegroundColor Green
} else {
    Write-Host "   ✅ Carpeta logs/ ya existe" -ForegroundColor Green
}

# 4. Instalar PM2 globalmente
Write-Host ""
Write-Host "4. Instalando PM2..." -ForegroundColor Yellow
npm list -g pm2 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Instalando PM2 globalmente..." -ForegroundColor Cyan
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al instalar PM2" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✅ PM2 instalado" -ForegroundColor Green

# 5. Instalar pm2-windows-startup
Write-Host ""
Write-Host "5. Instalando pm2-windows-startup..." -ForegroundColor Yellow
npm list -g pm2-windows-startup 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Instalando pm2-windows-startup..." -ForegroundColor Cyan
    npm install -g pm2-windows-startup
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al instalar pm2-windows-startup" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✅ pm2-windows-startup instalado" -ForegroundColor Green

# 6. Configurar inicio automático
Write-Host ""
Write-Host "6. Configurando inicio automático..." -ForegroundColor Yellow
Write-Host "   NOTA: Esto requiere permisos de Administrador" -ForegroundColor Cyan
pm2-startup install
Write-Host "   ✅ Inicio automático configurado" -ForegroundColor Green

# 7. Detener instancias previas
Write-Host ""
Write-Host "7. Limpiando instancias previas..." -ForegroundColor Yellow
pm2 delete visor-backup 2>$null | Out-Null
Write-Host "   ✅ Limpieza completada" -ForegroundColor Green

# 8. Iniciar la aplicación con PM2
Write-Host ""
Write-Host "8. Iniciando aplicación con PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al iniciar la aplicación" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Aplicación iniciada" -ForegroundColor Green

# 9. Guardar configuración
Write-Host ""
Write-Host "9. Guardando configuración..." -ForegroundColor Yellow
pm2 save
Write-Host "   ✅ Configuración guardada" -ForegroundColor Green

# 10. Mostrar estado
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pm2 list
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   pm2 list                - Ver estado de la app" -ForegroundColor White
Write-Host "   pm2 logs visor-backup   - Ver logs en tiempo real" -ForegroundColor White
Write-Host "   pm2 restart visor-backup - Reiniciar la app" -ForegroundColor White
Write-Host "   pm2 stop visor-backup   - Detener la app" -ForegroundColor White
Write-Host "   pm2 monit               - Monitor en tiempo real" -ForegroundColor White
Write-Host ""
Write-Host "🌐 La aplicación está corriendo en:" -ForegroundColor Green

# Obtener IPs del servidor
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" }
foreach ($ip in $ips) {
    Write-Host "   http://$($ip.IPAddress):3001" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "✅ La aplicación se iniciará automáticamente al reiniciar Windows" -ForegroundColor Green
Write-Host ""
