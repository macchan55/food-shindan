# Restaurant DNA

飲食業界で働く人・働きたい人向けのエンタメ型キャリア診断サービス。仕様の詳細は
[`docs/spec/`](./docs/spec/)（`README.md` から参照）を参照。本READMEはアプリの実装・
セットアップ手順。

## 現在のスコープ（Sprint 1）

`docs/spec/03-mvp-overview.md` セクション34「AI開発への指示」の Sprint 1 を実装済み。

- Next.jsプロジェクト作成
- DB作成（Supabaseマイグレーション）
- 匿名診断セッション
- 質問表示（64問・20シーン）
- 回答保存（1問ごとに即保存、途中離脱しても再開可能）
- スコア計算（ルールベース、10コア軸＋4補助軸）
- 診断結果表示（64タイプ判定・飲食業界適性・能力スコア・適職/業態/役職ランキング・
  隠れタイプ・フィードバック収集）

Sprint 2以降（SNSシェア画像生成、会員登録、管理画面、履歴書・職務経歴書、転職意向、
分析ダッシュボードなど）は未実装。結果画面にはそれらへの導線をプレースホルダーとして
置いている。

## 技術構成

`03-mvp-overview.md` セクション29の「最速案」に準拠。

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase（PostgreSQL）。アプリからは Route Handler 経由でのみアクセスし、
  service role key はサーバー側にのみ置く（ブラウザに公開する Supabase キーは今のところ無い）
- 診断スコアの算出は全てルールベース（`src/lib/scoring/`）。LLMは未使用（AI文章生成は
  Sprint 3以降の履歴書機能で使用予定）

## ディレクトリ構成

```
docs/spec/            元の仕様書一式（README含む）
scripts/               仕様Markdown→DBシード変換スクリプト、動作確認スクリプト
  seed-data/           parseスクリプトの出力（JSON、gitignore対象外でコミット済み）
supabase/
  migrations/          スキーマ定義SQL
  seed.sql             64問・64タイプ・95件の職種/業態/役職マスターの投入SQL（自動生成）
src/
  app/                 ページ & Route Handler (App Router)
    diagnosis/         診断説明→診断フロー→結果画面
    api/diagnosis/     診断セッションAPI
  components/          結果画面・診断フローの表示コンポーネント
  lib/
    axes.ts            10+4軸の定義（DBシード・スコアリング・画面表示で共通）
    scoring/            採点エンジン（純粋関数、DBに依存しない）
    supabase/           Supabase service role クライアント・行の型
    diagnosis/           Supabaseアクセス層（repository）・診断フローのビジネスロジック（service）
```

## セットアップ

### 1. Supabaseプロジェクトを用意する

1. https://supabase.com でプロジェクトを作成
2. `supabase/migrations/0001_init.sql` を SQL Editor で実行（またはSupabase CLIで
   `supabase db push` — マイグレーションはこのプロジェクト用にSupabase CLI設定は同梱していないため、
   SQL Editorへの貼り付けが最短）
3. 続けて `supabase/seed.sql` を実行し、64問・64タイプ・95件の職種/業態/役職マスターを投入する
4. Project Settings → API から `Project URL` と `service_role` キーを控える

### 2. 環境変数

```bash
cp .env.example .env.local
# .env.local に SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定
```

### 3. 依存関係のインストール & 起動

```bash
npm install
npm run dev
```

http://localhost:3000 でトップページ、`/diagnosis` から診断を開始できる。

## シードデータの再生成

仕様Markdown（`docs/spec/04-64-questions-scoring.md` / `01-64-types.md` /
`02-job-format-role-master.md`）を修正した場合は、以下の順で再生成する。

```bash
npm run seed
# 内訳: npm run seed:parse (questions/types/master を再パース)
#       npm run seed:generate (supabase/seed.sql を再生成)
```

各parseスクリプトは件数・配点合計・タグの一意性などを検証し、想定外の形式があれば
例外で落ちる（例: 質問が64件でない、選択肢の配点合計が4点でない、64タイプの判定タグが
重複している、など）。`supabase/seed.sql` はUUIDを決定論的に生成しているため、同じ入力
からは常に同じSQLが出力される。

## 動作確認スクリプト

```bash
# スコアリングエンジン単体の健全性チェック（DB不要、seed-data/*.json を直接使用）
npm run verify:scoring

# 実際のPostgresに対する統合テスト（マイグレーション+シード適用済みのDBが必要）
DATABASE_URL=postgres://user:pass@localhost:5432/dbname npm run verify:integration
```

`integration-test.ts` はセッション作成→64問回答→スコア計算→結果保存→読み出しまでを
実DBに対して一通り実行する。Supabase実体（PostgREST）を経由しない分、本番のRoute
Handlerとは経路が異なる点に注意（スキーマとスコアリングロジックの結合確認が目的）。

## 診断ロジックについて（既知の簡略化・要レビュー事項）

`docs/spec/README.md` および `docs/spec/00-axes.md` で明記されている通り、以下は元資料
に定義がなかったため今回新規設計、またはSprint 1向けに意図的に簡略化している。

- **64タイプ判定用の6メタ軸の算出方法**（`src/lib/scoring/meta-axes.ts`）: 元資料に定義が
  無かったため `00-axes.md` の新規ロジックをそのまま実装。特に High-end/Mass 軸の算出は
  他の解釈もあり得るため企画レビュー推奨。
- **隠れタイプ（第2候補）の判定**: 64タイプごとの14軸基準ベクトルが元資料に存在しないため、
  「6メタ軸のうち最も僅差だった軸を反転させたタイプ」を第2候補として採用。差が3点未満の
  場合のみ表示する仕様(`04-64-questions-scoring.md`)は反映済み。
- **補強質問（0〜8問）は未実装**: 判定が拮抗した場合の補強質問プールが `05-question-bank-200.md`
  に存在するが、正式4補助軸に含まれない軸コードを使う設問が残っており「要マッピング」と
  明記されている。Sprint 1では正式64問のみで確定判定する。
- **飲食業界適性の重み付け**: `03-mvp-overview.md` セクション12は「接客職はHospitality重視、
  調理職はCraft/Ownership重視」と職種による重み調整を求めているが、これには職歴データ
  （Sprint 3以降）が必要なため、Sprint 1では対象7軸の単純平均を使用。
- **適職/業態/役職ランキング**: `02-job-format-role-master.md` の10軸ベクトルとユーザーの
  正規化スコアのコサイン類似度で算出（元資料にアルゴリズムの指定なし）。
