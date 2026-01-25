import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar Faker en español
faker.locale = 'es'

// Datos base de El Salvador
const DEPARTAMENTOS = [
  'Santa Ana', 'San Salvador', 'San Miguel', 'La Libertad', 'Sonsonate',
  'Usulután', 'La Paz', 'Ahuachapán', 'Cabañas', 'Chalatenango'
]

const MUNICIPIOS = {
  'Santa Ana': ['Santa Ana', 'Metapán', 'Chalchuapa', 'Coatepeque'],
  'San Salvador': ['San Salvador', 'Soyapango', 'Mejicanos', 'Apopa', 'Ilopango'],
  'San Miguel': ['San Miguel', 'Chinameca', 'Moncagua', 'Quelepa']
}

const CATEGORIAS = ['SA', 'SM', 'SS', 'gastos', 'remisiones', 'notas_de_credito', 'anuladas']

const SUCURSALES_MAP = {
  'SA': 'H1 - Santa Ana',
  'SM': 'H2 - San Miguel',
  'SS': 'H4 - San Salvador'
}

const PRODUCTOS = [
  'Ferretería - Cemento Portland',
  'Ferretería - Varilla 3/8"',
  'Ferretería - Alambre de amarre',
  'Ferretería - Clavos 2"',
  'Ferretería - Pintura látex blanca',
  'Ferretería - Thinner estándar',
  'Ferretería - Brochas varias',
  'Materiales - Block 15x20x40',
  'Materiales - Arena de río',
  'Materiales - Piedrín',
  'Eléctrico - Cable THW #12',
  'Eléctrico - Toma corriente doble',
  'Eléctrico - Interruptor sencillo',
  'Plomería - Tubo PVC 1/2"',
  'Plomería - Codo PVC 90°',
  'Herramientas - Pala cuadrada',
  'Herramientas - Piocha',
  'Herramientas - Carretilla de construcción'
]

// Generar lista de clientes únicos
function generateClientes(cantidad = 50) {
  const clientes = []
  const nombresUsados = new Set()

  while (clientes.length < cantidad) {
    const nombre = faker.company.name()

    if (!nombresUsados.has(nombre)) {
      nombresUsados.add(nombre)

      const dpto = faker.helpers.arrayElement(DEPARTAMENTOS)

      clientes.push({
        nombre: nombre,
        numDocumento: faker.string.numeric(14),
        nrc: faker.string.numeric(8),
        tipoDocumento: faker.helpers.arrayElement(['36', '13', '37']), // NIT, DUI, Carnet
        direccion: {
          departamento: dpto,
          municipio: faker.helpers.arrayElement(MUNICIPIOS[dpto] || [dpto]),
          complemento: faker.location.streetAddress()
        },
        telefono: `${faker.helpers.arrayElement(['2', '6', '7'])}${faker.string.numeric(7)}`,
        correo: faker.internet.email().toLowerCase()
      })
    }
  }

  return clientes
}

// Generar items del cuerpo del documento
function generateCuerpoDocumento(numItems = null) {
  const cantidad = numItems || faker.number.int({ min: 1, max: 5 })
  const items = []

  for (let i = 0; i < cantidad; i++) {
    const precioUni = parseFloat(faker.finance.amount(10, 500, 2))
    const cant = faker.number.int({ min: 1, max: 20 })
    const ventaGravada = precioUni * cant
    const ivaItem = ventaGravada * 0.13

    items.push({
      numItem: i + 1,
      tipoItem: 1, // Bienes
      cantidad: cant,
      codigo: faker.string.alphanumeric(8).toUpperCase(),
      descripcion: faker.helpers.arrayElement(PRODUCTOS),
      uniMedida: 99, // Unidad
      precioUni: precioUni,
      montoDescu: 0,
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: parseFloat(ventaGravada.toFixed(2)),
      ivaItem: parseFloat(ivaItem.toFixed(2))
    })
  }

  return items
}

// Calcular resumen financiero
function calcularResumen(cuerpoDocumento) {
  let totalGravada = 0
  let totalIva = 0

  cuerpoDocumento.forEach(item => {
    totalGravada += item.ventaGravada
    totalIva += item.ivaItem
  })

  const subTotalVentas = parseFloat(totalGravada.toFixed(2))
  const totalPagar = parseFloat((totalGravada + totalIva).toFixed(2))

  return {
    totalNoSuj: 0,
    totalExenta: 0,
    totalGravada: subTotalVentas,
    subTotalVentas: subTotalVentas,
    descuNoSuj: 0,
    descuExenta: 0,
    descuGravada: 0,
    porcentajeDescuento: 0,
    totalDescu: 0,
    subTotal: subTotalVentas,
    ivaRete1: 0,
    reteRenta: 0,
    montoTotalOperacion: totalPagar,
    totalNoGravado: 0,
    totalPagar: totalPagar,
    totalLetras: numeroALetras(totalPagar),
    totalIva: parseFloat(totalIva.toFixed(2)),
    saldoFavor: 0,
    condicionOperacion: faker.helpers.arrayElement([1, 2, 3]), // 1=Contado, 2=Crédito, 3=Otro
  }
}

// Convertir número a letras (simplificado)
function numeroALetras(num) {
  const entero = Math.floor(num)
  const decimales = Math.round((num - entero) * 100)
  return `${entero > 0 ? entero : 'CERO'} DÓLARES CON ${decimales}/100 USD`
}

// Generar una factura completa
function generateFactura(clientes, options = {}) {
  const categoria = options.categoria || faker.helpers.arrayElement(CATEGORIAS)
  const cliente = options.cliente || faker.helpers.arrayElement(clientes)
  // NUEVO: Fechas del año pasado (2025) - todos los meses
  const fecha = options.fecha || faker.date.between({
    from: '2025-01-01',
    to: '2025-12-31'
  }).toISOString().split('T')[0]

  const codigoGeneracion = faker.string.uuid().toUpperCase()
  const numeroControl = `DTE-01-${faker.string.alphanumeric(8).toUpperCase()}-${faker.string.numeric(15)}`

  const cuerpoDocumento = generateCuerpoDocumento()
  const resumen = calcularResumen(cuerpoDocumento)

  // Determinar sucursal según categoría
  let sucursal = ''
  if (categoria === 'SA') sucursal = SUCURSALES_MAP['SA']
  else if (categoria === 'SM') sucursal = SUCURSALES_MAP['SM']
  else if (categoria === 'SS') sucursal = SUCURSALES_MAP['SS']
  else sucursal = faker.helpers.arrayElement(Object.values(SUCURSALES_MAP))

  return {
    identificacion: {
      version: 1,
      ambiente: '00', // Pruebas
      tipoDte: '01', // Factura
      numeroControl: numeroControl,
      codigoGeneracion: codigoGeneracion,
      tipoModelo: 1,
      tipoOperacion: 1,
      fecEmi: fecha,
      horEmi: faker.date.recent().toTimeString().split(' ')[0],
      tipoMoneda: 'USD'
    },

    emisor: {
      nit: '0614-161289-001-7',
      nrc: '12345-6',
      nombre: 'TECNOSOLUTIONS S.A. DE C.V.',
      codActividad: '46900',
      descActividad: 'Comercio al por mayor de productos varios',
      nombreComercial: 'TECNOSOLUTIONS',
      direccion: {
        departamento: 'Santa Ana',
        municipio: 'Santa Ana',
        complemento: 'Avenida Independencia Sur, Col. Centro'
      },
      telefono: '24478000',
      correo: 'ventas@tecnosolutions.com'
    },

    receptor: {
      tipoDocumento: cliente.tipoDocumento,
      numDocumento: cliente.numDocumento,
      nrc: cliente.nrc,
      nombre: cliente.nombre,
      codActividad: '46900',
      descActividad: 'Comercio minorista',
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      correo: cliente.correo
    },

    cuerpoDocumento: cuerpoDocumento,

    resumen: resumen,

    // Metadata
    categoria_origen: categoria,
    sucursal: sucursal,
    ruta_pdf: `${categoria}/${codigoGeneracion}.pdf`,
    nombre_archivo_pdf: `${codigoGeneracion}.pdf`,
    tiene_respaldo_pdf: faker.datatype.boolean(0.8), // 80% tienen PDF
    migrado_en: new Date().toISOString()
  }
}

// Generar conjunto de facturas balanceado
function generateFacturas(cantidad = 500, clientes) {
  const facturas = []

  // Distribución por categoría (proporciones realistas)
  const distribucion = {
    'SA': Math.floor(cantidad * 0.35),      // 35% Santa Ana
    'SM': Math.floor(cantidad * 0.25),      // 25% San Miguel
    'SS': Math.floor(cantidad * 0.25),      // 25% San Salvador
    'gastos': Math.floor(cantidad * 0.05),  // 5% Gastos
    'remisiones': Math.floor(cantidad * 0.05), // 5% Remisiones
    'notas_de_credito': Math.floor(cantidad * 0.03), // 3% Notas
    'anuladas': Math.floor(cantidad * 0.02) // 2% Anuladas
  }

  // Ajustar para llegar a la cantidad exacta
  const totalDistribuido = Object.values(distribucion).reduce((a, b) => a + b, 0)
  distribucion['SA'] += (cantidad - totalDistribuido)

  // Generar facturas por categoría
  Object.entries(distribucion).forEach(([categoria, cant]) => {
    for (let i = 0; i < cant; i++) {
      // Para anuladas, usar más los mismos clientes (simulación realista)
      let cliente
      if (categoria === 'anuladas' && facturas.length > 0) {
        // 70% de probabilidad de reusar un cliente existente
        if (Math.random() < 0.7) {
          const facturaAnterior = faker.helpers.arrayElement(facturas)
          cliente = {
            nombre: facturaAnterior.receptor.nombre,
            numDocumento: facturaAnterior.receptor.numDocumento,
            nrc: facturaAnterior.receptor.nrc,
            tipoDocumento: facturaAnterior.receptor.tipoDocumento,
            direccion: facturaAnterior.receptor.direccion,
            telefono: facturaAnterior.receptor.telefono,
            correo: facturaAnterior.receptor.correo
          }
        } else {
          cliente = faker.helpers.arrayElement(clientes)
        }
      } else {
        cliente = faker.helpers.arrayElement(clientes)
      }

      facturas.push(generateFactura(clientes, { categoria, cliente }))
    }
  })

  // Ordenar por fecha descendente
  facturas.sort((a, b) => b.identificacion.fecEmi.localeCompare(a.identificacion.fecEmi))

  return facturas
}

// Función principal
async function main() {
  console.log('🎲 Generando datos de prueba...\n')

  // Generar clientes
  console.log('👥 Generando 50 clientes únicos...')
  const clientes = generateClientes(50)
  console.log(`✅ ${clientes.length} clientes generados\n`)

  // Generar facturas
  console.log('📄 Generando 500 facturas...')
  const facturas = generateFacturas(500, clientes)
  console.log(`✅ ${facturas.length} facturas generadas\n`)

  // Estadísticas
  const stats = {}
  facturas.forEach(f => {
    stats[f.categoria_origen] = (stats[f.categoria_origen] || 0) + 1
  })

  console.log('📊 Distribución por categoría:')
  Object.entries(stats).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} facturas`)
  })

  // Guardar archivos
  console.log('\n💾 Guardando archivos...')

  fs.writeFileSync(
    path.join(__dirname, 'clientes.json'),
    JSON.stringify(clientes, null, 2)
  )
  console.log('✅ clientes.json guardado')

  fs.writeFileSync(
    path.join(__dirname, 'facturas.json'),
    JSON.stringify(facturas, null, 2)
  )
  console.log('✅ facturas.json guardado')

  // Generar muestra de 10 facturas para referencia rápida
  const muestra = facturas.slice(0, 10)
  fs.writeFileSync(
    path.join(__dirname, 'facturas-muestra.json'),
    JSON.stringify(muestra, null, 2)
  )
  console.log('✅ facturas-muestra.json guardado (10 facturas de ejemplo)')

  console.log('\n🎉 ¡Datos generados exitosamente!')
  console.log(`\n📁 Archivos creados en: server/mock-data/`)
  console.log(`   - clientes.json (${clientes.length} registros)`)
  console.log(`   - facturas.json (${facturas.length} registros)`)
  console.log(`   - facturas-muestra.json (10 registros)`)
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { generateClientes, generateFactura, generateFacturas }
