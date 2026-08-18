# Findings

## 2026-08-17

- 作業ディレクトリ `/Users/work/Documents/Codex/2026-08-17/2-gemma-4-rag-ai-1` は空で、Gitリポジトリではない。
- ユーザーの計画では、ローカルGemma 4、PDF/TXT、ページ付き根拠、Cloudflare Vectorize、Cloudflare公開、READMEが完成判定に含まれる。
- Cloudflare skillのVectorize資料では、検索用の `topK`、メタデータ、500件単位のupsert、Embedding次元とmetricがインデックス作成後に不変である点が示されている。これは初期設定を固定する前にEmbeddingモデルを決める必要があることを意味する。
- Workers best practicesでは、compatibility date、`nodejs_compat`、bindings、secretの分離、浮遊Promise回避、モジュールレベルのリクエスト状態回避が重要とされている。
- Next.js App Routerでは `src/app/page.tsx` がルートページ、Route Handlerは `src/app/api/**/route.ts`、UIのインタラクティブ境界は `'use client'` で切り分ける構成にした。
- `second-work` のGitHub確認は、`gh auth status` で `second-works` と `NineDragon00` のトークンが無効と判明し、API接続にも失敗した。リモートの実体は未確定。
- npmレジストリ確認時点の現行版は Next.js `16.3.1`、Wrangler `4.123.0`、Workers Types `5.20260817.1`。初期のWorkers Types指定は存在しなかったため修正した。
- 現在のMacでは `cloudflared` と `llama-server` が利用可能。llama-serverはloopback `127.0.0.1:8081`で `gemma-4-e4b` を返す。
- 既存Tunnel `nine-ai` は複数接続中で別用途のため再利用しない。第2作専用 `local-rag-llm`（UUID `118d0011-4f4a-4112-81b3-e1a08e1af79a`）を作成した。
- Tunnel DNSは初回の名前指定で既存 `nine-ai` に向いたが、UUID明示と `--overwrite-dns` で専用Tunnelへ修正した。既存Tunnelの設定ファイルは変更していない。
- Cloudflare Access API tokenは環境に無く、Service Authアプリ/トークンの自動作成は未実施。ユーザーがDashboardで作成し、値をSecretsへ対話的に設定する必要がある。

## Unverified

- ローカルLLMサーバーの実際のポート、モデルID、OpenAI互換エンドポイント。
- Cloudflareアカウント、Vectorize index、D1/R2、Tunnel/Accessの既存設定。
- `second-work` がGitHubリポジトリ名なのかブランチ名なのか。
- Cloudflare AccessのTeam domain、Application AUD、Service Auth tokenの実値。
