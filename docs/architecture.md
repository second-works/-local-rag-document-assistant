# Architecture

```text
Browser
  ↓
Next.js App Router / Route Handlers
  ↓
RAG service (page-aware chunks + score threshold)
  ↓
Embedding provider ──→ Cloudflare Vectorize
  ↓                         ↓
  └──────── context ────────┘
              ↓
OpenAI-compatible local LLM bridge
              ↓
            Gemma 4
```

## Boundaries

- Generation and embedding are separate providers. Changing the embedding model does not change the Gemma prompt contract.
- Retrieved text is data, not an instruction. The system prompt explicitly treats prompt-injection-like text inside documents as quoted material.
- Low-score searches return `登録された文書からは確認できません。` and do not call the local LLM.
- The Worker bridge never exposes the local LLM port directly. Production requires a private route such as Cloudflare Tunnel/Access and a secret token configured with `wrangler secret put LOCAL_LLM_TOKEN`.
- The current local store is an intentionally small runtime adapter for the first vertical slice. Durable persistence (D1/R2) and Vectorize are the next integration boundary.
