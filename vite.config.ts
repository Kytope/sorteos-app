import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: false,
    allowedHosts: ['exciting-imagination-production.up.railway.app', '.railway.app'],
  },
})
