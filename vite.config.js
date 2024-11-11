import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { loadEnv } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VueDevTools from 'vite-plugin-vue-devtools';

const env = loadEnv('development', './');

export default defineConfig({
  plugins: [vue(), vueJsx(), VueDevTools()],
  server: {
    port: env.VITE_PORT,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      // css预处理器
      less: {
        // 引入全局的Less库，有关lib.less请看 → https://www.jianshu.com/p/b13e2a2204b2
        additionalData: '@import "./src/assets/theme.less";',
      },
    },
  },
  // 预编译
  optimizeDeps: {
    include: ['@/../lib/vform/designer.umd.js'],
  },
});
