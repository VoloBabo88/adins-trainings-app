import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/adins-trainings-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Adins Trainings App',
        short_name: 'FitApp',
        description: 'Dein persönlicher Trainingsbegleiter',
        theme_color: '#7c3aed',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
