import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SpeedySnake/',
  server: {
    proxy: {
      '/SpeedySnake/socket.io': {
        target: 'http://localhost:28500',
        ws: true,
      },
    },
  },
})
