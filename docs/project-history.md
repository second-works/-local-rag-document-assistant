# Project history

## 2026-08-17 — Project created

- Created Portfolio 02, Local RAG Document Assistant, as a new project.
- User impact: provides a browser-based demo shell for asking questions over facility-management documents and viewing source pages, scores, and evidence text.
- Technical impact: establishes page-aware chunking, a score threshold, local OpenAI-compatible LLM adapter, and a Cloudflare-authenticated bridge boundary.
- Deployment impact: adds the OpenNext Cloudflare adapter so the Next.js UI and Route Handlers can be served from one public Workers URL.
- Completed: GitHub publication to `second-works/-local-rag-document-assistant` and Cloudflare Workers deployment.
- Live URL: https://local-rag-document-assistant.katamachi.workers.dev
- Tunnel update: created dedicated Named Tunnel `local-rag-llm` (`118d0011-4f4a-4112-81b3-e1a08e1af79a`) and routed `local-rag-llm.amirkatamachi.com` to the authenticated local proxy.
- Maintenance update: changed the 管理画面 to a public read-only portfolio view with document list and browser PDF viewer; removed upload, reload, and maintenance-key UI/API requirements. The private R2 bucket remains the file source.
- Not yet completed: Cloudflare Access Service Auth/Worker Secrets setup, live Gemma 4 acceptance, embedding model evaluation, and D1/Vectorize provisioning.
