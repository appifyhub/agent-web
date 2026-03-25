import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom") || id.match(/\/react\//)) {
              return "vendor-react";
            }
            if (id.includes("radix-ui")) {
              return "vendor-radix";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("sonner") ||
              id.includes("tailwind-merge") ||
              id.includes("clsx") ||
              id.includes("class-variance-authority") ||
              id.includes("embla-carousel-react") ||
              id.includes("vaul") ||
              id.includes("next-themes") ||
              id.includes("input-otp")
            ) {
              return "vendor-ui";
            }
          }
        },
      },
    },
  },
  server: {
    allowedHosts: true,
  },
});
