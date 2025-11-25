# ✅ Checklist de Configuración Docker

## Antes de construir la imagen

### 1. Docker Desktop Instalado

- [ ] Docker Desktop descargado desde https://www.docker.com/products/docker-desktop/
- [ ] Docker Desktop instalado
- [ ] Docker Desktop corriendo (ícono en bandeja del sistema)
- [ ] Comando `docker --version` funciona
- [ ] Comando `docker ps` funciona sin errores

### 2. Archivos Docker Presentes

- [ ] `Dockerfile` existe en la raíz del proyecto
- [ ] `docker-compose.yml` existe en la raíz del proyecto
- [ ] `.dockerignore` existe en la raíz del proyecto
- [ ] `.env.example` existe en la raíz del proyecto

### 3. Configuración Ajustada

- [ ] Ruta del backup configurada en `docker-compose.yml` (línea 12)
- [ ] La ruta usa `/` en lugar de `\`
- [ ] La ruta termina con `:ro` (read-only)
- [ ] La ruta existe y contiene archivos

**Ejemplo de ruta correcta:**

```yaml
- 'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup:/backup:ro'
```

### 4. Build del Frontend

- [ ] `node_modules` instalados: `npm install`
- [ ] Build funciona: `npm run build` (opcional, Docker lo hace)

## Construcción de la Imagen

### 5. Build de Docker

```powershell
# Ejecutar en PowerShell desde la carpeta del proyecto
docker-compose build
```

- [ ] Build inicia sin errores
- [ ] Se descarga imagen base de Node.js
- [ ] Se instalan dependencias
- [ ] Se compila el frontend Vue
- [ ] Build completa exitosamente
- [ ] Imagen `visor-backup-hermaco` aparece en `docker images`

**Tiempo estimado:** 3-5 minutos en primera construcción

## Iniciar Contenedor

### 6. Iniciar Aplicación

```powershell
docker-compose up -d
```

- [ ] Contenedor inicia sin errores
- [ ] `docker-compose ps` muestra estado "Up"
- [ ] Logs no muestran errores: `docker-compose logs`
- [ ] Caché se precarga correctamente (ver logs)

### 7. Verificación de Volumen

```powershell
docker exec visor-backup-hermaco ls -la /backup
```

- [ ] Comando funciona
- [ ] Muestra carpetas del backup (SA, SM, SS, gastos, etc.)
- [ ] Archivos son accesibles

## Verificación de Funcionamiento

### 8. API Backend

```powershell
# Health check
curl http://localhost:3001/api/health

# O en el navegador
http://localhost:3001/api/health
```

- [ ] Responde con JSON
- [ ] `success: true`
- [ ] `cacheStatus.loaded: true`

### 9. Frontend

Abrir en navegador: `http://localhost:3001`

- [ ] Página carga correctamente
- [ ] Dashboard se muestra
- [ ] Módulo "Estadísticas" funciona
- [ ] Módulo "Explorador" muestra archivos
- [ ] Módulo "Empaquetador" muestra carpetas

### 10. Funcionalidades

- [ ] Estadísticas muestran números reales
- [ ] Explorador lista archivos del backup
- [ ] Búsqueda funciona en Explorador
- [ ] Doble click en PDF abre en navegador
- [ ] Doble click en JSON abre en Bloc de Notas
- [ ] Empaquetador permite seleccionar carpetas
- [ ] Descarga de ZIP funciona

## Monitoreo

### 11. Logs y Salud

```powershell
# Ver logs en tiempo real
docker-compose logs -f

# Estado del contenedor
docker-compose ps

# Healthcheck
docker inspect visor-backup-hermaco --format='{{.State.Health.Status}}'
```

- [ ] Logs sin errores críticos
- [ ] Estado: `healthy`
- [ ] Contenedor no se reinicia constantemente

### 12. Actualización de Datos

- [ ] Esperar 5 minutos
- [ ] Agregar/modificar archivo en carpeta de backup
- [ ] Verificar que después de 5 min se refleja en la app
- [ ] O forzar recarga: `curl -X POST http://localhost:3001/api/cache/reload`

## Mantenimiento

### 13. Comandos Básicos Funcionan

```powershell
# Detener
docker-compose down

# Iniciar
docker-compose up -d

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f
```

- [ ] Todos los comandos funcionan sin errores

## Opcional: Producción

### 14. Persistencia

- [ ] Contenedor se reinicia automáticamente: `restart: unless-stopped` en compose
- [ ] Logs rotan correctamente
- [ ] No hay memory leaks (monitorear con `docker stats`)

### 15. Seguridad

- [ ] Volumen montado en modo read-only (`:ro`)
- [ ] Solo puerto 3001 expuesto
- [ ] No hay datos sensibles en logs
- [ ] Variables de entorno no tienen passwords hardcodeados

## Problemas Comunes

### ❌ "Cannot connect to Docker daemon"

**Solución:** Iniciar Docker Desktop

### ❌ "port is already allocated"

**Solución:** Cambiar puerto en docker-compose.yml o detener servicio que usa 3001

### ❌ "invalid mount config"

**Solución:** Verificar que la ruta del backup existe y usa `/` en lugar de `\`

### ❌ "no such file or directory" en /backup

**Solución:** Verificar ruta en docker-compose.yml, debe ser absoluta

### ❌ Contenedor se reinicia constantemente

**Solución:** Ver logs con `docker-compose logs`, probablemente error en server/index.js

## 🎉 ¡Completado!

Si todas las casillas están marcadas, tu aplicación está:

- ✅ Completamente dockerizada
- ✅ Funcionando correctamente
- ✅ Lista para producción
- ✅ Con monitoreo y healthchecks
- ✅ Protegiendo archivos originales (read-only)

---

**Siguiente paso:** Monitorear logs por 24 horas para asegurar estabilidad

```powershell
# Monitoreo continuo
docker stats visor-backup-hermaco
```
