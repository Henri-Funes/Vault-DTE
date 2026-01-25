================================================================================
FILOSOFÍA DEL PROYECTO
================================================================================

VISIÓN GENERAL
───────────────────────────────────────────────────────────────────────────────

Para maximizar la versatilidad del sistema, se mantienen dos núcleos de
servidor independientes. Esto permite que el proyecto viva en GitHub de forma
pública sin comprometer datos sensibles ni requerir infraestructuras complejas
para su visualización.

ESTRUCTURA DE LOS DOS MODOS
───────────────────────────────────────────────────────────────────────────────

COMPONENTE MODO DEMO MODO PRODUCCIÓN
───────────────────────────────────────────────────────────────────────────────
Archivo Base server/index.js server/index.production.js
Fuente de Datos Archivos JSON Base de Datos MongoDB
(Mock Data)  
Entorno Ideal Portfolio, GitHub Servidor Local
Vercel Intranet

================================================================================
MODO DEMO: EL "SANDBOX"
================================================================================

Es la versión optimizada para que reclutadores o interesados vean el potencial
del software al instante.

CARACTERÍSTICAS PRINCIPALES
───────────────────────────────────────────────────────────────────────────────

INFRAESTRUCTURA CERO
• No requiere configurar bases de datos externas
• Funciona solo con Node.js
• Deploy inmediato en plataformas como Vercel

DATOS DE ALTA FIDELIDAD
• 500 registros realistas
• 50 clientes generados sintéticamente
• Simulan patrones reales de facturas

ACTIVOS FUNCIONALES
• Más de 400 PDFs reales incluidos
• Puedes probar el visor de documentos
• Las descargas en ZIP funcionan completamente

PRIVACIDAD TOTAL
• Todos los datos son ficticios
• Cumple con estándares de seguridad de información
• Seguro para mostrar públicamente

CÓMO FUNCIONA INTERNAMENTE
───────────────────────────────────────────────────────────────────────────────

El servidor carga los archivos JSON en la memoria RAM al arrancar, utilizando
métodos nativos de JavaScript (.filter(), .find()) para simular la velocidad
de una base de datos indexada.

Ventaja: Búsquedas instantáneas sin latencia de red

================================================================================
MODO PRODUCCIÓN: EL ENTORNO REAL
================================================================================

Esta versión es la que opera actualmente en la infraestructura privada
de la empresa.

CARACTERÍSTICAS PRINCIPALES
───────────────────────────────────────────────────────────────────────────────

ESCALABILIDAD
• Diseñado para manejar más de 50,000 facturas
• Crece sin limitar el rendimiento
• Optimizado para grandes volúmenes

PERSISTENCIA
• Conexión robusta mediante Mongoose a MongoDB
• Los datos se guardan permanentemente
• Actualizaciones en tiempo real

RENDIMIENTO
• Utiliza agregaciones de base de datos ($group, $match)
• Cálculos estadísticos complejos optimizados
• Respuestas rápidas incluso con muchos registros

SEGURIDAD
• Requiere autenticación mediante variables de entorno
• Credenciales en archivo .env protegido
• Datos privados y controlados

================================================================================
GESTIÓN DE MODOS: CÓMO ALTERNAR
================================================================================

LA FORMA RECOMENDADA (Pro)
───────────────────────────────────────────────────────────────────────────────

En lugar de renombrar archivos, gestiona el arranque mediante scripts de Node.

En tu package.json puedes definir:

{
"scripts": {
"dev:demo": "node server/index.js",
"dev:prod": "node server/index.production.js",
"start": "node server/index.production.js"
}
}

CÓMO USARLOS
───────────────────────────────────────────────────────────────────────────────

Para ver la versión de portfolio (Demo):
$ npm run dev:demo

Para trabajar con datos reales (Producción):
$ npm run dev:prod

Para arrancar en modo producción automático:
$ npm start

VENTAJAS DE ESTE ENFOQUE
───────────────────────────────────────────────────────────────────────────────

• No necesitas renombrar archivos
• Cambias entre modos con un simple comando
• Más profesional y mantenible
• Compatible con herramientas de deploy

================================================================================
EVOLUCIÓN TÉCNICA (Actualización 24/01/2026)
================================================================================

Se ha unificado la respuesta de la API para que el Frontend sea agnóstico
al modo de datos.

Esto significa que ambos servidores (Demo y Producción) ahora entregan el
objeto detallePorSucursal con la misma estructura.

COMPARATIVA DE IMPLEMENTACIÓN
───────────────────────────────────────────────────────────────────────────────

MODO ESTRATEGIA CÓDIGO CLAVE
───────────────────────────────────────────────────────────────────────────────
DEMO Iteración de Array facturasDB.forEach(f => ...)
PRODUCCIÓN Pipeline de Factura.aggregate([
Agregación { $group: ... }
])

RESULTADO UNIFICADO
───────────────────────────────────────────────────────────────────────────────

Ambos modos retornan esta estructura:

{
"pdf": 500,
"json": 500,
"detallePorSucursal": {
"H1 - Santa Ana": {
"facturas": 175,
"gastos": 8,
"total": 198
},
...más sucursales
}
}

El Frontend (EstadisticasNew.vue) recibe exactamente lo mismo, sin importar
si los datos vienen de JSON o MongoDB.

================================================================================
GUÍA DE DESPLIEGUE
================================================================================

PARA TU PORTFOLIO (Vercel/Railway)
───────────────────────────────────────────────────────────────────────────────

1. Asegúrate de que server/index.js esté configurado como punto de entrada

2. Verifica que la carpeta server/mock-data esté incluida en el repositorio

3. Despliega normalmente - no requiere variables de entorno adicionales

4. El Frontend se sirve automáticamente

PARA EL SERVIDOR LOCAL (PM2)
───────────────────────────────────────────────────────────────────────────────

1. Activa el modo producción en tu servidor

2. Configura el archivo .env con las credenciales de la red interna:
   MONGODB_URI=mongodb://usuario:password@host:27017/database

3. Ejecuta el build de Vue:
   npm run build

4. Reinicia el proceso de PM2:
   pm2 restart visor-backup

5. Verifica que está funcionando:
   pm2 logs visor-backup

NOTAS IMPORTANTES
───────────────────────────────────────────────────────────────────────────────

• El .env NUNCA debe ser committeado a Git
• Usa .env.example como plantilla para documentar variables
• En producción, configura las variables a través del panel de deploy
• Revisa los logs después de cada deploy

================================================================================
RESUMEN COMPARATIVO FINAL
================================================================================

CARACTERÍSTICA DEMO PRODUCCIÓN
───────────────────────────────────────────────────────────────────────────────
Velocidad Instantánea (RAM) Depende de la red/DB
Mantenibilidad Alta (simple) Media (requiere DB)
Peso en Disco ~3 MB Gigabytes (Documentos)
Visibilidad Pública (GitHub) Privada (Empresa)
Escalabilidad ~500 facturas 50,000+ facturas
Configuración Plug and Play Requiere Setup
Ideal Para Portfolio/Demo Producción Real
Deploy Vercel/Railway Servidor Local

================================================================================
CONCLUSIÓN
================================================================================

Este diseño de dos núcleos te permite tener lo mejor de ambos mundos:

• Un Demo perfecto para mostrar a otros sin comprometer datos
• Una Producción robusta para operaciones reales
• Código compartido entre ambos modos
• Deploy flexible según necesidad

El proyecto es completamente modular y agnóstico a la fuente de datos, lo que
garantiza mantenibilidad y escalabilidad a largo plazo.

================================================================================
