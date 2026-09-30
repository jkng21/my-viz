import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles.css'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          background: '#101725',
          surface: '#121c2d',
          primary: '#8db9ff',
          secondary: '#7ad7c3',
          accent: '#d7a8ff',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
