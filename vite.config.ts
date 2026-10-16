import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Support GitHub Pages (/midical-club/), custom deployment platforms, or local dev
const base =
  process.env.BASE_PATH ||
  (process.env.NETLIFY || process.env.VERCEL
    ? '/'
    : process.env.NODE_ENV === 'production'
    ? '/midical-club/'
    : '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})