#!/usr/bin/env node
/**
 * Script de diagnóstico para verificar la conexión a MongoDB
 * y el estado de la base de datos
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/database.js'
import Factura from './models/Factura.js'

// Cargar variables de entorno
dotenv.config()

console.log('\n🔍 ===== DIAGNÓSTICO DE CONEXIÓN MONGODB =====\n')

// 1. Verificar variables de entorno
console.log('1️⃣ Variables de Entorno:')
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ NO CONFIGURADA')
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development')
console.log('   BACKUP_PATH:', process.env.BACKUP_PATH || 'default')

if (!process.env.MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI no está configurada en el archivo .env')
  console.error('   Asegúrate de tener un archivo .env con:')
  console.error('   MONGODB_URI=mongodb://usuario:password@host:puerto/database?authSource=admin')
  process.exit(1)
}

console.log('\n2️⃣ Intentando conectar a MongoDB...')

try {
  await connectDB()
  console.log('   ✅ Conexión exitosa a MongoDB')
  console.log('   📊 Base de datos:', mongoose.connection.name)
  console.log('   🌐 Host:', mongoose.connection.host)
  console.log('   🔌 Puerto:', mongoose.connection.port)

  console.log('\n3️⃣ Verificando colecciones...')
  const collections = await mongoose.connection.db.listCollections().toArray()
  console.log('   Colecciones encontradas:', collections.length)
  collections.forEach((col) => {
    console.log(`   - ${col.name}`)
  })

  console.log('\n4️⃣ Contando documentos en colección "facturas"...')
  const totalFacturas = await Factura.countDocuments()
  console.log('   📄 Total de facturas:', totalFacturas)

  if (totalFacturas === 0) {
    console.log('\n   ⚠️  ADVERTENCIA: No hay facturas en la base de datos')
    console.log('   ⚠️  Esto podría ser normal si aún no se han migrado datos')
  } else {
    console.log('\n5️⃣ Obteniendo muestra de datos...')
    const sample = await Factura.findOne()
      .select(
        'identificacion.codigoGeneracion identificacion.fecEmi receptor.nombre categoria_origen',
      )
      .lean()

    if (sample) {
      console.log('   📋 Ejemplo de factura:')
      console.log('   - Código:', sample.identificacion?.codigoGeneracion)
      console.log('   - Fecha:', sample.identificacion?.fecEmi)
      console.log('   - Cliente:', sample.receptor?.nombre)
      console.log('   - Categoría:', sample.categoria_origen)
    }

    console.log('\n6️⃣ Conteo por categoría:')
    const porCategoria = await Factura.aggregate([
      { $group: { _id: '$categoria_origen', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    porCategoria.forEach((item) => {
      console.log(`   - ${item._id || 'sin categoría'}: ${item.count} facturas`)
    })

    console.log('\n7️⃣ Facturas recientes (últimas 24 horas):')
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    const recentCount = await Factura.countDocuments({
      migrado_en: { $gte: yesterday },
    })
    console.log(`   📅 Facturas agregadas en las últimas 24h: ${recentCount}`)
  }

  console.log('\n✅ ===== DIAGNÓSTICO COMPLETADO =====')
  console.log('   Todo está funcionando correctamente')
  console.log('   El servidor debería poder servir datos sin problemas\n')

  process.exit(0)
} catch (error) {
  console.error('\n❌ ===== ERROR EN DIAGNÓSTICO =====')
  console.error('   Tipo:', error.name)
  console.error('   Mensaje:', error.message)

  if (error.message.includes('MONGODB_URI')) {
    console.error('\n💡 Solución:')
    console.error('   1. Verifica que existe el archivo .env en la raíz del proyecto')
    console.error('   2. Asegúrate de que contiene: MONGODB_URI=...')
    console.error('   3. Verifica que no hay espacios adicionales')
  } else if (error.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Solución:')
    console.error('   1. Verifica que el servidor MongoDB está corriendo')
    console.error('   2. Verifica que el host y puerto son correctos')
    console.error('   3. Verifica que no hay firewall bloqueando la conexión')
  } else if (error.message.includes('Authentication failed')) {
    console.error('\n💡 Solución:')
    console.error('   1. Verifica usuario y contraseña en MONGODB_URI')
    console.error('   2. Verifica que authSource es correcto (normalmente "admin")')
    console.error('   3. Verifica que el usuario tiene permisos en la base de datos')
  }

  console.error('\n   Stack trace:')
  console.error(error.stack)
  process.exit(1)
}
