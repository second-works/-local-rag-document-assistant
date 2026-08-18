interface LlmBridgeEnv extends Env {
  LOCAL_LLM_TOKEN: string;
}

const json = (body: unknown, init?: ResponseInit) => Response.json(body, init);

function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a[index] ^ b[index];
  return result === 0;
}

export default {
  async fetch(request: Request, env: LlmBridgeEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "local-rag-llm-bridge" });
    if (url.pathname !== "/api/llm" || request.method !== "POST") return json({ error: "not found" }, { status: 404 });

    const expected = env.LOCAL_LLM_TOKEN;
    const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    if (!expected || !constantTimeEqual(provided, expected)) return json({ error: "unauthorized" }, { status: 401 });
    if (!env.LOCAL_LLM_URL) return json({ error: "LOCAL_LLM_URL is not configured" }, { status: 503 });

    const upstream = await fetch(env.LOCAL_LLM_URL, { method: "POST", headers: { "content-type": "application/json" }, body: await request.text() });
    return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
  },
};
