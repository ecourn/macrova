import { defineConfig, devices } from "@playwright/test"
import { loadEnv } from "vite"

const liveAuth = process.env.E2E_AUTH === "1"
const env = loadEnv("development", process.cwd(), "")
const baseURL = "http://localhost:3001"

if (liveAuth) {
  if (
    !env.CONVEX_DEPLOYMENT?.startsWith("dev:") ||
    !env.VITE_CONVEX_URL ||
    !env.VITE_CONVEX_SITE_URL
  ) {
    throw new Error(
      "Les tests d'auth exigent un déploiement Convex dev configuré."
    )
  }
  if (!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD) {
    throw new Error(
      "Définir E2E_AUTH_EMAIL et E2E_AUTH_PASSWORD (compte de test)."
    )
  }
}

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: liveAuth
    ? ["**/public.spec.ts", "**/auth.spec.ts"]
    : ["**/public.spec.ts", "**/offline.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: liveAuth ? "off" : "retain-on-failure",
    screenshot: liveAuth ? "off" : "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev --host localhost --port 3001 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_CONVEX_URL: liveAuth ? env.VITE_CONVEX_URL : "",
      VITE_CONVEX_SITE_URL: liveAuth ? env.VITE_CONVEX_SITE_URL : "",
      VITE_SITE_URL: baseURL,
      E2E_AUTH_EMAIL: "",
      E2E_AUTH_PASSWORD: "",
    },
  },
})
