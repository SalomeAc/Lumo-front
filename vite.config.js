import { defineConfig } from "vite";
import { resolve } from "path";

const ROOT = resolve(__dirname, "src");
const PUBLIC_DIR = resolve(__dirname, "public");
const OUT_DIR = resolve(__dirname, "dist");

export default defineConfig({
  root: ROOT,
  publicDir: PUBLIC_DIR,
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(ROOT, "index.html"),
        about: resolve(ROOT, "about", "index.html"),
      },
    },
  },
});
