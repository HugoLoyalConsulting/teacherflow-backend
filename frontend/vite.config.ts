import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
})
