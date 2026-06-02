@AGENTS.md

# petprice — プロジェクト状況

## プロジェクト概要

楽天市場のペット用品価格を毎日自動取得・比較する Next.js 製ウェブサービス。
価格推移グラフ・値下がり通知・レビュー・コミュニティ・ペット保険比較など多機能。

- **URL**: www.petprices.jp（Vercel デプロイ済み）
- **スタック**: Next.js 16 (App Router) / React 19 / Tailwind CSS v4 / Supabase / TypeScript

---

## ファイル構成

| パス | 役割 |
|---|---|
| `app/page.tsx` | トップページ（ランキング・値下がり・コラム・コミュニティ） |
| `app/[category]/page.tsx` | カテゴリ一覧ページ |
| `app/product/[id]/page.tsx` | 商品詳細・価格推移グラフ |
| `app/search/page.tsx` | 全文検索 |
| `app/ranking/page.tsx` | ランキング |
| `app/compare/page.tsx` | 商品比較 |
| `app/insurance/page.tsx` | ペット保険比較 |
| `app/column/` | 専門家コラム |
| `app/community/` | コミュニティ掲示板 |
| `app/mypage/` | マイページ（お気に入り・閲覧履歴・ペット登録） |
| `app/login/` `app/register/` | 認証（Google OAuth / メール） |
| `app/api/alerts/` | 価格アラートメール送信API |
| `app/api/yahoo-price/` | Yahoo価格取得API（CORS回避用サーバーサイドプロキシ） |
| `components/` | UIコンポーネント群 |
| `lib/supabase.ts` | Supabase クライアント（サーバー用） |
| `lib/supabase-browser.ts` | Supabase クライアント（ブラウザ用） |
| `lib/categories.ts` | カテゴリ定数・サイドバー定義 |
| `lib/columns.ts` | コラム記事データ |
| `lib/ingredientScore.ts` | 成分安全スコア計算 |
| `lib/rakuten.ts` | 楽天API ラッパー |
| `scripts/fetch-rakuten.ts` | 楽天API から商品データを取得・Supabase に upsert |
| `supabase/schema.sql` | DBスキーマ（products / price_history / price_alerts） |
| `supabase/migrations/` | 追加マイグレーション |
| `.github/workflows/fetch-products.yml` | 毎日 UTC 18:00 に fetch-rakuten.ts を実行 |

---

## 実装済み機能

### データ取得・DB
- 楽天APIから全カテゴリの商品をフェッチ（`scripts/fetch-rakuten.ts`）
- GitHub Actions で毎日自動フェッチ（UTC 18:00 = JST 3:00）
- 価格履歴を `price_history` テーブルに蓄積
- Yahoo価格をAPIルート経由でサーバーサイド取得（CORS回避）

### フロントエンド
- カテゴリ別ランキング・値下がり商品（5%以上）をトップページに表示
- 30日間価格推移グラフ（Chart.js）
- キーワード検索・カテゴリフィルタ
- 商品比較（最大3件）
- ペット保険比較ページ
- 専門家コラム（静的データ）
- コミュニティ掲示板（Supabase DB）

### ユーザー機能
- Google OAuth / メール認証（Supabase Auth）
- お気に入り登録・複数リスト管理（#21）
- 価格アラート（メール通知）
- 閲覧履歴（localStorage）
- ペット登録・ペット情報連動おすすめ
- ユーザーレビュー・写真投稿（#19、Supabase Storage）
- 購入済みマーク（#20）
- ペットプロフィール公開設定（#22）
- マイページ（履歴・お気に入り・ペット管理）

### 広告・収益化
- A8.net アフィリエイト広告（サイドバー・インライン）
- AdRotator でページ遷移ごとにランダム広告切り替え
- 楽天アフィリエイトリンク
- ペット保険アフィリエイト

### SEO・インフラ
- sitemap.ts / robots.ts
- Google Analytics 4（G-Y5YCGBY44M）
- Google Search Console 認証済み
- Vercel デプロイ（www.petprices.jp）
- Supabase クエリ並列化・キャッシュ（revalidate = 300）

---

## 現在の状態（2026-06-02）

- **本番稼働中**（Vercel + Supabase）
- 実装タスク #1〜#23 すべて完了
- 最新コミット: `feat: 左右広告をAdRotatorで完全動的化`
- GitHub Actions による毎日の自動フェッチが動いている

---

## 次のタスク候補

### 優先度 高
1. **SEO強化** — 商品詳細ページの構造化データ（JSON-LD）追加、メタディスクリプション最適化
2. **価格フェッチの安定化** — fetch-log.txt / cleanup-log.txt を確認し、失敗カテゴリや欠損データを修正
3. **LINE通知** — 現在メール通知のみ。LINE Messaging API でアラート対応

### 優先度 中
4. **ペナント・カップ&ハンドルの自動検出追加** — 未対応パターンの自動検出実装
5. **スコア永続化** — クイズ成績をファイル保存してセッション間継続
6. **コラム記事の拡充** — 現在静的データ。CMS連携またはMDX化
7. **コミュニティのモデレーション** — スパム対策・通報機能
8. **商品画像のローカルキャッシュ** — 楽天画像URLの失効対策

### 優先度 低
9. **バックテスト機能** — 価格パターンの過去成績自動集計
10. **モバイルレイアウト改善** — スマホ表示の最適化
11. **多言語対応** — 英語サポート

---

## 技術メモ

- `app/page.tsx` は `force-dynamic` + `revalidate = 300` の二重指定になっている（`force-dynamic` が優先、`revalidate` は無効）。整理余地あり
- サイドバーカテゴリは `lib/categories.ts` の `SIDEBAR_GROUPS` で管理
- Supabase の RLS は `auth.users` 参照テーブルすべてに有効
- `@supabase/ssr` を使い cookie ベースのセッション管理
- fetch スクリプトは `tsx` で直接実行（`npx tsx scripts/fetch-rakuten.ts`）
