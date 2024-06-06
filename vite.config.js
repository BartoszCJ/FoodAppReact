import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/FoodAppReact/",
  server: {
    port: 5000,    
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        ws: false
      },
      '/PluginsAPI': {
        target: 'https://localhost:55434/',
        changeOrigin: true,
        secure: false,
        ws: false
      },  
    },}
});
