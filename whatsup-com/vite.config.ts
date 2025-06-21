import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*server: {
    host: true,
    allowedHosts: ['b0b5-2406-7400-c2-ca76-898-3788-684f-6d60.ngrok-free.app'],
    hmr: {
      clientPort: 443,
    },
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  }*/
})
