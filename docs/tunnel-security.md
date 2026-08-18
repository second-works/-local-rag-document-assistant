# Local Gemma Tunnel Security

The deployed Worker must never connect directly to `127.0.0.1` on the development Mac. The intended path is:

```text
Cloudflare Worker
  ↓ HTTPS + tunnel bearer + optional Access Service Auth
Named Cloudflare Tunnel: local-rag-llm
  ↓ outbound-only connector
127.0.0.1:8091 authenticated proxy
  ↓ loopback only
127.0.0.1:8081 llama-server / gemma-4-e4b
```

## Why the proxy exists

`llama-server` stays bound to loopback and is not the Tunnel origin. The local proxy accepts only `POST /v1/chat/completions`, requires a random bearer token, compares it with a timing-safe comparison, limits request/response sizes, strips the bearer before forwarding, and returns `404` for every other path.

## Setup

1. A dedicated Named Tunnel called `local-rag-llm` has been created with ID `118d0011-4f4a-4112-81b3-e1a08e1af79a`. Do not reuse `nine-ai` or `cloudflare-os-experiment`.
2. `local-rag-llm.amirkatamachi.com` is routed to that dedicated Tunnel.
3. Create a Cloudflare Access application for that hostname. Add a Service Auth policy restricted to the Worker’s service token. Do not allow `Everyone`.
4. Copy `.env.tunnel.example` to `.env.tunnel`, generate a random token of at least 32 characters, and keep the file mode `600`. Do not paste the token into chat or Git.
5. Configure the same token as a Cloudflare Worker Secret named `LOCAL_LLM_TUNNEL_TOKEN`.
6. Copy `cloudflared/config.example.yml` to `cloudflared/config.yml` and fill in the new UUID and credentials-file path.
7. Start the proxy and Tunnel separately:

```bash
npm run llm:proxy
npm run tunnel:run
```

8. `wrangler.jsonc` already points `LOCAL_LLM_BASE_URL` to `https://local-rag-llm.amirkatamachi.com/v1`. Add `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` as Worker Secrets, then redeploy.

## Secret setup commands

Run these from the project directory. `wrangler secret put` prompts for each value without placing it in the command history:

```bash
cp .env.tunnel.example .env.tunnel
chmod 600 .env.tunnel
# Put the same random token in .env.tunnel and the next Cloudflare prompt.
npx wrangler secret put LOCAL_LLM_TUNNEL_TOKEN
npx wrangler secret put CF_ACCESS_CLIENT_ID
npx wrangler secret put CF_ACCESS_CLIENT_SECRET
npm run deploy
```

Do not deploy with a real Tunnel hostname until `LOCAL_LLM_TUNNEL_TOKEN` is configured. The application intentionally fails closed for a remote endpoint without that secret.

## Acceptance checks

- `curl http://127.0.0.1:8081/health` succeeds locally.
- `curl http://127.0.0.1:8091/v1/chat/completions` without the bearer returns `401`.
- The public hostname without Access credentials does not reach the LLM.
- The deployed `/api/query` succeeds only when the proxy, Tunnel, Access policy, and Worker secrets are all present.
- No tunnel credential JSON, Access secret, or bearer token is committed.
