import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

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
        dashboard: resolve(ROOT, "dashboard", "index.html"),
        "create-task": resolve(ROOT, "create-task", "index.html"),
        "create-list": resolve(ROOT, "create-list", "index.html"),
        "recover-password": resolve(ROOT, "recover-password", "index.html"),
        "reset-password": resolve(ROOT, "reset-password", "index.html"),
        "user-profile": resolve(ROOT, "user-profile", "index.html"),
        "edit-profile": resolve(ROOT, "edit-profile", "index.html"),
        security: resolve(ROOT, "security", "index.html"),
        contact: resolve(ROOT, "contact", "index.html"),
        login: resolve(ROOT, "login", "index.html"),
        register: resolve(ROOT, "register", "index.html"),
      },
    },
    copyPublicDir: true,
  },
  assetsInclude: ['**/*.html'],
  plugins: [
    {
      name: 'copy-components',
      writeBundle() {
        try {
          mkdirSync(resolve(OUT_DIR, 'components'), { recursive: true });
          copyFileSync(
            resolve(ROOT, 'components', 'barnav.html'),
            resolve(OUT_DIR, 'components', 'barnav.html')
          );
          copyFileSync(
            resolve(ROOT, 'components', 'barnav.css'),
            resolve(OUT_DIR, 'components', 'barnav.css')
          );
          copyFileSync(
            resolve(ROOT, 'components', 'barnav.js'),
            resolve(OUT_DIR, 'components', 'barnav.js')
          );
        } catch (error) {
          console.warn('Error copying components:', error);
        }
      }
    }
  ]
});
