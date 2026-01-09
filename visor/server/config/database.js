import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    console.log('✅ Ya conectado a MongoDB')
    return
  }

  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI no está definida en las variables de entorno')
    }

    console.log('🔄 Conectando a MongoDB...')

    await mongoose.connect(mongoUri, {
      // Opciones recomendadas
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    console.log('✅ Conectado exitosamente a MongoDB')
    console.log(`📊 Base de datos: ${mongoose.connection.name}`)

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message)
    throw error
  }
}

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Desconectado de MongoDB')
  isConnected = false
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de MongoDB:', err)
})

export default mongoose
