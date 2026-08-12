# クチコミ番頭 公開・課金開始チェックリスト（GO-LIVE）

上から順に実行すれば「実際にお金を受け取れる状態」になります。
所要時間の目安：**初回は2〜3時間**（Stripeの審査待ちを除く）。

コマンドはすべて `kuchikomi-banto/` ディレクトリ直下で実行してください。

```bash
cd /home/user/AIyakai/kuchikomi-banto
```

---

## 0. 事前に用意するもの

- [ ] Cloudflareアカウント（無料プランで開始可。Workers Paid $5/月 は後からで可）
- [ ] Stripeアカウント（本番利用には事業者情報・銀行口座の登録＝本人確認が必要。**審査に1〜3営業日かかる場合がある**ので最初に申請しておく）
- [ ] Anthropic APIキー（https://platform.claude.com/ で発行。クレジットを最低$20ほどチャージ）
- [ ] 独自ドメイン（例: `kuchikomi-banto.jp`）。お名前.com / Cloudflare Registrar など
- [ ] Resendアカウント（ログインコードのメール送信用。任意だが実運用ではほぼ必須）
- [ ] 特定商取引法の表示に載せる情報一式（事業者名・住所・電話番号・メール）
  - 個人事業主で自宅住所を出したくない場合は、バーチャルオフィス契約を先に済ませておく

---

## 1. ローカルで動くことを確認する

- [ ] Node.js 20以上が入っている（`node -v`）
- [ ] 依存パッケージをインストール

```bash
npm install
```

- [ ] ローカル用シークレットファイルを作る

```bash
cp .dev.vars.example .dev.vars
```

- [ ] `.dev.vars` を編集し、最低限 `ANTHROPIC_API_KEY` を入れる（Stripeはまだ空でよい）
- [ ] `.dev.vars` が `.gitignore` に入っていることを確認（`git status` に出てこないこと）

```bash
git status --short
```

- [ ] ローカルD1にマイグレーションを適用

```bash
npx wrangler d1 migrations apply kuchikomi-banto --local
```

- [ ] 型チェックが通る

```bash
npm run typecheck
```

- [ ] 開発サーバーを起動して `http://localhost:8787` を開く

```bash
npm run dev
```

- [ ] トップページ（LP）が表示される
- [ ] 無料お試しでクチコミを貼り付け → 3案が生成される
- [ ] 4回目で「無料お試しの上限」のエラーが出る（`FREE_TRIAL_LIMIT=3`）
- [ ] `http://localhost:8787/api/health` が `{"ok":true, ...}` を返す

---

## 2. Cloudflareの初期設定

- [ ] Wranglerでログイン（ブラウザが開く）

```bash
npx wrangler login
```

- [ ] ログインできたか確認

```bash
npx wrangler whoami
```

- [ ] 本番用D1データベースを作成

```bash
npx wrangler d1 create kuchikomi-banto
```

- [ ] 出力された `database_id` をコピーし、`wrangler.jsonc` の `REPLACE_WITH_YOUR_D1_DATABASE_ID` を置き換える

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "kuchikomi-banto",
    "database_id": "ここに貼る"
  }
]
```

- [ ] 本番D1にマイグレーションを適用

```bash
npx wrangler d1 migrations apply kuchikomi-banto --remote
```

- [ ] テーブルができたか確認

```bash
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table';"
```

  → `accounts` / `shops` / `replies` などが並べば成功

---

## 3. シークレットを本番に登録する

`wrangler secret put` は対話式で値の入力を求められます。**入力した値は画面に表示されません。**

- [ ] `ANTHROPIC_API_KEY`（必須）

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

- [ ] `STRIPE_SECRET_KEY`（課金を使うなら必須。まずは `sk_test_...` を入れる）

```bash
npx wrangler secret put STRIPE_SECRET_KEY
```

- [ ] `STRIPE_WEBHOOK_SECRET`（手順5でWebhookを登録した後に取得できる `whsec_...`）

```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

- [ ] `STRIPE_PRICE_LIGHT`（手順4で作るライトの価格ID `price_...`）

```bash
npx wrangler secret put STRIPE_PRICE_LIGHT
```

- [ ] `STRIPE_PRICE_STANDARD`（手順4で作るスタンダードの価格ID `price_...`）

```bash
npx wrangler secret put STRIPE_PRICE_STANDARD
```

- [ ] `RESEND_API_KEY`（メール送信。任意だが推奨）

```bash
npx wrangler secret put RESEND_API_KEY
```

- [ ] `MAIL_FROM`（例: `クチコミ番頭 <noreply@kuchikomi-banto.jp>`。Resendでドメイン認証済みのアドレスにすること）

```bash
npx wrangler secret put MAIL_FROM
```

- [ ] `ADMIN_TOKEN`（管理API用。自分で決めた長いランダム文字列）

```bash
# 値を作る
openssl rand -hex 32
# その値を入力する
npx wrangler secret put ADMIN_TOKEN
```

- [ ] `APP_BASE_URL` は**シークレットではなく `wrangler.jsonc` の `vars`** に書く。独自ドメインが決まったら書き換える

```jsonc
"vars": {
  "APP_BASE_URL": "https://kuchikomi-banto.jp",
  "ANTHROPIC_MODEL": "claude-opus-5",
  "FREE_TRIAL_LIMIT": "3",
  "SUPPORT_EMAIL": "support@kuchikomi-banto.jp"
}
```

  ※ もし運用上シークレットとして扱いたい場合は `npx wrangler secret put APP_BASE_URL` でも動作しますが、`vars` と両方に書くと混乱するのでどちらか一方に統一してください。

- [ ] 登録済みシークレットの一覧を確認（値は表示されず、名前だけ出ます）

```bash
npx wrangler secret list
```

**登録すべきシークレット一覧（チェック用）**

| 名前 | 必須 | 取得元 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ◎ | platform.claude.com |
| `STRIPE_SECRET_KEY` | ◎（課金する場合） | Stripe ダッシュボード > 開発者 > APIキー |
| `STRIPE_WEBHOOK_SECRET` | ◎（課金する場合） | Stripe Webhook登録時に表示 |
| `STRIPE_PRICE_LIGHT` | ◎（課金する場合） | Stripe 商品カタログ |
| `STRIPE_PRICE_STANDARD` | ◎（課金する場合） | Stripe 商品カタログ |
| `RESEND_API_KEY` | ○ | resend.com |
| `MAIL_FROM` | ○ | 自分で決める（認証済みドメイン） |
| `ADMIN_TOKEN` | ○ | 自分で生成 |
| `APP_BASE_URL` | ◎ | 自分のドメイン（`vars` 推奨） |

---

## 4. Stripe：商品と価格を作る

**まずテストモードで作業します。** ダッシュボード右上のトグルが「テストモード」になっていることを必ず確認してください。

### 4-1. 通貨・税の扱いを決める

- [ ] Stripeアカウントの既定通貨が **JPY** になっている（ダッシュボード > 設定 > 通貨）
- [ ] 価格は**税込金額をそのまま登録する**方針にする
  - ライト = `2980`（JPYは最小単位が円なので、そのまま2980と入力。100倍しない）
  - スタンダード = `5980`
- [ ] 商品の説明文に「表示価格は税込です」と明記する
- [ ] Stripe Tax は**使わない**（使うと税額が上乗せされ、税込表記と矛盾する）
  - 将来インボイス対応が必要になったら、その時点で「内税」設定に切り替えを検討する
- [ ] 特定商取引法ページ・LP・Checkout画面の3か所で価格表記が一致していることを後で確認する

### 4-2. 商品を作る

Stripeダッシュボード > 商品カタログ > 「商品を追加」

- [ ] 商品1
  - 名前: `クチコミ番頭 ライト`
  - 説明: `月100件まで／1店舗。返信文3案生成。表示価格は税込です。`
  - 料金体系: **継続**（サブスクリプション）
  - 金額: `2980` / 通貨: `JPY` / 請求期間: **月次**
  - → 作成後、`price_xxxxx` をコピー
- [ ] 商品2
  - 名前: `クチコミ番頭 スタンダード`
  - 説明: `月500件まで／5店舗。返信文3案生成。表示価格は税込です。`
  - 料金体系: **継続**
  - 金額: `5980` / 通貨: `JPY` / 請求期間: **月次**
  - → 作成後、`price_xxxxx` をコピー

- [ ] 2つの `price_...` を手順3の `STRIPE_PRICE_LIGHT` / `STRIPE_PRICE_STANDARD` に登録した

### 4-3. 14日間トライアルの設定

このアプリは **Checkout Session 作成時にコード側でトライアルを指定** しています（`src/billing.ts` の `subscription_data[trial_period_days]` = 14）。

- [ ] したがって **Stripeダッシュボード側の商品にトライアル設定は不要**。二重設定しないこと
- [ ] トライアル日数を変えたい場合は `src/billing.ts` の `trialDays` の既定値を変更する
- [ ] トライアル中の解約でも請求が発生しないことを、手順6のテストで実際に確認する

### 4-4. Customer Portal（顧客ポータル）を有効にする

解約・カード変更をユーザー自身にやってもらうために必須です。

Stripeダッシュボード > 設定 > 請求 > カスタマーポータル

- [ ] 「顧客ポータルを有効にする」をON
- [ ] 「サブスクリプションのキャンセルを許可」をON
  - キャンセルのタイミング: **請求期間の終了時**（即時解約にすると日割り返金の判断が必要になり煩雑）
- [ ] 「プランの変更を許可」をON → 変更可能な商品に **ライトとスタンダードの両方**を追加
- [ ] 「支払い方法の更新を許可」をON
- [ ] 「請求書履歴の閲覧」をON
- [ ] ビジネス情報：サービス名を `クチコミ番頭`、利用規約URL・プライバシーポリシーURLを設定
  - `https://（あなたのドメイン）/legal/terms.html`
  - `https://（あなたのドメイン）/legal/privacy.html`
- [ ] 「デフォルトのリダイレクトリンク」を `https://（あなたのドメイン）/app` に設定
- [ ] 保存後、**テストモードと本番モードの両方で同じ設定をする**（ポータル設定はモードごとに独立）

---

## 5. Stripe：Webhookを登録する

Webhookが動かないと「決済は成功したのにプランが有効にならない」という最悪の事故が起きます。必ず疎通確認してください。

Stripeダッシュボード > 開発者 > Webhook > 「エンドポイントを追加」

- [ ] エンドポイントURL: `https://（あなたのドメイン）/api/stripe/webhook`
  - まだ独自ドメインがなければ `https://kuchikomi-banto.<あなたのサブドメイン>.workers.dev/api/stripe/webhook`
- [ ] 説明: `クチコミ番頭 本番`
- [ ] 送信するイベントを **以下の4つだけ** 選択する
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`
- [ ] 作成後、「署名シークレット」を表示して `whsec_...` をコピー
- [ ] `npx wrangler secret put STRIPE_WEBHOOK_SECRET` で登録
- [ ] **再デプロイする**（シークレット更新だけでも反映のため `npx wrangler deploy` を実行）

### ローカルでWebhookを試す場合（任意・推奨）

```bash
# Stripe CLI をインストール後
stripe login
stripe listen --forward-to http://localhost:8787/api/stripe/webhook
# → 表示される whsec_... を .dev.vars の STRIPE_WEBHOOK_SECRET に設定

# 別ターミナルでイベントを送ってみる
stripe trigger checkout.session.completed
```

- [ ] ローカルのログに `200` が返っているのを確認した

---

## 6. デプロイして、テストモードで一連の動作を確認する

- [ ] デプロイ

```bash
npx wrangler deploy
```

- [ ] 出力された `https://kuchikomi-banto.<サブドメイン>.workers.dev` を開く
- [ ] `/api/health` が `{"ok":true,"hasStripe":true,"hasMail":true}` を返す

### 6-1. 無料お試しの確認

- [ ] 未ログイン状態でクチコミを貼り付け → 3案が生成される
- [ ] 3回使い切ると4回目で上限メッセージが出る（HTTP 429）
- [ ] 星1のクチコミを貼ると「謝罪→事実確認→改善→オフライン誘導」の型になっている
- [ ] 明らかな誹謗中傷（例: 事実無根の中傷文）を貼ると、削除申請の助言が表示される

### 6-2. 登録〜決済の確認（テストカード）

- [ ] `/signup` からメールアドレスを入力して登録
- [ ] ログインコードのメールが届く（Resend未設定なら画面表示を確認）
- [ ] プラン選択 → Stripe Checkout に遷移する
- [ ] Checkout画面で価格が **¥2,980**（または ¥5,980）と表示されている
- [ ] Checkout画面に **「14日間の無料トライアル」** の表示がある
- [ ] テストカードで決済

| カード番号 | 挙動 | 確認すること |
|---|---|---|
| `4242 4242 4242 4242` | 成功 | 正常に契約できる |
| `4000 0000 0000 9995` | 残高不足で失敗 | エラー表示が出る |
| `4000 0000 0000 0341` | 登録は通るが後の請求で失敗 | `invoice.payment_failed` の挙動 |

  有効期限は未来の任意の日付（例: `12/34`）、CVCは任意の3桁（例: `123`）、郵便番号は任意（例: `1000001`）。

- [ ] 決済後 `/welcome` にリダイレクトされる
- [ ] `/api/me` を開くとプランが `light`（または `standard`）、statusが `active` になっている
- [ ] Stripeダッシュボード > Webhook > 該当エンドポイント で `checkout.session.completed` が **200** で成功している
- [ ] D1で実際にレコードが更新されているか確認

```bash
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT id,email,plan,status,trial_ends_at,current_period_end FROM accounts ORDER BY id DESC LIMIT 5;"
```

### 6-3. 解約・失敗系の確認

- [ ] アプリ内の「お支払い情報の管理」から Customer Portal に遷移できる
- [ ] ポータルで解約 → `customer.subscription.deleted` が届き、`status` が `canceled` になる
- [ ] `4000 0000 0000 0341` のカードで契約 → 請求失敗時に `invoice.payment_failed` が届き `status` が `past_due` になる
- [ ] `past_due` のアカウントで生成しようとしたときの画面表示が親切か確認する
- [ ] プラン上限（ライト100件）を超えたときに 429 と「プラン変更のご案内」が出るか確認
  - テスト用に一時的に `PLANS.light.monthlyLimit` を 2 にして確認 → **確認後は必ず元に戻す**

---

## 7. 本番キーへの切り替え

テストモードで6章がすべて通ってから実施してください。

- [ ] Stripeの本人確認・事業者情報登録が完了している（ダッシュボードに「本番環境を有効化」の警告が出ていない）
- [ ] Stripeダッシュボードを **本番モード** に切り替える
- [ ] 本番モードで **商品と価格を作り直す**（テストモードの `price_...` は本番では使えない）
  - ライト ¥2,980 / スタンダード ¥5,980、通貨JPY、月次
- [ ] 本番モードで **Customer Portal を設定し直す**（設定はモード別）
- [ ] 本番モードで **Webhookエンドポイントを登録し直す**（イベントは同じ4つ）
- [ ] 本番の値でシークレットを上書き

```bash
npx wrangler secret put STRIPE_SECRET_KEY        # sk_live_...
npx wrangler secret put STRIPE_PRICE_LIGHT       # 本番の price_...
npx wrangler secret put STRIPE_PRICE_STANDARD    # 本番の price_...
npx wrangler secret put STRIPE_WEBHOOK_SECRET    # 本番の whsec_...
```

- [ ] 再デプロイ

```bash
npx wrangler deploy
```

- [ ] **自分の本物のカードで、ライトプランを1回契約してみる**（¥2,980）
  - トライアル14日があるので即時課金は発生しないが、カード登録が通ることを確認する
- [ ] Customer Portalから自分で解約できることを確認
- [ ] 銀行口座への入金設定（Stripe > 設定 > 支払い）が正しいか確認

---

## 8. 独自ドメインの割り当てとDNS

### 8-1. ドメインをCloudflareに載せる

- [ ] Cloudflareダッシュボード > 「サイトを追加」でドメインを登録
- [ ] 表示された2つのネームサーバー（例: `xxx.ns.cloudflare.com`）を、レジストラ（お名前.com等）の管理画面で設定
- [ ] ネームサーバーの反映を待つ（数十分〜48時間）。Cloudflare上でステータスが「アクティブ」になればOK

### 8-2. Workerにカスタムドメインを割り当てる

- [ ] Cloudflareダッシュボード > Workers & Pages > `kuchikomi-banto` > 設定 > ドメインとルート > 「カスタムドメインを追加」
- [ ] `kuchikomi-banto.jp` と `www.kuchikomi-banto.jp` の両方を追加
  - カスタムドメインを追加すると、必要なDNSレコード（CNAME/AAAA）は自動で作成される。手動でAレコードを作らないこと
- [ ] SSL/TLS > 概要 で暗号化モードが **「フル」または「フル（厳格）」** になっている
- [ ] SSL/TLS > エッジ証明書 > 「常にHTTPSを使用」をON
- [ ] `https://kuchikomi-banto.jp` にアクセスして鍵マークが出る

### 8-3. ドメイン確定後にやること

- [ ] `wrangler.jsonc` の `APP_BASE_URL` を本番ドメインに更新して再デプロイ
- [ ] Stripe Webhookのエンドポイントを本番ドメインのURLに更新（または新規追加して旧URLを削除）
- [ ] Customer Portal の利用規約・プライバシーポリシーURLを本番ドメインに更新
- [ ] Resendでドメイン認証（SPF / DKIM のDNSレコード追加）を済ませ、`MAIL_FROM` を独自ドメインに変更

---

## 9. 公開前の最終確認

### 9-1. 法務・表記（ここが一番事故りやすい）

- [ ] `public/legal/tokushoho.html` のプレースホルダをすべて実在の情報に置換した
  - [ ] 販売事業者名（法人名 or 個人事業主の氏名）
  - [ ] 所在地（**「請求があったら遅滞なく開示」は不可。原則そのまま記載が必要**）
  - [ ] 電話番号（つながる番号。**「メールで対応」は不可**）
  - [ ] メールアドレス（`SUPPORT_EMAIL` と一致させる）
  - [ ] 販売価格（税込 ¥2,980 / ¥5,980 と明記）
  - [ ] 追加手数料（「なし」または実費）
  - [ ] 支払方法（クレジットカード・Stripe決済）と支払時期
  - [ ] 役務の提供時期（「決済完了後、直ちにご利用いただけます」）
  - [ ] 返品・キャンセル（「デジタルサービスのため返金不可。解約は次回請求日の前日までにマイページから」等、実際の運用と一致させる）
- [ ] `public/legal/terms.html` の事業者名・準拠法・管轄裁判所を確認
- [ ] `public/legal/privacy.html` に以下が書いてある
  - [ ] 取得する情報（メールアドレス、店舗プロフィール、入力されたクチコミ本文）
  - [ ] 第三者提供（Anthropic APIへの送信、Stripeへの決済情報）
  - [ ] 保存期間と削除請求の窓口
- [ ] LP・料金表・特商法・Stripe Checkout の **4か所で価格表記が完全一致**している
- [ ] リンク切れがない（下記コマンドで全リンクを一覧して手で開く）

```bash
grep -ohE 'href="[^"]+"' public/index.html public/legal/*.html | sort -u
```

- [ ] フッターから 利用規約 / プライバシーポリシー / 特定商取引法 の3ページに到達できる
- [ ] 各法務ページからトップに戻れる

### 9-2. 機能

- [ ] 無料お試し3件が正しく動く／4件目で止まる
- [ ] 429（上限到達）のときに「エラー」ではなく「プランのご案内」として親切に見えている
- [ ] 星1〜2のクチコミで謝罪型のテンプレートになる
- [ ] 誹謗中傷の検知が働き、「返信せず削除申請」の助言が出る
- [ ] 店舗プロフィールのNGワードが返信文に混入しない
- [ ] 署名が返信文の末尾に入る
- [ ] コピーボタンが実際にクリップボードにコピーされる（iOS Safari でも確認）

### 9-3. 表示

- [ ] iPhone（Safari）で表示崩れがない。特に **文字が12px未満になっていない**（50代のユーザーが多い）
- [ ] Android（Chrome）で表示崩れがない
- [ ] ダークモード（端末設定を「ダーク」にして）で文字が読める・ボタンが消えない
- [ ] PC 1280px幅で崩れない
- [ ] 入力欄にキーボードを出したときにボタンが隠れない
- [ ] 生成中のローディング表示がある（10秒近く待たせるので必須）

### 9-4. 運用の備え

- [ ] `ADMIN_TOKEN` を手元の安全な場所に控えた
- [ ] 管理APIが動く

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://kuchikomi-banto.jp/api/admin/stats
```

- [ ] Cloudflare Workers の Observability（ログ）が有効（`wrangler.jsonc` で `observability.enabled: true` 済み）
- [ ] Stripeの「支払い失敗時に顧客へメール送信」設定を確認（設定 > 請求 > サブスクリプションとメール）
- [ ] Anthropicのコンソールで **使用量アラート** を設定（例: 月$50で通知）
- [ ] 自分宛に問い合わせが届くメールアドレス（`SUPPORT_EMAIL`）を毎日見る運用にする

---

## 10. ローンチ後の運用

### 10-1. 毎週見る数字

管理APIで取れる数字：

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://kuchikomi-banto.jp/api/admin/stats | python3 -m json.tool
```

D1を直接叩いて見る場合：

```bash
# プラン別の契約数
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT plan, status, COUNT(*) AS n FROM accounts GROUP BY plan, status;"

# 今月の生成件数
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT COUNT(*) AS n FROM replies WHERE created_at >= date('now','start of month');"

# 今月のトークン消費（原価計算用）
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT SUM(input_tokens) AS in_tok, SUM(output_tokens) AS out_tok, COUNT(*) AS n FROM replies WHERE created_at >= date('now','start of month');"

# 直近30日で1件も生成していない有料ユーザー（解約予備軍）
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT a.id, a.email, a.plan FROM accounts a WHERE a.plan IN ('light','standard') AND a.status='active' AND NOT EXISTS (SELECT 1 FROM replies r WHERE r.account_id=a.id AND r.created_at >= datetime('now','-30 days'));"
```

### 10-2. MRR（月次経常収益）の見方

```
MRR = （ライトの有効契約数 × 2,980） + （スタンダードの有効契約数 × 5,980）
```

- 「有効契約」は `status='active'` かつ `plan != 'trial'` のもの
- トライアル中（`trial_ends_at` が未来）のアカウントは **MRRに含めない**。「トライアル中件数」として別に数える
- Stripeダッシュボード > 収益 でも同じ数字が見られるので、月末に自分の集計と突き合わせる

- [ ] 毎週月曜にMRRとトライアル中件数を記録する（スプレッドシートでよい）

### 10-3. 解約率（チャーン）の見方

```
月次解約率 = 当月に解約した有料アカウント数 ÷ 月初の有料アカウント数 × 100
```

判断の目安：

| 月次解約率 | 状態 | やること |
|---|---|---|
| 3%未満 | 良好 | 獲得に集中してよい |
| 3〜7% | 標準 | 解約者に必ず理由を聞く |
| 7〜10% | 要注意 | 「使われていない」原因を潰す。オンボーディングを直す |
| 10%超 | 危険 | 新規獲得を止めて、既存ユーザーへのヒアリングに全振り |

- [ ] 解約が出たら**必ず**メールを1通送って理由を聞く（テンプレートは SALES-KIT.md 参照）
- [ ] 「30日間1件も生成していない有料ユーザー」を毎月チェックし、解約される前に声をかける

### 10-4. Claude APIコストの目安と1件あたり原価

**モデル**: `claude-opus-5`（入力 $5 / 100万トークン、出力 $25 / 100万トークン）

**1件あたり原価の計算式**

```
1件の原価（USD） = (入力トークン ÷ 1,000,000 × 5) + (出力トークン ÷ 1,000,000 × 25)
1件の原価（円）   = 上記 × 為替レート（例 155円/USD）
```

**実測に基づく目安**（システムプロンプト＋店舗プロフィール＋クチコミ本文で入力 約1,800トークン、3案＋リスク判定で出力 約1,000トークン）

```
入力: 1,800 ÷ 1,000,000 × $5  = $0.009
出力: 1,000 ÷ 1,000,000 × $25 = $0.025
合計: $0.034 ≒ 約5.3円 / 件（155円/USD換算）
```

→ **1件あたり おおむね5〜8円** と見ておけば大きく外れません。

**プラン別の最悪ケース（上限まで使い切られた場合）**

| プラン | 月額（税込） | 上限件数 | 最悪原価 | 粗利 |
|---|---|---|---|---|
| ライト | ¥2,980 | 100件 | 約 ¥800 | 約 ¥2,180（73%） |
| スタンダード | ¥5,980 | 500件 | 約 ¥4,000 | 約 ¥1,980（33%） |

**運用上の注意**

- 実際の中小店舗は月5〜20件程度のクチコミが大半で、上限まで使い切るケースは稀。平均原価は1契約あたり **月¥50〜150** に収まる想定
- ただし**スタンダードで上限近くまで使うヘビーユーザーが出ると利益が薄くなる**。月400件超のアカウントが複数出たら、上位プラン（例: ¥12,800/月・2,000件）の追加を検討する
- Cloudflare Workers Paid は $5/月（約¥800）の固定費。D1は無料枠でしばらく足りる
- 実測トークンで毎月見直す：

```bash
npx wrangler d1 execute kuchikomi-banto --remote \
  --command "SELECT ROUND(AVG(input_tokens)) AS avg_in, ROUND(AVG(output_tokens)) AS avg_out, COUNT(*) AS n FROM replies WHERE created_at >= datetime('now','-30 days');"
```

- [ ] 毎月1日に「実測平均トークン × 単価」で原価を再計算し、粗利率が60%を切っていないか確認する

### 10-5. サポート問い合わせ導線

- [ ] アプリ内フッターに `SUPPORT_EMAIL` を常時表示する
- [ ] 問い合わせメールは **営業時間内なら当日中、遅くとも翌営業日** に一次返信する
- [ ] よくある問い合わせは FAQ に追記し、同じ質問が3回来たらUIを直す

**あらかじめ用意しておく回答テンプレート**

| 問い合わせ | 一次回答の要点 |
|---|---|
| ログインコードが届かない | 迷惑メールフォルダの確認 → 届かなければ手動でコードを再発行して送る |
| 生成された文章がしっくりこない | 店舗プロフィールの「こだわり」を具体的に書いてもらう。NGワードの設定を案内 |
| 解約したい | マイページ > お支払い情報の管理 から。次回請求日の前日まで有効な旨を伝える |
| 返金してほしい | 特商法ページの規定に沿って対応。トライアル中なら請求自体が発生していないことを説明 |
| Googleに直接投稿してほしい | 本サービスは文章の作成まで。Googleビジネスプロフィールへの貼り付けはご自身で行っていただく旨を説明 |

- [ ] 上記5つの返信テンプレートをメールの下書きに保存しておく

---

## 11. 公開直後の見守り（最初の72時間）

- [ ] 1日3回、Stripe > Webhook のエラー率を確認（失敗が出ていたら即対応）
- [ ] Cloudflare > Workers > ログ でエラーが出ていないか確認
- [ ] Anthropic コンソールで API エラー率と使用量を確認
- [ ] 最初の10人には**必ず個別にメールを送り**、使えているか聞く
- [ ] 「登録したが1件も生成していない人」がいたら、その日のうちに声をかける
