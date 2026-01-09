import mongoose from 'mongoose'

const FacturaSchema = new mongoose.Schema({
  // Identificación
  identificacion: {
    version: Number,
    ambiente: String,
    tipoDte: String,
    numeroControl: String,
    codigoGeneracion: { type: String, required: true, index: true },
    tipoModelo: Number,
    tipoOperacion: Number,
    tipoContingencia: String,
    motivoContin: String,
    fecEmi: { type: String, index: true }, // Formato: YYYY-MM-DD
    horEmi: String, // Formato: HH:MM:SS
    tipoMoneda: String
  },

  // Emisor
  emisor: {
    nit: String,
    nrc: String,
    nombre: String,
    codActividad: String,
    descActividad: String,
    nombreComercial: String,
    tipoEstablecimiento: String,
    direccion: {
      departamento: String,
      municipio: String,
      complemento: String
    },
    telefono: String,
    correo: String,
    codEstableMH: String,
    codEstable: String,
    codPuntoVentaMH: String,
    codPuntoVenta: String
  },

  // Receptor
  receptor: {
    tipoDocumento: String,
    numDocumento: String,
    nrc: String,
    nombre: { type: String, index: true }, // Índice para búsquedas rápidas por cliente
    codActividad: String,
    descActividad: String,
    direccion: {
      departamento: String,
      municipio: String,
      complemento: String
    },
    telefono: String,
    correo: String
  },

  // Cuerpo del documento
  cuerpoDocumento: [{
    numItem: Number,
    tipoItem: Number,
    numeroDocumento: String,
    cantidad: Number,
    codigo: String,
    codTributo: String,
    uniMedida: Number,
    descripcion: String,
    precioUni: Number,
    montoDescu: Number,
    ventaNoSuj: Number,
    ventaExenta: Number,
    ventaGravada: Number,
    tributos: [String],
    psv: Number,
    noGravado: Number,
    ivaItem: Number
  }],

  // Resumen
  resumen: {
    totalNoSuj: Number,
    totalExenta: Number,
    totalGravada: Number,
    subTotalVentas: Number,
    descuNoSuj: Number,
    descuExenta: Number,
    descuGravada: Number,
    porcentajeDescuento: Number,
    totalDescu: Number,
    tributos: mongoose.Schema.Types.Mixed,
    subTotal: Number,
    ivaRete1: Number,
    reteRenta: Number,
    montoTotalOperacion: Number,
    totalNoGravado: Number,
    totalPagar: Number,
    totalLetras: String,
    totalIva: Number,
    saldoFavor: Number,
    condicionOperacion: Number,
    pagos: mongoose.Schema.Types.Mixed,
    numPagoElectronico: String
  },

  // Extension (si aplica)
  extension: mongoose.Schema.Types.Mixed,

  // Apéndice (si aplica)
  apendice: mongoose.Schema.Types.Mixed,

  // Venta a tercero (si aplica)
  ventaTercero: mongoose.Schema.Types.Mixed,

  // Otros documentos
  otrosDocumentos: mongoose.Schema.Types.Mixed,

  // Documento relacionado
  documentoRelacionado: mongoose.Schema.Types.Mixed,

  // Firma electrónica y sellos
  firmaElectronica: String,
  selloRecibido: String,

  // Metadata de migración y archivos
  categoria_origen: { type: String, index: true }, // SA, SM, SS, gastos, remisiones, notas_de_credito, anuladas
  sucursal: String,
  ruta_pdf: String,
  nombre_archivo_pdf: String,
  tiene_respaldo_pdf: Boolean,
  migrado_en: { type: Date, index: true }

}, {
  timestamps: false, // No usar createdAt/updatedAt porque ya tienes migrado_en
  collection: 'facturas', // Nombre de la colección en MongoDB
  strict: false // Permite campos adicionales que no estén en el schema
})

// Índices compuestos para búsquedas comunes
FacturaSchema.index({ 'identificacion.fecEmi': -1, 'categoria_origen': 1 })
FacturaSchema.index({ 'receptor.nombre': 1, 'identificacion.fecEmi': -1 })

const Factura = mongoose.model('Factura', FacturaSchema)

export default Factura
