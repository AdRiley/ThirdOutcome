import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          build: {
            rollupOptions: {
              external: ["@duckdb/node-api"]
            }
          }
        }
      },
      preload: {
        input: "electron/preload.ts"
      }
    })
  ],
  build: {
    outDir: "dist"
  }
});
