import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Backend FastAPI chạy ở cổng 8000 (cd backend && uvicorn app.main:app --reload).
// Proxy để FE gọi /api/... mà không vướng CORS khi dev.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': BACKEND_URL,
      '/health': BACKEND_URL,
    },
  },
})
