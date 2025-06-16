import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch'
          ],
          'query-vendor': ['@tanstack/react-query', 'axios'],
          'icons-vendor': ['@mdi/react', '@mdi/js', 'lucide-react', '@tabler/icons-react'],
          'framer-motion': ['framer-motion'],
          'antd': ['antd'],
          'charts': ['recharts'],
          'lightbox': ['yet-another-react-lightbox'],
          'pdf-export': ['jspdf', 'jspdf-autotable'],
          'excel': ['xlsx'],
          'qr-scanner': ['html5-qrcode'],
          'utils-vendor': ['lodash', 'dayjs', 'moment', 'date-fns', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios'
    ],
    exclude: [
      'framer-motion',
      'antd',
      'jspdf',
      'xlsx',
      'html5-qrcode',
      'yet-another-react-lightbox'
    ]
  }
}) 