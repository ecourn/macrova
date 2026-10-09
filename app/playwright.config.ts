import { defineConfig, devices } from "@playwright/test"
import { loadEnv } from "vite"

const liveAuth = process.env.E2E_AUTH === "1"
const remoteOrigin = process.env.E2E_BASE_URL
if (process.env.E2E_REMOTE === "1" && !remoteOrigin) {
  throw new Error("La recette distante exige E2E_BASE_URL.")
}
if (remoteOrigin && !liveAuth) {
  throw new Error("Une cible distante exige le mode authentification réelle.")
}
if (remoteOrigin) {
  const url = new URL(remoteOrigin)
  if (
    url.protocol !== "https:" ||
    url.origin !== remoteOrigin ||
    url.username ||
    url.password ||
    url.hostname === "localhost"
  ) {
    throw new Error(
      "E2E_BASE_URL doit être une origine HTTPS exacte sans chemin."
    )
  }
}
const env = loadEnv("development", process.cwd(), "")
const port = liveAuth ? Number(process.env.E2E_AUTH_PORT ?? 3001) : 3001
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("E2E_AUTH_PORT doit être un port valide.")
}
const baseURL = remoteOrigin ?? `http://localhost:${port}`

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
  const deployment = env.CONVEX_DEPLOYMENT.slice(4).split(/\s/)[0]
  if (
    env.VITE_CONVEX_URL !== `https://${deployment}.convex.cloud` ||
    env.VITE_CONVEX_SITE_URL !== `https://${deployment}.convex.site`
  ) {
    throw new Error(
      "Les URL cloud et site doivent correspondre au déploiement Convex dev déclaré."
    )
  }
  if (remoteOrigin && env.VITE_SITE_URL !== remoteOrigin) {
    throw new Error("La cible distante doit correspondre à VITE_SITE_URL.")
  }
  if (
    !remoteOrigin &&
    (!process.env.E2E_AUTH_EMAIL || !process.env.E2E_AUTH_PASSWORD)
  ) {
    throw new Error(
      "Définir E2E_AUTH_EMAIL et E2E_AUTH_PASSWORD (compte de test)."
    )
  }
}

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: remoteOrigin
    ? [
        "**/public.spec.ts",
        "**/auth.spec.ts",
        "**/contracts.spec.ts",
        "**/calculator-remote.spec.ts",
      ]
    : liveAuth
      ? ["**/public.spec.ts", "**/auth.spec.ts", "**/contracts.spec.ts"]
      : [
          "**/public.spec.ts",
          "**/offline.spec.ts",
          "**/calculator.spec.ts",
          "**/calculator-failure.spec.ts",
        ],
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
  projects: [
    {
      name: "chromium",
      testIgnore: "**/calculator-failure.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(!liveAuth
      ? [
          {
            name: "public-backend-unavailable",
            testMatch: "**/calculator-failure.spec.ts",
            use: {
              ...devices["Desktop Chrome"],
              baseURL: "http://localhost:3002",
            },
          },
        ]
      : []),
  ],
  webServer: remoteOrigin
    ? undefined
    : [
        {
          command:
            process.env.E2E_COMPILED === "1"
              ? "bun run start"
              : `bun run dev --host localhost --port ${port} --strictPort`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            PORT: String(port),
            HOST: "localhost",
            VITE_CONVEX_URL: liveAuth ? env.VITE_CONVEX_URL : "",
            VITE_CONVEX_SITE_URL: liveAuth ? env.VITE_CONVEX_SITE_URL : "",
            VITE_SITE_URL: baseURL,
            E2E_AUTH_EMAIL: "",
            E2E_AUTH_PASSWORD: "",
          },
        },
        ...(!liveAuth
          ? [
              {
                command: "bun tests/e2e/backend-unavailable.ts",
                url: "http://localhost:3999/count",
                reuseExistingServer: false,
              },
              {
                command:
                  "bun run dev --host localhost --port 3002 --strictPort",
                url: "http://localhost:3002",
                reuseExistingServer: false,
                timeout: 120_000,
                env: {
                  VITE_CONVEX_URL: "http://localhost:3999",
                  VITE_CONVEX_SITE_URL: "http://localhost:3999",
                  VITE_SITE_URL: "http://localhost:3002",
                  E2E_VITE_CACHE_DIR: "node_modules/.vite-public-failure",
                },
              },
            ]
          : []),
      ],
})
