import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uncomment and install rollup-plugin-visualizer to analyze bundle size:
    // npm install -D rollup-plugin-visualizer
    // Then import: import { visualizer } from 'rollup-plugin-visualizer'
    // visualizer({ open: true, gzipSize: true, brotliSize: true })
  ],
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'framer': ['framer-motion'], // Separate framer-motion for lazy loading
          'icons': ['react-icons'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Disable source maps in production for smaller bundle
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@chakra-ui/react', '@supabase/supabase-js'],
    // Exclude framer-motion from pre-bundling for on-demand loading
    exclude: ['framer-motion'],
  },
})
