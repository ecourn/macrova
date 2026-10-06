import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import { createServer } from "node:http"
import { createConnection } from "node:net"
import { once } from "node:events"
import { setTimeout } from "node:timers/promises"
import { test } from "node:test"

// À lancer après bun run build : ce test exerce le serveur compilé et les
// vrais endpoints Start. Le backend HTTP synthétique est uniquement loopback.
test("abandon réel du POST auth Start, logs techniques et CSRF RPC préservé", {
  timeout: 20_000,
}, async () => {
  let authPosts = 0
  const backend = createServer((request, response) => {
    if (request.url === "/api/auth/sign-up/email") {
      authPosts++
      request.on("error", () => undefined)
      request.resume()
      return
    }
    if (request.url === "/api/auth/convex/token") {
      response.writeHead(401)
      response.end()
      return
    }
    response.setHeader("content-type", "application/json")
    response.end(JSON.stringify({ user: null, session: null }))
  })
  backend.listen(0, "127.0.0.1")
  await once(backend, "listening")
  const backendPort = backend.address().port
  const reserve = createServer()
  reserve.listen(0, "127.0.0.1")
  await once(reserve, "listening")
  const port = reserve.address().port
  await new Promise((resolve) => reserve.close(resolve))
  const origin = `http://127.0.0.1:${port}`
  const child = spawn("node", [".output/server/index.mjs"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      VITE_CONVEX_URL: "https://local-test.convex.cloud",
      VITE_CONVEX_SITE_URL: `http://127.0.0.1:${backendPort}`,
    },
    stdio: ["ignore", "ignore", "pipe"],
  })
  let logs = ""
  child.stderr.on("data", (data) => {
    logs += data
  })
  try {
    let ready = false
    let readinessStatus
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const response = await fetch(`${origin}/api/auth/get-session`)
        readinessStatus = response.status
        if (response.status === 200) {
          ready = true
          break
        }
      } catch {
        /* Le serveur compilé démarre. */
      }
      await setTimeout(100)
    }
    assert.equal(
      ready,
      true,
      `Serveur compilé indisponible (${readinessStatus})`
    )
    const files = await readdir(".output/server/_ssr")
    const rpcFile = files.find(
      (file) => /^auth\.functions-.*\.mjs$/.test(file) && file.length < 45
    )
    assert.ok(rpcFile, "RPC compilé absent")
    const rpc = await readFile(`.output/server/_ssr/${rpcFile}`, "utf8")
    const id = rpc.match(/id: "([a-f0-9]+)"/)[1]
    const csrf = await fetch(`${origin}/_serverFn/${id}`, {
      method: "POST",
      headers: {
        Origin: "https://foreign.example",
        "content-type": "application/json",
      },
      body: "{}",
    })
    assert.equal(csrf.status, 403, "CSRF RPC doit refuser avant exécution")
    for (let index = 0; index < 3; index++) {
      const socket = createConnection({ host: "127.0.0.1", port })
      await once(socket, "connect")
      socket.write(
        `POST /api/auth/sign-up/email HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nOrigin: ${origin}\r\nContent-Type: application/json\r\nContent-Length: 10000\r\n\r\n{"password":"sensitive-password`
      )
      for (let attempt = 0; attempt < 50 && authPosts <= index; attempt++)
        await setTimeout(10)
      assert.equal(
        authPosts,
        index + 1,
        "Le vrai relais auth Start doit être atteint"
      )
      socket.destroy()
      await setTimeout(150)
    }
    const response = await fetch(`${origin}/`)
    assert.equal(response.status, 200, "Le serveur doit rester utilisable")
    const lines = logs.trim().split("\n").filter(Boolean)
    assert.ok(
      lines.length >= 3,
      "Chaque abandon doit produire un log technique"
    )
    assert.ok(
      lines.every((line) =>
        /^(UNAVAILABLE|ECONNRESET|ECONNABORTED|EPIPE|ETIMEDOUT|HTTP_ERROR) [a-f0-9-]{36}$/.test(
          line
        )
      ),
      "Un log non technique a été émis"
    )
    console.log(
      `POST auth Start compilé : ${authPosts} corps interrompus ; ${lines.length} logs code/UUID uniquement ; CSRF 403 ; accueil 200.`
    )
  } finally {
    child.kill("SIGTERM")
    await once(child, "exit")
    backend.closeAllConnections()
    await new Promise((resolve) => backend.close(resolve))
  }
})
