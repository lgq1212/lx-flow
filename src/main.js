import { createPinia } from 'pinia'

import router from './router'
import { createApp } from 'vue'
import App from './App.vue';

//wflow样式文件
import './assets/theme.css'
import './assets/global.css'
import {Icon} from '@iconify/vue'
// 额外引入图标库
import * as ElIcons from '@element-plus/icons-vue'
import ElementPlus from "element-plus";
import 'element-plus/dist/index.css'

// VForm3
import VForm3 from '@/../lib/vform/designer.umd.js';
import '@/../lib/vform/designer.style.css';

const app = createApp(App);

//注册element图标
for (const [key, component] of Object.entries(ElIcons)) {
  app.component(key, component)
}

app.use(ElementPlus);
app.use(VForm3); //全局注册VForm3，同时注册了v-form-designer、v-form-render等组件
app.component('iconify', Icon)
app.use(createPinia())
app.use(router)
app.mount('#app');
