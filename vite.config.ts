import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'MugenChessX - by ANANDA JANA',
          short_name: 'MugenChessX',
          description: 'A dark-themed human-vs-human multiplayer dice chess platform featuring custom Prince mechanics.',
          theme_color: '#0b0f17',
          background_color: '#0b0f17',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio preview iframe environment.
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: true as const,
    },


    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'motion'],
    },
  };
});
