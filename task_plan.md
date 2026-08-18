# Local RAG Document Assistant 開発計画

## Goal

Gemma 4 をローカルLLMとして利用する企業向け文書検索RAGの初期プロジェクトを作成し、ローカルLLM APIを交換可能な境界として保ちつつ、PDF/TXT登録、チャンク化、ベクトル検索、根拠付き回答へ拡張できる構成を `second-work` として公開する。

## Phases

| Phase | Status | Scope |
|---|---|---|
| 1. 調査・設計 | complete | 現行ドキュメント、既存環境、リモート方針を確認 |
| 2. 新規プロジェクト骨格 | complete | Next.js UI、API、型、設定、READMEを作成 |
| 3. RAGコア | complete | PDF/TXT抽出、ページ保持、chunking、検索/生成境界を実装 |
| 4. Cloudflare接続準備 | complete | Worker/Vectorize/D1/R2の設定と安全なLLM接続方針を追加 |
| 5. 検証 | complete | 型検査、テスト、ビルド、UI/APIの最低限確認 |
| 6. Git公開 | complete | `second-works/-local-rag-document-assistant` へプッシュし、Cloudflare公開URLと本番HTTPを確認 |
| 7. Tunnel接続・セキュリティ | in_progress | 専用Named Tunnel、認証プロキシ、Access/Secret設定を完成させる |
| 8. 管理画面・PDF閲覧 | complete | ポートフォリオ向け読み取り専用の一覧・R2 PDF閲覧モードを実装 |

## Decisions

- 既存ファイルがないため、現在のディレクトリを新規プロジェクトとして使用する。
- 生成LLM（Gemma 4）とEmbeddingを分離し、LLMはOpenAI互換HTTP APIのアダプター越しに呼び出す。
- 初期のローカル開発では、実サービスが未接続でも画面とRAGコアのテストが可能な構造にする。
- Cloudflare VectorizeのEmbedding次元は、採用モデル確定前に固定しない。設定値で差し替え可能にする。
- `second-work` の実体（GitHubリポジトリ名、ブランチ名、既存リモート）は現地確認後に確定する。
- 現時点では候補リポジトリが未検出のため、リモートURLを推測せずローカルコミットを先に保全する。
- GitHubリポジトリは `https://github.com/second-works/-local-rag-document-assistant` と確認できた。公開設定はPublic、既定ブランチは空の新規リポジトリ。
- 既存の `nine-ai` / `cloudflare-os-experiment` は変更せず、第2作専用Tunnel `local-rag-llm` を作成する。
- `llama-server` は `127.0.0.1:8081`、実モデルは `gemma-4-e4b`。Tunnelのoriginは直接8081ではなく、認証プロキシ `127.0.0.1:8091` に限定する。
- リモートURLにHTTPSを要求し、WorkerはTunnel bearerがない場合にfail closedする。Access Service Authヘッダーも任意の防御層として送信する。

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| 初期ディレクトリに `.git` とファイルが存在しない | 1 | 新規プロジェクトとして初期化する |
| 一部のスキル説明に表示された短縮パスが実ファイルと一致しない | 1 | 実体パスを `find` で解決し、利用可能なSKILL.mdを読む |
| `@cloudflare/workers-types@^4.20260817.0` がnpmに存在しない | 1 | `npm view` で `5.20260817.1` を確認し、指定を修正 |
| Vitestが `@/lib/rag/chunk` を解決できない | 1 | テストでは相対importを使用するよう修正 |
| Wrangler型生成がsandboxのログ書き込み/listen制限で停止 | 1 | 一時ログ先を指定して権限付き実行し、生成に成功 |
| 日本語の単語境界依存で質問が検索ヒットしない | 1 | 文字バイグラムを併用し、関連/無関係のテストを追加 |
| GitHub CLIの認証トークンが無効で候補リポジトリも未検出 | 1 | リモートを推測せず、ローカルコミットまで進めて公開を保留 |
| `cloudflared tunnel route dns` が既存 `nine-ai` を選択した | 1 | Tunnel UUIDを明示し、`--overwrite-dns` をフラグ先頭に置いて専用Tunnelへ修正 |
| `cloudflared tunnel ingress validate --config` が不正な引数順で失敗 | 1 | `cloudflared tunnel --config ... ingress validate` へ修正し、OKを確認 |

## Next Step

ユーザー側でAccessアプリ/Service AuthとLLM秘密トークンを設定後、proxy起動・Tunnel起動・Worker再デプロイ・管理画面と外部認証済みRAG回答を確認する。
