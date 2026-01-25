import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBackupPathStore = defineStore('backupPath', () => {
  const currentPath = ref<string>('')
  const isPathSet = ref(true) // Siempre configurado automáticamente

  // La ruta ahora se determina automáticamente en el backend
  // Este store se mantiene para compatibilidad pero ya no requiere configuración del usuario

  function loadBackupPath() {
    // El backend determina la ruta automáticamente desde .env o búsqueda
    isPathSet.value = true
  }

  return {
    currentPath,
    isPathSet,
    loadBackupPath,
  }
})
