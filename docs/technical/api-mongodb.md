================================================================================
REFERENCIA DE ENDPOINTS MONGODB
PRODUCCIÓN
================================================================================

Este archivo documenta los endpoints originales que usaban MongoDB.
La versión demo simula estos mismos endpoints usando datos JSON en memoria.

================================================================================
SCHEMA MONGODB - MODELO FACTURA
================================================================================

El schema completo está en models/Factura.js e incluye los siguientes
campos principales:

ESTRUCTURA BASE
───────────────────────────────────────────────────────────────────────────────
• Identificación - Código de generación - Fecha de emisión - Número de control - Tipo de documento

• Emisor - NIT - Nombre y datos del que emite

• Receptor - Nombre - Número de documento - Datos del cliente

• Cuerpo del Documento - Lista de items - Descripción, cantidad y precio unitario

• Resumen - Totales a pagar - IVA y otros montos

• Categoría de Origen - Clasificación (SA, SM, SS, gastos, etc.)

• Gestión de PDFs - Indica si tiene respaldo PDF - Ruta del archivo

• Fecha de Migración - Cuándo se agregó a la base de datos

ÍNDICES PARA BÚSQUEDAS RÁPIDAS
───────────────────────────────────────────────────────────────────────────────
• Fecha de emisión ordenada con categoría
• Nombre del receptor con fecha de emisión

================================================================================
ENDPOINTS DISPONIBLES
================================================================================

1. ESTADÍSTICAS
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/backup/stats

Obtiene información general de las facturas:
• Total de facturas por categoría
• Cantidad de facturas con respaldo en PDF
• Facturas agregadas recientemente (últimas 24 horas)

2. ESTRUCTURA DE CARPETAS
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/backup/structure

Lista las carpetas disponibles agrupadas por categoría:
• SA (compras)
• SM (servicios)
• SS (suministros)
• Y otras categorías disponibles

3. ARCHIVOS DE CARPETA
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/backup/folder/:folderName?page=1&limit=100&dateFrom=&dateTo=

Obtiene las facturas de una carpeta específica con opciones de filtrado:
• Parámetro: nombre de la carpeta (SA, SM, SS, etc.)
• Filtros opcionales: fecha inicial y final
• Paginación: número de página y cantidad por página
• Ordenadas por fecha más reciente

4. BÚSQUEDA GENERAL
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/backup/search?query=ABC123

Busca facturas por:
• Código de generación
• Número de control
• Nombre del archivo PDF

Retorna hasta 100 resultados con la información básica.

5. CLIENTES CON FACTURAS ANULADAS
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/clientes

Lista todos los clientes que tienen facturas anuladas:
• Nombre del cliente
• Cantidad de facturas anuladas
• Ordenado de mayor a menor cantidad

6. CLIENTES CON NOTAS DE CRÉDITO
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/clientes/notas-credito

Similar al anterior pero muestra clientes con notas de crédito
en lugar de anuladas.

7. FACTURAS ANULADAS DE UN CLIENTE
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/clientes/:nombreCliente/anuladas

Obtiene todas las facturas anuladas de un cliente específico:
• Información de identificación
• Datos del receptor
• Ruta del PDF si existe
• Ordenadas por fecha más reciente

8. NOTAS DE CRÉDITO DE UN CLIENTE
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/clientes/:nombreCliente/notas-credito

Similar al anterior pero muestra las notas de crédito emitidas al cliente.

9. CONTENIDO DE ARCHIVO
   ───────────────────────────────────────────────────────────────────────────────
   GET /api/file/content?codigoGeneracion=ABC123&path=SA/ABC123.json

Obtiene el contenido de un archivo específico:
• Para archivos JSON: devuelve los datos completos de la factura
• Para archivos PDF: devuelve el archivo PDF descargable

10. DESCARGAR MÚLTIPLES CARPETAS
    ───────────────────────────────────────────────────────────────────────────────
    POST /api/backup/download-folders

Descarga todas las facturas de una o varias carpetas en un archivo ZIP.

Body esperado:
{
"folders": ["SA", "SM"]
}

Incluye los archivos JSON y PDFs disponibles de cada carpeta.

11. DESCARGAR ARCHIVOS ESPECÍFICOS
    ───────────────────────────────────────────────────────────────────────────────
    POST /api/backup/download-files

Descarga archivos específicos en un archivo ZIP.

Body esperado:
{
"codigosGeneracion": ["ABC123", "XYZ789"]
}

12. VERIFICAR ESTADO DEL SISTEMA
    ───────────────────────────────────────────────────────────────────────────────
    GET /api/health

Verifica que el backend está funcionando correctamente:
• Estado de la conexión a MongoDB
• Base de datos conectada
• Variables de entorno configuradas
• Ruta de respaldos

13. VERIFICAR ACTUALIZACIONES
    ───────────────────────────────────────────────────────────────────────────────
    GET /api/backup/check-updates?since=2026-01-23T10:00:00Z

Verifica si hay facturas nuevas desde una fecha específica:
• Parámetro: fecha y hora en formato ISO
• Retorna cantidad de facturas nuevas
• Información de la factura más reciente

================================================================================
CONFIGURACIÓN DE CONEXIÓN A MONGODB
================================================================================

El archivo config/database.js maneja la conexión:

import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
if (isConnected) return

    const mongoUri = process.env.MONGODB_URI

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    console.log('Conectado a MongoDB')

}

VARIABLE DE ENTORNO REQUERIDA
───────────────────────────────────────────────────────────────────────────────
Añade en tu archivo .env:

MONGODB_URI=mongodb://usuario:password@host:27017/database?authSource=admin

================================================================================
DEMO VS PRODUCCIÓN
================================================================================

La aplicación incluye dos versiones:

VERSIÓN DEMO (server/index.js)
───────────────────────────────────────────────────────────────────────────────
• Usa archivos JSON estáticos
• No requiere MongoDB
• Ideal para desarrollo y pruebas
• Limitado a aproximadamente 500 facturas

VERSIÓN PRODUCCIÓN (server/index.production.js)
───────────────────────────────────────────────────────────────────────────────
• Usa base de datos MongoDB real
• Búsquedas optimizadas y paginación en base de datos
• Acceso a archivos PDF físicos
• Soporta miles de facturas
• Datos actualizados en tiempo real

================================================================================
MIGRACIÓN DE DEMO A PRODUCCIÓN
================================================================================

Para cambiar de la versión demo a producción:

1. INSTALA MONGODB EN TU SERVIDOR

2. RENOMBRA LOS ARCHIVOS DEL SERVIDOR

   mv server/index.js server/index.demo.js
   mv server/index.production.js server/index.js

3. CONFIGURA TU ARCHIVO .env CON LAS CREDENCIALES REALES DE MONGODB

   MONGODB_URI=tu_uri_real_aqui

4. EJECUTA EL SCRIPT DE MIGRACIÓN PARA IMPORTAR LOS DATOS

   node migrate-paths.js

5. REINICIA EL SERVIDOR

================================================================================
RECURSOS ÚTILES
================================================================================

• Documentación de Mongoose
https://mongoosejs.com/docs/guide.html

• Pipeline de Agregación MongoDB
https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

• Mejores Prácticas Express.js
https://expressjs.com/en/advanced/best-practice-performance.html

================================================================================
INFORMACIÓN GENERAL
================================================================================

Última actualización: Enero 2026
Versión demo: server/index.js
Versión producción: server/index.production.js

================================================================================
