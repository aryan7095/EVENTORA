import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Vite configuration file
export default defineConfig({
    // Enables React support: JSX transformation and Fast Refresh (hot reload) during development
    plugins: [react()],
})
