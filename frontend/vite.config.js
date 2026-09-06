import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      // socket.io is used for real-time chat and must reach the backend
      "/socket.io": {
        target: "ws://localhost:5000",
        ws: true,
      },
    },
  },
})
