import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Strona stoi w katalogu głównym domeny (Netlify). Dla GitHub Pages trzeba by ustawić '/<nazwa-repo>/'.
  base: '/',
})