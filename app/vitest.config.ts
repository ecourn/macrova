import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: [
      "convex/**/*.test.ts",
      "src/domain/**/*.test.ts",
      "src/lib/**/*.test.ts",
      "tests/config/**/*.test.ts",
    ],
  },
})
