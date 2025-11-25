# 🚀 Inicio Rápido - Docker

## Instalación de Docker

### Windows

1. **Descargar Docker Desktop**
   - https://www.docker.com/products/docker-desktop/
   - Descarga el instalador para Windows

2. **Instalar**
   - Ejecuta el instalador
   - Sigue las instrucciones en pantalla
   - Reinicia tu computadora si es necesario

3. **Verificar instalación**

   ```powershell
   docker --version
   docker-compose --version
   ```

   Deberías ver algo como:

   ```
   Docker version 24.0.7, build...
   Docker Compose version v2.23.3
   ```

4. **Iniciar Docker Desktop**
   - Busca "Docker Desktop" en el menú de inicio
   - Espera a que el ícono de Docker en la bandeja del sistema deje de parpadear
   - Debe mostrar "Docker Desktop is running"

## Configuración del Proyecto

### 1. Ajustar Ruta del Backup

Edita el archivo `docker-compose.yml` en la línea 12:

```yaml
volumes:
  # Cambia esta ruta a tu carpeta de backup
  - 'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup:/backup:ro'
```

**Importante:**

- Usa `/` en lugar de `\`
- Mantén `:ro` al final (read-only para proteger tus archivos)
- La ruta debe ser absoluta

### 2. Verificar Archivos Docker

Asegúrate de tener estos archivos:

- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `.dockerignore`

## Construir y Ejecutar

### Desde PowerShell

```powershell
# 1. Navega a la carpeta del proyecto
cd C:\Dashboard\Visor-Backup-Hermaco\visor

# 2. Construye la imagen Docker (primera vez o después de cambios)
docker-compose build

# 3. Inicia el contenedor
docker-compose up -d

# 4. Verifica que está corriendo
docker-compose ps

# 5. Ve los logs (opcional)
docker-compose logs -f
```

### Usando npm scripts

```powershell
# Construir
npm run docker:build

# Iniciar
npm run docker:up

# Ver logs
npm run docker:logs

# Detener
npm run docker:down
```

## Acceder a la Aplicación

Una vez iniciado, abre tu navegador:

```
http://localhost:3001
```

Deberías ver el Visor de Backup funcionando! 🎉

## Verificar que Todo Funciona

### 1. Healthcheck

```powershell
curl http://localhost:3001/api/health
```

Debería responder:

```json
{
  "success": true,
  "message": "Backend funcionando correctamente",
  ...
}
```

### 2. Ver archivos del backup

```powershell
docker exec visor-backup-hermaco ls -la /backup
```

Deberías ver las carpetas: SA, SM, SS, gastos, remisiones, etc.

### 3. Ver logs de carga

```powershell
docker-compose logs visor-backup
```

Busca:

```
⏳ Precargando datos en caché...
✅ Datos precargados exitosamente
```

## Detener la Aplicación

```powershell
docker-compose down
```

## Solución de Problemas Comunes

### "docker: command not found"

- Docker Desktop no está instalado o no está en el PATH
- Reinicia PowerShell después de instalar Docker

### "Cannot connect to the Docker daemon"

- Docker Desktop no está corriendo
- Abre Docker Desktop desde el menú de inicio

### "bind: An attempt was made to access a socket in a way forbidden"

- El puerto 3001 está en uso
- Detén otros servicios en ese puerto o cambia el puerto en docker-compose.yml

### "Error response from daemon: invalid mount config"

- La ruta del backup no existe o está mal escrita
- Verifica la ruta en docker-compose.yml
- Usa `/` en lugar de `\`

### No se cargan los archivos

- Verifica que la ruta del volumen apunta a la carpeta correcta
- Verifica permisos de lectura en la carpeta de backup
- Revisa logs: `docker-compose logs -f`

## Comandos Útiles

```powershell
# Estado del contenedor
docker-compose ps

# Reiniciar contenedor
docker-compose restart

# Ver uso de recursos
docker stats visor-backup-hermaco

# Entrar al contenedor
docker exec -it visor-backup-hermaco sh

# Forzar recarga de datos
curl -X POST http://localhost:3001/api/cache/reload

# Limpiar todo y empezar de cero
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## Próximos Pasos

1. ✅ Docker instalado y corriendo
2. ✅ Contenedor construido
3. ✅ Aplicación accesible en localhost:3001
4. 🎯 **Opcional:** Configurar como servicio de Windows para inicio automático
5. 🎯 **Opcional:** Configurar reverse proxy (nginx) para acceso por dominio

---

**¿Necesitas ayuda?** Revisa el archivo completo [DOCKER.md](./DOCKER.md)
