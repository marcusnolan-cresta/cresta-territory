import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'cresta-territory' to match your exact GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/cresta-territory/',
})
