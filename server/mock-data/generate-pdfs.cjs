const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Leer facturas
const facturas = JSON.parse(fs.readFileSync(path.join(__dirname, 'facturas.json'), 'utf8'));

// Crear directorios para PDFs
const basePath = path.join(__dirname, 'pdfs');
const categorias = ['SA', 'SM', 'SS', 'gastos', 'remisiones', 'notas_de_credito', 'anuladas'];

// Crear estructura de carpetas
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}

categorias.forEach(cat => {
  const catPath = path.join(basePath, cat);
  if (!fs.existsSync(catPath)) {
    fs.mkdirSync(catPath);
  }
});

// Función para formatear moneda
function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Función para generar PDF de factura
function generarPDF(factura, rutaPDF) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    const pdfPath = path.join(basePath, rutaPDF);
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // ======== ENCABEZADO ========
    doc.fontSize(20).font('Helvetica-Bold').text('DOCUMENTO TRIBUTARIO ELECTRÓNICO', { align: 'center' });
    doc.moveDown(0.3);

    // Tipo de documento
    let tipoDoc = 'FACTURA';
    if (factura.identificacion.tipoDocumento === 'SUJETO EXCLUIDO') {
      tipoDoc = 'FACTURA SUJETO EXCLUIDO';
    } else if (factura.identificacion.tipoDocumento === 'SIMPLIFICADA') {
      tipoDoc = 'FACTURA SIMPLIFICADA';
    } else if (factura.identificacion.tipoDocumento === 'CREDITO FISCAL') {
      tipoDoc = 'CRÉDITO FISCAL';
    }

    doc.fontSize(16).font('Helvetica-Bold').text(tipoDoc, { align: 'center' });
    doc.moveDown(0.5);

    // Código de generación
    doc.fontSize(9).font('Helvetica');
    doc.text(`Código de Generación: ${factura.identificacion.codigoGeneracion}`, { align: 'center' });
    doc.text(`Número de Control: ${factura.identificacion.numeroControl}`, { align: 'center' });
    doc.text(`Fecha: ${factura.identificacion.fhProcesamiento}`, { align: 'center' });

    doc.moveDown(1);

    // ======== EMISOR Y RECEPTOR ========
    const leftColumn = 40;
    const rightColumn = 320;
    let yPosition = doc.y;

    // EMISOR
    doc.fontSize(11).font('Helvetica-Bold').text('EMISOR', leftColumn, yPosition);
    doc.fontSize(9).font('Helvetica');
    doc.text(factura.emisor.nombre, leftColumn, doc.y + 5, { width: 250 });
    doc.text(`NIT: ${factura.emisor.nit}`, leftColumn);
    doc.text(`NRC: ${factura.emisor.nrc}`, leftColumn);
    doc.text(factura.emisor.direccion.departamento, leftColumn, doc.y + 3);
    doc.text(factura.emisor.direccion.municipio, leftColumn);
    doc.text(`Tel: ${factura.emisor.telefono}`, leftColumn);
    doc.text(factura.emisor.correo, leftColumn);

    // RECEPTOR
    doc.fontSize(11).font('Helvetica-Bold').text('RECEPTOR', rightColumn, yPosition);
    doc.fontSize(9).font('Helvetica');
    doc.text(factura.receptor.nombre, rightColumn, yPosition + 17, { width: 250 });
    doc.text(`${factura.receptor.tipoDocumento}: ${factura.receptor.numDocumento}`, rightColumn);
    if (factura.receptor.nrc) {
      doc.text(`NRC: ${factura.receptor.nrc}`, rightColumn);
    }
    doc.text(factura.receptor.direccion.departamento, rightColumn, doc.y + 3);
    doc.text(factura.receptor.direccion.municipio, rightColumn);
    if (factura.receptor.telefono) {
      doc.text(`Tel: ${factura.receptor.telefono}`, rightColumn);
    }
    doc.text(factura.receptor.correo, rightColumn);

    doc.moveDown(2);

    // ======== TABLA DE ITEMS ========
    const tableTop = doc.y + 20;
    doc.fontSize(10).font('Helvetica-Bold');

    // Headers
    const colCantidad = leftColumn;
    const colDescripcion = leftColumn + 50;
    const colPrecio = leftColumn + 320;
    const colTotal = leftColumn + 420;

    doc.text('Cant.', colCantidad, tableTop);
    doc.text('Descripción', colDescripcion, tableTop);
    doc.text('Precio Unit.', colPrecio, tableTop);
    doc.text('Total', colTotal, tableTop);

    // Línea separadora
    doc.moveTo(leftColumn, tableTop + 15)
       .lineTo(leftColumn + 520, tableTop + 15)
       .stroke();

    // Items
    doc.fontSize(9).font('Helvetica');
    let itemY = tableTop + 25;

    factura.cuerpoDocumento.forEach((item, index) => {
      if (itemY > 650) { // Nueva página si es necesario
        doc.addPage();
        itemY = 40;
      }

      doc.text(item.cantidad, colCantidad, itemY);
      doc.text(item.descripcion, colDescripcion, itemY, { width: 260 });
      doc.text(formatCurrency(item.precioUnitario), colPrecio, itemY);
      doc.text(formatCurrency(item.ventaGravada || item.ventaExenta || 0), colTotal, itemY);

      itemY += 30;
    });

    // ======== RESUMEN ========
    itemY += 20;
    if (itemY > 650) {
      doc.addPage();
      itemY = 40;
    }

    doc.moveTo(leftColumn, itemY)
       .lineTo(leftColumn + 520, itemY)
       .stroke();

    itemY += 15;

    const labelX = leftColumn + 280;
    const valueX = leftColumn + 420;

    doc.fontSize(10).font('Helvetica');

    if (factura.resumen.totalGravada > 0) {
      doc.text('Subtotal Gravado:', labelX, itemY);
      doc.text(formatCurrency(factura.resumen.totalGravada), valueX, itemY);
      itemY += 20;

      doc.text('IVA (13%):', labelX, itemY);
      doc.text(formatCurrency(factura.resumen.totalIva), valueX, itemY);
      itemY += 20;
    }

    if (factura.resumen.totalExenta > 0) {
      doc.text('Total Exento:', labelX, itemY);
      doc.text(formatCurrency(factura.resumen.totalExenta), valueX, itemY);
      itemY += 20;
    }

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('TOTAL A PAGAR:', labelX, itemY);
    doc.text(formatCurrency(factura.resumen.totalPagar), valueX, itemY);

    // Monto en letras
    itemY += 25;
    doc.fontSize(9).font('Helvetica-Oblique');
    doc.text(`SON: ${factura.resumen.totalLetras}`, leftColumn, itemY, { width: 520 });

    // ======== PIE DE PÁGINA ========
    itemY += 40;
    doc.fontSize(8).font('Helvetica');
    doc.text('Este documento ha sido procesado conforme a las disposiciones del Ministerio de Hacienda', leftColumn, itemY, {
      align: 'center',
      width: 520
    });

    itemY += 15;
    doc.text('de la República de El Salvador para Documentos Tributarios Electrónicos (DTE)', leftColumn, itemY, {
      align: 'center',
      width: 520
    });

    // Sello de DEMO
    doc.fontSize(40).font('Helvetica-Bold').fillColor('red').opacity(0.1);
    doc.text('DEMO', 0, 400, {
      align: 'center',
      rotate: -45
    });

    doc.end();

    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
}

// Generar PDFs
console.log('📄 Generando PDFs de facturas...\n');

let generados = 0;
let omitidos = 0;

async function generarTodosPDFs() {
  for (const factura of facturas) {
    if (factura.tiene_respaldo_pdf) {
      try {
        await generarPDF(factura, factura.ruta_pdf);
        generados++;

        if (generados % 50 === 0) {
          console.log(`   ⏳ Procesando... ${generados} PDFs generados`);
        }
      } catch (error) {
        console.error(`   ❌ Error generando ${factura.ruta_pdf}:`, error.message);
      }
    } else {
      omitidos++;
    }
  }

  console.log('\n✅ Proceso completado:');
  console.log(`   📄 ${generados} PDFs generados`);
  console.log(`   ⏭️  ${omitidos} facturas sin respaldo PDF`);
  console.log(`\n📁 Ubicación: ${basePath}`);

  // Calcular tamaño total
  let totalSize = 0;
  categorias.forEach(cat => {
    const catPath = path.join(basePath, cat);
    if (fs.existsSync(catPath)) {
      const files = fs.readdirSync(catPath);
      files.forEach(file => {
        const stats = fs.statSync(path.join(catPath, file));
        totalSize += stats.size;
      });
    }
  });

  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`   💾 Tamaño total: ${sizeMB} MB`);
}

generarTodosPDFs().catch(console.error);
