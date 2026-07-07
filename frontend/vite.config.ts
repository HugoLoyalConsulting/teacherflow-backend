import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts'
          }

          if (id.includes('@fullcalendar')) {
            return 'calendar'
          }

          if (id.includes('@sentry') || id.includes('posthog-js')) {
            return 'observability'
          }

          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
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
