<template>
  <div class="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
    <!-- Sidebar lateral -->
    <aside class="w-24 bg-navy flex flex-col items-center py-2 gap-6 shadow-xl">
      <!-- Logo -->
      <div class="w-22 h-22 flex items-center justify-center mb-4 bg-white rounded-xl shadow-lg overflow-hidden">
        <img src="/Vault-DTE.png" alt="Vault-DTE" class="w-full h-full object-contain scale-200" />
      </div>

      <!-- Botones de navegación -->
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 relative',
          activeTab === tab.id
            ? 'bg-white text-navy shadow-lg scale-110'
            : 'text-white hover:bg-navy-light hover:scale-105',
        ]"
        :title="tab.name"
      >
        <component :is="tab.icon" :size="24" />
      </button>
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header moderno -->
      <header class="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
        <div class="px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">{{ currentTabName }}</h1>
              <p class="text-xs text-slate-500">Sistema de Gestión de Documentos Tributarios Electrónicos</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-sm font-semibold text-slate-700">{{ currentDate }}</div>
                <div class="text-xs text-slate-500">Última actualización: {{ lastUpdate }}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard principal -->
      <main class="flex-1 overflow-y-auto px-8 py-6">
        <!-- Contenido dinámico según la pestaña activa -->
        <div class="transition-all duration-300 mb-6">
          <Estadisticas v-if="activeTab === 'stats'" />
          <Explorer v-if="activeTab === 'explorer'" />
          <Clientes v-if="activeTab === 'clientes'" />
          <Empaquetador v-if="activeTab === 'packager'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Clientes from '@/modules/Clientes.vue'
import Empaquetador from '@/modules/Empaquetador.vue'
import Estadisticas from '@/modules/EstadisticasNew.vue'
import Explorer from '@/modules/Explorer.vue'
import { getBackupStats } from '@/services/api'
import { onMounted, ref, computed } from 'vue'
import { BarChart3, FolderOpen, Users, Package } from 'lucide-vue-next'

const activeTab = ref('stats')
const currentDate = ref('')
const lastUpdate = ref('Hace 5 minutos')
const totalSize = ref('')

const tabs = [
  { id: 'stats', name: 'Estadísticas', icon: BarChart3 },
  { id: 'explorer', name: 'Explorador', icon: FolderOpen },
  { id: 'clientes', name: 'Clientes', icon: Users },
  { id: 'packager', name: 'Empaquetador', icon: Package },
]

const currentTabName = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value)?.name || 'Vault-DTE'
})

const loadStats = async () => {
  try {
    const data = await getBackupStats()
    totalSize.value = data.totalSizeFormatted

    // Notificar que los datos están cargados para ocultar pantalla de carga
    window.dispatchEvent(new Event('app-data-loaded'))
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    totalSize.value = 'N/A'

    // Ocultar pantalla de carga incluso si hay error
    window.dispatchEvent(new Event('app-data-loaded'))
  }
}

onMounted(() => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  loadStats()
})
</script>

<style scoped>
.bg-navy {
  background-color: #1e3a8a;
}

.bg-navy-light {
  background-color: #2563eb;
}

.text-navy {
  color: #1e3a8a;
}
</style>
