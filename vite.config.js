import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/FoodAppReact/",
  server: {
    proxy: {
      "/login": "http://localhost:5000",
    },
  },
});
