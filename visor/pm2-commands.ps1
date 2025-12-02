# Comandos rápidos de PM2 para gestionar la aplicación
# Ejecutar desde la carpeta del proyecto

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'monit', 'delete', 'save')]
    [string]$Action = 'status'
)

$AppName = "visor-backup"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PM2 - Visor de Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action) {
    'start' {
        Write-Host "🚀 Iniciando aplicación..." -ForegroundColor Green
        pm2 start ecosystem.config.cjs
        pm2 save
    }
    'stop' {
        Write-Host "🛑 Deteniendo aplicación..." -ForegroundColor Yellow
        pm2 stop $AppName
    }
    'restart' {
        Write-Host "🔄 Reiniciando aplicación..." -ForegroundColor Yellow
        pm2 restart $AppName
    }
    'status' {
        Write-Host "📊 Estado de la aplicación:" -ForegroundColor Cyan
        pm2 list
        Write-Host ""
        Write-Host "📋 Detalles:" -ForegroundColor Cyan
        pm2 describe $AppName
    }
    'logs' {
        Write-Host "📄 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
        pm2 logs $AppName
    }
    'monit' {
        Write-Host "📊 Monitor en tiempo real (Ctrl+C para salir)..." -ForegroundColor Cyan
        pm2 monit
    }
    'delete' {
        Write-Host "🗑️  Eliminando aplicación de PM2..." -ForegroundColor Red
        pm2 delete $AppName
        pm2 save
    }
    'save' {
        Write-Host "💾 Guardando configuración..." -ForegroundColor Green
        pm2 save
    }
}

Write-Host ""
