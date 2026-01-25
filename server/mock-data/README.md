# 📊 Mock Data - Vault-DTE

Datos de prueba generados para la versión demo de Vault-DTE.

## 📁 Archivos Generados

### `clientes.json` (50 registros)

Lista de clientes ficticios con:

- Nombres de empresas realistas
- NIT, NRC, DUI
- Direcciones de El Salvador (departamentos y municipios reales)
- Teléfonos y correos

### `facturas.json` (500 registros)

Facturas electrónicas completas con:

- Códigos de generación únicos (UUID)
- Fechas entre 2024-2026
- Distribuidas por categorías:
  - **SA (H1 Santa Ana)**: ~35% (175 facturas)
  - **SM (H2 San Miguel)**: ~25% (125 facturas)
  - **SS (H4 San Salvador)**: ~25% (125 facturas)
  - **Gastos**: ~5% (25 facturas)
  - **Remisiones**: ~5% (25 facturas)
  - **Notas de Crédito**: ~3% (15 facturas)
  - **Anuladas**: ~2% (10 facturas)

### `facturas-muestra.json` (10 registros)

Muestra reducida para pruebas rápidas y revisión de estructura.

### `pdfs/` (411 archivos PDF - 1.13MB)

PDFs funcionales generados con **PDFKit** que contienen:

- ✅ **Contenido real** de cada factura (emisor, receptor, ítems, totales)
- ✅ **Formato DTE** oficial de El Salvador
- ✅ **Tablas de ítems** con cantidades, descripciones, precios
- ✅ **Resumen financiero** (subtotales, IVA 13%, total a pagar)
- ✅ **Marca de agua "DEMO"** semitransparente
- ✅ **Organizados por categoría**: `SA/`, `SM/`, `SS/`, `gastos/`, `remisiones/`, `notas_de_credito/`, `anuladas/`
- ✅ **80% de cobertura**: 411 de 500 facturas tienen PDF

**Para abrir un PDF**: cualquier visor PDF (Adobe, Chrome, Firefox, etc.)

---

## 🔄 Regenerar Datos

Si necesitas regenerar los datos con diferentes valores:

```bash
cd server/mock-data
node generator.js        # Genera facturas y clientes JSON
node generate-pdfs.cjs   # Genera PDFs funcionales (requiere los JSON)
```

Esto creará nuevos archivos con:

- 50 clientes diferentes
- 500 facturas con valores aleatorios
- Distribución similar por categorías

---

## 🎯 Personalización

Puedes modificar `generator.js` para ajustar:

### Cantidad de registros

```javascript
const clientes = generateClientes(50) // Cambiar número
const facturas = generateFacturas(500, clientes) // Cambiar número
```

### Distribución por categorías

```javascript
const distribucion = {
  SA: Math.floor(cantidad * 0.35), // Ajustar porcentajes
  SM: Math.floor(cantidad * 0.25),
  // ...
}
```

### Rangos de fechas

```javascript
faker.date.between({
  from: '2024-01-01', // Fecha inicial
  to: '2026-01-24', // Fecha final
})
```

### Productos

Edita el array `PRODUCTOS` para agregar/modificar productos de ferretería.

---

## 📊 Estructura de Factura

Cada factura incluye:

- **identificacion**: Código generación, fecha emisión, número control
- **emisor**: Datos de Hermaco (fijos)
- **receptor**: Cliente aleatorio de la lista
- **cuerpoDocumento**: 1-5 items con productos
- **resumen**: Totales, IVA (13%), monto a pagar
- **metadata**: Categoría, sucursal, referencia PDF

---

## 🔒 Confidencialidad

Estos datos son **completamente ficticios**:

- ✅ Nombres generados por Faker.js
- ✅ NITs, NRCs y correos inventados
- ✅ No hay información real de clientes
- ✅ Seguro para repositorios públicos

---

## 🛠️ Uso en la Aplicación

Los datos son cargados por `server/index.js`:

```javascript
import facturas from './mock-data/facturas.json' assert { type: 'json' }
import clientes from './mock-data/clientes.json' assert { type: 'json' }

// Cargar en memoria al iniciar
let facturasDB = [...facturas]
let clientesDB = [...clientes]
```

No requiere base de datos, todo funciona en memoria.
