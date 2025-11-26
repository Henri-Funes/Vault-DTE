# 🧪 Guía de Pruebas del Portable

## Escenario 1: Prueba Local (Misma PC)

### Preparación

1. Compilar el portable:

   ```powershell
   .\build-portable.ps1
   ```

2. Crear estructura de prueba:

   ```powershell
   # Crear carpeta temporal de prueba
   New-Item -ItemType Directory -Path "C:\Temp\VisorTest"

   # Copiar el ejecutable
   Copy-Item "dist-electron\Visor Hermaco-*.exe" "C:\Temp\VisorTest\"

   # Crear carpeta Backup de prueba
   New-Item -ItemType Directory -Path "C:\Temp\VisorTest\Backup"
   New-Item -ItemType Directory -Path "C:\Temp\VisorTest\Backup\SA"
   New-Item -ItemType Directory -Path "C:\Temp\VisorTest\Backup\SM"

   # Copiar algunos archivos de prueba
   Copy-Item "C:\Dashboard\Backup\SA\*.pdf" "C:\Temp\VisorTest\Backup\SA\" -ErrorAction SilentlyContinue
   ```

3. Ejecutar:
   ```powershell
   cd C:\Temp\VisorTest
   & ".\Visor Hermaco-1.0.0-Portable.exe"
   ```

### Verificar

- [ ] La ventana abre correctamente
- [ ] No hay errores en la consola (F12)
- [ ] Las carpetas se muestran en el explorador
- [ ] Los archivos se listan correctamente
- [ ] Las estadísticas se calculan
- [ ] El empaquetador funciona

---

## Escenario 2: Prueba en Red Local (Carpeta Compartida)

### Preparación

1. Crear carpeta compartida:

   ```powershell
   # En el servidor/PC principal
   New-Item -ItemType Directory -Path "C:\Compartido\VisorHermaco"

   # Compartir la carpeta (ajustar según tu red)
   # Permisos: Lectura para todos
   ```

2. Copiar archivos:

   ```powershell
   # Copiar ejecutable
   Copy-Item "dist-electron\Visor Hermaco-*.exe" "C:\Compartido\VisorHermaco\"

   # Copiar carpeta Backup real
   Copy-Item "C:\Dashboard\Backup" "C:\Compartido\VisorHermaco\Backup" -Recurse
   ```

3. Acceder desde otra PC:
   ```powershell
   # En otra PC de la red
   cd \\NOMBRE-SERVIDOR\VisorHermaco
   & ".\Visor Hermaco-1.0.0-Portable.exe"
   ```

### Verificar

- [ ] Se puede acceder desde otra PC
- [ ] Carga los archivos correctamente
- [ ] Rendimiento aceptable
- [ ] No hay errores de permisos

---

## Escenario 3: Prueba con Ruta UNC

### Preparación

```powershell
# Mapear unidad de red (opcional)
net use Z: \\servidor\compartido

# O usar ruta UNC directamente
cd \\servidor\compartido\VisorHermaco
```

### Estructura

```
\\servidor\compartido\VisorHermaco\
├── Visor Hermaco-1.0.0-Portable.exe
└── Backup\
    ├── SA\
    ├── SM\
    ├── SS\
    ├── gastos\
    └── remisiones\
```

### Verificar

- [ ] Funciona con rutas UNC
- [ ] Funciona con unidad mapeada
- [ ] Acceso desde múltiples PCs simultáneamente

---

## Debugging y Diagnóstico

### Ver logs del servidor

1. Abrir DevTools en Electron: `F12` o `Ctrl+Shift+I`
2. Ir a la pestaña "Console"
3. Buscar mensajes que empiecen con:
   - `📂 Configuración de rutas:`
   - `✅ Ruta de backup accesible`
   - `⚠️ ADVERTENCIA:`

### Endpoint de diagnóstico

```
http://localhost:3001/api/system/info
```

Muestra:

```json
{
  "success": true,
  "data": {
    "nodeEnv": "production",
    "isElectron": true,
    "backupPath": "C:\\Temp\\VisorTest\\Backup",
    "serverDir": "...",
    "platform": "win32",
    "cwd": "..."
  }
}
```

### Problemas comunes

#### "No se encuentra la carpeta Backup"

```powershell
# Verificar estructura
Get-ChildItem -Path "." -Directory

# Debe mostrar:
# Backup/
# Visor Hermaco-1.0.0-Portable.exe
```

#### "Acceso denegado"

```powershell
# Verificar permisos de lectura
icacls "Backup"

# Debe mostrar al menos: BUILTIN\Users:(R)
```

#### "No carga datos"

1. Abrir DevTools (F12)
2. Ir a Network
3. Verificar llamadas a `/api/backup/structure`
4. Ver respuesta y errores

---

## Prueba de Rendimiento

### Benchmark de carga inicial

1. Medir tiempo de inicio
2. Verificar uso de CPU
3. Verificar uso de memoria

### Caché del servidor

- Primera carga: ~2-5 segundos
- Carga desde caché: instantánea
- Caché válida por: 5 minutos

### Optimización

Si es lento, verificar:

- Cantidad de archivos en Backup
- Velocidad de red (si es compartido)
- Caché está habilitada

---

## Checklist de Pruebas Completo

### Funcionalidad Básica

- [ ] Aplicación abre correctamente
- [ ] Interfaz se muestra completa
- [ ] No hay errores en consola

### Explorador

- [ ] Lista todas las carpetas (SA, SM, SS, gastos, remisiones)
- [ ] Muestra cantidad de archivos por carpeta
- [ ] Permite navegar entre carpetas
- [ ] Muestra detalles de archivos
- [ ] Búsqueda funciona

### Estadísticas

- [ ] Calcula totales correctamente
- [ ] Muestra gráficos (si aplica)
- [ ] Cuenta por tipo de archivo (PDF, JSON, XML)
- [ ] Facturas emparejadas se detectan

### Empaquetador

- [ ] Permite seleccionar facturas
- [ ] Genera ZIP correctamente
- [ ] Descarga funciona
- [ ] Nombres de archivo correctos

### Rutas Dinámicas

- [ ] Detecta carpeta Backup automáticamente
- [ ] Funciona desde diferentes ubicaciones
- [ ] Logs muestran ruta correcta

### Red/Compartido

- [ ] Funciona desde disco compartido
- [ ] Múltiples usuarios pueden acceder
- [ ] No hay conflictos de archivos

---

## Reporte de Bugs

Si encuentras problemas, reportar:

1. **Mensaje de error completo** (de DevTools)
2. **Estructura de carpetas** donde está el .exe
3. **Sistema operativo** y versión
4. **Ubicación** (local, red, UNC)
5. **Logs de consola** (copiar todo)

---

**Actualizado:** 2025-11-26
