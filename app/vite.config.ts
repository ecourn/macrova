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
          noDiscovery: true,
          include: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "@base-ui/react/button",
            "@base-ui/react/input",
            "@base-ui/react/separator",
            "@base-ui/react/tooltip",
            "@tanstack/react-devtools",
            "class-variance-authority",
            "cn",
            "lucide-react",
            "seroval",
            "convex/browser",
            "convex/react",
            "convex/server",
            "better-auth/react",
            "@convex-dev/better-auth/react",
            "@convex-dev/better-auth/react-start",
            "@convex-dev/better-auth/client/plugins",
          ],
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
