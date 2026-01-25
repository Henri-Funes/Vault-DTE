import archiver from 'archiver'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs/promises'
import { networkInterfaces } from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { connectDB } from './config/database.js'
import Factura from './models/Factura.js'

// Cargar variables de entorno
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Conectar a MongoDB al iniciar
let mongoConnected = false
connectDB()
  .then(() => {
    mongoConnected = true
    console.log('✅ MongoDB conectado exitosamente')
    console.log('📊 El servidor está listo para servir datos desde MongoDB')
  })
  .catch((err) => {
    mongoConnected = false
    console.error('❌ Error fatal conectando a MongoDB:', err)
    console.error('⚠️  El servidor continuará pero NO podrá servir datos desde MongoDB')
    console.error('⚠️  Verifica MONGODB_URI en el archivo .env')
  })

function getBackupPath() {
  if (process.env.BACKUP_PATH) {
    return process.env.BACKUP_PATH
  }

  // Rutas genéricas de ejemplo - configurar con variables de entorno en producción
  if (NODE_ENV === 'development') {
    return 'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup'
  }

  return 'C:/zeta2/Henri/Copia de seguridad de facturas(No borrar)/Backup'
}

// Ruta del backup - ahora dinámica
const BACKUP_PATH = getBackupPath()

console.log('📂 Configuración de rutas:')
console.log('   - NODE_ENV:', NODE_ENV)
console.log('   - BACKUP_PATH:', BACKUP_PATH)
console.log('   - __dirname:', __dirname)

// CORS - En producción, servir frontend desde el mismo servidor
if (NODE_ENV === 'development') {
  app.use(cors())
}

app.use(express.json())

// ===================================================================
// CONFIGURACIÓN DE SWAGGER
// ===================================================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vault-DTE API',
      version: '1.0.0',
      description: 'API REST para gestión de facturas electrónicas (DTE) con MongoDB',
      contact: {
        name: 'Hermaco - Sistema de Gestión DTE',
        email: 'soporte@hermaco.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://production-server:3001',
        description: 'Servidor de producción'
      }
    ],
    tags: [
      { name: 'Estadísticas', description: 'Métricas y análisis de datos' },
      { name: 'Explorador', description: 'Búsqueda y navegación de facturas' },
      { name: 'Clientes', description: 'Gestión de clientes y su historial' },
      { name: 'Empaquetador', description: 'Generación de archivos ZIP' },
      { name: 'Sistema', description: 'Salud y configuración del servidor' }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Mensaje de error' },
            details: { type: 'string', example: 'Detalles adicionales del error' }
          }
        },
        Estadisticas: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                pdf: { type: 'number', example: 500 },
                json: { type: 'number', example: 500 },
                total: { type: 'number', example: 1000 },
                recentFiles: { type: 'number', example: 25 },
                pairedInvoices: { type: 'number', example: 500 },
                anuladas: { type: 'number', example: 10 },
                pairedByFolder: {
                  type: 'object',
                  properties: {
                    SA: { type: 'number', example: 175 },
                    SM: { type: 'number', example: 125 },
                    SS: { type: 'number', example: 125 },
                    gastos: { type: 'number', example: 25 },
                    remisiones: { type: 'number', example: 25 },
                    notas_de_credito: { type: 'number', example: 15 }
                  }
                },
                detallePorSucursal: {
                  type: 'object',
                  properties: {
                    'H1 - Santa Ana': {
                      type: 'object',
                      properties: {
                        facturas: { type: 'number', example: 175 },
                        gastos: { type: 'number', example: 9 },
                        remisiones: { type: 'number', example: 8 },
                        notas_credito: { type: 'number', example: 4 },
                        anuladas: { type: 'number', example: 4 },
                        total: { type: 'number', example: 200 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        VentasPorSucursal: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                periodo: { type: 'number', example: 12 },
                fechaInicio: { type: 'string', format: 'date', example: '2025-01-25' },
                fechaFin: { type: 'string', format: 'date', example: '2026-01-25' },
                ventasPorSucursal: {
                  type: 'object',
                  properties: {
                    'H1 - Santa Ana': {
                      type: 'object',
                      properties: {
                        totalVentas: { type: 'number', example: 123456.78 },
                        facturas: { type: 'number', example: 175 },
                        anuladas: { type: 'number', example: 4 },
                        devuelto: { type: 'number', example: 1234.56 }
                      }
                    },
                    'H2 - San Miguel': {
                      type: 'object',
                      properties: {
                        totalVentas: { type: 'number', example: 98765.43 },
                        facturas: { type: 'number', example: 125 },
                        anuladas: { type: 'number', example: 4 },
                        devuelto: { type: 'number', example: 987.65 }
                      }
                    },
                    'H4 - San Salvador': {
                      type: 'object',
                      properties: {
                        totalVentas: { type: 'number', example: 87654.32 },
                        facturas: { type: 'number', example: 125 },
                        anuladas: { type: 'number', example: 2 },
                        devuelto: { type: 'number', example: 876.54 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./server/index.production.js'] // Ruta al archivo actual
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Servir documentación Swagger en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vault-DTE API Documentation'
}))

// Endpoint para obtener el spec JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

console.log(`📚 Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`)

// Middleware para verificar conexión a MongoDB en endpoints que lo requieren
const requireMongoDB = (req, res, next) => {
  if (!mongoConnected) {
    console.error('⚠️ Intento de acceder a endpoint MongoDB sin conexión activa')
    return res.status(503).json({
      success: false,
      error: 'Base de datos no disponible. Verifica la conexión a MongoDB.',
      details: 'MONGODB_URI podría no estar configurada o el servidor MongoDB no está accesible',
    })
  }
  next()
}

// Servir archivos estáticos del frontend en producción
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  console.log(`📦 Sirviendo frontend desde: ${distPath}`)

  app.use(express.static(distPath))
}

// Función para obtener información de un archivo
async function getFileInfo(filePath, fileName) {
  try {
    const stats = await fs.stat(filePath)
    const ext = path.extname(fileName).toLowerCase().slice(1)

    return {
      name: fileName,
      path: filePath,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      type: getFileType(ext),
      extension: ext,
      isDirectory: stats.isDirectory(),
      modifiedDate: stats.mtime,
      createdDate: stats.birthtime,
    }
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error)
    return null
  }
}

// Función para formatear bytes a formato legible
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Función para determinar el tipo de archivo
function getFileType(ext) {
  const types = {
    pdf: 'pdf',
    json: 'json',
    xml: 'xml',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    txt: 'text',
    doc: 'document',
    docx: 'document',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
  }
  return types[ext] || 'other'
}

// ===================================================================
// ENDPOINTS - ESTADÍSTICAS
// ===================================================================

/**
 * @swagger
 * /api/backup/stats:
 *   get:
 *     tags:
 *       - Estadísticas
 *     summary: Obtener estadísticas generales del sistema
 *     description: Retorna métricas globales de facturas, conteos por categoría y detalle por sucursal desde MongoDB
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estadisticas'
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/backup/stats', requireMongoDB, async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas desde MongoDB...')
    console.log('🔌 Estado de conexión MongoDB:', connectDB ? 'Disponible' : 'No disponible')

    // Total de facturas
    const totalFacturas = await Factura.countDocuments()
    console.log('📈 Total facturas encontradas:', totalFacturas)

    // Facturas con respaldo PDF (para compatibilidad, ahora será igual al total)
    const conPDF = await Factura.countDocuments({ tiene_respaldo_pdf: true })

    // Conteo por categoría
    const porCategoria = await Factura.aggregate([
      { $group: { _id: '$categoria_origen', count: { $sum: 1 } } },
    ])

    // Conteo detallado por sucursal (nuevo)
    const porSucursal = await Factura.aggregate([
      {
        $group: {
          _id: { sucursal: '$sucursal', categoria: '$categoria_origen' },
          count: { $sum: 1 }
        }
      }
    ])

    const pairedByFolder = {
      SA: 0,
      SM: 0,
      SS: 0,
      gastos: 0,
      remisiones: 0,
      notas_de_credito: 0,
    }

    let anuladas = 0

    // Detalle por sucursal (nuevo)
    const detallePorSucursal = {
      'H1 - Santa Ana': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
      'H2 - San Miguel': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
      'H4 - San Salvador': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 }
    }

    porCategoria.forEach((item) => {
      const categoria = item._id
      const count = item.count

      if (categoria === 'SA' || categoria === 'H1') pairedByFolder.SA = count
      else if (categoria === 'SM' || categoria === 'H2') pairedByFolder.SM = count
      else if (categoria === 'SS' || categoria === 'H4') pairedByFolder.SS = count
      else if (categoria === 'gastos') pairedByFolder.gastos = count
      else if (categoria === 'remisiones') pairedByFolder.remisiones = count
      else if (categoria === 'notas_de_credito') pairedByFolder.notas_de_credito = count
      else if (categoria === 'anuladas') anuladas = count
    })

    // Agrupar por sucursal (nuevo)
    porSucursal.forEach((item) => {
      const sucursal = item._id.sucursal
      const categoria = item._id.categoria
      const count = item.count

      if (detallePorSucursal[sucursal]) {
        detallePorSucursal[sucursal].total += count

        if (categoria === 'SA' || categoria === 'SM' || categoria === 'SS' ||
            categoria === 'H1' || categoria === 'H2' || categoria === 'H4') {
          detallePorSucursal[sucursal].facturas += count
        } else if (categoria === 'gastos') {
          detallePorSucursal[sucursal].gastos += count
        } else if (categoria === 'remisiones') {
          detallePorSucursal[sucursal].remisiones += count
        } else if (categoria === 'notas_de_credito') {
          detallePorSucursal[sucursal].notas_credito += count
        } else if (categoria === 'anuladas') {
          detallePorSucursal[sucursal].anuladas += count
        }
      }
    })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const recentFiles = await Factura.countDocuments({
      'identificacion.fecEmi': yesterdayStr,
    })

    const stats = {
      pdf: totalFacturas, // Cambiado: ahora muestra el total de facturas (igual que JSON)
      json: totalFacturas,
      xml: 0, // Ya no lo necesitamos pero lo dejamos para compatibilidad
      images: 0,
      other: 0,
      total: totalFacturas * 2, // PDF + JSON
      totalSize: 0,
      totalSizeFormatted: 'N/A',
      recentFiles,
      pairedInvoices: totalFacturas,
      anuladas,
      pairedByFolder,
      detallePorSucursal, // NUEVO: Detalle completo por sucursal
    }

    console.log('✅ Estadísticas calculadas:', stats)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('❌ Error generating stats:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/backup/structure:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Obtener estructura de carpetas
 *     description: Retorna la estructura jerárquica de carpetas con conteo de archivos por categoría
 *     responses:
 *       200:
 *         description: Estructura obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       example: '/facturas'
 *                     folders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: 'SA'
 *                           path:
 *                             type: string
 *                             example: '/facturas/SA'
 *                           fileCount:
 *                             type: number
 *                             example: 350
 *                     totalFiles:
 *                       type: number
 *                       example: 1000
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/backup/structure', requireMongoDB, async (req, res) => {
  try {
    console.log('📂 Obteniendo estructura de carpetas desde MongoDB...')
    console.log('🔌 Estado de conexión MongoDB:', connectDB ? 'Disponible' : 'No disponible')

    // Obtener conteo por categoría
    const porCategoria = await Factura.aggregate([
      { $group: { _id: '$categoria_origen', count: { $sum: 1 } } },
    ])

    const folders = []

    // Mapeo de categorías a nombres de carpeta
    const categoriasMap = {
      SA: 'SA',
      H1: 'SA',
      SM: 'SM',
      H2: 'SM',
      SS: 'SS',
      H4: 'SS',
      gastos: 'gastos',
      remisiones: 'remisiones',
      notas_de_credito: 'notas_de_credito',
      anuladas: 'anuladas',
    }

    // Agrupar conteos por carpeta
    const conteoPorCarpeta = {}
    porCategoria.forEach((item) => {
      const categoria = item._id
      const folderName = categoriasMap[categoria] || categoria
      conteoPorCarpeta[folderName] = (conteoPorCarpeta[folderName] || 0) + item.count
    })

    // Crear estructura de carpetas
    Object.entries(conteoPorCarpeta).forEach(([folderName, count]) => {
      folders.push({
        name: folderName,
        path: `/facturas/${folderName}`,
        fileCount: count * 2, // PDF + JSON
        files: [], // Se llenarán bajo demanda
        size: 0,
        sizeFormatted: 'N/A',
      })
    })

    const structure = {
      path: '/facturas',
      folders,
      totalFiles: folders.reduce((sum, f) => sum + f.fileCount, 0),
      totalSize: 0,
      totalSizeFormatted: 'N/A',
    }

    console.log('✅ Estructura obtenida:', structure)

    res.json({
      success: true,
      data: structure,
    })
  } catch (error) {
    console.error('❌ Error getting structure:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/backup/ventas-por-sucursal:
 *   get:
 *     tags:
 *       - Estadísticas
 *     summary: Obtener ventas por sucursal con período ajustable
 *     description: Calcula ventas totales, facturas anuladas y devoluciones por sucursal en un período de tiempo específico
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: integer
 *           enum: [1, 6, 12]
 *           default: 12
 *         description: Número de meses a consultar (1, 6 o 12 meses)
 *     responses:
 *       200:
 *         description: Ventas calculadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VentasPorSucursal'
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/backup/ventas-por-sucursal', requireMongoDB, async (req, res) => {
  try {
    const { periodo = 12 } = req.query // 12, 6, o 1 meses
    const mesesAtras = parseInt(periodo)

    console.log(`📈 Calculando ventas por sucursal desde MongoDB (últimos ${mesesAtras} meses)...`)

    // Calcular fecha de inicio
    const fechaFin = new Date()
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras)

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
    const fechaFinStr = fechaFin.toISOString().split('T')[0]

    // Agregación para obtener ventas por sucursal
    const ventasData = await Factura.aggregate([
      {
        $match: {
          'identificacion.fecEmi': {
            $gte: fechaInicioStr,
            $lte: fechaFinStr
          }
        }
      },
      {
        $group: {
          _id: {
            sucursal: '$sucursal',
            categoria: '$categoria_origen'
          },
          totalVentas: { $sum: { $ifNull: ['$resumen.totalPagar', 0] } },
          count: { $sum: 1 }
        }
      }
    ])

    const ventasPorSucursal = {
      'H1 - Santa Ana': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 },
      'H2 - San Miguel': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 },
      'H4 - San Salvador': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 }
    }

    // Procesar datos agregados
    ventasData.forEach(item => {
      const sucursal = item._id.sucursal
      const categoria = item._id.categoria
      const total = item.totalVentas
      const count = item.count

      if (ventasPorSucursal[sucursal]) {
        // Ventas (SA, SM, SS)
        if (categoria === 'SA' || categoria === 'SM' || categoria === 'SS') {
          ventasPorSucursal[sucursal].totalVentas += total
          ventasPorSucursal[sucursal].facturas += count
        }
        // Anuladas
        else if (categoria === 'anuladas') {
          ventasPorSucursal[sucursal].anuladas += count
          ventasPorSucursal[sucursal].devuelto += total
        }
        // Notas de crédito
        else if (categoria === 'notas_de_credito') {
          ventasPorSucursal[sucursal].devuelto += total
        }
      }
    })

    // Redondear valores
    Object.keys(ventasPorSucursal).forEach(sucursal => {
      ventasPorSucursal[sucursal].totalVentas = parseFloat(ventasPorSucursal[sucursal].totalVentas.toFixed(2))
      ventasPorSucursal[sucursal].devuelto = parseFloat(ventasPorSucursal[sucursal].devuelto.toFixed(2))
    })

    console.log('✅ Ventas calculadas:', ventasPorSucursal)

    res.json({
      success: true,
      data: {
        periodo: mesesAtras,
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        ventasPorSucursal
      }
    })
  } catch (error) {
    console.error('❌ Error calculando ventas:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/backup/folder/{folderName}:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Obtener archivos de una carpeta específica
 *     description: Lista facturas de una categoría con paginación y filtros por fecha
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SA, SM, SS, gastos, remisiones, notas_de_credito, anuladas]
 *         description: Nombre de la carpeta/categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (formato YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           codigoGeneracion:
 *                             type: string
 *                             example: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'
 *                           numeroControl:
 *                             type: string
 *                             example: 'DTE-01-00000001-000000000000001'
 *                           cliente:
 *                             type: string
 *                             example: 'CLIENTE EJEMPLO S.A. DE C.V.'
 *                           fecha:
 *                             type: string
 *                             format: date
 *                             example: '2025-01-15'
 *                           total:
 *                             type: number
 *                             example: 1250.50
 *                     total:
 *                       type: number
 *                       example: 175
 *                     page:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 2
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/backup/folder/:folderName', requireMongoDB, async (req, res) => {
  try {
    const { folderName } = req.params
    const { dateFrom, dateTo, limit = '100', page = '1' } = req.query
    console.log(
      `📁 Solicitando archivos de carpeta: ${folderName}, página: ${page}, límite: ${limit}`,
    )

    const limitNum = parseInt(limit) || 100
    const pageNum = parseInt(page) || 1
    const skip = (pageNum - 1) * limitNum

    const query = {}

    const folderToCategorias = {
      SA: ['SA', 'H1'],
      SM: ['SM', 'H2'],
      SS: ['SS', 'H4'],
      gastos: ['gastos'],
      remisiones: ['remisiones'],
      notas_de_credito: ['notas_de_credito'],
      anuladas: ['anuladas'],
    }

    const categorias = folderToCategorias[folderName]
    if (categorias) {
      query['categoria_origen'] = { $in: categorias }
    } else {
      query['categoria_origen'] = folderName
    }

    if (dateFrom || dateTo) {
      query['identificacion.fecEmi'] = {}
      if (dateFrom) query['identificacion.fecEmi'].$gte = dateFrom
      if (dateTo) query['identificacion.fecEmi'].$lte = dateTo
    }

    const totalFacturas = await Factura.countDocuments(query)
    const totalFiles = totalFacturas * 2
    const totalPages = Math.ceil(totalFacturas / limitNum)

    const facturas = await Factura.find(query)
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi receptor.nombre nombre_archivo_pdf ruta_pdf tiene_respaldo_pdf categoria_origen',
      )
      .sort({ 'identificacion.fecEmi': -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    const files = []

    facturas.forEach((factura) => {
      const baseName =
        factura.nombre_archivo_pdf || factura.identificacion?.codigoGeneracion || 'unknown'
      const cleanBaseName = baseName.replace(/\.pdf$/i, '')
      const emissionDate = factura.identificacion?.fecEmi
      const codigoGeneracion = factura.identificacion?.codigoGeneracion
      const pdfPath = factura.ruta_pdf
        ? factura.ruta_pdf.replace(/\\/g, '/')
        : `${folderName}/${cleanBaseName}.pdf`
      const jsonPath = pdfPath.replace(/\.pdf$/i, '.json')

      files.push({
        name: `${cleanBaseName}.json`,
        path: jsonPath,
        size: 5000,
        sizeFormatted: '5 KB',
        type: 'json',
        extension: 'json',
        isDirectory: false,
        modifiedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        emissionDate: emissionDate || null,
        codigoGeneracion: codigoGeneracion || null,
      })

      if (factura.tiene_respaldo_pdf) {
        files.push({
          name: `${cleanBaseName}.pdf`,
          path: pdfPath,
          size: 50000,
          sizeFormatted: '50 KB',
          type: 'pdf',
          extension: 'pdf',
          isDirectory: false,
          modifiedDate: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          emissionDate: emissionDate || null,
          codigoGeneracion: codigoGeneracion || null,
        })
      }
    })

    res.json({
      success: true,
      data: {
        folder: folderName,
        path: `/facturas/${folderName}`,
        files,
        count: files.length,
        filtered: !!(dateFrom || dateTo),
        dateRange: { dateFrom, dateTo },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalFiles,
          totalFacturas,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    })
  } catch (error) {
    console.error('❌ Error reading folder:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint universal para abrir cualquier archivo
app.post('/api/backup/open-file', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporciono la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // Obtener extension del archivo
    const ext = path.extname(filePath).toLowerCase()

    // Leer el archivo
    const fileBuffer = await fs.readFile(filePath)
    const fileName = path.basename(filePath)

    // Determinar el Content-Type segun la extension
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error opening file:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para abrir PDF en el navegador (mantener por compatibilidad)
app.post('/api/backup/open-pdf', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // Leer el archivo y enviarlo como respuesta
    const fileBuffer = await fs.readFile(filePath)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error opening PDF:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para abrir JSON en bloc de notas
app.post('/api/backup/open-notepad', async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó la ruta del archivo',
      })
    }

    // Verificar que el archivo existe
    await fs.access(filePath)

    // En Windows, abrir con notepad
    const { exec } = await import('child_process')
    exec(`notepad "${filePath}"`, (error) => {
      if (error) {
        console.error('Error opening notepad:', error)
      }
    })

    res.json({
      success: true,
      message: 'Archivo abierto en Bloc de Notas',
    })
  } catch (error) {
    console.error('Error opening file in notepad:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/backup/download-folders:
 *   post:
 *     tags:
 *       - Empaquetador
 *     summary: Descargar carpetas completas en formato ZIP
 *     description: Genera un archivo ZIP con todas las facturas de las carpetas seleccionadas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folders
 *             properties:
 *               folders:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [SA, SM, SS, gastos, remisiones, notas_de_credito, anuladas]
 *                 description: Lista de carpetas a empaquetar
 *                 example: ['SA', 'SM']
 *     responses:
 *       200:
 *         description: Archivo ZIP generado exitosamente
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/backup/download-folders', async (req, res) => {
  try {
    const { folders } = req.body

    if (!folders || !Array.isArray(folders) || folders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron carpetas para empaquetar',
      })
    }

    console.log(`📦 Generando ZIP para carpetas: ${folders.join(', ')}`)

    // Configurar el archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Nivel máximo de compresión
    })

    // Configurar headers
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="backup-folders-${Date.now()}.zip"`)

    // Pipe del archivo al response
    archive.pipe(res)

    // Mapear nombres de carpetas a categorías MongoDB
    const folderToCategorias = {
      SA: ['SA', 'H1'],
      SM: ['SM', 'H2'],
      SS: ['SS', 'H4'],
      gastos: ['gastos'],
      remisiones: ['remisiones'],
      notas_de_credito: ['notas_de_credito'],
      anuladas: ['anuladas'],
    }

    // Procesar cada carpeta
    for (const folderName of folders) {
      const categorias = folderToCategorias[folderName] || [folderName]

      console.log(`📁 Procesando carpeta: ${folderName} (categorías: ${categorias.join(', ')})`)

      // Buscar facturas de esta categoría en MongoDB
      const facturas = await Factura.find({
        categoria_origen: { $in: categorias },
      })
        .select('identificacion.codigoGeneracion nombre_archivo_pdf ruta_pdf tiene_respaldo_pdf')
        .lean()

      console.log(`✅ ${facturas.length} facturas encontradas para ${folderName}`)

      // Agregar cada factura al ZIP
      for (const factura of facturas) {
        const baseName =
          factura.nombre_archivo_pdf?.replace('.pdf', '') ||
          factura.identificacion?.codigoGeneracion ||
          'unknown'

        // Agregar JSON (desde MongoDB)
        const jsonContent = JSON.stringify(factura, null, 2)
        archive.append(jsonContent, { name: `${folderName}/${baseName}.json` })

        // Agregar PDF si existe físicamente
        if (factura.tiene_respaldo_pdf && factura.ruta_pdf) {
          const pdfPath = path.join(BACKUP_PATH, factura.ruta_pdf)
          try {
            await fs.access(pdfPath)
            archive.file(pdfPath, { name: `${folderName}/${path.basename(pdfPath)}` })
          } catch (err) {
            console.warn(`⚠️  PDF no encontrado: ${pdfPath}`)
          }
        }
      }
    }

    console.log('📦 Finalizando ZIP...')
    // Finalizar el archivo
    await archive.finalize()
    console.log('✅ ZIP generado exitosamente')
  } catch (error) {
    console.error('❌ Error creating ZIP:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para descargar archivos específicos en ZIP (usando MongoDB)
app.post('/api/backup/download-files', async (req, res) => {
  try {
    const { files, folderName, codigosGeneracion } = req.body

    if ((!files || files.length === 0) && (!codigosGeneracion || codigosGeneracion.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos para empaquetar',
      })
    }

    console.log(`📦 Generando ZIP de archivos para ${folderName}`)

    // Configurar el archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    // Configurar headers
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${folderName || 'files'}-${Date.now()}.zip"`,
    )

    // Pipe del archivo al response
    archive.pipe(res)

    // Si se proporcionaron códigos de generación, buscar en MongoDB
    if (codigosGeneracion && codigosGeneracion.length > 0) {
      console.log(
        `🔍 Buscando facturas por códigos de generación: ${codigosGeneracion.length} archivos`,
      )

      for (const codigo of codigosGeneracion) {
        const factura = await Factura.findOne({
          'identificacion.codigoGeneracion': codigo,
        }).lean()

        if (factura) {
          const baseName = factura.nombre_archivo_pdf?.replace('.pdf', '') || codigo

          // Agregar JSON
          const jsonContent = JSON.stringify(factura, null, 2)
          archive.append(jsonContent, { name: `${baseName}.json` })

          // Agregar PDF si existe
          if (factura.tiene_respaldo_pdf && factura.ruta_pdf) {
            const pdfPath = path.join(BACKUP_PATH, factura.ruta_pdf)
            try {
              await fs.access(pdfPath)
              archive.file(pdfPath, { name: `${baseName}.pdf` })
            } catch (err) {
              console.warn(`⚠️  PDF no encontrado: ${pdfPath}`)
            }
          }
        }
      }
    } else {
      // Método legacy: usar paths de archivos directos
      console.log(`📁 Usando paths directos: ${files.length} archivos`)
      for (const filePath of files) {
        try {
          await fs.access(filePath)
          const fileName = path.basename(filePath)
          archive.file(filePath, { name: fileName })
        } catch (error) {
          console.error(`Error accessing file ${filePath}:`, error)
        }
      }
    }

    console.log('📦 Finalizando ZIP...')
    // Finalizar el archivo
    await archive.finalize()
    console.log('✅ ZIP generado exitosamente')
  } catch (error) {
    console.error('❌ Error creating ZIP:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * @swagger
 * /api/backup/search:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Buscar facturas por código DTE o número de control
 *     description: Realiza una búsqueda global por código de generación o número de control
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (código DTE o número de control)
 *         example: 'A1B2C3D4-E5F6'
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           codigoGeneracion:
 *                             type: string
 *                           numeroControl:
 *                             type: string
 *                           cliente:
 *                             type: string
 *                           fecha:
 *                             type: string
 *                           total:
 *                             type: number
 *                     count:
 *                       type: number
 *       500:
 *         description: Error en la búsqueda
 */
app.get('/api/backup/search', async (req, res) => {
  try {
    const { query } = req.query

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        data: {
          files: [],
          count: 0,
        },
      })
    }

    const searchTerm = query.trim()

    const facturas = await Factura.find({
      $or: [
        { 'identificacion.codigoGeneracion': { $regex: searchTerm, $options: 'i' } },
        { nombre_archivo_pdf: { $regex: searchTerm, $options: 'i' } },
        { 'identificacion.numeroControl': { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi receptor.nombre nombre_archivo_pdf ruta_pdf tiene_respaldo_pdf categoria_origen',
      )
      .limit(100)
      .lean()

    const files = []

    facturas.forEach((factura) => {
      const baseName =
        factura.nombre_archivo_pdf || factura.identificacion?.codigoGeneracion || 'unknown'
      const cleanBaseName = baseName.replace(/\.pdf$/i, '')
      const emissionDate = factura.identificacion?.fecEmi
      const codigoGeneracion = factura.identificacion?.codigoGeneracion
      const pdfPath = factura.ruta_pdf
        ? factura.ruta_pdf.replace(/\\/g, '/')
        : `${factura.categoria_origen}/${cleanBaseName}.pdf`
      const jsonPath = pdfPath.replace(/\.pdf$/i, '.json')

      files.push({
        name: `${cleanBaseName}.json`,
        path: jsonPath,
        size: 5000,
        sizeFormatted: '5 KB',
        type: 'json',
        extension: 'json',
        isDirectory: false,
        modifiedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        emissionDate: emissionDate || null,
        codigoGeneracion: codigoGeneracion || null,
      })

      if (factura.tiene_respaldo_pdf) {
        files.push({
          name: `${cleanBaseName}.pdf`,
          path: pdfPath,
          size: 50000,
          sizeFormatted: '50 KB',
          type: 'pdf',
          extension: 'pdf',
          isDirectory: false,
          modifiedDate: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          emissionDate: emissionDate || null,
          codigoGeneracion: codigoGeneracion || null,
        })
      }
    })

    res.json({
      success: true,
      data: {
        files,
        count: files.length,
        query: searchTerm,
      },
    })
  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ========== ENDPOINT ANTIGUO DESHABILITADO ==========
// Endpoint para obtener clientes con anuladas
// Endpoint para obtener clientes (con caché)
/* DESHABILITADO - Ahora se usa MongoDB
app.get('/api/clientes', async (req, res) => {
  try {
    // Ruta del archivo de clientes
    const clientesPath =
      NODE_ENV === 'development'
        ? 'J:/Henri/Clientes/lista_clientes.json'
        : 'C:/zeta2/Henri/Clientes/lista_clientes.json'

    // Leer archivo de clientes
    const clientesData = await fs.readFile(clientesPath, 'utf-8')
    const clientesJson = JSON.parse(clientesData)

    // Obtener lista de clientes
    const clientes = clientesJson.clientes || []

    // Contar anuladas por cliente
    const clientesConAnuladas = []

    // Cargar datos de facturas anuladas
    const anuladasPath = path.join(BACKUP_PATH, 'anuladas')

    try {
      await fs.access(anuladasPath)
      const anuladasFiles = await fs.readdir(anuladasPath)

      // Crear mapa de anuladas por cliente
      const anuladasPorCliente = new Map()

      for (const fileName of anuladasFiles) {
        if (fileName.endsWith('.json')) {
          try {
            const filePath = path.join(anuladasPath, fileName)
            const fileContent = await fs.readFile(filePath, 'utf-8')
            const jsonData = JSON.parse(fileContent)

            // Obtener nombre del receptor
            const nombreCliente = jsonData.receptor?.nombre

            if (nombreCliente) {
              const count = anuladasPorCliente.get(nombreCliente) || 0
              anuladasPorCliente.set(nombreCliente, count + 1)
            }
          } catch (err) {
            // Ignorar archivos con errores
            console.error(`Error leyendo archivo ${fileName}:`, err.message)
          }
        }
      }

      // Crear lista de clientes con conteo de anuladas
      for (const cliente of clientes) {
        clientesConAnuladas.push({
          nombre: cliente,
          anuladas: anuladasPorCliente.get(cliente) || 0,
        })
      }

      // Ordenar por número de anuladas (descendente)
      clientesConAnuladas.sort((a, b) => b.anuladas - a.anuladas)
    } catch (err) {
      console.warn('No se pudo acceder a la carpeta anuladas:', err.message)
      // Si no existe la carpeta, solo devolver clientes sin anuladas
      for (const cliente of clientes) {
        clientesConAnuladas.push({
          nombre: cliente,
          anuladas: 0,
        })
      }
    }

    res.json({
      success: true,
      data: clientesConAnuladas,
    })
  } catch (err) {
    console.error('Error loading clientes:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})
*/

// ========== ENDPOINT ANTIGUO DESHABILITADO ==========
// Endpoint para obtener clientes con notas de crédito
/* DESHABILITADO - Ahora se usa MongoDB
app.get('/api/clientes/notas-credito', async (req, res) => {
  try {
    // Ruta del archivo de clientes (rutas genéricas de ejemplo)
    const clientesPath =
      NODE_ENV === 'development'
        ? 'J:/Henri/Clientes/lista_clientes.json'
        : 'C:/zeta2/Henri/Clientes/lista_clientes.json'

    // Leer archivo de clientes
    const clientesData = await fs.readFile(clientesPath, 'utf-8')
    const clientesJson = JSON.parse(clientesData)

    // Obtener lista de clientes
    const clientes = clientesJson.clientes || []

    // Contar notas de crédito por cliente
    const clientesConNotasCredito = []

    // Cargar datos de notas de crédito
    const notasCreditoPath = path.join(BACKUP_PATH, 'notas_de_credito')

    try {
      await fs.access(notasCreditoPath)
      const notasCreditoFiles = await fs.readdir(notasCreditoPath)

      // Crear mapa de notas de crédito por cliente
      const notasCreditoPorCliente = new Map()

      for (const fileName of notasCreditoFiles) {
        if (fileName.endsWith('.json')) {
          try {
            const filePath = path.join(notasCreditoPath, fileName)
            const fileContent = await fs.readFile(filePath, 'utf-8')
            const jsonData = JSON.parse(fileContent)

            // Obtener nombre del receptor
            const nombreCliente = jsonData.receptor?.nombre

            if (nombreCliente) {
              const count = notasCreditoPorCliente.get(nombreCliente) || 0
              notasCreditoPorCliente.set(nombreCliente, count + 1)
            }
          } catch (err) {
            // Ignorar archivos con errores
            console.error(`Error leyendo archivo ${fileName}:`, err.message)
          }
        }
      }

      // Crear lista de clientes con conteo de notas de crédito
      for (const cliente of clientes) {
        clientesConNotasCredito.push({
          nombre: cliente,
          anuladas: 0,
          notas_de_credito: notasCreditoPorCliente.get(cliente) || 0,
        })
      }

      // Ordenar por número de notas de crédito (descendente)
      clientesConNotasCredito.sort((a, b) => b.notas_de_credito - a.notas_de_credito)
    } catch (err) {
      console.warn('No se pudo acceder a la carpeta notas_de_credito:', err.message)
      // Si no existe la carpeta, solo devolver clientes sin notas de crédito
      for (const cliente of clientes) {
        clientesConNotasCredito.push({
          nombre: cliente,
          anuladas: 0,
          notas_de_credito: 0,
        })
      }
    }

    res.json({
      success: true,
      data: clientesConNotasCredito,
    })
  } catch (err) {
    console.error('Error loading clientes notas de credito:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})
*/

// ========== ENDPOINT ANTIGUO DESHABILITADO ==========
// Endpoint para obtener notas de crédito de un cliente específico
/* DESHABILITADO - Ahora se usa MongoDB
app.get('/api/clientes/:nombreCliente/notas-credito', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    const notasCreditoPath = path.join(BACKUP_PATH, 'notas_de_credito')

    try {
      await fs.access(notasCreditoPath)
    } catch (err) {
      return res.json({
        success: true,
        data: {
          cliente: nombreCliente,
          facturas: [],
          count: 0,
        },
      })
    }

    const notasCreditoFiles = await fs.readdir(notasCreditoPath)
    const facturasCliente = []

    for (const fileName of notasCreditoFiles) {
      if (fileName.endsWith('.json')) {
        try {
          const filePath = path.join(notasCreditoPath, fileName)
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const jsonData = JSON.parse(fileContent)

          // Verificar si pertenece al cliente
          const nombreReceptor = jsonData.receptor?.nombre

          if (nombreReceptor === nombreCliente) {
            // Obtener info del archivo
            const fileInfo = await getFileInfo(filePath, fileName)
            if (fileInfo) {
              fileInfo.emissionDate = jsonData.identificacion?.fecEmi || null
              fileInfo.numeroDocumento =
                jsonData.identificacion?.codigoGeneracion || fileName.replace('.json', '')
              facturasCliente.push(fileInfo)

              // Buscar PDF correspondiente
              const pdfName = fileName.replace('.json', '.pdf')
              const pdfPath = path.join(notasCreditoPath, pdfName)
              try {
                await fs.access(pdfPath)
                const pdfInfo = await getFileInfo(pdfPath, pdfName)
                if (pdfInfo) {
                  pdfInfo.emissionDate = jsonData.identificacion?.fecEmi || null
                  pdfInfo.numeroDocumento =
                    jsonData.identificacion?.codigoGeneracion || pdfName.replace('.pdf', '')
                  facturasCliente.push(pdfInfo)
                }
              } catch (err) {
                // PDF no existe
              }
            }
          }
        } catch (err) {
          console.error(`Error procesando archivo ${fileName}:`, err.message)
        }
      }
    }

    // Ordenar por fecha de emisión (más reciente primero)
    facturasCliente.sort((a, b) => {
      if (!a.emissionDate) return 1
      if (!b.emissionDate) return -1
      return b.emissionDate.localeCompare(a.emissionDate)
    })

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasCliente,
        count: facturasCliente.length,
      },
    })
  } catch (err) {
    console.error('Error loading notas de credito for cliente:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})
*/

// ========== ENDPOINT ANTIGUO DESHABILITADO ==========
// Endpoint para obtener facturas anuladas de un cliente específico
/* DESHABILITADO - Ahora se usa MongoDB
app.get('/api/clientes/:nombreCliente/anuladas', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    const anuladasPath = path.join(BACKUP_PATH, 'anuladas')

    try {
      await fs.access(anuladasPath)
    } catch (err) {
      return res.json({
        success: true,
        data: {
          cliente: nombreCliente,
          facturas: [],
          count: 0,
        },
      })
    }

    const anuladasFiles = await fs.readdir(anuladasPath)
    const facturasCliente = []

    for (const fileName of anuladasFiles) {
      if (fileName.endsWith('.json')) {
        try {
          const filePath = path.join(anuladasPath, fileName)
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const jsonData = JSON.parse(fileContent)

          // Verificar si pertenece al cliente
          const nombreReceptor = jsonData.receptor?.nombre

          if (nombreReceptor === nombreCliente) {
            // Obtener info del archivo
            const fileInfo = await getFileInfo(filePath, fileName)
            if (fileInfo) {
              fileInfo.emissionDate = jsonData.identificacion?.fecEmi || null
              fileInfo.numeroDocumento =
                jsonData.identificacion?.codigoGeneracion || fileName.replace('.json', '')
              facturasCliente.push(fileInfo)

              // Buscar PDF correspondiente
              const pdfName = fileName.replace('.json', '.pdf')
              const pdfPath = path.join(anuladasPath, pdfName)
              try {
                await fs.access(pdfPath)
                const pdfInfo = await getFileInfo(pdfPath, pdfName)
                if (pdfInfo) {
                  pdfInfo.emissionDate = jsonData.identificacion?.fecEmi || null
                  pdfInfo.numeroDocumento =
                    jsonData.identificacion?.codigoGeneracion || pdfName.replace('.pdf', '')
                  facturasCliente.push(pdfInfo)
                }
              } catch (err) {
                // PDF no existe
              }
            }
          }
        } catch (err) {
          console.error(`Error procesando archivo ${fileName}:`, err.message)
        }
      }
    }

    // Ordenar por fecha de emisión (más reciente primero)
    facturasCliente.sort((a, b) => {
      if (!a.emissionDate) return 1
      if (!b.emissionDate) return -1
      return b.emissionDate.localeCompare(a.emissionDate)
    })

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasCliente,
        count: facturasCliente.length,
      },
    })
  } catch (err) {
    console.error('Error loading anuladas for cliente:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})
*/

// Endpoint para abrir archivos en el visor del sistema
app.get('/api/file/open', async (req, res) => {
  try {
    const { path: filePath } = req.query

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Falta el parámetro path',
      })
    }

    // Verificar que el archivo existe
    try {
      await fs.access(filePath)
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado',
      })
    }

    // En Windows, usar start para abrir el archivo con la aplicación predeterminada
    const { exec } = await import('child_process')
    const command =
      process.platform === 'win32' ? `start "" "${filePath}"` : `xdg-open "${filePath}"`

    exec(command, (error) => {
      if (error) {
        console.error('Error abriendo archivo:', error)
        return res.json({
          success: false,
          error: 'Error al abrir el archivo: ' + error.message,
        })
      }
    })

    // Responder inmediatamente (no esperar a que se abra)
    res.json({
      success: true,
      message: 'Archivo abierto',
    })
  } catch (err) {
    console.error('Error en /api/file/open:', err)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

// ============ ENDPOINTS MONGODB ============

// Endpoint para probar la conexión a MongoDB
app.get('/api/mongodb/test', async (req, res) => {
  try {
    const count = await Factura.countDocuments()
    const sample = await Factura.findOne().lean()

    res.json({
      success: true,
      message: 'Conexión a MongoDB exitosa',
      data: {
        totalFacturas: count,
        muestraFactura: sample
          ? {
              codigoGeneracion: sample.identificacion?.codigoGeneracion,
              fecha: sample.identificacion?.fecEmi,
              cliente: sample.receptor?.nombre,
              total: sample.resumen?.totalPagar,
              categoria: sample.categoria_origen,
              sucursal: sample.sucursal,
              tienePDF: sample.tiene_respaldo_pdf,
            }
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para buscar facturas con filtros
app.get('/api/mongodb/facturas', async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, categoria, cliente, limit = 50 } = req.query

    const query = {}

    if (fechaDesde || fechaHasta) {
      query['identificacion.fecEmi'] = {}
      if (fechaDesde) query['identificacion.fecEmi'].$gte = fechaDesde
      if (fechaHasta) query['identificacion.fecEmi'].$lte = fechaHasta
    }

    if (categoria) {
      query['categoria_origen'] = categoria
    }

    if (cliente) {
      query['receptor.nombre'] = new RegExp(cliente, 'i') // Búsqueda case-insensitive
    }

    const facturas = await Factura.find(query)
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi identificacion.numeroControl receptor.nombre resumen.totalPagar categoria_origen sucursal tiene_respaldo_pdf',
      )
      .sort({ 'identificacion.fecEmi': -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      data: {
        facturas,
        count: facturas.length,
        filtros: { fechaDesde, fechaHasta, categoria, cliente, limit },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener estadísticas desde MongoDB
app.get('/api/mongodb/stats', async (req, res) => {
  try {
    const [total, porCategoria, ultimaFactura] = await Promise.all([
      Factura.countDocuments(),
      Factura.aggregate([{ $group: { _id: '$categoria_origen', count: { $sum: 1 } } }]),
      Factura.findOne().sort({ 'identificacion.fecEmi': -1 }).lean(),
    ])

    const totalPorCategoria = porCategoria.reduce((acc, item) => {
      acc[item._id || 'sin_categoria'] = item.count
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalFacturas: total,
        porCategoria: totalPorCategoria,
        ultimaFactura: ultimaFactura
          ? {
              fecha: ultimaFactura.identificacion?.fecEmi,
              cliente: ultimaFactura.receptor?.nombre,
              codigo: ultimaFactura.identificacion?.codigoGeneracion,
              categoria: ultimaFactura.categoria_origen,
            }
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para buscar facturas de un cliente específico
app.get('/api/mongodb/clientes/:nombreCliente', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    const { categoria, limit = 100 } = req.query

    const query = {
      'receptor.nombre': nombreCliente,
    }

    if (categoria) {
      query['categoria_origen'] = categoria
    }

    const facturas = await Factura.find(query)
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi identificacion.numeroControl resumen.totalPagar categoria_origen nombre_archivo_pdf',
      )
      .sort({ 'identificacion.fecEmi': -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas,
        count: facturas.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener lista de clientes únicos
app.get('/api/mongodb/clientes', async (req, res) => {
  try {
    const clientes = await Factura.distinct('receptor.nombre')

    // Contar facturas por cliente
    const clientesConConteo = await Promise.all(
      clientes.slice(0, 100).map(async (cliente) => {
        const count = await Factura.countDocuments({ 'receptor.nombre': cliente })
        return { nombre: cliente, facturas: count }
      }),
    )

    // Ordenar por cantidad de facturas
    clientesConConteo.sort((a, b) => b.facturas - a.facturas)

    res.json({
      success: true,
      data: {
        clientes: clientesConConteo,
        total: clientes.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: mongoConnected
      ? 'Backend funcionando correctamente con MongoDB'
      : 'Backend funcionando SIN conexión a MongoDB',
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: mongoConnected,
      database: mongoConnected ? 'facturas-hermaco' : 'N/A',
      uri: process.env.MONGODB_URI ? 'Configurada' : '❌ NO CONFIGURADA',
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      BACKUP_PATH: process.env.BACKUP_PATH || 'default',
    },
  })
})

// Endpoint para verificar si hay cambios recientes (últimos 30 segundos)
app.get('/api/backup/check-updates', async (req, res) => {
  try {
    const { since } = req.query
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 30000) // Por defecto 30 segundos

    // Contar facturas agregadas/modificadas desde la fecha indicada
    const recentCount = await Factura.countDocuments({
      migrado_en: { $gte: sinceDate },
    })

    // Obtener el último documento insertado
    const ultimaFactura = await Factura.findOne()
      .sort({ migrado_en: -1 })
      .select('migrado_en identificacion.fecEmi')
      .lean()

    res.json({
      success: true,
      hasUpdates: recentCount > 0,
      recentCount,
      lastUpdate: ultimaFactura?.migrado_en || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error checking updates:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ========== ENDPOINT ANTIGUO DESHABILITADO ==========
// Endpoint para contar archivos directamente en carpeta SA
/* DESHABILITADO - Ahora se usa MongoDB
app.get('/api/count-files-sa', async (req, res) => {
  try {
    const saPath = path.join(BACKUP_PATH, 'SA')
    console.log('📊 Contando archivos en SA:', saPath)

    // Verificar que existe la carpeta
    try {
      await fs.access(saPath)
    } catch (err) {
      return res.json({
        success: false,
        error: 'Carpeta SA no encontrada',
        path: saPath,
      })
    }

    // Leer todos los archivos
    const files = await fs.readdir(saPath)

    let pdfCount = 0
    let jsonCount = 0
    let otherCount = 0
    const sampleFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = path.extname(file).toLowerCase()

      if (ext === '.pdf') {
        pdfCount++
        if (pdfCount <= 3) sampleFiles.push(file)
      } else if (ext === '.json') {
        jsonCount++
        if (jsonCount <= 3) sampleFiles.push(file)
      } else {
        otherCount++
      }
    }

    const result = {
      success: true,
      carpeta: 'SA (H1)',
      ruta: saPath,
      totalArchivos: files.length,
      conteos: {
        pdf: pdfCount,
        json: jsonCount,
        otros: otherCount,
      },
      parejasCompletas: Math.min(pdfCount, jsonCount),
      muestrasArchivos: sampleFiles,
    }

    console.log('✅ Resultado conteo SA:', result)

    res.json(result)
  } catch (error) {
    console.error('❌ Error contando archivos SA:', error)
    res.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
})
*/

// ========== ENDPOINTS ANTIGUOS DESHABILITADOS ==========
/* DESHABILITADOS - Ya no se usa caché con MongoDB
// Endpoint para limpiar caché manualmente
app.post('/api/cache/clear', (req, res) => {
  cache = {
    structure: null,
    stats: null,
    lastUpdate: null,
    isLoading: false,
  }

  console.log('🗑️ Caché limpiada manualmente')

  res.json({
    success: true,
    message: 'Caché limpiada correctamente',
  })
})

// Endpoint para forzar recarga de caché
app.post('/api/cache/reload', async (req, res) => {
  try {
    // Limpiar caché
    cache = {
      structure: null,
      stats: null,
      lastUpdate: null,
      isLoading: false,
    }

    // Recargar datos
    console.log('🔄 Recargando caché...')
    await loadBackupData()

    res.json({
      success: true,
      message: 'Caché recargada correctamente',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})
*/

// ============ ENDPOINTS DE CLIENTES (MongoDB) ============

// Endpoint para obtener clientes con anuladas (usando MongoDB)
app.get('/api/clientes', async (req, res) => {
  try {
    console.log('📊 Cargando clientes con facturas anuladas desde MongoDB...')

    // Agregar por cliente y contar anuladas
    const clientesConAnuladas = await Factura.aggregate([
      {
        $match: {
          categoria_origen: 'anuladas',
          'receptor.nombre': { $exists: true, $ne: null, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$receptor.nombre',
          anuladas: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          nombre: '$_id',
          anuladas: 1,
        },
      },
      {
        $sort: { anuladas: -1 },
      },
    ])

    console.log(`✅ ${clientesConAnuladas.length} clientes con facturas anuladas encontrados`)

    res.json({
      success: true,
      data: clientesConAnuladas,
    })
  } catch (error) {
    console.error('❌ Error en /api/clientes:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener clientes con notas de crédito (usando MongoDB)
app.get('/api/clientes/notas-credito', async (req, res) => {
  try {
    console.log('📊 Cargando clientes con notas de crédito desde MongoDB...')

    // Agregar por cliente y contar notas de crédito
    const clientesConNotas = await Factura.aggregate([
      {
        $match: {
          categoria_origen: 'notas_de_credito',
          'receptor.nombre': { $exists: true, $ne: null, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$receptor.nombre',
          notas_de_credito: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          nombre: '$_id',
          notas_de_credito: 1,
        },
      },
      {
        $sort: { notas_de_credito: -1 },
      },
    ])

    console.log(`✅ ${clientesConNotas.length} clientes con notas de crédito encontrados`)

    res.json({
      success: true,
      data: clientesConNotas,
    })
  } catch (error) {
    console.error('❌ Error en /api/clientes/notas-credito:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener facturas anuladas de un cliente específico (usando MongoDB)
app.get('/api/clientes/:nombreCliente/anuladas', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    console.log(`📊 Cargando facturas anuladas del cliente: ${nombreCliente}`)

    // Buscar facturas anuladas del cliente
    const facturas = await Factura.find({
      categoria_origen: 'anuladas',
      'receptor.nombre': nombreCliente,
    })
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi identificacion.numeroControl receptor.nombre resumen.totalPagar ruta_pdf nombre_archivo_pdf tiene_respaldo_pdf categoria_origen sucursal',
      )
      .sort({ 'identificacion.fecEmi': -1 })
      .lean()

    console.log(`✅ ${facturas.length} facturas anuladas encontradas`)

    // Transformar facturas a formato de archivo para el frontend
    const facturasFormateadas = []
    for (const factura of facturas) {
      const baseName =
        factura.nombre_archivo_pdf?.replace('.pdf', '') ||
        factura.identificacion?.codigoGeneracion ||
        'sin-nombre'

      // JSON siempre existe (está en MongoDB)
      facturasFormateadas.push({
        name: `${baseName}.json`,
        extension: '.json',
        type: 'json',
        path: factura.ruta_pdf?.replace('.pdf', '.json') || `anuladas/${baseName}.json`,
        emissionDate: factura.identificacion?.fecEmi || null,
        numeroDocumento: factura.identificacion?.codigoGeneracion || baseName,
        size: 0, // No disponible desde MongoDB
        sizeFormatted: 'N/A',
        modified: factura.identificacion?.fecEmi || null,
        codigoGeneracion: factura.identificacion?.codigoGeneracion,
      })

      // PDF solo si existe
      if (factura.tiene_respaldo_pdf) {
        facturasFormateadas.push({
          name: `${baseName}.pdf`,
          extension: '.pdf',
          type: 'pdf',
          path: factura.ruta_pdf || `anuladas/${baseName}.pdf`,
          emissionDate: factura.identificacion?.fecEmi || null,
          numeroDocumento: factura.identificacion?.codigoGeneracion || baseName,
          size: 0,
          sizeFormatted: 'N/A',
          modified: factura.identificacion?.fecEmi || null,
          codigoGeneracion: factura.identificacion?.codigoGeneracion,
        })
      }
    }

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasFormateadas,
        count: facturasFormateadas.length,
      },
    })
  } catch (error) {
    console.error('❌ Error en /api/clientes/:nombreCliente/anuladas:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint para obtener notas de crédito de un cliente específico (usando MongoDB)
app.get('/api/clientes/:nombreCliente/notas-credito', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    console.log(`📊 Cargando notas de crédito del cliente: ${nombreCliente}`)

    // Buscar notas de crédito del cliente
    const facturas = await Factura.find({
      categoria_origen: 'notas_de_credito',
      'receptor.nombre': nombreCliente,
    })
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi identificacion.numeroControl receptor.nombre resumen.totalPagar ruta_pdf nombre_archivo_pdf tiene_respaldo_pdf categoria_origen sucursal',
      )
      .sort({ 'identificacion.fecEmi': -1 })
      .lean()

    console.log(`✅ ${facturas.length} notas de crédito encontradas`)

    // Transformar facturas a formato de archivo para el frontend
    const facturasFormateadas = []
    for (const factura of facturas) {
      const baseName =
        factura.nombre_archivo_pdf?.replace('.pdf', '') ||
        factura.identificacion?.codigoGeneracion ||
        'sin-nombre'

      // JSON siempre existe (está en MongoDB)
      facturasFormateadas.push({
        name: `${baseName}.json`,
        extension: '.json',
        type: 'json',
        path: factura.ruta_pdf?.replace('.pdf', '.json') || `notas_de_credito/${baseName}.json`,
        emissionDate: factura.identificacion?.fecEmi || null,
        numeroDocumento: factura.identificacion?.codigoGeneracion || baseName,
        size: 0,
        sizeFormatted: 'N/A',
        modified: factura.identificacion?.fecEmi || null,
        codigoGeneracion: factura.identificacion?.codigoGeneracion,
      })

      // PDF solo si existe
      if (factura.tiene_respaldo_pdf) {
        facturasFormateadas.push({
          name: `${baseName}.pdf`,
          extension: '.pdf',
          type: 'pdf',
          path: factura.ruta_pdf || `notas_de_credito/${baseName}.pdf`,
          emissionDate: factura.identificacion?.fecEmi || null,
          numeroDocumento: factura.identificacion?.codigoGeneracion || baseName,
          size: 0,
          sizeFormatted: 'N/A',
          modified: factura.identificacion?.fecEmi || null,
          codigoGeneracion: factura.identificacion?.codigoGeneracion,
        })
      }
    }

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasFormateadas,
        count: facturasFormateadas.length,
      },
    })
  } catch (error) {
    console.error('❌ Error en /api/clientes/:nombreCliente/notas-credito:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

app.get('/api/file/content', async (req, res) => {
  try {
    const { path: filePath, codigoGeneracion } = req.query

    if (!filePath && !codigoGeneracion) {
      return res.status(400).json({
        success: false,
        error: 'Falta el parámetro path o codigoGeneracion',
      })
    }

    if (filePath) {
      const isPdf = filePath.toLowerCase().endsWith('.pdf')
      const isJson = filePath.toLowerCase().endsWith('.json')

      if (isPdf) {
        const normalizedPath = filePath.replace(/\\/g, '/')
        const fullPath = path.join(BACKUP_PATH, normalizedPath)

        try {
          await fs.access(fullPath)
          const fileStats = await fs.stat(fullPath)
          const fileBuffer = await fs.readFile(fullPath)

          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Length', fileStats.size.toString())
          res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Accept-Ranges', 'bytes')

          return res.send(fileBuffer)
        } catch (error) {
          return res.status(404).json({
            success: false,
            error: 'PDF no encontrado en disco',
          })
        }
      } else if (isJson) {
        let factura

        if (codigoGeneracion) {
          factura = await Factura.findOne({
            'identificacion.codigoGeneracion': codigoGeneracion,
          }).lean()
        } else {
          const fileName = path.basename(filePath, '.json')
          const normalizedPath = filePath.replace(/\\/g, '/').replace(/\.json$/i, '.pdf')

          factura = await Factura.findOne({
            $or: [
              { 'identificacion.codigoGeneracion': fileName },
              { nombre_archivo_pdf: fileName + '.pdf' },
              { nombre_archivo_pdf: fileName },
              { ruta_pdf: normalizedPath },
            ],
          }).lean()
        }

        if (!factura) {
          return res.status(404).json({
            success: false,
            error: 'Factura no encontrada en MongoDB',
          })
        }

        res.setHeader('Content-Type', 'application/json')
        return res.json(factura)
      }
    }

    if (codigoGeneracion && !filePath) {
      const factura = await Factura.findOne({
        'identificacion.codigoGeneracion': codigoGeneracion,
      }).lean()

      if (!factura) {
        return res.status(404).json({
          success: false,
          error: 'Factura no encontrada en MongoDB',
        })
      }

      if (factura.tiene_respaldo_pdf && factura.ruta_pdf) {
        const relativePath = factura.ruta_pdf.replace(/\\/g, '/')
        const pdfPath = path.join(BACKUP_PATH, relativePath)

        try {
          await fs.access(pdfPath)
          const fileStats = await fs.stat(pdfPath)
          const fileBuffer = await fs.readFile(pdfPath)

          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Length', fileStats.size.toString())
          res.setHeader('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Accept-Ranges', 'bytes')

          return res.send(fileBuffer)
        } catch (error) {
          return res.status(404).json({
            success: false,
            error: 'PDF no encontrado en disco',
          })
        }
      } else {
        res.setHeader('Content-Type', 'application/json')
        return res.json(factura)
      }
    }

    return res.status(400).json({
      success: false,
      error: 'Falta información para procesar la solicitud',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Endpoint adicional para diagnóstico
app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    data: {
      nodeEnv: NODE_ENV,
      backupPath: BACKUP_PATH,
      serverDir: __dirname,
      platform: process.platform,
      cwd: process.cwd(),
    },
  })
})

if (NODE_ENV === 'production') {
  app.use((req, res) => {
    // Solo servir index.html si no es una ruta de API
    if (!req.url.startsWith('/api')) {
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
      console.log(`📄 Sirviendo: ${req.url} -> index.html`)
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Error sirviendo ${req.url}:`, err.message)
          res.status(500).send('Error al cargar la aplicacion')
        }
      })
    } else {
      res.status(404).json({ success: false, error: 'Endpoint no encontrado' })
    }
  })
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Verificar estado del servidor
 *     description: Endpoint de health check para monitorear el estado del servidor y la conexión a MongoDB
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: 'healthy'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2026-01-25T10:30:00.000Z'
 *                 mongodb:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                   example: 'connected'
 *                 environment:
 *                   type: string
 *                   example: 'production'
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoConnected ? 'connected' : 'disconnected',
    environment: NODE_ENV
  })
})

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  console.log(`🌐 Accesible desde: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`📁 Backup path: ${BACKUP_PATH}`)

  // Mostrar todas las IPs disponibles
  console.log('\n📡 Accesible desde las siguientes IPs:')
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Solo IPv4 y no loopback
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   - http://${net.address}:${PORT} (${name})`)
      }
    }
  }
  console.log('')

  // Verificar si la ruta existe (opcional, ya que ahora usamos MongoDB)
  try {
    await fs.access(BACKUP_PATH)
    console.log('✅ Ruta de backup accesible (para PDFs físicos)')
  } catch (error) {
    console.warn('⚠️  ADVERTENCIA: La ruta de backup no existe o no es accesible')
    console.warn('   Los PDFs no se podrán abrir/descargar')
  }

  console.log('✅ Servidor listo - Usando MongoDB para consultas')
})
