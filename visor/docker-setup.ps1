# Script de Setup para Docker - Visor de Backup Hermaco
# Ejecuta este script en PowerShell como Administrador

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Visor de Backup - Setup Docker" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Docker Desktop desde:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

# Verificar si Docker está corriendo
Write-Host "🔍 Verificando Docker daemon..." -ForegroundColor Yellow
try {
    docker ps | Out-Null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker está corriendo" -ForegroundColor Green
    } else {
        throw "Docker no responde"
    }
} catch {
    Write-Host "❌ Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Opciones de Configuración" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Construir imagen Docker" -ForegroundColor White
Write-Host "2. Iniciar contenedor" -ForegroundColor White
Write-Host "3. Detener contenedor" -ForegroundColor White
Write-Host "4. Ver logs" -ForegroundColor White
Write-Host "5. Reiniciar contenedor" -ForegroundColor White
Write-Host "6. Reconstruir (limpio)" -ForegroundColor White
Write-Host "7. Estado del contenedor" -ForegroundColor White
Write-Host "8. Limpiar todo" -ForegroundColor White
Write-Host "9. Salir" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opción (1-9)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Yellow
        docker-compose build
        Write-Host ""
        Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Iniciando contenedor..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host ""
        Write-Host "✅ Contenedor iniciado" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Accede a la aplicación en: http://localhost:3001" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ver logs en tiempo real con: docker-compose logs -f" -ForegroundColor Gray
    }
    "3" {
        Write-Host ""
        Write-Host "⏹️ Deteniendo contenedor..." -ForegroundColor Yellow
        docker-compose down
        Write-Host ""
        Write-Host "✅ Contenedor detenido" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "📋 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Yellow
        Write-Host ""
        docker-compose logs -f
    }
    "5" {
        Write-Host ""
        Write-Host "🔄 Reiniciando contenedor..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host ""
        Write-Host "✅ Contenedor reiniciado" -ForegroundColor Green
    }
    "6" {
        Write-Host ""
        Write-Host "🔨 Reconstruyendo desde cero..." -ForegroundColor Yellow
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host ""
        Write-Host "✅ Reconstrucción completa" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Accede a la aplicación en: http://localhost:3001" -ForegroundColor Cyan
    }
    "7" {
        Write-Host ""
        Write-Host "📊 Estado del contenedor:" -ForegroundColor Yellow
        Write-Host ""
        docker-compose ps
        Write-Host ""
        Write-Host "🔍 Healthcheck:" -ForegroundColor Yellow
        try {
            $health = docker inspect visor-backup-hermaco --format='{{.State.Health.Status}}' 2>&1
            if ($health -eq "healthy") {
                Write-Host "✅ Contenedor saludable" -ForegroundColor Green
            } elseif ($health -eq "starting") {
                Write-Host "⏳ Contenedor iniciando..." -ForegroundColor Yellow
            } else {
                Write-Host "⚠️ Estado: $health" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ No se pudo obtener healthcheck" -ForegroundColor Yellow
        }
    }
    "8" {
        Write-Host ""
        Write-Host "⚠️ ADVERTENCIA: Esto eliminará imágenes, contenedores y volúmenes" -ForegroundColor Red
        $confirmar = Read-Host "¿Estás seguro? (si/no)"
        if ($confirmar -eq "si") {
            Write-Host ""
            Write-Host "🗑️ Limpiando..." -ForegroundColor Yellow
            docker-compose down
            docker system prune -a -f
            Write-Host ""
            Write-Host "✅ Limpieza completa" -ForegroundColor Green
        } else {
            Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
        }
    }
    "9" {
        Write-Host ""
        Write-Host "👋 Hasta luego!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host ""
pause
