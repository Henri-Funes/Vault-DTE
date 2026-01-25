🚀 Vault-DTE: Documentación de la API

Esta API, construida sobre Node.js y Express, actúa como el puente inteligente entre el sistema de archivos del servidor y la interfaz de usuario. Está diseñada para manejar altos volúmenes de documentos electrónicos con latencia mínima.

+--------------+--------+-------------------------------+-------------------------------------------+
| CATEGORÍA | MÉTODO | ENDPOINT | DESCRIPCIÓN |
+--------------+--------+-------------------------------+-------------------------------------------+
| Sistema | GET | /api/health | Estado del servidor y del caché |
| Estadísticas | GET | /api/backup/stats | Resumen cuantitativo por categoría |
| Explorador | GET | /api/backup/structure | Árbol completo de directorios |
| Explorador | GET | /api/backup/folder/:name | Contenido de una carpeta específica |
| Acciones | POST | /api/backup/download-folders | Empaquetado ZIP de directorios |
| Acciones | POST | /api/backup/download-files | Empaquetado ZIP de archivos seleccionados |
| Caché | POST | /api/cache/reload | Forzar actualización de datos |
+--------------+--------+-------------------------------+-------------------------------------------+

Endpoints detallados
Estructura de Directorios

Descripción: Retorna el árbol de carpetas, conteo total de archivos y tamaño total.
Endpoint: GET /api/backup/structure  
Respuesta exitosa (200):
json

{
"success": true,
"data": {
"path": "C:\\Dashboard\\Backup",
"totalFiles": 3123,
"totalSizeFormatted": "2.4 GB",
"folders": [
{ "name": "SA", "fileCount": 450, "size": "340MB" },
{ "name": "SS", "fileCount": 320, "size": "210MB" }
]
}
}

Errores comunes: 500 (error de lectura), 503 (caché no disponible).
Contenido de Carpeta

Descripción: Filtra y retorna documentos dentro de una categoría (ej. SA, SS, gastos).
Endpoint: GET /api/backup/folder/:folderName  
Parámetros:

    folderName (String) — nombre de la sucursal o categoría.

Respuesta ejemplo (200):
json

{
"success": true,
"data": {
"folder": "SA",
"files": [
{ "name": "2025-01-01_invoice.json", "size": "12KB", "type": "json" },
{ "name": "2025-01-01_invoice.pdf", "size": "120KB", "type": "pdf" }
]
}
}

Estadísticas de Respaldo

Descripción: Genera un desglose por tipo de archivo y emparejamientos (JSON vs PDF). Alimenta el dashboard.
Endpoint: GET /api/backup/stats  
Métricas clave:

    pairedInvoices: cantidad de facturas con ambos formatos.

    recentFiles: documentos procesados en las últimas 24 horas.

Respuesta ejemplo (200):
json

{
"success": true,
"data": {
"totalFiles": 3123,
"pairedInvoices": 2780,
"recentFiles": 124,
"byType": { "json": 1600, "pdf": 1523 }
}
}

Descargas y Acciones

Empaquetado de carpetas  
Endpoint: POST /api/backup/download-folders  
Payload esperado: { "folders": ["SA", "SS"] }  
Comportamiento: Genera ZIP con las carpetas solicitadas y devuelve URL temporal o stream.

Empaquetado de archivos  
Endpoint: POST /api/backup/download-files  
Payload esperado: { "files": ["path/to/file1.pdf", "path/to/file2.json"] }  
Comportamiento: Genera ZIP con archivos seleccionados.

Códigos de respuesta: 200 (OK + enlace/stream), 400 (payload inválido), 404 (archivo/carpeta no encontrada).
