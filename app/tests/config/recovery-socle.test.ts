// @vitest-environment node
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { parse } from "dotenv"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test, vi } from "vitest"
import {
  exerciseRecovery,
  validateLocalTarget,
} from "../../scripts/recovery-socle"
const workspace = join(tmpdir(), "macrova-recovery-synthetic")
test.each(["local:local-synthetic", "anonymous:anonymous-agent"])(
  "copie locale %s autorisée",
  (deployment) => {
    expect(() =>
      validateLocalTarget(deployment, workspace, "http://127.0.0.1:3210")
    ).not.toThrow()
  }
)
test.each([
  [
    "dev:dazzling-puffin-856",
    workspace,
    "https://dazzling-puffin-856.convex.cloud",
  ],
  ["prod:target", workspace, "http://127.0.0.1:3210"],
  ["dev:disposable", workspace, "http://127.0.0.1:3210"],
  ["local:safe", "/home/ubuntu/macrova/app", "http://127.0.0.1:3210"],
  ["local:safe", workspace, "https://other.convex.cloud"],
  ["local:safe", workspace, "http://secret:token@localhost:3210"],
  ["local:safe", workspace, "http://localhost:3210/path"],
  ["local:safe", workspace, "http://localhost"],
])("cible %s refusée avant écriture", (deployment, directory, url) => {
  expect(() => validateLocalTarget(deployment, directory, url)).toThrow(
    "RECOVERY_UNSAFE_TARGET"
  )
})

vi.mock("node:child_process", () => ({ spawnSync: vi.fn() }))
async function isolatedWorkspace(content: string, dotEnv = "") {
  const directory = await mkdtemp(join(tmpdir(), "macrova-recovery-test-"))
  await mkdir(join(directory, ".convex/local/default"), { recursive: true })
  await writeFile(
    join(directory, ".recovery-socle.json"),
    JSON.stringify({ version: 1, syntheticOnly: true, nonce: "synthetic" })
  )
  await writeFile(join(directory, ".env.local"), content)
  await writeFile(join(directory, ".env"), dotEnv)
  await writeFile(
    join(directory, ".convex/local/default/config.json"),
    JSON.stringify({
      deploymentName: "anonymous-agent",
      ports: { cloud: 3210 },
      adminKey: "synthetic-local-admin",
    })
  )
  return directory
}
const localEnv =
  "CONVEX_DEPLOYMENT=anonymous:anonymous-agent\nVITE_CONVEX_URL=http://127.0.0.1:3210\n"
test("dernier doublon cloud : refus avant toute sous-commande", async () => {
  const directory = await isolatedWorkspace(
    `${localEnv}export CONVEX_DEPLOYMENT=dev:dazzling-puffin-856\n`
  )
  vi.mocked(spawnSync).mockClear()
  try {
    await expect(exerciseRecovery(directory)).rejects.toThrow(
      "RECOVERY_UNSAFE_TARGET"
    )
    expect(spawnSync).not.toHaveBeenCalled()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
test.each([".env", ".env.local"])(
  "secret exporté dans %s : refus avant toute sous-commande",
  async (filename) => {
    const secret = "export CONVEX_DEPLOY_KEY=synthetic-priority-key\n"
    const directory = await isolatedWorkspace(
      filename === ".env.local" ? localEnv + secret : localEnv,
      filename === ".env" ? secret : ""
    )
    vi.mocked(spawnSync).mockClear()
    try {
      await expect(exerciseRecovery(directory)).rejects.toThrow(
        "RECOVERY_PRIORITY_KEY"
      )
      expect(spawnSync).not.toHaveBeenCalled()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
)
test("dernier doublon local : le CLI reçoit exclusivement la cible locale validée", async () => {
  const directory = await isolatedWorkspace(
    `CONVEX_DEPLOYMENT=dev:cloud-synthetic\n${localEnv}`,
    "CONVEX_DEPLOYMENT=dev:other-cloud\n"
  )
  let envFile = ""
  vi.mocked(spawnSync).mockImplementationOnce((_binary, args, options) => {
    const argv = args as string[]
    expect(argv.slice(0, 2)).toEqual(["run", "recoveryExercise:seed"])
    expect(argv.at(-2)).toBe("--env-file")
    envFile = String(argv.at(-1))
    const effective = parse(readFileSync(envFile, "utf8"))
    expect(effective).toEqual({
      CONVEX_SELF_HOSTED_URL: "http://127.0.0.1:3210",
      CONVEX_SELF_HOSTED_ADMIN_KEY: "synthetic-local-admin",
    })
    expect(options?.env?.CONVEX_DEPLOY_KEY).toBeUndefined()
    expect(options?.env?.CONVEX_DEPLOYMENT).toBeUndefined()
    expect(options?.cwd).toBe(directory)
    // Échec synthétique immédiat : aucun accès réseau ni écriture backend.
    return {
      status: 1,
      signal: null,
      pid: 0,
      output: [],
      stdout: "",
      stderr: "synthetic failure",
    }
  })
  try {
    await expect(exerciseRecovery(directory)).rejects.toThrow(
      "RECOVERY_CLI_FAILED"
    )
    expect(() => readFileSync(envFile)).toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
