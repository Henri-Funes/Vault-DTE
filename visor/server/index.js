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

// Cargar variables de entorno
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'

console.log('🎭 MODO DEMO ACTIVADO - Usando datos de prueba ficticios')
console.log('📁 Los datos no provienen de MongoDB sino de archivos JSON locales\n')

// ===================================================================
// CARGAR DATOS MOCK EN MEMORIA
// ===================================================================
let facturasDB = []
let clientesDB = []

async function loadMockData() {
  try {
    const facturasPath = path.join(__dirname, 'mock-data', 'facturas.json')
    const clientesPath = path.join(__dirname, 'mock-data', 'clientes.json')

    const facturasRaw = await fs.readFile(facturasPath, 'utf-8')
    const clientesRaw = await fs.readFile(clientesPath, 'utf-8')

    facturasDB = JSON.parse(facturasRaw)
    clientesDB = JSON.parse(clientesRaw)

    console.log('✅ Datos mock cargados:')
    console.log(`   - ${facturasDB.length} facturas`)
    console.log(`   - ${clientesDB.length} clientes`)

    // Estadísticas por categoría
    const stats = {}
    facturasDB.forEach(f => {
      stats[f.categoria_origen] = (stats[f.categoria_origen] || 0) + 1
    })

    console.log('\n📊 Distribución:')
    Object.entries(stats).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} facturas`)
    })
    console.log('')

    return true
  } catch (error) {
    console.error('❌ Error cargando datos mock:', error)
    return false
  }
}

// Cargar datos al iniciar
await loadMockData()

// ===================================================================
// FUNCIONES AUXILIARES
// ===================================================================

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function getFileType(ext) {
  const types = {
    pdf: 'pdf',
    json: 'json',
    xml: 'xml',
    png: 'image',
    jpg: 'image',
    jpeg: 'image'
  }
  return types[ext] || 'other'
}

// ===================================================================
// MIDDLEWARES
// ===================================================================

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
      title: 'Vault-DTE API (Demo Mode)',
      version: '1.0.0',
      description: 'API REST para gestión de facturas electrónicas (DTE) - Modo Demo con datos ficticios. Incluye también referencia a endpoints de producción.',
      contact: {
        name: 'Vault-DTE - Sistema de Gestión DTE',
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor demo con datos ficticios'
      }
    ],
    tags: [
      { name: 'Estadísticas', description: 'Métricas y análisis de datos' },
      { name: 'Explorador', description: 'Búsqueda y navegación de facturas' },
      { name: 'Clientes', description: 'Gestión de clientes' },
      { name: 'Empaquetador', description: 'Generación de archivos ZIP' },
      { name: 'Sistema', description: 'Salud y configuración del servidor' }
    ]
  },
  apis: ['./server/index.js', './server/index.production.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vault-DTE API Documentation (Demo)'
}))

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

console.log(`📚 Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`)

// Servir archivos estáticos del frontend en producción
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  console.log(`📦 Sirviendo frontend desde: ${distPath}`)
  app.use(express.static(distPath))
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
 *     summary: Obtener estadísticas generales (Demo)
 *     description: Retorna métricas globales de facturas desde datos ficticios en memoria
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     pdf:
 *                       type: number
 *                       example: 500
 *                     json:
 *                       type: number
 *                       example: 500
 *                     total:
 *                       type: number
 *                       example: 1000
 *                     pairedInvoices:
 *                       type: number
 *                       example: 500
 *                     anuladas:
 *                       type: number
 *                       example: 10
 */
app.get('/api/backup/stats', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas...')

    // Total de facturas
    const totalFacturas = facturasDB.length

    // Facturas con respaldo PDF (debe ser igual al total)
    const conPDF = facturasDB.filter(f => f.tiene_respaldo_pdf).length

    // Conteo global por categoría
    const categorias = {
      SA: 0,
      SM: 0,
      SS: 0,
      gastos: 0,
      remisiones: 0,
      notas_de_credito: 0,
      anuladas: 0
    }

    // Conteo detallado por sucursal (incluyendo todas las categorías en cada sucursal)
    const detallePorSucursal = {
      'H1 - Santa Ana': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
      'H2 - San Miguel': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 },
      'H4 - San Salvador': { facturas: 0, gastos: 0, remisiones: 0, notas_credito: 0, anuladas: 0, total: 0 }
    }

    facturasDB.forEach(f => {
      const cat = f.categoria_origen
      const sucursal = f.sucursal

      // Contar por categoría global
      if (categorias[cat] !== undefined) {
        categorias[cat]++
      }

      // Agrupar por sucursal
      if (detallePorSucursal[sucursal]) {
        detallePorSucursal[sucursal].total++

        if (cat === 'SA' || cat === 'SM' || cat === 'SS') {
          detallePorSucursal[sucursal].facturas++
        } else if (cat === 'gastos') {
          detallePorSucursal[sucursal].gastos++
        } else if (cat === 'remisiones') {
          detallePorSucursal[sucursal].remisiones++
        } else if (cat === 'notas_de_credito') {
          detallePorSucursal[sucursal].notas_credito++
        } else if (cat === 'anuladas') {
          detallePorSucursal[sucursal].anuladas++
        }
      }
    })

    // Para compatibilidad con frontend antiguo
    const pairedByFolder = {
      SA: categorias.SA,
      SM: categorias.SM,
      SS: categorias.SS,
      gastos: categorias.gastos,
      remisiones: categorias.remisiones,
      notas_de_credito: categorias.notas_de_credito,
    }

    const anuladas = categorias.anuladas

    // Facturas recientes (últimas 24h - simulado)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const recentFiles = facturasDB.filter(f =>
      f.identificacion?.fecEmi === yesterdayStr
    ).length

    const stats = {
      pdf: totalFacturas, // Cambiado: ahora debe mostrar 500 como los JSON
      json: totalFacturas, // 500
      xml: 0,
      images: 0,
      other: 0,
      total: totalFacturas * 2, // PDF + JSON = 1000
      totalSize: 0,
      totalSizeFormatted: 'N/A (modo demo)',
      recentFiles,
      pairedInvoices: totalFacturas,
      anuladas,
      pairedByFolder,
      detallePorSucursal, // NUEVO: Detalle completo por sucursal
    }

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
 * /api/backup/ventas-por-sucursal:
 *   get:
 *     tags:
 *       - Estadísticas
 *     summary: Obtener ventas por sucursal (Demo)
 *     description: Calcula ventas totales por sucursal en un período ajustable
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: integer
 *           enum: [1, 6, 12]
 *           default: 12
 *         description: Número de meses (1, 6 o 12)
 *     responses:
 *       200:
 *         description: Ventas calculadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: number
 *                       example: 12
 *                     ventasPorSucursal:
 *                       type: object
 */
app.get('/api/backup/ventas-por-sucursal', async (req, res) => {
  try {
    const { periodo = 12 } = req.query // 12, 6, o 1 meses
    const mesesAtras = parseInt(periodo)

    console.log(`📈 Calculando ventas por sucursal (últimos ${mesesAtras} meses)...`)

    // Calcular fecha de inicio
    const fechaFin = new Date()
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras)

    const ventasPorSucursal = {
      'H1 - Santa Ana': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 },
      'H2 - San Miguel': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 },
      'H4 - San Salvador': { totalVentas: 0, facturas: 0, anuladas: 0, devuelto: 0 }
    }

    facturasDB.forEach(f => {
      const fechaFactura = new Date(f.identificacion?.fecEmi || '2025-01-01')
      const sucursal = f.sucursal
      const categoria = f.categoria_origen

      // Filtrar por período
      if (fechaFactura >= fechaInicio && fechaFactura <= fechaFin && ventasPorSucursal[sucursal]) {
        const totalPagar = f.resumen?.totalPagar || 0

        // Ventas (SA, SM, SS)
        if (categoria === 'SA' || categoria === 'SM' || categoria === 'SS') {
          ventasPorSucursal[sucursal].totalVentas += totalPagar
          ventasPorSucursal[sucursal].facturas++
        }
        // Anuladas
        else if (categoria === 'anuladas') {
          ventasPorSucursal[sucursal].anuladas++
          ventasPorSucursal[sucursal].devuelto += totalPagar
        }
        // Notas de crédito (también cuentan como devolución)
        else if (categoria === 'notas_de_credito') {
          ventasPorSucursal[sucursal].devuelto += totalPagar
        }
      }
    })

    // Redondear valores
    Object.keys(ventasPorSucursal).forEach(sucursal => {
      ventasPorSucursal[sucursal].totalVentas = parseFloat(ventasPorSucursal[sucursal].totalVentas.toFixed(2))
      ventasPorSucursal[sucursal].devuelto = parseFloat(ventasPorSucursal[sucursal].devuelto.toFixed(2))
    })

    res.json({
      success: true,
      data: {
        periodo: mesesAtras,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
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

// ===================================================================
// ENDPOINTS - ESTRUCTURA Y EXPLORADOR
// ===================================================================

/**
 * @swagger
 * /api/backup/structure:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Obtener estructura de carpetas (Demo)
 *     description: Retorna la estructura jerárquica de carpetas con conteo de archivos
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
 *                           fileCount:
 *                             type: number
 *                             example: 350
 */
app.get('/api/backup/structure', async (req, res) => {
  try {
    console.log('📂 Obteniendo estructura de carpetas...')

    // Obtener conteo por categoría
    const conteoPorCarpeta = {}

    facturasDB.forEach(f => {
      const folder = f.categoria_origen
      conteoPorCarpeta[folder] = (conteoPorCarpeta[folder] || 0) + 1
    })

    // Crear estructura de carpetas
    const folders = Object.entries(conteoPorCarpeta).map(([name, count]) => ({
      name,
      path: `/facturas/${name}`,
      fileCount: count * 2, // PDF + JSON
      files: [],
      size: 0,
      sizeFormatted: 'N/A',
    }))

    const structure = {
      path: '/facturas',
      folders,
      totalFiles: folders.reduce((sum, f) => sum + f.fileCount, 0),
      totalSize: 0,
      totalSizeFormatted: 'N/A (modo demo)',
    }

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
 * /api/backup/folder/{folderName}:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Listar facturas de una carpeta (Demo)
 *     description: Obtiene todas las facturas de una categoría específica con paginación
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SA, SM, SS, gastos, remisiones, notas_de_credito, anuladas]
 *         description: Nombre de la categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Facturas obtenidas exitosamente
 */
app.get('/api/backup/folder/:folderName', async (req, res) => {
  try {
    const { folderName } = req.params
    const { dateFrom, dateTo, limit = '100', page = '1' } = req.query

    console.log(`📁 Obteniendo facturas de carpeta: ${folderName}, página: ${page}`)

    const limitNum = parseInt(limit) || 100
    const pageNum = parseInt(page) || 1
    const skip = (pageNum - 1) * limitNum

    // Filtrar por categoría
    let facturasFiltradas = facturasDB.filter(f => f.categoria_origen === folderName)

    // Filtrar por fechas si se proporcionan
    if (dateFrom || dateTo) {
      facturasFiltradas = facturasFiltradas.filter(f => {
        const fecEmi = f.identificacion?.fecEmi
        if (!fecEmi) return false

        if (dateFrom && fecEmi < dateFrom) return false
        if (dateTo && fecEmi > dateTo) return false

        return true
      })
    }

    const totalFacturas = facturasFiltradas.length
    const totalFiles = totalFacturas * 2
    const totalPages = Math.ceil(totalFacturas / limitNum)

    // Paginar
    const facturasPaginadas = facturasFiltradas.slice(skip, skip + limitNum)

    // Convertir a formato de archivos
    const files = []
    facturasPaginadas.forEach(factura => {
      const codigoGen = factura.identificacion?.codigoGeneracion || 'unknown'
      const fecEmi = factura.identificacion?.fecEmi

      // Archivo JSON
      files.push({
        name: `${codigoGen}.json`,
        path: `${folderName}/${codigoGen}.json`,
        size: 5000,
        sizeFormatted: '5 KB',
        type: 'json',
        extension: 'json',
        isDirectory: false,
        modifiedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        emissionDate: fecEmi || null,
        codigoGeneracion: codigoGen,
      })

      // Archivo PDF (si existe)
      if (factura.tiene_respaldo_pdf) {
        files.push({
          name: `${codigoGen}.pdf`,
          path: `${folderName}/${codigoGen}.pdf`,
          size: 50000,
          sizeFormatted: '50 KB',
          type: 'pdf',
          extension: 'pdf',
          isDirectory: false,
          modifiedDate: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          emissionDate: fecEmi || null,
          codigoGeneracion: codigoGen,
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

// ===================================================================
// ENDPOINTS - BÚSQUEDA
// ===================================================================

/**
 * @swagger
 * /api/backup/search:
 *   get:
 *     tags:
 *       - Explorador
 *     summary: Buscar facturas (Demo)
 *     description: Búsqueda global por código DTE o número de control
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: 'A1B2C3D4'
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
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

    const searchTerm = query.trim().toLowerCase()
    console.log(`🔍 Buscando: "${searchTerm}"`)

    // Buscar en facturas
    const facturasEncontradas = facturasDB.filter(f => {
      const codigoGen = (f.identificacion?.codigoGeneracion || '').toLowerCase()
      const nombrePdf = (f.nombre_archivo_pdf || '').toLowerCase()
      const numeroControl = (f.identificacion?.numeroControl || '').toLowerCase()

      return codigoGen.includes(searchTerm) ||
             nombrePdf.includes(searchTerm) ||
             numeroControl.includes(searchTerm)
    }).slice(0, 100) // Limitar a 100 resultados

    // Convertir a formato de archivos
    const files = []
    facturasEncontradas.forEach(factura => {
      const codigoGen = factura.identificacion?.codigoGeneracion || 'unknown'
      const fecEmi = factura.identificacion?.fecEmi
      const categoria = factura.categoria_origen

      files.push({
        name: `${codigoGen}.json`,
        path: `${categoria}/${codigoGen}.json`,
        size: 5000,
        sizeFormatted: '5 KB',
        type: 'json',
        extension: 'json',
        isDirectory: false,
        modifiedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        emissionDate: fecEmi || null,
        codigoGeneracion: codigoGen,
      })

      if (factura.tiene_respaldo_pdf) {
        files.push({
          name: `${codigoGen}.pdf`,
          path: `${categoria}/${codigoGen}.pdf`,
          size: 50000,
          sizeFormatted: '50 KB',
          type: 'pdf',
          extension: 'pdf',
          isDirectory: false,
          modifiedDate: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          emissionDate: fecEmi || null,
          codigoGeneracion: codigoGen,
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

// ===================================================================
// ENDPOINTS - CLIENTES
// ===================================================================

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar todos los clientes (Demo)
 *     description: Obtiene listado de clientes con contador de facturas anuladas
 *     responses:
 *       200:
 *         description: Clientes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: 'CLIENTE EJEMPLO S.A. DE C.V.'
 *                       anuladas:
 *                         type: number
 *                         example: 3
 */
app.get('/api/clientes', async (req, res) => {
  try {
    console.log('👥 Cargando clientes con facturas anuladas...')

    // Contar anuladas por cliente
    const anuladasPorCliente = {}

    facturasDB
      .filter(f => f.categoria_origen === 'anuladas')
      .forEach(f => {
        const nombre = f.receptor?.nombre
        if (nombre) {
          anuladasPorCliente[nombre] = (anuladasPorCliente[nombre] || 0) + 1
        }
      })

    // Crear array de clientes con anuladas
    const clientesConAnuladas = Object.entries(anuladasPorCliente)
      .map(([nombre, anuladas]) => ({
        nombre,
        anuladas,
      }))
      .sort((a, b) => b.anuladas - a.anuladas)

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

app.get('/api/clientes/notas-credito', async (req, res) => {
  try {
    console.log('👥 Cargando clientes con notas de crédito...')

    // Contar notas de crédito por cliente
    const notasPorCliente = {}

    facturasDB
      .filter(f => f.categoria_origen === 'notas_de_credito')
      .forEach(f => {
        const nombre = f.receptor?.nombre
        if (nombre) {
          notasPorCliente[nombre] = (notasPorCliente[nombre] || 0) + 1
        }
      })

    // Crear array de clientes con notas
    const clientesConNotas = Object.entries(notasPorCliente)
      .map(([nombre, notas_de_credito]) => ({
        nombre,
        notas_de_credito,
      }))
      .sort((a, b) => b.notas_de_credito - a.notas_de_credito)

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

app.get('/api/clientes/:nombreCliente/anuladas', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    console.log(`👤 Cargando anuladas del cliente: ${nombreCliente}`)

    // Buscar facturas anuladas del cliente
    const facturas = facturasDB.filter(f =>
      f.categoria_origen === 'anuladas' &&
      f.receptor?.nombre === nombreCliente
    )

    // Convertir a formato de archivos
    const facturasFormateadas = []
    facturas.forEach(factura => {
      const codigoGen = factura.identificacion?.codigoGeneracion || 'unknown'
      const fecEmi = factura.identificacion?.fecEmi

      facturasFormateadas.push({
        name: `${codigoGen}.json`,
        extension: '.json',
        type: 'json',
        path: `anuladas/${codigoGen}.json`,
        emissionDate: fecEmi || null,
        numeroDocumento: codigoGen,
        size: 5000,
        sizeFormatted: '5 KB',
        modified: fecEmi || null,
        codigoGeneracion: codigoGen,
      })

      if (factura.tiene_respaldo_pdf) {
        facturasFormateadas.push({
          name: `${codigoGen}.pdf`,
          extension: '.pdf',
          type: 'pdf',
          path: `anuladas/${codigoGen}.pdf`,
          emissionDate: fecEmi || null,
          numeroDocumento: codigoGen,
          size: 50000,
          sizeFormatted: '50 KB',
          modified: fecEmi || null,
          codigoGeneracion: codigoGen,
        })
      }
    })

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasFormateadas,
        count: facturasFormateadas.length,
      },
    })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

app.get('/api/clientes/:nombreCliente/notas-credito', async (req, res) => {
  try {
    const { nombreCliente } = req.params
    console.log(`👤 Cargando notas de crédito del cliente: ${nombreCliente}`)

    // Buscar notas de crédito del cliente
    const facturas = facturasDB.filter(f =>
      f.categoria_origen === 'notas_de_credito' &&
      f.receptor?.nombre === nombreCliente
    )

    // Convertir a formato de archivos
    const facturasFormateadas = []
    facturas.forEach(factura => {
      const codigoGen = factura.identificacion?.codigoGeneracion || 'unknown'
      const fecEmi = factura.identificacion?.fecEmi

      facturasFormateadas.push({
        name: `${codigoGen}.json`,
        extension: '.json',
        type: 'json',
        path: `notas_de_credito/${codigoGen}.json`,
        emissionDate: fecEmi || null,
        numeroDocumento: codigoGen,
        size: 5000,
        sizeFormatted: '5 KB',
        modified: fecEmi || null,
        codigoGeneracion: codigoGen,
      })

      if (factura.tiene_respaldo_pdf) {
        facturasFormateadas.push({
          name: `${codigoGen}.pdf`,
          extension: '.pdf',
          type: 'pdf',
          path: `notas_de_credito/${codigoGen}.pdf`,
          emissionDate: fecEmi || null,
          numeroDocumento: codigoGen,
          size: 50000,
          sizeFormatted: '50 KB',
          modified: fecEmi || null,
          codigoGeneracion: codigoGen,
        })
      }
    })

    res.json({
      success: true,
      data: {
        cliente: nombreCliente,
        facturas: facturasFormateadas,
        count: facturasFormateadas.length,
      },
    })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ===================================================================
// ENDPOINTS - ARCHIVOS (JSON/PDF)
// ===================================================================

app.get('/api/file/content', async (req, res) => {
  try {
    const { path: filePath, codigoGeneracion } = req.query

    if (!filePath && !codigoGeneracion) {
      return res.status(400).json({
        success: false,
        error: 'Falta el parámetro path o codigoGeneracion',
      })
    }

    let factura

    // Buscar por código de generación
    if (codigoGeneracion) {
      factura = facturasDB.find(f =>
        f.identificacion?.codigoGeneracion === codigoGeneracion
      )
    } else if (filePath) {
      // Extraer código de generación del path
      const fileName = filePath.split('/').pop().replace(/\.(pdf|json)$/i, '')
      factura = facturasDB.find(f =>
        f.identificacion?.codigoGeneracion === fileName
      )
    }

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada',
      })
    }

    // Si pide PDF, verificamos si existe en mock-data/pdfs/
    if (filePath && filePath.toLowerCase().endsWith('.pdf')) {
      const pdfPath = path.join(__dirname, 'mock-data', 'pdfs', filePath)

      try {
        await fs.access(pdfPath)

        // El PDF existe, enviarlo
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`)

        const pdfBuffer = await fs.readFile(pdfPath)
        return res.send(pdfBuffer)

      } catch {
        return res.status(404).json({
          success: false,
          error: 'PDF no disponible para esta factura',
        })
      }
    }

    // Devolver JSON de la factura
    res.setHeader('Content-Type', 'application/json')
    res.json(factura)

  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ===================================================================
// ENDPOINTS - DESCARGAS ZIP
// ===================================================================

/**
 * @swagger
 * /api/backup/download-folders:
 *   post:
 *     tags:
 *       - Empaquetador
 *     summary: Generar archivo ZIP (Demo)
 *     description: Descarga carpetas completas en formato ZIP
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
 *         description: ZIP generado exitosamente
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Solicitud inválida
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
      zlib: { level: 9 },
    })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="backup-folders-${Date.now()}.zip"`)

    archive.pipe(res)

    // Agregar facturas de las carpetas seleccionadas
    folders.forEach(folderName => {
      const facturasCarpeta = facturasDB.filter(f => f.categoria_origen === folderName)

      facturasCarpeta.forEach(factura => {
        const codigoGen = factura.identificacion?.codigoGeneracion || 'unknown'
        const jsonContent = JSON.stringify(factura, null, 2)

        archive.append(jsonContent, { name: `${folderName}/${codigoGen}.json` })
      })
    })

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

app.post('/api/backup/download-files', async (req, res) => {
  try {
    const { codigosGeneracion } = req.body

    if (!codigosGeneracion || codigosGeneracion.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos para empaquetar',
      })
    }

    console.log(`📦 Generando ZIP de ${codigosGeneracion.length} archivos`)

    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="files-${Date.now()}.zip"`)

    archive.pipe(res)

    // Buscar y agregar facturas
    codigosGeneracion.forEach(codigo => {
      const factura = facturasDB.find(f =>
        f.identificacion?.codigoGeneracion === codigo
      )

      if (factura) {
        const jsonContent = JSON.stringify(factura, null, 2)
        archive.append(jsonContent, { name: `${codigo}.json` })
      }
    })

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

// ===================================================================
// ENDPOINTS - SALUD Y SISTEMA
// ===================================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🎭 Backend en MODO DEMO - Datos ficticios',
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: false,
      database: 'N/A - Modo Demo',
      note: 'Los datos provienen de archivos JSON locales',
    },
    mockData: {
      facturas: facturasDB.length,
      clientes: clientesDB.length,
      source: 'server/mock-data/*.json',
    },
    environment: {
      NODE_ENV: NODE_ENV,
      mode: 'DEMO',
    },
  })
})

app.get('/api/backup/check-updates', async (req, res) => {
  try {
    // En modo demo, simular que no hay actualizaciones
    res.json({
      success: true,
      hasUpdates: false,
      recentCount: 0,
      lastUpdate: null,
      timestamp: new Date().toISOString(),
      note: 'Modo demo - datos estáticos',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ===================================================================
// PRODUCCIÓN - Servir Frontend
// ===================================================================

if (NODE_ENV === 'production') {
  app.use((req, res) => {
    if (!req.url.startsWith('/api')) {
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Error sirviendo ${req.url}:`, err.message)
          res.status(500).send('Error al cargar la aplicación')
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
 *     summary: Health check del servidor
 *     description: Verifica el estado del servidor demo
 *     responses:
 *       200:
 *         description: Servidor funcionando
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
 *                 mode:
 *                   type: string
 *                   example: 'demo'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    mode: 'demo',
    timestamp: new Date().toISOString(),
    totalFacturas: facturasDB.length
  })
})

// ===================================================================
// INICIAR SERVIDOR
// ===================================================================

app.listen(PORT, HOST, async () => {
  console.log(`\n🚀 Vault-DTE Server (MODO DEMO) running on http://${HOST}:${PORT}`)
  console.log(`🌐 Accesible desde: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`🎭 Modo: DEMO (datos ficticios)\n`)

  // Mostrar todas las IPs disponibles
  console.log('📡 Accesible desde las siguientes IPs:')
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   - http://${net.address}:${PORT} (${name})`)
      }
    }
  }

  console.log('\n✅ Servidor listo - Usando datos de prueba')
  console.log('📊 Para regenerar datos: cd server/mock-data && node generator.js\n')
})
