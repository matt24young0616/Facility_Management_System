import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "@arcgis/core/assets/esri/themes/light/main.css";


const app = createApp(App)

app.use(router)

app.mount('#app')
