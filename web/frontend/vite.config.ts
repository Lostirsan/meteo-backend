import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'mindful-reverence-production-2a76.up.railway.app'
    ]
  }
})
