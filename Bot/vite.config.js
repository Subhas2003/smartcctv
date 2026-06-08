// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss(),],
//   server: {
//     host: true,          // allow external
//     port: 5173,
//     strictPort: true,

//     // 🔥 ngrok er jonno MUST
//     allowedHosts: 'posttoxic-unexplosively-johnathan.ngrok-free.dev',

//     cors: true,

//     hmr: {
//       clientPort: 443   // ngrok https fix
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss(),],

  server: {
    host: '0.0.0.0',      // 🔥 important
    port: 5173,
    strictPort: true,

    // 🔥 NGROK FIX
    allowedHosts: [
      'All'
    ],

    cors: true,

    hmr: {
      host: 'posttoxic-unexplosively-johnathan.ngrok-free.dev',
      protocol: 'wss',
      clientPort: 443
    }
  }
})
