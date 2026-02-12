import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'ui-vendor': ['framer-motion', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ai-vendor': ['@google/genai'],
          'document-vendor': ['mammoth'],
          'validation-vendor': ['zod'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8001'
    }
  }
})
