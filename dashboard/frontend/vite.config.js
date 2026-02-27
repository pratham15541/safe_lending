import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const proxyTarget = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: true, // 🔥 important
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: true, // 🔥 important
    allowedHosts: "all", // 🔥 allows ngrok domains
  },
});