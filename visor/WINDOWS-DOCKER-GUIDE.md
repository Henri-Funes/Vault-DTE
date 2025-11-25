# 🐳 Guía de Deploy - Visor Backup en Windows

## ✅ Correcciones Aplicadas

### 1. **Imagen Base Actualizada**

- ❌ Antes: `node:20-nanoserver-1809` (obsoleta)
- ✅ Ahora: `node:20-nanoserver-ltsc2019` (compatible con Windows Server 2019)

### 2. **Variables de Entorno Corregidas**

- ❌ Antes: `BACKUP_PATH="C:\backup"` (mal escapado)
- ✅ Ahora: `BACKUP_PATH=C:\\backup` en Dockerfile y `C:/backup` en compose

### 3. **Sintaxis de Volúmenes Mejorada**

- ✅ Usa sintaxis explícita `type: bind` para mayor claridad
- ✅ Configurado como `read_only: true` para seguridad

### 4. **Rutas en Código**

- ✅ Server usa forward slashes compatibles con Node.js en todas plataformas

---

## 🚀 Pasos para Testing en Windows 11

### Requisitos Previos

1. **Docker Desktop** instalado y corriendo
2. **Windows Containers mode** activado (no Linux)
3. Directorio `C:\Dashboard\Backup` debe existir (o será creado)

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\build-and-test.ps1
```

Este script hace todo automáticamente:

- ✅ Verifica que Docker esté corriendo
- ✅ Valida modo Windows Containers
- ✅ Verifica/crea directorio de backup
- ✅ Construye la imagen
- ✅ Inicia el contenedor
- ✅ Espera a que el servicio esté listo
- ✅ Ofrece abrir en navegador

### Opción 2: Comandos Manuales

```powershell
# 1. Cambiar a Windows Containers (si estás en Linux mode)
# Click derecho en Docker Desktop → "Switch to Windows containers..."

# 2. Verificar directorio
if (-not (Test-Path "C:\Dashboard\Backup")) {
    New-Item -ItemType Directory -Path "C:\Dashboard\Backup"
}

# 3. Construir imagen
docker-compose build

# 4. Iniciar contenedor
docker-compose up -d

# 5. Ver logs
docker-compose logs -f

# 6. Verificar que funciona
Start-Process "http://localhost:3001"
```

---

## 🔧 Comandos Útiles

### Gestión del Contenedor

```powershell
# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir sin cache
docker-compose build --no-cache
```

### Debugging

```powershell
# Entrar al contenedor en PowerShell
docker exec -it visor-backup-hermaco powershell

# Ver archivos en el volumen
docker exec visor-backup-hermaco cmd /c "dir C:\backup"

# Verificar variables de entorno
docker exec visor-backup-hermaco cmd /c "echo %BACKUP_PATH%"

# Ver procesos
docker exec visor-backup-hermaco powershell "Get-Process"
```

---

## 📦 Deploy en Windows Server 2019

### 1. Preparar el Servidor

```powershell
# Instalar Docker Enterprise (si no está instalado)
Install-Module -Name DockerMsftProvider -Repository PSGallery -Force
Install-Package -Name docker -ProviderName DockerMsftProvider

# Iniciar servicio Docker
Start-Service Docker

# Configurar para inicio automático
Set-Service -Name Docker -StartupType Automatic
```

### 2. Transferir Archivos

Copiar al servidor:

- Todo el contenido del proyecto
- Asegurar que `C:\Dashboard\Backup` existe y contiene los backups

### 3. Build y Deploy

```powershell
# Navegar al directorio del proyecto
cd C:\Dashboard\Visor-Backup-Hermaco\visor

# Construir imagen
docker-compose build

# Iniciar en producción
docker-compose up -d

# Verificar estado
docker-compose ps
docker-compose logs
```

### 4. Configurar Firewall

```powershell
# Abrir puerto 3001
New-NetFirewallRule -DisplayName "Visor Backup" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### 5. Configurar como Servicio (Opcional)

Para que inicie automáticamente al reiniciar el servidor:

```powershell
# Crear tarea programada
$action = New-ScheduledTaskAction -Execute "docker-compose" -Argument "up -d" -WorkingDirectory "C:\Dashboard\Visor-Backup-Hermaco\visor"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "VisorBackupDocker" -Action $action -Trigger $trigger -Principal $principal
```

---

## 🔍 Verificación Post-Deploy

### Healthcheck

```powershell
# Verificar health del contenedor
docker inspect visor-backup-hermaco | Select-String "Health"

# O vía API
curl http://localhost:3001/api/health
```

### Verificar Volumen

```powershell
# Listar archivos en el volumen montado
docker exec visor-backup-hermaco powershell "Get-ChildItem C:\backup -Recurse | Select-Object FullName, Length, LastWriteTime"
```

### Acceso Web

Abrir en navegador: `http://localhost:3001`
O desde otra máquina: `http://<IP-DEL-SERVIDOR>:3001`

---

## ⚠️ Problemas Comunes

### Error: "image operating system "linux" cannot be used"

**Solución:** Cambiar Docker a Windows Containers

```powershell
& $Env:ProgramFiles\Docker\Docker\DockerCli.exe -SwitchDaemon
```

### Error: "No se puede acceder al puerto 3001"

**Solución:** Verificar firewall

```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```

### Error: "Cannot find the path specified"

**Solución:** Crear directorio de backup

```powershell
New-Item -ItemType Directory -Path "C:\Dashboard\Backup" -Force
```

### Contenedor no inicia

**Debugging:**

```powershell
# Ver logs detallados
docker-compose logs --tail=100

# Intentar iniciar manualmente
docker run -it --rm node:20-nanoserver-ltsc2019 powershell
```

---

## 📊 Arquitectura

```
┌─────────────────────────────────────┐
│   Windows Server 2019 / Win 11     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Docker Container (Windows)   │ │
│  │                               │ │
│  │  ┌─────────────────────────┐  │ │
│  │  │  Node.js 20             │  │ │
│  │  │  + Express Server       │  │ │
│  │  │  + Vue.js (dist)        │  │ │
│  │  └─────────────────────────┘  │ │
│  │                               │ │
│  │  Puerto: 3001                 │ │
│  │  Volume: C:\backup (RO)       │ │
│  └───────────────────────────────┘ │
│           ↑                         │
│           │ (bind mount)            │
│           ↓                         │
│  C:\Dashboard\Backup                │
│  (archivos de backup del host)     │
└─────────────────────────────────────┘
```

---

## ✨ Características de la Configuración

- ✅ **Multi-stage build** para optimizar tamaño de imagen
- ✅ **Healthcheck** integrado para monitoreo
- ✅ **Volumen read-only** para seguridad
- ✅ **Variables de entorno** configurables
- ✅ **Red nat** optimizada para Windows
- ✅ **Restart policy** para alta disponibilidad
- ✅ **Compatible** con Windows Server 2019 y Windows 11

---

## 📝 Notas Adicionales

1. **Tamaño de Imagen:** ~350-400 MB (nanoserver es ligero)
2. **Tiempo de Build:** ~5-10 minutos primera vez (depende de conexión)
3. **RAM Necesaria:** ~512 MB mínimo, recomendado 1 GB
4. **Persistencia:** Los datos están en el host (`C:\Dashboard\Backup`)

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar `.\build-and-test.ps1` en Windows 11
2. ✅ Verificar funcionamiento en `http://localhost:3001`
3. ✅ Probar lectura de archivos de backup
4. ✅ Transferir al Windows Server 2019
5. ✅ Configurar firewall y acceso remoto
6. ✅ Configurar inicio automático (opcional)

---

**¿Necesitas ayuda?** Verifica logs con `docker-compose logs -f`
