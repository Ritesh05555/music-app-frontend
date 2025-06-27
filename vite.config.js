// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sun Dhun',
        short_name: 'Sun Dhun',
        description: 'Listen to your favorite melodies anytime, anywhere!',
        theme_color: '#000000',           // Make this match your splash background
        background_color: '#000000',      // Match this too for smooth transition
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',       // Your logo file resized to 192x192
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',       // Your logo file resized to 512x512
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'       // Good practice for modern Android splash shape
          }
        ]
      }
    })
  ]
})