# Script de configuración inicial para Visor de Backups Hermaco
# Este script ayuda a configurar la ruta de red de forma interactiva

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Configuración Visor de Backups Hermaco" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya existe el archivo .env
if (Test-Path ".env") {
    Write-Host "⚠️  Ya existe un archivo .env" -ForegroundColor Yellow
    $content = Get-Content ".env" -Raw
    Write-Host ""
    Write-Host "Contenido actual:" -ForegroundColor Gray
    Write-Host $content -ForegroundColor DarkGray
    Write-Host ""
    
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (S/N)"
    if ($overwrite -ne "S" -and $overwrite -ne "s") {
        Write-Host ""
        Write-Host "✅ Configuración cancelada. Se mantiene el archivo actual." -ForegroundColor Green
        exit
    }
}

Write-Host ""
Write-Host "📂 Opciones de configuración:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Buscar automáticamente (recomendado para desarrollo)" -ForegroundColor White
Write-Host "  2. Configurar ruta específica (recomendado para producción)" -ForegroundColor White
Write-Host ""

$option = Read-Host "Selecciona una opción (1 o 2)"

if ($option -eq "1") {
    # Configuración para búsqueda automática
    $envContent = @"
# Configuración de la aplicación Visor de Backups Hermaco
# Ruta dejada vacía para búsqueda automática
BACKUP_PATH=
"@
    
    Set-Content -Path ".env" -Value $envContent
    
    Write-Host ""
    Write-Host "✅ Configuración completada: Búsqueda automática habilitada" -ForegroundColor Green
    Write-Host ""
    Write-Host "La aplicación buscará en:" -ForegroundColor Gray
    Write-Host "  • J:/Henri/Copia de seguridad de facturas(No borrar)/Backup" -ForegroundColor DarkGray
    Write-Host "  • Unidades J:, K:, L:, M:, N:, Z:" -ForegroundColor DarkGray
    Write-Host "  • Todas las unidades disponibles" -ForegroundColor DarkGray
    
} elseif ($option -eq "2") {
    # Configuración manual
    Write-Host ""
    Write-Host "📍 Ingresa la ruta completa de la carpeta Backup" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Gray
    Write-Host "  • J:/Henri/Copia de seguridad de facturas(No borrar)/Backup" -ForegroundColor DarkGray
    Write-Host "  • //servidor/compartido/Backup" -ForegroundColor DarkGray
    Write-Host "  • C:/Datos/Backup" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "⚠️  Usa / en lugar de \ para las rutas" -ForegroundColor Yellow
    Write-Host ""
    
    $backupPath = Read-Host "Ruta"
    
    # Convertir \ a /
    $backupPath = $backupPath.Replace("\", "/")
    
    # Verificar si la ruta existe
    $testPath = $backupPath.Replace("/", "\")
    if (Test-Path $testPath) {
        Write-Host ""
        Write-Host "✅ Ruta verificada: la carpeta existe y es accesible" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA: La ruta no existe o no es accesible actualmente" -ForegroundColor Yellow
        Write-Host "   La configuración se guardará de todos modos." -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "¿Continuar de todas formas? (S/N)"
        if ($continue -ne "S" -and $continue -ne "s") {
            Write-Host ""
            Write-Host "❌ Configuración cancelada" -ForegroundColor Red
            exit
        }
    }
    
    $envContent = @"
# Configuración de la aplicación Visor de Backups Hermaco
# Ruta de red donde están los backups (usa / en lugar de \)
BACKUP_PATH=$backupPath
"@
    
    Set-Content -Path ".env" -Value $envContent
    
    Write-Host ""
    Write-Host "✅ Configuración completada" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ruta configurada:" -ForegroundColor Gray
    Write-Host "  $backupPath" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Opción inválida. Configuración cancelada." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Ejecuta:  npm run dev  (para desarrollo)" -ForegroundColor Gray
Write-Host "     o bien:   npm run electron:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Para producción:" -ForegroundColor Gray
Write-Host "     npm run electron:build" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Para más información, lee: CONFIGURACION-RED.md" -ForegroundColor Cyan
Write-Host ""
