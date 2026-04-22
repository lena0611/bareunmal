import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bareunmal/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}))
