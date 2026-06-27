import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

const head = createHead()

createApp(App).use(router).use(head).use(i18n).mount('#app')
