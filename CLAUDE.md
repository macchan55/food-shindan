@AGENTS.md

# Restaurant DNA — プロジェクト概要

飲食業界で働く人・働きたい人向けの、エンタメ型キャラ診断サービス（64タイプ診断）。
「診断→（転職を考えていなくても）自分を知る」がまず入口で、そこから転職を考えたくなった
人向けに、診断結果を活かした履歴書・職務経歴書を作れるところまでをこのアプリが担う。

詳細仕様は [`docs/spec/`](./docs/spec/)（`docs/spec/README.md` から参照）。ただし
`docs/spec/03-mvp-overview.md` は初期のSprint 1計画書で、Sprint 2以降として書かれていた
履歴書機能などは既に実装済み。仕様書と実装の間にズレがあれば実装（このファイルとコード）
を正とする。`README.md` もセットアップ手順以外は古くなっている箇所がある。

## 技術スタック

- Next.js 16（App Router, Turbopack）+ TypeScript + React 19 + Tailwind CSS v4
- Supabase（Postgres + Auth + Storage）。DBアクセスは基本的に service role key を使った
  サーバー側（Route Handler / Server Component）経由のみ。ブラウザ側は `@supabase/ssr` の
  `createBrowserClient`（publishable key）経由で **Auth のみ** 直接使用する
- Supabase Auth の匿名サインイン（`signInAnonymously`）を多用。履歴書作成は匿名ユーザーの
  まま最後まで進められ、PDFダウンロード等の節目でだけ `updateUser({email,password})` に
  より **同一ユーザーIDのまま** 本登録にアップグレードする設計（全テーブルが
  `auth.users(id)` にFKしているのでスキーマ変更なしで成立している）
- `@react-pdf/renderer` でサーバー側PDF生成（履歴書・職務経歴書）。日本語フォントは
  variable fontではなく static font を同梱（理由は下記「詰まりやすいポイント」参照）
- OpenAI Chat Completions API（`gpt-4o-mini`, JSON mode）で履歴書の自己PR等をAI生成
- スコアリングは全てルールベースの純粋関数（`src/lib/scoring/`、DB非依存）。診断の
  タイプ判定・スコア計算にLLMは使っていない
- Next.js 16 では `middleware.ts` → `proxy.ts`、関数名も `middleware` → `proxy` に変更
  されている（`src/proxy.ts`）。学習データ上のNext.jsとは差分があるので
  `node_modules/next/dist/docs/` を確認してから書く（`AGENTS.md` にも明記済み）

## ディレクトリ構成（抜粋）

```
docs/spec/              元の仕様書一式
scripts/                 仕様Markdown→DBシード変換、動作確認、画像生成スクリプト
supabase/migrations/     スキーマ定義SQL（0001〜、番号順に上から実行）
src/
  app/
    diagnosis/            診断説明→診断フロー→結果画面
    diagnosis-sample-likert/  回答形式（4件法）検討用の独立デモ。本番ロジックには不関与
    resume/               履歴書・職務経歴書作成フロー（プロフィール〜プレビュー）
    api/diagnosis/         診断セッションAPI
    api/resume/            履歴書関連API
  components/             結果画面・診断フロー・履歴書ダッシュボードの表示コンポーネント
  lib/
    axes.ts                10コア軸＋4補助軸の定義（DBシード・スコアリング・画面表示で共通）
    scoring/                採点エンジン（純粋関数）
    diagnosis/              Supabaseアクセス層（repository）＋診断フローのビジネスロジック（service）
    resume/                 履歴書のCRUD・AI生成・PDF生成（pdf/配下にテンプレート）
    supabase/               Supabase各クライアント（admin/browser/server）・行の型
```

## これまでの経緯（実装済み機能）

### 診断（`/diagnosis`）
- 64問・20シーン構成（シーン1〜12は4問、13〜20は2問）。質問ごとに専用イラストあり
- 回答はシーン単位で1ページ。シーン内は回答するたびに次の設問へ自動スクロールし、
  シーンの最後まで答えると次のシーン（新しいページ、スクロール位置は先頭にリセット）へ
  遷移する。回答は全問答え終わるまでブラウザ（localStorage）にだけ保持し、最後に一括で
  DBへ書き込む（以前は1問答えるごとにDB書き込み+件数カウントのAPIを叩いていて、質問間の
  遷移が重かったための変更）
- 送信後は「診断鑑定中・・・」のリッチなローディング演出（キャラのシャッフル演出＋
  分析っぽいメッセージのローテーション＋フェイクプログレスバー）を挟んで結果画面へ
- 結果画面：64タイプ判定・隠れタイプ・飲食業界適性・能力レーダーチャート（上位3件表示＋
  「詳細を見る」で上位10件展開）・適職/業態/役職ランキング・フィードバック収集
- 64タイプそれぞれに深掘りコンテンツ（タイプ概要・性格分析・能力分析・キャリア提案・
  成長アドバイス・相性の良いタイプ）を用意済み

### 履歴書・職務経歴書作成（`/resume/*`）
- 診断結果画面の「履歴書を作る」から、会員登録なしで（匿名セッションのまま）そのまま
  作成を開始できる。会員登録が必須になるのはPDFを実際にダウンロードする瞬間だけ
  （プレビューは匿名のまま自由に見られる）。これはサーバー側（`/api/resume/pdf`の
  `download=1`時）でも強制しているので、クライアント側のガードだけに依存していない
- 入力ステップ：基本情報（郵便番号→住所自動入力、性別ラジオボタン、電話番号の
  ハイフン自動除去）→ 学歴 → 職歴 → 資格 → 自己PR・職務要約（AI生成）
- 自己PRはユーザーが下書き・メモを先に書き、AIはそれを土台に編集・加筆する仕様
  （ゼロから生成ではない。ユーザーの言葉やエピソードを尊重するようプロンプトで指示）
- 学歴の入学年月・卒業年月、職歴の入社年月・退社年月は、ネイティブ`<input type="date">`
  ではなく年・月それぞれ独立した`<select>`（`YearMonthField`コンポーネント）。理由は
  下記「詰まりやすいポイント」参照
- 職歴の席数・管理人数・客単価（→顧客単価に改名）は数値の直接入力ではなく範囲の
  プルダウン（例:「21席〜40席」）。DBカラムもint→textに変更済み（migration 0007）
- プレビュー画面：先にデザイン（トラディショナル/モダン/リッチ）を1つ選び、その下で
  履歴書・職務経歴書をタブで切り替える。履歴書と職務経歴書は別テンプレートID体系だが、
  見た目の系統が対応するようペアリングしている
  （traditional+chronological / modern+timeline / sidebar+highlight）
- 履歴書ダッシュボード（`/resume`）はチェックリストではなく、AIによる訴求コピー＋
  3テンプレートのミニプレビュー（`ResumeTemplateThumb`、実データ非依存の装飾モックアップ）
  を先に見せて始めたくなる導線にしてある。下部にステップ進捗（アイコン・チェックマーク・
  プログレスバー）

## 未完了・検討中のタスク

- **診断の回答形式をLikert（4件法）に変えるかどうか検討中**。ユーザーは「読む時間が
  長くて離脱しそう」と懸念しており、Scene 1を素材にした比較サンプルを
  `/diagnosis-sample-likert`（本番ロジックとは独立、DB非依存）に用意済み。採用する場合、
  今の1問=4択（各選択肢が別々の軸ペアに加点）という設計は成立しなくなるので、
  ①設問文を全て「1つの主張文」に書き直す、②スコア計算ロジックを「同意度に応じて
  該当軸へ加点」方式に作り替える、③軸カバレッジ（項目数を増やすか維持するか）を
  決める、の3点セットが必要。ユーザーからの続報待ち
- 元のMVP仕様（`docs/spec/03-mvp-overview.md`）にあって未実装のまま残っているもの：
  - 補強質問（0〜8問）：判定が拮抗した場合の追加設問。`docs/spec/05-question-bank-200.md`
    にプールはあるが、正式4補助軸に含まれない軸コードを使う設問が残っており要マッピング
  - 結果を画像またはURLで共有する機能（SNSシェア）
  - 転職意向・希望条件の入力、キャリア相談の申込み（`career_preferences` /
    `consultation_requests` 相当のテーブル・画面とも未着手）
  - 管理画面・分析ダッシュボード
  - 飲食業界適性の重み付け（接客職はHospitality重視、調理職はCraft/Ownership重視、
    のような職種別重み）。今は対象7軸の単純平均。職歴データは今は取得済みなので、
    やるなら実装難易度は下がっている

## 開発時の注意点（詰まりやすいポイント）

- **このサンドボックス環境からSupabase本体・大半の外部サイトへの直接アクセスは
  ネットワークポリシーでブロックされている**。実機能のE2E確認をしたい場合は、実際の
  Next.jsコンポーネントを再エクスポートするだけの`scratch-*`ルート（例:
  `src/app/scratch-xxx-test/page.tsx` に `export { default } from "../real/page"`）を
  一時的に作り、Playwrightの`page.route()`で`/api/resume/*`などの自前APIやSupabaseの
  ホストをモックして検証し、**検証後は必ず削除してからコミットする**、という手順を
  このセッションでは繰り返し使っている。Chromiumの`headless`モードはデフォルトで
  PDFビューアが無効化されているため、PDFの見た目を画像として確認したい場合は
  `xvfb-run` + `headless: false` で起動する必要がある
- **iOS Safari特有のレンダリング差はChromiumでは再現できないことがある**。実際に
  「Chromiumでは崩れなし」を確認した`<input type="date">`が本番のiPhone Safariでは
  崩れていた、という事例が発生した（ネイティブdateピッカーの最小幅がSafari側で
  Chromiumより大きい）。日付系の入力はこの経緯で年月選択を素の`<select>`に置き換えて
  回避している。同種の「ネイティブフォームコントロール」を使う時は要注意
- **PDFの日本語フォントはvariable fontではなくstatic fontを使う**
  （`assets/fonts/NotoSansJP-Static.otf`）。variable fontを使っていた時、fontkit経由で
  一部の漢字（例: 「調」→「誂」）が誤ったグリフで描画されるバグがあった
- 開発サーバー（`next dev`, Turbopack）が生きている状態で`rm -rf .next`や
  `npm run build`を同時に走らせると、Turbopackの永続キャッシュが壊れて
  `Persisting failed: Another write batch or compaction is already active`のような
  エラーが出ることがある。ビルド前には必ず`next dev`プロセスを止めてから
  `.next`を消す
- コミットは基本的にユーザーから明示的な依頼があった時のみ。ただし本セッションの
  慣習として、検証済みの変更は都度コミット→プッシュ→（必要なら）Supabaseで
  マイグレーションを手動実行してもらう、というテンポで進めている。新しいmigrationを
  追加した場合は、ユーザーにSupabase側での実行を都度リマインドすること
