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
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Error en la petición')
    }

    return data.data
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

// Obtener estadísticas
export async function getBackupStats(): Promise<Stats> {
  return fetchAPI<Stats>('/backup/stats')
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
