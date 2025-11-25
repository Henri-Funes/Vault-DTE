# Script para construir y probar el contenedor en Windows 11
# Compatible con Windows Server 2019

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Visor Backup - Build & Test Docker" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está corriendo
Write-Host "[1/6] Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker no está corriendo o no está instalado." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop e intenta nuevamente." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar modo de contenedor Windows
Write-Host "[2/6] Verificando modo de contenedor..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1 | Select-String "OSType"
if ($dockerInfo -match "linux") {
    Write-Host "❌ ERROR: Docker está en modo Linux." -ForegroundColor Red
    Write-Host "Cambia a modo Windows Containers:" -ForegroundColor Yellow
    Write-Host "1. Click derecho en el icono de Docker Desktop" -ForegroundColor Yellow
    Write-Host "2. Selecciona 'Switch to Windows containers...'" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "¿Ya cambiaste a Windows containers? (s/n)"
    if ($response -ne "s") {
        exit 1
    }
}
Write-Host "✅ Modo Windows Containers activo" -ForegroundColor Green
Write-Host ""

# Verificar directorio de backup
Write-Host "[3/6] Verificando directorio de backup..." -ForegroundColor Yellow
$backupPath = "C:\Dashboard\Backup"
if (-not (Test-Path $backupPath)) {
    Write-Host "⚠️  ADVERTENCIA: $backupPath no existe." -ForegroundColor Yellow
    $create = Read-Host "¿Deseas crearlo para testing? (s/n)"
    if ($create -eq "s") {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        Write-Host "✅ Directorio creado: $backupPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Continuando sin directorio de backup..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Directorio de backup existe: $backupPath" -ForegroundColor Green
}
Write-Host ""

# Limpiar contenedores anteriores
Write-Host "[4/6] Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

# Construir imagen
Write-Host "[5/6] Construyendo imagen Docker..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Gray
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló la construcción de la imagen." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
Write-Host ""

# Iniciar contenedor
Write-Host "[6/6] Iniciando contenedor..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló al iniciar el contenedor." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contenedor iniciado" -ForegroundColor Green
Write-Host ""

# Esperar que el servicio esté listo
Write-Host "Esperando que el servicio esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""
if ($ready) {
    Write-Host "✅ Servicio listo y funcionando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "  🎉 TODO LISTO!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Aplicación disponible en: http://localhost:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  Ver logs:       docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  Detener:        docker-compose down" -ForegroundColor Gray
    Write-Host "  Reiniciar:      docker-compose restart" -ForegroundColor Gray
    Write-Host "  Ver estado:     docker-compose ps" -ForegroundColor Gray
    Write-Host ""
    
    # Abrir en navegador
    $openBrowser = Read-Host "¿Abrir en navegador? (s/n)"
    if ($openBrowser -eq "s") {
        Start-Process "http://localhost:3001"
    }
} else {
    Write-Host "❌ ERROR: El servicio no respondió después de $maxAttempts intentos." -ForegroundColor Red
    Write-Host ""
    Write-Host "Ver logs para diagnóstico:" -ForegroundColor Yellow
    docker-compose logs --tail=50
    exit 1
}
