import mongoose from 'mongoose'
import path from 'path'

// Configuración de MongoDB
const MONGODB_URI = 'mongodb://adminHenri:123456@hermacoserver:27017/facturas-hermaco?authSource=admin'

// Rutas base antiguas que queremos eliminar
const OLD_PATHS = [
  'C:\\zeta2\\Henri\\Copia de seguridad de facturas(No borrar)\\Backup\\',
  'C:/zeta2/Henri/Copia de seguridad de facturas(No borrar)/Backup/',
  'J:\\Henri\\Copia de seguridad de facturas(No borrar)\\Backup\\',
  'J:/Henri/Copia de seguridad de facturas(No borrar)/Backup/',
]

// Esquema de Factura (simplificado)
const facturaSchema = new mongoose.Schema({}, { strict: false, collection: 'facturas' })
const Factura = mongoose.model('Factura', facturaSchema)

async function migratePaths() {
  try {
    console.log('🔄 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Buscar todas las facturas con ruta_pdf
    const facturas = await Factura.find({
      ruta_pdf: { $exists: true, $ne: null, $ne: '' }
    })

    console.log(`📊 Encontradas ${facturas.length} facturas con ruta_pdf`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const factura of facturas) {
      try {
        let rutaPdf = factura.ruta_pdf
        let wasAbsolute = false

        // Verificar si es ruta absoluta y convertir a relativa
        for (const oldPath of OLD_PATHS) {
          if (rutaPdf.startsWith(oldPath)) {
            rutaPdf = rutaPdf.substring(oldPath.length)
            wasAbsolute = true
            break
          }
        }

        // Si ya es relativa, no hacer nada
        if (!wasAbsolute) {
          // Verificar si es relativa válida (no empieza con C:\ o J:\)
          if (!path.isAbsolute(rutaPdf)) {
            skipped++
            continue
          }
        }

        // Normalizar separadores a forward slash para consistencia
        rutaPdf = rutaPdf.replace(/\\/g, '/')

        // Actualizar en MongoDB
        await Factura.updateOne(
          { _id: factura._id },
          { $set: { ruta_pdf: rutaPdf } }
        )

        updated++

        if (updated % 100 === 0) {
          console.log(`⏳ Procesadas ${updated} facturas...`)
        }
      } catch (err) {
        console.error(`❌ Error procesando factura ${factura._id}:`, err)
        errors++
      }
    }

    console.log('\n✅ Migración completada!')
    console.log(`   - Actualizadas: ${updated}`)
    console.log(`   - Omitidas (ya relativas): ${skipped}`)
    console.log(`   - Errores: ${errors}`)

    // Mostrar algunos ejemplos
    console.log('\n📄 Ejemplos de rutas actualizadas:')
    const samples = await Factura.find({ ruta_pdf: { $exists: true } }).limit(5)
    samples.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.ruta_pdf}`)
    })

  } catch (error) {
    console.error('❌ Error en migración:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Desconectado de MongoDB')
  }
}

// Ejecutar migración
migratePaths()
