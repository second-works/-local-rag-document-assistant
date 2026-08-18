# Local RAG Document Assistant

Gemma 4 をローカルで動かし、PDF/TXTの業務文書を検索して根拠付きで回答するPortfolio 02です。

## What this proves

- ローカルLLMをHTTP APIとして分離し、Gemma 4へ交換可能な設計
- ページ情報を維持したPDF/TXTの文書登録とチャンク化
- Embedding / Vector Search / Generationを分離したRAG構成
- 回答本文、文書名、ページ、関連度、根拠文章の表示
- 検索スコア閾値と回答不能処理によるハルシネーション抑制
- Cloudflare Workerを使った認証済みローカルLLM接続境界
- 管理画面からの登録文書一覧と、非公開R2に保存したPDFの閲覧

## Current status

この初期版は、UIとRAGコアをローカルで動かせる縦切りです。`LOCAL_LLM_BASE_URL` と `LOCAL_LLM_MODEL` を設定すると、OpenAI互換のGemma 4サーバーへ問い合わせます。未設定時は、登録済みのデモ文書から根拠を返すフォールバックを使用します。

Vectorizeのインデックス次元はEmbeddingモデルの日本語評価後に固定するため、現段階では未プロビジョニングです。PDFの原本はCloudflare R2の非公開バケットへ保存し、公開用の読み取りAPIからのみ閲覧できます。Cloudflare公開は完了していますが、実Gemma接続はTunnel/Access Secret設定後に有効化されます。

## Live demo

<https://local-rag-document-assistant.katamachi.workers.dev>

Cloudflare Workers上でNext.js UIとRoute Handlersを公開しています。現在はTunnel/Access Secret未設定のため、デモ文書に対する根拠付きフォールバック回答を返します。

## Application guide

アプリの操作方法、システム構成、RAG処理、Tunnelセキュリティ、技術選定、ポートフォリオ向け説明は、[docs/application-guide.md](docs/application-guide.md) にまとめています。

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

Optional local LLM settings:

```text
LOCAL_LLM_BASE_URL=http://127.0.0.1:8080/v1
LOCAL_LLM_MODEL=gemma-4
LOCAL_LLM_API_KEY=
```

## Validate

```bash
npm run typecheck
npm run worker:typecheck
npm test
npm run build
```

## Cloudflare deployment

The complete Next.js application is deployed to Cloudflare Workers through the OpenNext adapter. The deployed Worker serves the UI and Route Handlers together. `worker/src/index.ts` remains a narrow authenticated bridge reference for a separate local-LLM connection when that topology is selected; it is not permission to expose a local port directly to the public internet.

```bash
npm run cf-typegen
npm run deploy
npx wrangler deployments list
```

Before deploying, set `LOCAL_LLM_BASE_URL` to a private, authenticated route reachable by the Worker. Do not use `localhost` in the deployed environment and do not put tokens in `wrangler.jsonc` or source code.

Before the Tunnel secrets are configured, the deployed app intentionally uses the grounded fallback. Vectorize should be provisioned only after the Japanese embedding model and dimension are evaluated.

### Maintenance screen

サイドバーの「管理画面」では、登録文書のファイル名、ページ数、チャンク数、容量、登録日を確認できます。PDFを選択すると、WorkerがR2から取得し、ブラウザ内のPDFビューアに表示します。ポートフォリオ公開用のため、一覧・閲覧だけを提供し、アップロードや再読込などの運用操作は持たせていません。詳しい境界は [docs/maintenance-mode.md](docs/maintenance-mode.md) を参照してください。

The local Gemma connection is prepared for `Cloudflare Tunnel + Access Service Auth`. Follow [docs/tunnel-security.md](docs/tunnel-security.md) before enabling live inference. The Worker rejects a remote LLM endpoint when the tunnel bearer secret is missing.

For the optional bridge topology:

```bash
npm run worker:types
npx wrangler secret put LOCAL_LLM_TOKEN
```

## Project structure

```text
src/app/                 Next.js UI and Route Handlers
src/lib/rag/             page extraction, chunking, retrieval, answer service
src/lib/llm/             OpenAI-compatible local LLM adapter
worker/src/              Cloudflare authenticated LLM bridge
docs/                    architecture and project history
```

## Portfolio positioning

> ローカルLLMを利用した企業向け文書検索システムを設計・構築しました。

業務文書を外部LLM APIへ送信せず、検索コンテキストと生成LLMを分離できることを主な差別化ポイントとします。
