================================================================================

          ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗    ██████╗ ████████╗███████╗
          ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝    ██╔══██╗╚══██╔══╝██╔════╝
          ██║   ██║███████║██║   ██║██║     ██║       ██║  ██║   ██║   █████╗
          ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║       ██║  ██║   ██║   ██╔══╝
           ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║       ██████╔╝   ██║   ███████╗
            ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝       ╚═════╝    ╚═╝   ╚══════╝

================================================================================

              Transformando Cumplimiento Tributario en Inteligencia de Negocio

================================================================================

📋 INTRODUCCIÓN
════════════════════════════════════════════════════════════════════════════════

Vault-DTE es una plataforma empresarial full-stack que convierte 50,000+
facturas electrónicas en datos accionables. Permite a las empresas buscar,
analizar y reportar información fiscal en segundos en lugar de horas.

Desarrollado durante pasantía en Hermaco - Demostración de impacto real en
proyectos de producción.

🎯 CARACTERÍSTICAS PRINCIPALES
════════════════════════════════════════════════════════════════════════════════

✓ Búsqueda Avanzada de Facturas
Encuentra documentos por código, cliente, fecha o estado en <5 segundos

✓ Dashboard Inteligente en Tiempo Real
Visualiza estadísticas por sucursal, clientes y tipos de documento

✓ Gestor de Descargas Masivas
Empaqueta facturas en ZIP con PDFs reales sin saturar servidor

✓ Documentación Interactiva Swagger
Prueba todos los endpoints sin escribir código

✓ Arquitectura Dual (Demo + Producción)
Demo para portfolio, Producción para datos reales con MongoDB

✓ Sin Autenticación Requerida
Acceso inmediato a la versión Demo

✓ Datos de Alta Fidelidad
500 facturas realistas + 50 clientes + 400 PDFs funcionales

⚡ IMPACTO Y RESULTADOS
════════════════════════════════════════════════════════════════════════════════

Métrica Antes Con Vault-DTE Mejora
────────────────────────────────────────────────────────────────────────────
Búsqueda de Documentos 5-10 minutos < 5 segundos 90%
Generación de Reportes 2 horas Instantáneo 100%
Usuarios Concurrentes 1 Ilimitado ∞
Escalabilidad ~100 registros 50,000+ 500x
Costo de Operación Manual Automatizado Reducido

🚀 GUÍA DE INSTALACIÓN
════════════════════════════════════════════════════════════════════════════════

PASO 1: CLONAR REPOSITORIO

$ git clone https://github.com/tu-usuario/vault-dte.git
$ cd vault-dte

PASO 2: INSTALAR DEPENDENCIAS

$ npm install

PASO 3: INICIAR DESARROLLO COMPLETO

$ npm run dev:all

LISTO. Los servicios están disponibles en:

Frontend: http://localhost:5173
API Backend: http://localhost:3001
Swagger Docs: http://localhost:3001/api-docs

✨ REQUISITOS PREVIOS
════════════════════════════════════════════════════════════════════════════════

• Node.js 16+ (Descargar desde nodejs.org)
• npm 7+ (Incluido con Node.js)
• Git (Para clonar el repositorio)

NOTA: La versión Demo NO requiere MongoDB. Solo para modo Producción.

📦 ESTRUCTURA DEL PROYECTO
════════════════════════════════════════════════════════════════════════════════

vault-dte/
├── 📁 server/
│ ├── mock-data/ Datos sintéticos (Demo)
│ ├── models/ Esquemas Mongoose (Prod)
│ ├── index.js API principal
│ └── index.production.js Versión con MongoDB
│
├── 📁 src/
│ ├── modules/
│ │ ├── Explorer/ Búsqueda y visualización
│ │ ├── Statistics/ Dashboard analítico
│ │ └── Clients/ Gestión de clientes
│ │
│ ├── components/ Componentes reutilizables
│ ├── stores/ Estado global (Pinia)
│ ├── App.vue Componente raíz
│ └── main.js Punto de entrada
│
├── 📁 docs/ Documentación técnica
├── package.json
└── vite.config.js

🔧 COMANDOS DISPONIBLES
════════════════════════════════════════════════════════════════════════════════

$ npm run dev:all Inicia frontend + backend simultáneamente
$ npm run dev:demo Backend en modo DEMO (datos ficticios)
$ npm run dev:prod Backend en modo PRODUCCIÓN (MongoDB)
$ npm run build Optimiza para producción
$ npm run preview Visualiza el build final
$ npm test Ejecuta pruebas unitarias

📚 DOCUMENTACIÓN DE API
════════════════════════════════════════════════════════════════════════════════

La API incluye Swagger UI interactivo. Accede a:

http://localhost:3001/api-docs

Desde ahí puedes probar TODOS los endpoints sin escribir código:

🔍 CIUDADES - Búsqueda y Gestión de Facturas
────────────────────────────────────────────────────────────────────────────

GET /api/backup/stats Estadísticas por sucursal
GET /api/backup/structure Árbol de carpetas del sistema
GET /api/backup/folder/:folderName Listado paginado de facturas
GET /api/backup/search?query=ABC123 Búsqueda global de facturas
GET /api/backup/check-updates Verificar facturas nuevas

👥 CLIENTES - Análisis y Historial
────────────────────────────────────────────────────────────────────────────

GET /api/clientes Clientes con anuladas
GET /api/clientes/notas-credito Clientes con notas de crédito
GET /api/clientes/:nombre/anuladas Anuladas por cliente
GET /api/clientes/:nombre/notas-credito Notas de crédito por cliente

📥 DESCARGAS - Empaquetado Dinámico
────────────────────────────────────────────────────────────────────────────

GET /api/file/content Obtener archivo (JSON o PDF)
POST /api/backup/download-folders Descargar múltiples carpetas
POST /api/backup/download-files Descargar archivos específicos

🏥 MONITOREO - Estado del Sistema
────────────────────────────────────────────────────────────────────────────

GET /api/health Estado de la API y BD

💾 DATOS DE DEMOSTRACIÓN
════════════════════════════════════════════════════════════════════════════════

La versión Demo incluye datos completamente ficticios y seguros:

• 500 facturas realistas con patrones de negocio reales
• 50 clientes sintéticos generados automáticamente
• 400+ PDFs funcionales para pruebas de descarga
• Todas las sucursales de ejemplo (H1, H2, H3, etc.)
• 100% seguro para mostrar públicamente en portfolio

🛠️ STACK TECNOLÓGICO
════════════════════════════════════════════════════════════════════════════════

FRONTEND BACKEND
──────────────────────────────── ────────────────────────────────────
✓ Vue 3 + TypeScript ✓ Node.js + Express
✓ UnoCSS (Atomic CSS) ✓ MongoDB + Mongoose
✓ Pinia (State Management) ✓ Archiver (ZIP Streaming)
✓ Composition API ✓ Swagger OpenAPI 3.0
✓ Vite (Build Tool) ✓ Jest (Testing)

📊 EJEMPLO DE RESPUESTA
════════════════════════════════════════════════════════════════════════════════

Content-Type: application/json

{
"success": true,
"data": {
"pdf": 500,
"json": 500,
"detallePorSucursal": {
"H1 - Santa Ana": {
"facturas": 175,
"gastos": 8,
"total": 198
},
"H2 - San Salvador": {
"facturas": 150,
"gastos": 12,
"total": 162
}
}
},
"timestamp": "2026-01-25T15:30:00Z"
}

🏛️ FILOSOFÍA DEL PROYECTO
════════════════════════════════════════════════════════════════════════════════

ARQUITECTURA DUAL ÚNICA
────────────────────────────────────────────────────────────────────────────

Aspecto Demo Producción
─────────────────────────────────────────────────────────────────────────────
Fuente de Datos Archivos JSON Base de Datos MongoDB
Velocidad Instantánea (RAM) Depende de la red/BD
Configuración Plug and Play Requiere Setup (.env)
Escalabilidad ~500 facturas 50,000+ facturas
Despliegue Ideal Vercel/Railway Windows Server/Intranet
Autenticación No requiere Variables de entorno

MODO DEMO: EL "SANDBOX"
────────────────────────────────────────────────────────────────────────────

✓ Infraestructura Zero: No necesitas MongoDB ni bases de datos
✓ Funciona al instante en GitHub, Vercel o tu máquina local
✓ Datos realistas pero ficticios (100% seguro para portfolio)
✓ Todas las funcionalidades operativas
✓ Perfecto para demostrar a reclutadores

MODO PRODUCCIÓN: ENTORNO REAL
────────────────────────────────────────────────────────────────────────────

✓ Escalable a 50,000+ facturas
✓ Conexión robusta a MongoDB
✓ Agregaciones optimizadas en base de datos
✓ Seguridad mediante variables de entorno
✓ Desplegado actualmente en infraestructura real

🚀 DESPLIEGUE
════════════════════════════════════════════════════════════════════════════════

PARA PORTFOLIO (Vercel / Railway)
────────────────────────────────────────────────────────────────────────────

1. Asegúrate de que server/index.js es el punto de entrada
2. Verifica que server/mock-data esté en el repositorio
3. Conecta tu repo a Vercel/Railway
4. Deploy automático - ¡Listo!

Ventaja: No requiere variables de entorno

PARA SERVIDOR LOCAL (PM2)
────────────────────────────────────────────────────────────────────────────

1. Instala MongoDB en tu servidor

2. Configura .env con credenciales:
   MONGODB_URI=mongodb://usuario:password@host:27017/database

3. Ejecuta:
   $ npm run build
   $ pm2 start ecosystem.config.js

4. Verifica logs:
   $ pm2 logs

📖 DOCUMENTACIÓN EXTENDIDA
════════════════════════════════════════════════════════════════════════════════

Consulta la carpeta docs/ para:

✓ Referencia de Endpoints MongoDB (Producción)
✓ Filosofía del Proyecto y Arquitectura Dual
✓ Guía de Migración Demo → Producción
✓ Modelos de Base de Datos
✓ Ejemplos de Uso Completos

🎓 APRENDIZAJES DEMOSTRADOS
════════════════════════════════════════════════════════════════════════════════

Optimización de Rendimiento
→ Cache en backend para reducir I/O
→ Agregaciones MongoDB optimizadas
→ Streaming de ZIP sin saturar RAM

Seguridad y Datos
→ Manejo de información sensible con .env
→ Normalización de datos ficticios
→ Separación segura Demo/Producción

Arquitectura
→ API RESTful con responsabilidad única
→ Dualidad sin duplicar lógica
→ Documentación interactiva (Swagger)

Experiencia de Usuario
→ Interfaz intuitiva para usuarios no técnicos
→ Necesidades contables → UI clara
→ Navegación fluida con Pinia

❓ PREGUNTAS FRECUENTES
════════════════════════════════════════════════════════════════════════════════

¿Necesito MongoDB para ejecutar?
No en Demo. Solo en modo Producción.

¿Los datos son reales?
Demo: Completamente ficticios (seguro para portfolio)
Producción: Datos reales de Hermaco

¿Es código de producción?
Sí, está desplegado actualmente en infraestructura real.

¿Puedo usar esto como plantilla?
Sí, la arquitectura es agnóstica a la fuente de datos.

¿Qué tan escalable es?
Probado con 50,000+ registros en producción.

¿Puedo probar sin instalar nada?
Sí, accede a la versión online en tu portfolio.

📝 VERSIONES
════════════════════════════════════════════════════════════════════════════════

Para cambios recientes y versiones anteriores, consulta CHANGELOG.md

Versión Actual: 1.0.0 - Versión estable con todas las características

👨‍💻 AUTOR
════════════════════════════════════════════════════════════════════════════════

Henri
Desarrollador Full Stack especializado en Soluciones Empresariales

Experiencia:
✓ Soluciones integradas frontend + backend
✓ Arquitectura de sistemas escalables
✓ Optimización de rendimiento
✓ Traducción de requisitos de negocio a código
✓ Despliegue en producción

LinkedIn: https://linkedin.com/in/tu-perfil
Portfolio: https://tu-portfolio.com
Email: tu-email@tudominio.com
GitHub: https://github.com/tu-usuario

🤝 AGRADECIMIENTOS
════════════════════════════════════════════════════════════════════════════════

A Hermaco, por confiar en mi criterio técnico para liderar el desarrollo
de una herramienta que hoy optimiza sus operaciones diarias.

🔗 CONTRIBUCIONES
════════════════════════════════════════════════════════════════════════════════

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

Revisa CONTRIBUTING.md para más detalles.

📄 LICENCIA
════════════════════════════════════════════════════════════════════════════════

MIT License

Libre para usar, modificar y distribuir en proyectos personales y comerciales.
Consulta LICENSE.txt para más detalles.

================================================================================

              Ready? Clone y explora el código. Ver es creer.

              $ git clone https://github.com/tu-usuario/vault-dte.git
              $ npm install && npm run dev:all

================================================================================
