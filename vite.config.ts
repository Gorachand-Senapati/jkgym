import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'darklogo.jpeg', 'whitelogo.jpeg'],
      manifest: {
        name: 'JK Multi Gym & Pain Rehab Centre',
        short_name: 'JK Gym',
        description: 'JK Multi Gym Management System',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          {
            src: 'darklogo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'darklogo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
})
