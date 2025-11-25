# 🐳 Guía de Dockerización - Visor de Backup Hermaco

Esta guía te ayudará a configurar y ejecutar la aplicación en Docker.

## 📋 Requisitos Previos

1. **Instalar Docker Desktop para Windows**
   - Descarga: https://www.docker.com/products/docker-desktop/
   - Instala Docker Desktop
   - Asegúrate de que Docker esté corriendo (icono en la bandeja del sistema)

2. **Verificar instalación**
   ```powershell
   docker --version
   docker-compose --version
   ```

## 📁 Estructura de Archivos Docker

```
visor/
├── Dockerfile              # Configuración de la imagen Docker
├── docker-compose.yml      # Orquestación de contenedores
├── .dockerignore          # Archivos excluidos del build
└── .env.example           # Variables de entorno de ejemplo
```

## 🔧 Configuración

### 1. Ajustar Ruta del Backup

Edita `docker-compose.yml` y ajusta la ruta de tu backup en la sección `volumes`:

```yaml
volumes:
  # CAMBIA ESTA RUTA a donde está tu backup real
  - 'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup:/backup:ro'
```

**Importante:**

- Usa `/` en lugar de `\` para rutas de Windows en Docker
- `:ro` significa "read-only" (solo lectura) - protege tus archivos
- La ruta del host (izquierda) debe ser absoluta
- La ruta del contenedor (derecha) siempre es `/backup`

### 2. Variables de Entorno (Opcional)

Crea un archivo `.env` basado en `.env.example`:

```env
NODE_ENV=production
PORT=3001
BACKUP_PATH=/backup
```

## 🚀 Construir y Ejecutar

### Opción 1: Docker Compose (Recomendado)

```powershell
# Construir la imagen
docker-compose build

# Iniciar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

### Opción 2: Docker Manual

```powershell
# Construir la imagen
docker build -t visor-backup-hermaco .

# Ejecutar el contenedor
docker run -d \
  --name visor-backup \
  -p 3001:3001 \
  -v "J:/Henri/Copia de seguridad de facturas(No borrar)/Backup:/backup:ro" \
  -e NODE_ENV=production \
  -e BACKUP_PATH=/backup \
  visor-backup-hermaco

# Ver logs
docker logs -f visor-backup

# Detener el contenedor
docker stop visor-backup
docker rm visor-backup
```

## 🌐 Acceder a la Aplicación

Una vez iniciado, la aplicación estará disponible en:

```
http://localhost:3001
```

El servidor sirve tanto el frontend como el API desde el mismo puerto.

## 📊 Monitoreo y Mantenimiento

### Ver Estado del Contenedor

```powershell
docker ps
docker-compose ps
```

### Ver Logs en Tiempo Real

```powershell
docker-compose logs -f visor-backup
```

### Healthcheck

El contenedor incluye healthcheck automático:

```powershell
docker inspect visor-backup --format='{{.State.Health.Status}}'
```

### Actualización de Datos

La aplicación detectará automáticamente cambios en los archivos del backup:

- **Caché:** 5 minutos
- **Detección:** Los cambios se reflejarán después de 5 minutos
- **Forzar recarga:** Usa el endpoint `POST /api/cache/reload`

```powershell
curl -X POST http://localhost:3001/api/cache/reload
```

### Reiniciar Contenedor

```powershell
docker-compose restart
```

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```powershell
# 1. Detener el contenedor
docker-compose down

# 2. Reconstruir la imagen
docker-compose build --no-cache

# 3. Iniciar nuevamente
docker-compose up -d
```

## 🐛 Troubleshooting

### El contenedor no inicia

```powershell
# Ver logs detallados
docker-compose logs

# Verificar que la ruta del backup existe
docker exec visor-backup-hermaco ls -la /backup
```

### Puerto 3001 ya en uso

Cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - '8080:3001' # Usar puerto 8080 en el host
```

### Cambios no se reflejan

```powershell
# Limpiar caché de Docker y reconstruir
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### No se pueden leer los archivos del backup

Verifica permisos:

```powershell
# En el host (Windows)
icacls "J:\Henri\Copia de seguridad de facturas(No borrar)\Backup"

# Dar permisos de lectura si es necesario
icacls "J:\Henri\Copia de seguridad de facturas(No borrar)\Backup" /grant Everyone:R /T
```

## 📦 Exportar/Importar Imagen

### Exportar imagen para otro servidor

```powershell
# Guardar imagen en archivo
docker save visor-backup-hermaco:latest -o visor-backup.tar

# Comprimir (opcional)
tar -czf visor-backup.tar.gz visor-backup.tar
```

### Importar en otro servidor

```powershell
# Cargar imagen
docker load -i visor-backup.tar

# O si está comprimida
tar -xzf visor-backup.tar.gz
docker load -i visor-backup.tar
```

## 🔒 Seguridad

### Montaje en Modo Lectura

La carpeta del backup se monta como **read-only** (`:ro`):

- El contenedor NO puede modificar, borrar o crear archivos
- Protege tus datos de backups originales
- Si necesitas escritura (no recomendado), quita `:ro`

### Redes Aisladas

El contenedor usa su propia red (`visor-network`):

- Aislamiento de otros contenedores
- Solo el puerto 3001 está expuesto

## 📝 Comandos Útiles

```powershell
# Ver uso de recursos
docker stats visor-backup-hermaco

# Entrar al contenedor (shell)
docker exec -it visor-backup-hermaco sh

# Ver variables de entorno
docker exec visor-backup-hermaco env

# Ver archivos en el volumen montado
docker exec visor-backup-hermaco ls -lh /backup

# Verificar API
curl http://localhost:3001/api/health

# Limpiar todo (imágenes, contenedores, volúmenes)
docker system prune -a --volumes
```

## 🎯 Próximos Pasos

1. ✅ **Configuración completa** - Ya tienes todos los archivos
2. 🔄 **Prueba local** - `docker-compose up`
3. 📦 **Genera imagen** - `docker-compose build`
4. 🚀 **Deploy** - Mueve a servidor de producción

## 💡 Recomendaciones

- **Desarrollo:** Usa `npm run dev:all` (sin Docker)
- **Producción:** Usa Docker para deployment
- **Monitoreo:** Revisa logs regularmente
- **Backups:** El contenedor solo LEE, no modifica tus archivos
- **Updates:** Reconstruye imagen después de cambios en código

---

**¿Problemas?** Revisa los logs: `docker-compose logs -f`
