import { createHash, randomUUID } from "node:crypto"
import { spawnSync } from "node:child_process"
import {
  chmod,
  cp,
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises"
import { parse } from "dotenv"
import { tmpdir } from "node:os"
import { dirname, join, resolve, sep } from "node:path"
import { pathToFileURL } from "node:url"

const source = resolve(dirname(new URL(import.meta.url).pathname), "..")
const forbidden = [
  "CONVEX_DEPLOY_KEY",
  "CONVEX_DEPLOYMENT_TOKEN",
  "CONVEX_SELF_HOSTED_URL",
  "CONVEX_SELF_HOSTED_ADMIN_KEY",
]
export function validateLocalTarget(
  deployment: string,
  workspace: string,
  origin: string
): void {
  const url = new URL(origin)
  if (
    !/^(local|anonymous):/.test(deployment) ||
    deployment.includes("dazzling-puffin-856") ||
    !/^(local|anonymous):[a-zA-Z0-9_-]+$/.test(deployment) ||
    !workspace.startsWith(join(tmpdir(), "macrova-recovery-")) ||
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    !url.port
  )
    throw new Error("RECOVERY_UNSAFE_TARGET")
}
function cleanEnvironment() {
  for (const key of forbidden)
    if (process.env[key]) throw new Error("RECOVERY_PRIORITY_KEY")
  const env = { ...process.env }
  for (const key of Object.keys(env))
    if (
      key.startsWith("CONVEX_") ||
      key.startsWith("VITE_") ||
      key.startsWith("E2E_")
    )
      delete env[key]
  return env
}
export async function prepareRecovery(): Promise<string> {
  cleanEnvironment()
  const workspace = await mkdtemp(join(tmpdir(), "macrova-recovery-"))
  await chmod(workspace, 0o700)
  for (const entry of [
    "convex",
    "src",
    "scripts",
    "tests",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "biome.json",
    ".gitignore",
  ])
    await cp(join(source, entry), join(workspace, entry), { recursive: true })
  await symlink(join(source, "node_modules"), join(workspace, "node_modules"))
  for (const [fixture, target] of [
    ["recovery-functions.ts", "recoveryExercise.ts"],
    ["access-functions.ts", "syntheticAccess.ts"],
  ]) {
    const contents = (
      await readFile(join(source, "tests/fixtures", fixture), "utf8")
    )
      .replaceAll("../../convex/", "./")
      .replace('"../../convex/schema"', '"./schema"')
    await writeFile(join(workspace, "convex", target), contents, {
      mode: 0o600,
    })
  }
  await writeFile(
    join(workspace, ".recovery-socle.json"),
    JSON.stringify({
      version: 1,
      syntheticOnly: true,
      nonce: randomUUID(),
      createdAt: new Date().toISOString(),
    }),
    { mode: 0o600 }
  )
  return workspace
}
async function assertWorkspace(workspace: string) {
  const canonical = await realpath(workspace)
  if (
    canonical === source ||
    canonical.startsWith(`${source}${sep}`) ||
    !canonical.startsWith(join(tmpdir(), "macrova-recovery-")) ||
    (await lstat(workspace)).isSymbolicLink()
  )
    throw new Error("RECOVERY_UNSAFE_WORKSPACE")
  const marker = JSON.parse(
    await readFile(join(workspace, ".recovery-socle.json"), "utf8")
  )
  if (marker.version !== 1 || marker.syntheticOnly !== true || !marker.nonce)
    throw new Error("RECOVERY_BAD_MARKER")
  let local: Record<string, string> = {}
  // Aucun .env courant n'est copié ; seul .env.local créé par le CLI anonymous.
  for (const filename of [".env", ".env.local"]) {
    let content = ""
    try {
      content = await readFile(join(workspace, filename), "utf8")
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    }
    const parsed = parse(content)
    if (forbidden.some((key) => Object.hasOwn(parsed, key)))
      throw new Error("RECOVERY_PRIORITY_KEY")
    if (filename === ".env.local") local = parsed
  }
  const deployment = local.CONVEX_DEPLOYMENT
  const origin = local.VITE_CONVEX_URL
  if (!deployment || !origin) throw new Error("RECOVERY_LOCAL_REQUIRED")
  validateLocalTarget(deployment, canonical, origin)
  const statePath = join(workspace, ".convex/local/default")
  if ((await realpath(statePath)) !== statePath)
    throw new Error("RECOVERY_UNSAFE_STATE")
  const state = JSON.parse(
    await readFile(join(statePath, "config.json"), "utf8")
  )
  if (
    state.cloudProjectId !== undefined ||
    state.deploymentName !== deployment.split(":")[1] ||
    state.ports?.cloud !== Number(new URL(origin).port)
  )
    throw new Error("RECOVERY_UNSAFE_STATE")
  if (
    typeof state.adminKey !== "string" ||
    !state.adminKey ||
    /[\r\n"\\]/.test(state.adminKey)
  )
    throw new Error("RECOVERY_UNSAFE_STATE")
  return { workspace: canonical, origin, adminKey: state.adminKey }
}
export async function exerciseRecovery(inputWorkspace: string) {
  const env = { ...cleanEnvironment(), CONVEX_AGENT_MODE: "anonymous" }
  const target = await assertWorkspace(resolve(inputWorkspace))
  const workspace = target.workspace
  const configDirectory = await mkdtemp(join(tmpdir(), "macrova-recovery-cli-"))
  await chmod(configDirectory, 0o700)
  const envFile = join(configDirectory, "target.env")
  await writeFile(
    envFile,
    `CONVEX_SELF_HOSTED_URL=${target.origin}\nCONVEX_SELF_HOSTED_ADMIN_KEY="${target.adminKey}"\n`,
    { mode: 0o600 }
  )
  // Le CLI lit ce fichier seul : cible et clé locales sont figées après validation.
  const command = (args: string[]) => [...args, "--env-file", envFile]
  try {
    function cli(args: string[], allowFailure?: string): unknown {
      const result = spawnSync(
        join(source, "node_modules/.bin/convex"),
        command(args),
        {
          cwd: workspace,
          env,
          encoding: "utf8",
          timeout: 120_000,
          maxBuffer: 8 * 1024 * 1024,
        }
      )
      // Jamais stderr/stdout arbitraire en sortie, même si le CLI joint des credentials.
      if (result.status !== 0) {
        if (allowFailure && result.stderr.includes(allowFailure)) return null
        throw new Error("RECOVERY_CLI_FAILED")
      }
      if (allowFailure) throw new Error("RECOVERY_EXPECTED_DENIAL")
      return result.stdout.trim() ? JSON.parse(result.stdout) : null
    }
    function run(
      name: string,
      args = {},
      identity?: { ownerId: string; sessionId: string },
      denied?: string
    ) {
      return cli(
        [
          "run",
          name,
          JSON.stringify(args),
          ...(identity
            ? [
                "--identity",
                JSON.stringify({
                  subject: identity.ownerId,
                  sessionId: identity.sessionId,
                }),
              ]
            : []),
        ],
        denied
      )
    }
    const fixtures = run("recoveryExercise:seed") as {
      closed: { ownerId: string; sessionId: string; referenceId: string }
      open: { ownerId: string; sessionId: string; referenceId: string }
    }
    const before = run("recoveryExercise:snapshot")
    const historic = run("account:getAccess", {}, fixtures.open)
    const closed = run("account:getAccess", {}, fixtures.closed)
    const archive = join(workspace, "snapshot.zip")
    // export/import ne renvoient pas du JSON : chemins bornés, sortie capturée.
    function archiveCli(args: string[]) {
      const result = spawnSync(
        join(source, "node_modules/.bin/convex"),
        command(args),
        {
          cwd: workspace,
          env,
          encoding: "utf8",
          timeout: 120_000,
          maxBuffer: 8 * 1024 * 1024,
        }
      )
      if (result.status !== 0) throw new Error("RECOVERY_ARCHIVE_FAILED")
    }
    archiveCli(["export", "--path", archive])
    await chmod(archive, 0o600)
    const sha256 = createHash("sha256")
      .update(await readFile(archive))
      .digest("hex")
    run("recoveryExercise:loseRoots")
    const lost = run("recoveryExercise:snapshot") as {
      entitlements: unknown[]
      closures: unknown[]
    }
    if (lost.entitlements.length || lost.closures.length)
      throw new Error("RECOVERY_LOSS_FAILED")
    archiveCli(["import", archive, "--replace", "--yes"])
    if (
      JSON.stringify(run("recoveryExercise:snapshot")) !==
      JSON.stringify(before)
    )
      throw new Error("RECOVERY_IDS_CHANGED")
    if (
      JSON.stringify(run("account:getAccess", {}, fixtures.open)) !==
        JSON.stringify(historic) ||
      JSON.stringify(run("account:getAccess", {}, fixtures.closed)) !==
        JSON.stringify(closed)
    )
      throw new Error("RECOVERY_V1_CHANGED")
    run("account:getAccess", {}, undefined, "UNAUTHENTICATED")
    run(
      "syntheticAccess:readReference",
      { referenceId: fixtures.closed.referenceId },
      fixtures.open,
      "ACCESS_DENIED"
    )
    run(
      "syntheticAccess:personalWrite",
      { referenceId: fixtures.closed.referenceId },
      fixtures.closed,
      "ACCOUNT_CLOSED"
    )
    run(
      "syntheticAccess:delayedWrite",
      { referenceId: fixtures.closed.referenceId, create: true },
      undefined,
      "ACCOUNT_CLOSED"
    )
    async function backfill() {
      let cursor: string | null = null
      let total = 0
      for (let batch = 0; batch < 10; batch++) {
        const page = run("recoveryExercise:enrich", { cursor }) as {
          cursor: string
          done: boolean
          updated: number
        }
        total += page.updated
        if (page.done) return total
        cursor = page.cursor
      }
      throw new Error("RECOVERY_BACKFILL_LIMIT")
    }
    const enriched = await backfill()
    if (enriched !== 1 || (await backfill()) !== 0)
      throw new Error("RECOVERY_BACKFILL_FAILED")
    if (
      JSON.stringify(run("account:getAccess", {}, fixtures.open)) !==
      JSON.stringify(historic)
    )
      throw new Error("RECOVERY_V1_CHANGED")
    run(
      "syntheticAccess:personalWrite",
      { referenceId: fixtures.open.referenceId },
      fixtures.open
    )
    run("recoveryExercise:revoke", { sessionId: fixtures.open.sessionId })
    run("account:getAccess", {}, fixtures.open, "UNAUTHENTICATED")
    const proof = {
      version: 1,
      executedAt: new Date().toISOString(),
      target: "local-isolated",
      archiveSha256: sha256,
      rootDocumentsAndIdsRestored: true,
      closureRestored: true,
      privateV1BeforeAfter: true,
      anonymousDenied: true,
      otherOwnerDenied: true,
      closedPersonalAndInternalDenied: true,
      revokedDenied: true,
      additiveBackfillUpdated: enriched,
      backfillReplayUpdated: 0,
      frontendHistoricVerified: false,
    }
    await writeFile(
      join(workspace, "proof.json"),
      `${JSON.stringify(proof, null, 2)}\n`,
      { mode: 0o600 }
    )
    return proof
  } finally {
    await rm(configDirectory, { recursive: true, force: true })
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (process.argv[2] === "prepare") console.log(await prepareRecovery())
    else if (process.argv[2] === "exercise" && process.argv[3])
      console.log(JSON.stringify(await exerciseRecovery(process.argv[3])))
    else throw new Error("RECOVERY_USAGE")
  } catch (error) {
    const code =
      error instanceof Error && /^RECOVERY_[A-Z_]+$/.test(error.message)
        ? error.message
        : "RECOVERY_FAILED"
    console.error(code)
    process.exitCode = 1
  }
}
