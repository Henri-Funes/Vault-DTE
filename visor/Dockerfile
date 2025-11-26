# ---------------------------------------
# Etapa 1: Build del frontend Vue
# ---------------------------------------
# Usar imagen base de Windows y instalar Node.js manualmente
FROM mcr.microsoft.com/windows/nanoserver:1809 AS frontend-build

# Descargar e instalar Node.js 18
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.20.4/node-v18.20.4-win-x64.zip' -OutFile 'node.zip'; \
    Expand-Archive node.zip -DestinationPath C:\; \
    Rename-Item -Path C:\node-v18.20.4-win-x64 -NewName nodejs; \
    Remove-Item -Force node.zip

# Agregar Node.js al PATH
ENV PATH="C:\nodejs;${PATH}"

WORKDIR C:\app\frontend

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# ---------------------------------------
# Etapa 2: Servidor final con Node.js
# ---------------------------------------
FROM mcr.microsoft.com/windows/nanoserver:1809

# Descargar e instalar Node.js 18
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.20.4/node-v18.20.4-win-x64.zip' -OutFile 'node.zip'; \
    Expand-Archive node.zip -DestinationPath C:\; \
    Rename-Item -Path C:\node-v18.20.4-win-x64 -NewName nodejs; \
    Remove-Item -Force node.zip

# Agregar Node.js al PATH
ENV PATH="C:\nodejs;${PATH}"

WORKDIR C:\app

# Copiar archivos de dependencias del servidor
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el código del servidor
COPY server/ ./server/

# Copiar el build del frontend desde la etapa anterior
COPY --from=frontend-build C:\app\frontend\dist ./dist

# Exponer puertos
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001
# IMPORTANTE: Ruta absoluta estilo Windows para el backup
ENV BACKUP_PATH=C:\\backup

# Crear directorio para volumen
RUN mkdir C:\backup

# Healthcheck adaptado para Windows
# (curl no viene por defecto en nanoserver, usamos el script de node interno que ya tenías, es perfecto)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar el servidor
CMD ["node", "server/index.js"]