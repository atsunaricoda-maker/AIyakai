# AI夜会・AI茶会 イベントサイト

## プロジェクト概要
- **名称**: AI夜会・AI茶会
- **目的**: 静岡県内で開催されるAI活用交流イベントの管理・申込サイト
- **特徴**: 招待制・紹介制、AI講師によるミニ講座（約30分）、参加者プレゼンテーション、交流とネットワーキング
- **対象者**: 経営者、起業準備中の方、AI講師・教室運営者、学生など、AI活用に興味がある全ての方

## 公開URL
- **開発環境**: https://3000-i7lyoyh7zahk8u5tbzmde-a402f90a.sandbox.novita.ai
- **本番環境**: （デプロイ後に更新）
- **GitHub**: （リポジトリURL）

## 現在実装済みの機能

### ✅ 完了機能
1. **イベント一覧表示**
   - AI夜会・AI茶会の開催予定イベントを一覧表示
   - **エリア別セクション表示**（東部・中部・西部）
   - イベントタイプ別（夜会/茶会）の色分け表示
   - エリアバッジ表示（東部/中部/西部）
   - テーマ・ミニ講座情報の表示
   - 残席数の表示と「残席わずか」アラート
   - 2カラムグリッドレイアウト

2. **イベント詳細ページ**
   - イベントの詳細情報表示
   - **イベントテーマ**の明示
   - **ミニ講座**の内容と時間
   - **プログラム詳細**（タイムライン）
   - **参加対象者**の表示
   - **講師・スタッフ紹介**セクション
   - 開催日時、場所、定員情報
   - 申込ボタン

3. **参加申込フォーム**
   - 招待コード検証機能
   - **参加者タイプ選択**（経営者/起業家/講師/学生/その他）
   - 会社情報・所属・申込者情報入力
   - AI活用状況・相談テーマの記入欄
   - 紹介者情報の記入

4. **招待コード管理**
   - 招待コード生成機能
   - 使用回数制限
   - 有効期限設定
   - イベント紐付け（全イベント共通コードも可）

5. **管理画面（簡易版）**
   - イベント作成・管理
   - 招待コード生成・管理
   - 参加申込一覧・ステータス確認

6. **データベース（D1）**
   - イベント情報管理（テーマ、ミニ講座、プログラム詳細含む）
   - 講師・スタッフ情報管理
   - 招待コード管理
   - 参加申込管理（参加者タイプ含む）
   - プレゼンター応募管理（将来の拡張用）
   - 管理者アカウント管理

### 📋 主要機能URIリスト

| パス | メソッド | 説明 | パラメータ |
|------|---------|------|-----------|
| `/` | GET | トップページ | - |
| `/events/:id` | GET | イベント詳細 | id: イベントID |
| `/apply/:id` | GET | 申込フォーム | id: イベントID |
| `/admin` | GET | 管理画面 | - |
| `/api/events` | GET | イベント一覧取得 | status, type |
| `/api/events/:id` | GET | イベント詳細取得 | id: イベントID |
| `/api/validate-code` | POST | 招待コード検証 | code, eventId |
| `/api/applications` | POST | 参加申込 | 申込情報 |
| `/api/admin/events` | POST | イベント作成 | イベント情報 |
| `/api/admin/invitation-codes` | POST | 招待コード作成 | コード情報 |
| `/api/admin/applications` | GET | 申込一覧取得 | eventId, status |

## データ構造

### イベントテーブル (events)
- **id**: イベントID
- **title**: イベント名
- **description**: 説明
- **event_type**: night (AI夜会) / tea (AI茶会)
- **location**: 開催地（浜松市、静岡市など）
- **address**: 詳細住所
- **event_date**: 開催日
- **start_time / end_time**: 開催時刻
- **capacity**: 定員
- **current_participants**: 現在の参加者数
- **status**: upcoming / ongoing / finished / cancelled
- **theme**: イベントテーマ
- **mini_lecture_topic**: ミニ講座のトピック
- **mini_lecture_duration**: ミニ講座の時間（分）
- **program_details**: プログラム詳細（タイムライン）
- **target_audience**: 参加対象者

### 講師・スタッフテーブル (event_staff)
- **id**: スタッフID
- **event_id**: イベントID
- **name**: 名前
- **role**: 役割（lecturer/staff/presenter/facilitator）
- **bio**: 自己紹介・経歴
- **profile_image_url**: プロフィール画像URL
- **presentation_topic**: プレゼンテーマ
- **display_order**: 表示順序

### 招待コードテーブル (invitation_codes)
- **code**: 招待コード文字列
- **event_id**: 紐付けイベントID（NULL=全イベント共通）
- **max_uses**: 最大使用回数
- **current_uses**: 現在使用回数
- **expires_at**: 有効期限
- **is_active**: 有効/無効

### 申込テーブル (applications)
- **event_id**: イベントID
- **invitation_code**: 使用した招待コード
- **participant_type**: 参加者タイプ（business_owner/aspiring_entrepreneur/teacher/student/other）
- **company_name**: 会社名・所属
- **applicant_name**: 申込者名
- **position**: 役職・立場
- **email / phone**: 連絡先
- **ai_usage_examples**: AI活用状況
- **consultation_topics**: 相談したいテーマ
- **referrer_name**: 紹介者名
- **status**: pending / approved / rejected / cancelled

## ストレージサービス
- **Cloudflare D1 Database**: SQLiteベースの分散データベース
  - ローカル開発: `.wrangler/state/v3/d1/` に自動生成
  - 本番環境: Cloudflare D1 (要作成)

## ユーザーガイド

### 一般ユーザー（イベント参加者）
1. トップページでイベント一覧を確認
2. 興味のあるイベントの「詳細を見る」をクリック
3. 「申し込む」ボタンから申込フォームへ
4. 招待コードと必要情報を入力して申込完了

### 管理者
1. `/admin` にアクセス
2. **イベント管理**: 新規イベント作成、イベント情報編集
3. **招待コード管理**: 新規コード生成、使用状況確認
4. **申込管理**: 申込一覧の確認、ステータス更新

## 未実装機能

### 🔨 今後の開発候補
1. **認証機能**: 管理画面のログイン機能
2. **メール通知**: 申込完了メール、リマインダーメール
3. **申込承認フロー**: 管理者による申込承認/却下処理
4. **イベント編集**: 既存イベントの情報更新機能
5. **参加者リスト**: イベントごとの参加者一覧表示
6. **QRコード**: 招待コード付きQRコード生成
7. **アンケート機能**: イベント後のフィードバック収集
8. **統計ダッシュボード**: イベント参加状況の可視化
9. **画像アップロード**: イベント画像の登録機能
10. **キャンセル機能**: 参加者自身によるキャンセル処理

## おすすめの次のステップ

### 優先度：高
1. **Cloudflare Pagesへのデプロイ**
   - 本番用D1データベース作成
   - プロダクション環境へのデプロイ

2. **管理画面の認証実装**
   - ログイン機能
   - セッション管理

3. **メール通知機能**
   - 申込完了通知
   - イベントリマインダー

### 優先度：中
4. **申込承認フロー**
   - 管理者による承認/却下
   - ステータス更新通知

5. **イベント編集機能**
   - 既存イベントの更新
   - イベントキャンセル機能

6. **参加者管理機能**
   - 参加者リストのエクスポート
   - 連絡先管理

## デプロイ状況
- **プラットフォーム**: Cloudflare Pages
- **ステータス**: 🚧 開発中（ローカル環境で動作確認済み）
- **技術スタック**: 
  - Backend: Hono (TypeScript)
  - Frontend: Vanilla JavaScript + TailwindCSS
  - Database: Cloudflare D1 (SQLite)
  - Deployment: Cloudflare Pages
- **最終更新**: 2025年10月27日

## ローカル開発

### 前提条件
- Node.js 18+
- npm

### セットアップ
```bash
# 依存関係インストール
npm install

# D1データベース初期化
npm run db:migrate:local

# テストデータ投入
npm run db:seed

# 開発サーバー起動
npm run build
npm run dev:sandbox

# または PM2 で起動
pm2 start ecosystem.config.cjs
```

### よく使うコマンド
```bash
# ビルド
npm run build

# ローカルD1リセット
npm run db:reset

# ポートクリーンアップ
npm run clean-port

# PM2ログ確認
pm2 logs ai-event-webapp --nostream
```

## プロジェクト構成
```
webapp/
├── src/
│   ├── index.tsx         # メインアプリケーション（Hono）
│   ├── renderer.tsx      # HTMLレンダラー
│   └── types.ts          # TypeScript型定義
├── public/
│   └── static/
│       ├── app.js        # フロントエンドJavaScript
│       └── style.css     # カスタムCSS
├── migrations/
│   └── 0001_initial_schema.sql  # データベーススキーマ
├── seed.sql              # テストデータ
├── ecosystem.config.cjs  # PM2設定
├── wrangler.jsonc        # Cloudflare設定
└── package.json          # プロジェクト設定
```

## ライセンス
© 2025 AI夜会・AI茶会. All rights reserved.
