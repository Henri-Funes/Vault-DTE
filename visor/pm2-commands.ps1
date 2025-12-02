# Comandos rapidos de PM2 para gestionar la aplicacion
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
        Write-Host "[INICIO] Iniciando aplicacion..." -ForegroundColor Green
        pm2 start ecosystem.config.cjs
        pm2 save
    }
    'stop' {
        Write-Host "[STOP] Deteniendo aplicacion..." -ForegroundColor Yellow
        pm2 stop $AppName
    }
    'restart' {
        Write-Host "[RESTART] Reiniciando aplicacion..." -ForegroundColor Yellow
        pm2 restart $AppName
    }
    'status' {
        Write-Host "[STATUS] Estado de la aplicacion:" -ForegroundColor Cyan
        pm2 list
        Write-Host ""
        Write-Host "[DETALLES]:" -ForegroundColor Cyan
        pm2 describe $AppName
    }
    'logs' {
        Write-Host "[LOGS] Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
        pm2 logs $AppName
    }
    'monit' {
        Write-Host "[MONITOR] Monitor en tiempo real (Ctrl+C para salir)..." -ForegroundColor Cyan
        pm2 monit
    }
    'delete' {
        Write-Host "[DELETE] Eliminando aplicacion de PM2..." -ForegroundColor Red
        pm2 delete $AppName
        pm2 save
    }
    'save' {
        Write-Host "[SAVE] Guardando configuracion..." -ForegroundColor Green
        pm2 save
    }
}

Write-Host ""
