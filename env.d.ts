/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    getBackupPath: () => Promise<string>
    getAppVersion: () => Promise<string>
    selectFolder: () => Promise<string | null>
    platform: string
  }
}
