import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar'
import * as QuasarAll from 'quasar'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Quasar styles
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import 'quasar/dist/quasar.css'

import './assets/app.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  components: QuasarAll,
  directives: QuasarAll,
  plugins: { Notify, Dialog, Loading, LocalStorage },
  config: {
    dark: 'auto',
    brand: {
      primary: '#c1710e',
      secondary: '#455a64',
      accent: '#f4c842',
      dark: '#181818',
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

router.isReady().then(() => {
  app.mount('#app')
})
