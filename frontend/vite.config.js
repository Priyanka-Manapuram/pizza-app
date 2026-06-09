import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pizza-app-backend-nz14.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
