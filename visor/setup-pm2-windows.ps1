# Script para configurar PM2 en Windows Server 2019
# Ejecutar como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION PM2 - WINDOWS SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Node.js NO esta instalado" -ForegroundColor Red
    Write-Host "   Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que exista dist/
Write-Host ""
Write-Host "2. Verificando carpeta dist/..." -ForegroundColor Yellow
if (-Not (Test-Path ".\dist")) {
    Write-Host "   [AVISO] Carpeta dist/ no encontrada" -ForegroundColor Yellow
    Write-Host "   Compilando frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Error al compilar" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   [OK] Carpeta dist/ existe" -ForegroundColor Green

# 3. Crear carpeta de logs
Write-Host ""
Write-Host "3. Creando carpeta de logs..." -ForegroundColor Yellow
if (-Not (Test-Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" | Out-Null
    Write-Host "   [OK] Carpeta logs/ creada" -ForegroundColor Green
} else {
    Write-Host "   [OK] Carpeta logs/ ya existe" -ForegroundColor Green
}

# 4. Instalar PM2 globalmente
Write-Host ""
Write-Host "4. Instalando PM2..." -ForegroundColor Yellow
npm list -g pm2 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Instalando PM2 globalmente..." -ForegroundColor Cyan
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Error al instalar PM2" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   [OK] PM2 instalado" -ForegroundColor Green

# 5. Instalar pm2-windows-startup
Write-Host ""
Write-Host "5. Instalando pm2-windows-startup..." -ForegroundColor Yellow
npm list -g pm2-windows-startup 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Instalando pm2-windows-startup..." -ForegroundColor Cyan
    npm install -g pm2-windows-startup
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Error al instalar pm2-windows-startup" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   [OK] pm2-windows-startup instalado" -ForegroundColor Green

# 6. Configurar inicio automatico
Write-Host ""
Write-Host "6. Configurando inicio automatico..." -ForegroundColor Yellow
Write-Host "   NOTA: Esto requiere permisos de Administrador" -ForegroundColor Cyan
pm2-startup install
Write-Host "   [OK] Inicio automatico configurado" -ForegroundColor Green

# 7. Detener instancias previas
Write-Host ""
Write-Host "7. Limpiando instancias previas..." -ForegroundColor Yellow
pm2 delete visor-backup 2>$null | Out-Null
Write-Host "   [OK] Limpieza completada" -ForegroundColor Green

# 8. Iniciar la aplicacion con PM2
Write-Host ""
Write-Host "8. Iniciando aplicacion con PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] Error al iniciar la aplicacion" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Aplicacion iniciada" -ForegroundColor Green

# 9. Guardar configuracion
Write-Host ""
Write-Host "9. Guardando configuracion..." -ForegroundColor Yellow
pm2 save
Write-Host "   [OK] Configuracion guardada" -ForegroundColor Green

# 10. Mostrar estado
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pm2 list
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host "   pm2 list                - Ver estado de la app" -ForegroundColor White
Write-Host "   pm2 logs visor-backup   - Ver logs en tiempo real" -ForegroundColor White
Write-Host "   pm2 restart visor-backup - Reiniciar la app" -ForegroundColor White
Write-Host "   pm2 stop visor-backup   - Detener la app" -ForegroundColor White
Write-Host "   pm2 monit               - Monitor en tiempo real" -ForegroundColor White
Write-Host ""
Write-Host "La aplicacion esta corriendo en:" -ForegroundColor Green

# Obtener IPs del servidor
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" }
foreach ($ip in $ips) {
    Write-Host "   http://$($ip.IPAddress):3001" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "[OK] La aplicacion se iniciara automaticamente al reiniciar Windows" -ForegroundColor Green
Write-Host ""
