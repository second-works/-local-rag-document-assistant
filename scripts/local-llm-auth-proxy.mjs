import http from "node:http";
import crypto from "node:crypto";

const listenHost = process.env.LOCAL_LLM_PROXY_HOST ?? "127.0.0.1";
const listenPort = Number(process.env.LOCAL_LLM_PROXY_PORT ?? "8091");
const upstreamBaseUrl = process.env.LOCAL_LLM_UPSTREAM_URL ?? "http://127.0.0.1:8081";
const tunnelToken = process.env.LOCAL_LLM_TUNNEL_TOKEN;
const maxRequestBytes = 512 * 1024;
const maxResponseBytes = 8 * 1024 * 1024;

if (!tunnelToken || tunnelToken.length < 32) {
  throw new Error("LOCAL_LLM_TUNNEL_TOKEN must be at least 32 characters");
}

function tokenMatches(request) {
  const provided = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = Buffer.from(tunnelToken);
  const actual = Buffer.from(provided);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function reject(response, status, message) {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify({ error: message }));
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") {
    reject(response, 404, "not found");
    return;
  }
  if (!tokenMatches(request)) {
    reject(response, 401, "unauthorized");
    return;
  }

  const declaredLength = Number(request.headers["content-length"] ?? "0");
  if (declaredLength > maxRequestBytes) {
    reject(response, 413, "request too large");
    return;
  }

  const chunks = [];
  let received = 0;
  for await (const chunk of request) {
    received += chunk.length;
    if (received > maxRequestBytes) {
      reject(response, 413, "request too large");
      request.destroy();
      return;
    }
    chunks.push(chunk);
  }

  try {
    const upstream = await fetch(`${upstreamBaseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": request.headers["content-type"] ?? "application/json" },
      body: Buffer.concat(chunks),
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > maxResponseBytes) {
      reject(response, 502, "upstream response too large");
      return;
    }
    response.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    reject(response, 502, "local LLM unavailable");
  }
});

server.listen(listenPort, listenHost, () => {
  console.log(`Authenticated local LLM proxy listening on http://${listenHost}:${listenPort}`);
  console.log(`Forwarding only POST /v1/chat/completions to ${upstreamBaseUrl}`);
});
