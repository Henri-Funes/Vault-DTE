# 📚 Índice de Documentación - Visor Portable Hermaco

## 🎯 Empieza Aquí

Si es tu primera vez, lee estos documentos en orden:

1. **[CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md)** ⭐  
   Resumen completo de qué se hizo y por qué

2. **[COMANDOS.md](COMANDOS.md)** ⚡  
   Comandos rápidos para usar día a día

3. **[PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md)** 🚀  
   Guía rápida de 5 minutos para usuarios finales

---

## 📖 Documentación Completa

### Para Usuarios Finales

| Documento                                        | Descripción              | Cuándo leerlo            |
| ------------------------------------------------ | ------------------------ | ------------------------ |
| [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md) | Cómo usar el portable    | Al distribuir a usuarios |
| [TESTING-GUIDE.md](TESTING-GUIDE.md)             | Cómo probar que funciona | Antes de distribuir      |

### Para Desarrolladores

| Documento                                      | Descripción                    | Cuándo leerlo             |
| ---------------------------------------------- | ------------------------------ | ------------------------- |
| [ELECTRON-README.md](ELECTRON-README.md)       | Documentación técnica completa | Para entender a fondo     |
| [ARCHITECTURE.md](ARCHITECTURE.md)             | Diagramas y arquitectura       | Para modificar el sistema |
| [ELECTRON-CHECKLIST.md](ELECTRON-CHECKLIST.md) | Checklist de implementación    | Referencia de lo hecho    |
| [COMANDOS.md](COMANDOS.md)                     | Comandos útiles                | Uso diario                |

### Guías Específicas

| Documento                                      | Tema                     | Para qué                    |
| ---------------------------------------------- | ------------------------ | --------------------------- |
| [TESTING-GUIDE.md](TESTING-GUIDE.md)           | Pruebas exhaustivas      | Testing antes de producción |
| [CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md) | Resumen de la conversión | Entender qué cambió         |

---

## 🗂️ Estructura de Archivos del Proyecto

```
visor/
│
├─ 📱 APLICACIÓN
│  ├── electron/              # Archivos de Electron
│  │   ├── main.js           # Proceso principal (detecta rutas)
│  │   ├── preload.js        # IPC seguro
│  │   └── icon.ico          # Ícono de la app
│  │
│  ├── server/               # Backend Express
│  │   ├── index.js          # API + sistema de rutas dinámicas
│  │   └── README.md
│  │
│  ├── src/                  # Frontend Vue.js
│  │   ├── components/
│  │   ├── modules/          # Explorer, Estadisticas, Empaquetador
│  │   ├── services/         # API client
│  │   └── views/
│  │
│  └── public/               # Assets estáticos
│
├─ ⚙️ CONFIGURACIÓN
│  ├── package.json          # Dependencias y scripts
│  ├── electron-builder.json # Config de empaquetado
│  ├── vite.config.ts        # Config de Vite
│  ├── tsconfig.json         # TypeScript
│  └── uno.config.ts         # UnoCSS
│
├─ 🔨 SCRIPTS
│  ├── build-portable.ps1    # Compilar portable automático
│  ├── dev-electron.ps1      # Desarrollo con Electron
│  ├── build-and-test.ps1    # Testing legacy
│  └── start.ps1             # Servidor legacy
│
├─ 📚 DOCUMENTACIÓN (¡Estás aquí!)
│  ├── INDEX.md              # Este archivo
│  ├── CONVERSION-SUMMARY.md # Resumen completo ⭐
│  ├── COMANDOS.md           # Comandos rápidos ⚡
│  ├── PORTABLE-QUICKSTART.md# Guía usuarios 🚀
│  ├── ELECTRON-README.md    # Docs técnica completa
│  ├── ARCHITECTURE.md       # Diagramas y arquitectura
│  ├── ELECTRON-CHECKLIST.md # Checklist de implementación
│  ├── TESTING-GUIDE.md      # Guía de pruebas
│  └── README.md             # README principal
│
├─ 🐳 DOCKER (Legacy - no usado en portable)
│  ├── DOCKER.md
│  ├── DOCKER-CHECKLIST.md
│  ├── QUICKSTART-DOCKER.md
│  └── WINDOWS-DOCKER-GUIDE.md
│
└─ 📦 BUILDS (Generados)
   ├── dist/                 # Frontend compilado
   ├── dist-electron/        # Portable .exe ← ¡Tu objetivo!
   └── node_modules/         # Dependencias
```

---

## 🎯 Flujos de Trabajo Comunes

### 1️⃣ "Nunca he trabajado con esto"

```
📖 Lee: CONVERSION-SUMMARY.md
     ↓
⚡ Revisa: COMANDOS.md
     ↓
🚀 Ejecuta: .\dev-electron.ps1
     ↓
✅ ¡Listo! Ya conoces lo básico
```

### 2️⃣ "Quiero entender cómo funciona"

```
📖 Lee: ELECTRON-README.md (completo)
     ↓
📐 Revisa: ARCHITECTURE.md (diagramas)
     ↓
🔍 Estudia: electron/main.js y server/index.js
     ↓
✅ Ya entiendes la arquitectura
```

### 3️⃣ "Quiero crear el portable"

```
⚡ Ejecuta: .\build-portable.ps1
     ↓
🧪 Prueba localmente (ver TESTING-GUIDE.md)
     ↓
📦 Distribuye (ver PORTABLE-QUICKSTART.md)
     ↓
✅ Portable funcionando en producción
```

### 4️⃣ "Tengo un problema"

```
🔍 Busca en: COMANDOS.md sección "Troubleshooting"
     ↓
📖 Si no lo encuentras: TESTING-GUIDE.md
     ↓
🆘 Si persiste: revisar logs (F12 en Electron)
     ↓
✅ Problema resuelto
```

---

## 🔑 Conceptos Clave

### Electron

- **Main Process** → Detecta rutas, lanza servidor
- **Renderer Process** → Tu app Vue en ventana Chromium
- **IPC** → Comunicación segura entre procesos

### Rutas Dinámicas

- Detecta automáticamente dónde está el .exe
- Busca carpeta `Backup` junto a él
- No usa rutas hardcodeadas

### Portable

- Un solo .exe con todo incluido
- No requiere instalación
- Funciona desde red compartida

---

## 📞 Soporte Rápido

### ❓ Pregunta → Documento

| "¿Cómo...?"                    | Documento                                        |
| ------------------------------ | ------------------------------------------------ |
| ...uso el portable?            | [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md) |
| ...compilo el portable?        | [COMANDOS.md](COMANDOS.md) → Compilación         |
| ...funciona internamente?      | [ARCHITECTURE.md](ARCHITECTURE.md)               |
| ...pruebo antes de distribuir? | [TESTING-GUIDE.md](TESTING-GUIDE.md)             |
| ...desarrollo nuevas features? | [ELECTRON-README.md](ELECTRON-README.md)         |
| ...resuelvo un error?          | [COMANDOS.md](COMANDOS.md) → Troubleshooting     |

### 🐛 Error → Solución

| Error                        | Solución                                               |
| ---------------------------- | ------------------------------------------------------ |
| "No encuentra Backup"        | Verificar estructura: Backup/ junto al .exe            |
| "Port 3001 in use"           | Ver [COMANDOS.md](COMANDOS.md) - Troubleshooting       |
| "Cannot find module"         | `npm install`                                          |
| "electron-builder not found" | `npm install`                                          |
| No inicia en otra PC         | Ver [TESTING-GUIDE.md](TESTING-GUIDE.md) - Escenario 2 |

---

## 🎓 Niveles de Conocimiento

### Nivel 1: Usuario Final

**Necesitas saber:**

- Dónde poner el .exe
- Que `Backup` va junto a él
- Cómo ejecutarlo

**Lee:**

- [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md)

---

### Nivel 2: Operador/TI

**Necesitas saber:**

- Cómo distribuir en red
- Cómo verificar que funciona
- Troubleshooting básico

**Lee:**

- [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md)
- [TESTING-GUIDE.md](TESTING-GUIDE.md)
- [COMANDOS.md](COMANDOS.md) - Troubleshooting

---

### Nivel 3: Desarrollador

**Necesitas saber:**

- Cómo modificar código
- Cómo compilar
- Arquitectura del sistema

**Lee:**

- [CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md)
- [ELECTRON-README.md](ELECTRON-README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [COMANDOS.md](COMANDOS.md)

---

### Nivel 4: Arquitecto/Lead

**Necesitas saber:**

- Decisiones de diseño
- Por qué se hizo así
- Cómo extender/mejorar

**Lee:**

- TODO lo anterior +
- [ELECTRON-CHECKLIST.md](ELECTRON-CHECKLIST.md)
- Código fuente: `electron/main.js`, `server/index.js`

---

## 🗺️ Mapa Mental

```
               VISOR HERMACO PORTABLE
                        |
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   USAR PORTABLE   DESARROLLAR    DISTRIBUIR
        |               |               |
        ↓               ↓               ↓
 QUICKSTART.md   COMANDOS.md    TESTING-GUIDE.md
                       |
                       ↓
                 ¿Cómo funciona?
                       |
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
  ARCHITECTURE   ELECTRON-README   Código
```

---

## ✅ Checklist de Lectura

Para nuevos en el proyecto:

- [ ] 1. Leer [CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md)
- [ ] 2. Ejecutar `.\dev-electron.ps1` para ver en acción
- [ ] 3. Leer [COMANDOS.md](COMANDOS.md) para referencia
- [ ] 4. Revisar [ARCHITECTURE.md](ARCHITECTURE.md) para entender
- [ ] 5. Compilar con `.\build-portable.ps1`
- [ ] 6. Probar según [TESTING-GUIDE.md](TESTING-GUIDE.md)
- [ ] 7. Leer [PORTABLE-QUICKSTART.md](PORTABLE-QUICKSTART.md) para distribuir

---

## 🔄 Actualizaciones

Este índice se actualiza cuando:

- Se agrega nueva documentación
- Cambia la estructura del proyecto
- Se descubren nuevos flujos de trabajo comunes

**Última actualización:** 26 de noviembre de 2025

---

## 💡 Recomendaciones

### Para empezar:

1. Lee [CONVERSION-SUMMARY.md](CONVERSION-SUMMARY.md) (10 min)
2. Ejecuta `.\dev-electron.ps1` (ver funcionar)
3. Revisa [COMANDOS.md](COMANDOS.md) (tener a mano)

### Para producción:

1. Lee [TESTING-GUIDE.md](TESTING-GUIDE.md) completo
2. Prueba todos los escenarios
3. Documenta tu configuración específica

### Para mantenimiento:

1. Guarda [COMANDOS.md](COMANDOS.md) como favorito
2. Conoce [ARCHITECTURE.md](ARCHITECTURE.md) para cambios
3. Actualiza versión en `package.json`

---

**🎉 ¡Bienvenido al proyecto Visor Portable Hermaco!**

Este índice es tu mapa - úsalo para navegar toda la documentación.
