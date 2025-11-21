<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header moderno -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"
            >
              📁
            </div>
            <div>
              <h1 class="text-3xl font-bold text-slate-800">Visor de Backup</h1>
              <p class="text-sm text-slate-500">Sistema de gestión de archivos</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right mr-4">
              <div class="text-sm font-semibold text-slate-700">{{ currentDate }}</div>
              <div class="text-xs text-slate-500">Última actualización: {{ lastUpdate }}</div>
            </div>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard principal -->
    <main class="max-w-7xl mx-auto px-8 py-8">
      <!-- Navegación por pestañas -->
      <div class="bg-white rounded-xl shadow-md mb-6 p-2 flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200',
            activeTab === tab.id
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100',
          ]"
        >
          <span class="mr-2">{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </div>

      <!-- Contenido dinámico según la pestaña activa -->
      <div class="transition-all duration-300">
        <Estadisticas v-if="activeTab === 'stats'" />
        <Explorer v-if="activeTab === 'explorer'" />
        <Empaquetador v-if="activeTab === 'packager'" />
      </div>

      <!-- Footer informativo -->
      <div class="mt-8 bg-white rounded-xl shadow-md p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-2xl"
            >
              ✅
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-700">Estado del Sistema</div>
              <div class="text-xs text-green-600">Operativo</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-2xl"
            >
              💾
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-700">Espacio Disponible</div>
              <div class="text-xs text-slate-600">45.2 GB / 100 GB</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-2xl"
            >
              🔄
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-700">Último Backup</div>
              <div class="text-xs text-slate-600">21/11/2025 - 14:30</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Empaquetador from '@/modules/Empaquetador.vue'
import Estadisticas from '@/modules/Estadisticas.vue'
import Explorer from '@/modules/Explorer.vue'
import { onMounted, ref } from 'vue'

const activeTab = ref('stats')
const currentDate = ref('')
const lastUpdate = ref('Hace 5 minutos')

const tabs = [
  { id: 'stats', name: 'Estadísticas', icon: '📊' },
  { id: 'explorer', name: 'Explorador', icon: '📂' },
  { id: 'packager', name: 'Empaquetador', icon: '📦' },
]

onMounted(() => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<style scoped>
/* Estilos adicionales si necesitas */
</style>
