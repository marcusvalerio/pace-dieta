import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O app sai em app.html (servido em /login); o site fica em public/index.html (servido em /)
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: 'app.html' } },
  server: { open: '/login' },
  appType: 'mpa',
})
