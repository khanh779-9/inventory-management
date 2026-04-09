import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Cổng dev server đọc từ VITE_DEV_PORT trong .env (mặc định 5173)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_DEV_PORT) || 5173
  return {
    plugins: [react(), tailwindcss()],
    server: { port, strictPort: true },
  }
})
