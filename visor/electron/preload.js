const { contextBridge, ipcRenderer } = require('electron')

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
})
