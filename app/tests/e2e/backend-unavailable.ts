import { createServer } from "node:http"
let calls = 0
createServer((request, response) => {
  response.setHeader("Content-Type", "application/json")
  if (request.url === "/count") {
    response.end(JSON.stringify({ calls }))
    return
  }
  calls += 1
  response.statusCode = 503
  response.end(JSON.stringify({ error: "synthetic-unavailable" }))
}).listen(3999, "localhost")
