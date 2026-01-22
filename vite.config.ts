import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permitir cualquier host en producción (Railway, Vercel, etc.)
    allowedHosts: true,
  },
  preview: {
    // También para el comando preview
    allowedHosts: true,
  },
})

