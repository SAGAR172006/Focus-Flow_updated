import react from '@vitejs/plugin-react-swc'
import path from 'path'

// We remove 'defineConfig' as it's a TypeScript helper.
// We just export the configuration object directly.

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  resolve: {
    alias: {
      // '__dirname' isn't available in standard JavaScript modules.
      // 'path.resolve('./src')' works perfectly here.
      '@': path.resolve('./src'),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',

    // --- THIS IS THE PROXY ---
    // This part is crucial for connecting your frontend (on port 5173)
    // to your backend (on port 5000) and avoiding CORS errors.
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // <-- This is the corrected port
        changeOrigin: true,
      }
    }
  },
}