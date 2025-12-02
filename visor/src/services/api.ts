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
export async function getFolderFiles(folderName: string): Promise<{
  folder: string
  path: string
  files: FileInfo[]
  count: number
}> {
  return fetchAPI(`/backup/folder/${folderName}`)
}

// Obtener estadísticas (con filtro de fechas opcional)
export async function getBackupStats(dateFrom?: string, dateTo?: string): Promise<Stats> {
  let endpoint = '/backup/stats'
  const params = new URLSearchParams()

  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) params.append('dateTo', dateTo)

  if (params.toString()) {
    endpoint += `?${params.toString()}`
  }

  return fetchAPI<Stats>(endpoint)
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
