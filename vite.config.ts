import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Matricula/',
  build: {
    outDir: 'dist'
    // NÃO inclua 404.html aqui
  }
})