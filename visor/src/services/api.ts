// Servicio para comunicarse con el backend
const API_BASE_URL = '/api'

export interface FileInfo {
  name: string
  path: string
  size: number
  sizeFormatted: string
  type: string
  extension: string
  isDirectory: boolean
  modifiedDate: string
  createdDate: string
  emissionDate?: string | null // Fecha de emisión desde el JSON
  codigoGeneracion?: string | null // Código de generación de la factura
}

export interface FolderInfo {
  name: string
  path: string
  fileCount: number
  files: FileInfo[]
  size: number
  sizeFormatted: string
}

export interface BackupStructure {
  path: string
  folders: FolderInfo[]
  totalFiles: number
  totalSize: number
  totalSizeFormatted: string
}

export interface Stats {
  pdf: number
  json: number
  xml: number
  images: number
  other: number
  total: number
  totalSize: number
  totalSizeFormatted: string
  recentFiles: number
  pairedInvoices: number
  anuladas: number
  pairedByFolder: {
    SA: number
    SM: number
    SS: number
    gastos: number
    remisiones: number
    notas_de_credito: number
  }
  byFolder: Record<
    string,
    {
      pdf: number
      json: number
      xml: number
      images: number
      other: number
      total: number
    }
  >
}

// Función helper para hacer peticiones
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Algunos endpoints devuelven { success, data }, otros devuelven directamente
    if (data.success !== undefined && data.data !== undefined) {
      return data.data
    }

    return data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}

// Obtener estructura completa del backup
export async function getBackupStructure(): Promise<BackupStructure> {
  return fetchAPI<BackupStructure>('/backup/structure')
}

// Obtener archivos de una carpeta específica
export async function getFolderFiles(
  folderName: string,
  dateFrom?: string,
  dateTo?: string,
  limit?: number,
  page?: number,
): Promise<{
  folder: string
  path: string
  files: FileInfo[]
  count: number
  pagination?: {
    currentPage: number
    totalPages: number
    totalFiles: number
    totalFacturas: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}> {
  let endpoint = `/backup/folder/${folderName}`
  const params = new URLSearchParams()

  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) params.append('dateTo', dateTo)
  if (limit) params.append('limit', limit.toString())
  if (page) params.append('page', page.toString())

  if (params.toString()) {
    endpoint += `?${params.toString()}`
  }

  return fetchAPI(endpoint)
}

// Obtener estadísticas (con filtro de fechas opcional)
export async function getBackupStats(
  dateFrom?: string,
  dateTo?: string,
  force?: boolean,
): Promise<Stats> {
  let endpoint = '/backup/stats'
  const params = new URLSearchParams()

  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) params.append('dateTo', dateTo)
  if (force) params.append('force', 'true')

  if (params.toString()) {
    endpoint += `?${params.toString()}`
  }

  return fetchAPI<Stats>(endpoint)
}

export async function searchFacturas(query: string): Promise<{
  files: FileInfo[]
  count: number
  query: string
}> {
  const params = new URLSearchParams()
  params.append('query', query)

  return fetchAPI(`/backup/search?${params.toString()}`)
}

// Health check del servidor
export async function checkServerHealth(): Promise<{
  success: boolean
  message: string
  timestamp: string
}> {
  const response = await fetch(`${API_BASE_URL}/health`)
  return response.json()
}
