import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'accounting',
      filename: 'remoteEntry.js',
      exposes: {
        './AccountingDashboard': './components/AccountingDashboard',
        './ChartOfAccounts': './components/ChartOfAccounts',
      },
      shared: {
        'react': { 
          singleton: true, 
          requiredVersion: '^18.2.0'
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.2.0'
        },
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: true,
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        'lucide-react',
        '@tanstack/react-query',
        '@tanstack/react-router',
        '@tanstack/react-form',
        'react-hot-toast',
        'date-fns',
        'zod',
        'axios'
      ],
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      }
    }
  }
})
