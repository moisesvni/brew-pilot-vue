import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Quasar styles
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import 'quasar/src/css/index.sass'

import './assets/app.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading, LocalStorage },
  config: {
    dark: 'auto',
    brand: {
      primary: '#e8a020',
      secondary: '#1e3a5f',
      accent: '#f4c842',
      dark: '#1a1a2e',
      positive: '#21ba45',
      negative: '#c10015',
      info: '#31ccec',
      warning: '#f2c037'
    },
    notify: {
      position: 'top-right',
      timeout: 3000
    }
  }
})

app.mount('#app')
