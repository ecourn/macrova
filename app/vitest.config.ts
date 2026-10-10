import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: {
    environment: "edge-runtime",
    include: [
      "convex/**/*.test.ts",
      "src/domain/**/*.test.ts",
      "src/lib/**/*.test.ts",
      "tests/config/**/*.test.ts",
      "scripts/audit-off.test.ts",
    ],
  },
})
