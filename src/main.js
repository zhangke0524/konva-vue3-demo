import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

import VueKonva from 'vue-konva'

const app = createApp(App)

app.use(VueKonva)
app.use(ElementPlus)

app.mount('#app')


