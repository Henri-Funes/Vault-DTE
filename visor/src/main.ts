import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Montar la aplicación
app.mount('#app')

// Función para ocultar la pantalla de carga
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    loadingScreen.classList.add('hidden')
    // Eliminar del DOM después de la transición
    setTimeout(() => {
      loadingScreen.remove()
    }, 500)
  }
}

// Escuchar evento de datos cargados
window.addEventListener('app-data-loaded', hideLoadingScreen)

// Timeout de seguridad: ocultar después de 5 segundos máximo
setTimeout(hideLoadingScreen, 5000)
