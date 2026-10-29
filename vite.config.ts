import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Support GitHub Pages, deployment platforms, and local development.
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

      '/backend': {
        target: 'https://api.medclubhu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
  },
})