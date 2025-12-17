import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/dofy_tel/",
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5185,
  },
});
