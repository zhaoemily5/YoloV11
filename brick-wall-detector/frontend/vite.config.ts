import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/** 开发环境 SPA 回退：仅改写前端路由，不拦截 Vite /src / @ 等资源 */
function isSpaHistoryPath(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0] || ''
  if (
    path.startsWith('/api') ||
    path.startsWith('/uploads') ||
    path.startsWith('/@') ||
    path.startsWith('/node_modules') ||
    path.startsWith('/src') ||
    path.startsWith('/assets')
  ) {
    return false
  }
  if (path.includes('.')) return false
  return path === '/' || path === '/index.html' || path.length > 1
}

export default defineConfig({
  root: __dirname,
  appType: 'spa',
  plugins: [
    vue(),
    {
      name: 'spa-fallback-entry',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (isSpaHistoryPath(req.url)) {
            req.url = '/entry.html'
          }
          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '..', 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'entry.html'),
    },
  },
})
