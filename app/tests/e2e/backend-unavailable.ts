import { createServer } from "node:http"
let calls = 0
let measurements = 0
createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Access-Control-Allow-Headers", "Content-Type")
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  if (request.method === "OPTIONS") {
    response.statusCode = 204
    response.end()
    return
  }
  response.setHeader("Content-Type", "application/json")
  if (request.url === "/count") {
    response.end(JSON.stringify({ calls, measurements }))
    return
  }
  if (request.url === "/measurements/calculator") measurements += 1
  else calls += 1
  response.statusCode = 503
  response.end(JSON.stringify({ error: "synthetic-unavailable" }))
}).listen(3999, "localhost")
