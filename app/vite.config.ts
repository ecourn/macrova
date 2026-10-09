import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  cacheDir: process.env.E2E_VITE_CACHE_DIR ?? "node_modules/.vite",
  optimizeDeps:
    process.env.E2E_CALCULATOR_ISOLATED === "1"
      ? {
          entries: [
            "src/routes/**/*.tsx",
            "src/components/**/*.tsx",
            "src/router.tsx",
          ],
        }
      : undefined,
  ssr: { noExternal: ["@convex-dev/better-auth"] },
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro({
      errorHandler: "./server/error-handler.ts",
      plugins: ["./server/h3-errors.ts", "./server/abort-response.ts"],
    }),
    viteReact(),
  ],
})

export default config
