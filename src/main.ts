import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import { setupStore } from './store'
import '@/assets/styles/index.scss'
import '@/assets/styles/reset.scss'
import '@/assets/styles/global.scss'
import 'nprogress/nprogress.css'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
setupStore(app)
app.use(router)

app.mount('#app')
