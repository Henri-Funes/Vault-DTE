# 🚀 Guía Rápida - Portable Hermaco

## Para usuarios finales

### ✅ Pasos para usar el portable:

1. **Descargar** el archivo `Visor Hermaco-1.0.0-Portable.exe`

2. **Copiar** el ejecutable al disco compartido donde están las facturas

3. **Verificar** que la estructura sea así:

   ```
   DiscoCompartido/
   ├── Visor Hermaco-1.0.0-Portable.exe
   └── Backup/
       ├── SA/
       ├── SM/
       ├── SS/
       ├── gastos/
       └── remisiones/
   ```

4. **Ejecutar** el archivo .exe

5. **¡Listo!** La aplicación abrirá automáticamente

### ⚠️ Importante

- La carpeta `Backup` **DEBE** estar junto al .exe
- Funciona desde cualquier PC con acceso al disco compartido
- No requiere instalación

### 🔍 Si no funciona

- Verifica que la carpeta `Backup` esté en el lugar correcto
- Verifica permisos de lectura en la carpeta compartida
- Contacta al equipo de TI

---

## Para desarrolladores

### Compilar el portable:

```powershell
# Instalar dependencias
npm install

# Compilar y empaquetar
npm run electron:build
```

El portable se genera en `dist-electron/`

### Modo desarrollo:

```powershell
npm run electron:dev
```

Ver `ELECTRON-README.md` para más detalles.
