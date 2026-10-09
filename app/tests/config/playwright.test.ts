// @vitest-environment node
import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vitest"

const directory = mkdtempSync(join(tmpdir(), "macrova-playwright-config-"))
const config = new URL("../../playwright.config.ts", import.meta.url).href
const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !/^(CONVEX_|VITE_|E2E_|CI$)/.test(key)
  )
)
const validEnv = {
  E2E_AUTH: "1",
  E2E_AUTH_EMAIL: "config-test@example.com",
  E2E_AUTH_PASSWORD: "configuration-only-password",
  CONVEX_DEPLOYMENT: "dev:config-test-123",
  VITE_CONVEX_URL: "https://config-test-123.convex.cloud",
  VITE_CONVEX_SITE_URL: "https://config-test-123.convex.site",
}

afterAll(() => rmSync(directory, { recursive: true, force: true }))

function loadConfig(overrides: Record<string, string> = {}) {
  // Un processus neuf et un dossier sans .env empêchent les secrets locaux
  // et le cache des modules de modifier les cas ; aucun serveur ne démarre.
  return spawnSync(
    "bun",
    [
      "--eval",
      `const { default: config } = await import(${JSON.stringify(config)}); console.log(JSON.stringify({ baseURL: config.use.baseURL, localServer: Boolean(config.webServer), testMatch: config.testMatch, trace: config.use.trace, screenshot: config.use.screenshot, video: config.use.video ?? "off" }))`,
    ],
    {
      cwd: directory,
      env: { ...inheritedEnv, ...validEnv, ...overrides },
      encoding: "utf8",
      timeout: 15_000,
    }
  )
}

describe("configuration Playwright de l'authentification réelle", () => {
  test.each(["dev:config-test-123", "dev:config-test-123 # team: exemple"])(
    "accepte les URL du déploiement %s",
    (deployment) => {
      const result = loadConfig({ CONVEX_DEPLOYMENT: deployment })
      expect(result.error).toBeUndefined()
      expect(result.status, result.stderr).toBe(0)
      expect(
        JSON.parse(result.stdout).testMatch.includes(
          "**/calculator-remote.spec.ts"
        )
      ).toBe(false)
    }
  )

  test.each<Record<string, string>>([
    { VITE_CONVEX_URL: "https://other-456.convex.cloud" },
    { VITE_CONVEX_SITE_URL: "https://other-456.convex.site" },
  ])("refuse une URL étrangère : %j", (overrides) => {
    const result = loadConfig(overrides)
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      "Les URL cloud et site doivent correspondre au déploiement Convex dev déclaré."
    )
  })

  test.each<Record<string, string>>([
    { CONVEX_DEPLOYMENT: "prod:config-test-123" },
    { VITE_CONVEX_URL: "" },
  ])("refuse une configuration non autorisée : %j", (overrides) => {
    const result = loadConfig(overrides)
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      "Les tests d'auth exigent un déploiement Convex dev configuré."
    )
  })

  test("préserve le mode hors ligne sans backend ni identifiants", () => {
    const result = loadConfig({
      E2E_AUTH: "",
      CONVEX_DEPLOYMENT: "",
      VITE_CONVEX_URL: "",
      VITE_CONVEX_SITE_URL: "",
      E2E_AUTH_EMAIL: "",
      E2E_AUTH_PASSWORD: "",
    })
    expect(result.error).toBeUndefined()
    expect(result.status, result.stderr).toBe(0)
    expect(
      JSON.parse(result.stdout).testMatch.includes(
        "**/calculator-remote.spec.ts"
      )
    ).toBe(false)
  })
})

describe("recette distante explicite", () => {
  const remote = {
    E2E_REMOTE: "1",
    E2E_BASE_URL: "https://macrova-test.onrender.com",
    VITE_SITE_URL: "https://macrova-test.onrender.com",
    E2E_AUTH_EMAIL: "",
    E2E_AUTH_PASSWORD: "",
  }
  test.each(["", undefined])(
    "refuse le mode distant sans origine : %s",
    (origin) => {
      const result = loadConfig(
        origin === undefined
          ? { E2E_REMOTE: "1" }
          : { E2E_REMOTE: "1", E2E_BASE_URL: origin }
      )
      expect(result.status).toBe(1)
      expect(result.stderr).toContain("La recette distante exige E2E_BASE_URL.")
    }
  )
  test("utilise HTTPS sans serveur local et sans compte préalable", () => {
    const result = loadConfig(remote)
    expect(result.status, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({
      baseURL: remote.E2E_BASE_URL,
      localServer: false,
      testMatch: [
        "**/public.spec.ts",
        "**/auth.spec.ts",
        "**/contracts.spec.ts",
        "**/calculator-remote.spec.ts",
      ],
      trace: "off",
      screenshot: "off",
      video: "off",
    })
  })
  test.each<Record<string, string>>([
    { E2E_AUTH: "" },
    { E2E_BASE_URL: "http://macrova-test.onrender.com" },
    { E2E_BASE_URL: "https://macrova-test.onrender.com/" },
    { E2E_BASE_URL: "https://macrova-test.onrender.com/path" },
    { E2E_BASE_URL: "https://user:password@macrova-test.onrender.com" },
    { VITE_SITE_URL: "https://other.onrender.com" },
    { VITE_CONVEX_SITE_URL: "https://other.convex.site" },
  ])("refuse une cible ambiguë ou incohérente : %j", (overrides) => {
    expect(loadConfig({ ...remote, ...overrides }).status).toBe(1)
  })
})
