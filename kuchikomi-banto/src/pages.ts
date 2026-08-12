/**
 * サーバ側で描画する小さなページ（登録・ログイン・完了）。
 * 対象利用者がITに不慣れな場合を想定し、JavaScriptなしのフォームPOSTで完結させる。
 */

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLE = `
:root{
  --bg:#f7f4ee; --surface:#fffdf9; --line:#e3dcd0; --ink:#221f1c; --muted:#6a6156;
  --accent:#9c3d2e; --accent-ink:#fff; --ok:#2f6b46; --warn:#8a5a12; --shadow:0 1px 2px rgba(34,31,28,.06),0 8px 24px rgba(34,31,28,.06);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#17150f; --surface:#211e18; --line:#3a352c; --ink:#f0ebe1; --muted:#a89e90;
    --accent:#d9705c; --accent-ink:#1b1410; --ok:#7fbf98; --warn:#e0b061; --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.3);
  }
}
:root[data-theme="dark"]{
  --bg:#17150f; --surface:#211e18; --line:#3a352c; --ink:#f0ebe1; --muted:#a89e90;
  --accent:#d9705c; --accent-ink:#1b1410; --ok:#7fbf98; --warn:#e0b061; --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.3);
}
*{box-sizing:border-box}
body{
  margin:0;background:var(--bg);color:var(--ink);
  font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,sans-serif;
  font-feature-settings:"palt" 1;line-height:1.8;
  -webkit-text-size-adjust:100%;
}
.wrap{max-width:520px;margin:0 auto;padding:32px 20px 64px}
.brand{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);font-weight:700;letter-spacing:.02em}
.brand svg{flex:none}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px;box-shadow:var(--shadow);margin-top:24px}
h1{font-size:1.4rem;margin:0 0 4px;line-height:1.5}
p.lead{color:var(--muted);margin:0 0 20px;font-size:.95rem}
label{display:block;font-weight:600;font-size:.9rem;margin:16px 0 6px}
input[type=email],input[type=text]{
  width:100%;padding:12px 14px;font-size:16px;color:var(--ink);background:var(--bg);
  border:1px solid var(--line);border-radius:9px;font-family:inherit;
}
input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.hint{font-size:.82rem;color:var(--muted);margin:6px 0 0}
button.primary{
  width:100%;margin-top:24px;padding:14px 18px;font-size:1rem;font-weight:700;font-family:inherit;
  background:var(--accent);color:var(--accent-ink);border:0;border-radius:9px;cursor:pointer;
}
button.primary:hover{filter:brightness(1.06)}
.alt{margin-top:20px;font-size:.9rem;color:var(--muted);text-align:center}
.alt a{color:var(--accent)}
.err{background:color-mix(in srgb,var(--accent) 12%,transparent);border:1px solid var(--accent);
  color:var(--ink);padding:12px 14px;border-radius:9px;font-size:.9rem;margin-bottom:8px}
.code{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.5rem;font-weight:700;letter-spacing:.12em;
  background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:16px;text-align:center;margin:14px 0;
  user-select:all;word-break:break-all;
}
.notice{border-left:3px solid var(--warn);padding:8px 0 8px 14px;color:var(--muted);font-size:.88rem;margin:16px 0}
footer{margin-top:40px;text-align:center;font-size:.8rem;color:var(--muted)}
footer a{color:var(--muted)}
`;

const MARK = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9.4L5 20.5A.6.6 0 0 1 4 20V5a1 1 0 0 1 0-1Z" opacity=".18"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M4.8 4.8h14.4v11.4H9.2L5 19.6V4.8Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M8.2 9h7.6M8.2 12.2h5"/></svg>`;

export function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<title>${esc(title)} | クチコミ番頭</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
  <a class="brand" href="/">${MARK}<span>クチコミ番頭</span></a>
  ${body}
  <footer>
    <a href="/legal/terms">利用規約</a> ・
    <a href="/legal/privacy">プライバシーポリシー</a> ・
    <a href="/legal/tokushoho">特定商取引法に基づく表記</a>
  </footer>
</div>
</body>
</html>`;
}

export function signupPage(opts: { plan: string; error?: string; email?: string }): string {
  const planLabel = opts.plan === 'standard' ? 'スタンダード（¥5,980/月）' : 'ライト（¥2,980/月）';
  return layout(
    'お申し込み',
    `<div class="card">
      <h1>お申し込み</h1>
      <p class="lead">${esc(planLabel)}／14日間は無料です。トライアル期間中に解約すれば料金は発生しません。</p>
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <form method="post" action="/signup">
        <input type="hidden" name="plan" value="${esc(opts.plan)}">
        <label for="email">メールアドレス</label>
        <input id="email" type="email" name="email" required autocomplete="email"
               inputmode="email" placeholder="you@example.com" value="${esc(opts.email ?? '')}">
        <p class="hint">ログインとご連絡に使います。決済はこの後Stripeの安全な画面で行います。</p>
        <button class="primary" type="submit">無料で始める</button>
      </form>
      <p class="notice">お申し込みの前に<a href="/legal/terms">利用規約</a>と<a href="/legal/privacy">プライバシーポリシー</a>をご確認ください。送信をもってこれらに同意したものとみなします。</p>
      <p class="alt">すでにご利用中の方は <a href="/login">ログイン</a></p>
    </div>`,
  );
}

export function loginPage(opts: {
  error?: string;
  email?: string;
  notice?: string;
  supportEmail?: string;
}): string {
  const support = opts.supportEmail || 'support@example.com';
  return layout(
    'ログイン',
    `<div class="card">
      <h1>ログイン</h1>
      <p class="lead">お申し込み時にお伝えしたログインコードを入力してください。</p>
      ${opts.notice ? `<div class="notice">${esc(opts.notice)}</div>` : ''}
      ${opts.error ? `<div class="err">${esc(opts.error)}</div>` : ''}
      <form method="post" action="/login">
        <label for="email">メールアドレス</label>
        <input id="email" type="email" name="email" required autocomplete="email"
               inputmode="email" value="${esc(opts.email ?? '')}">
        <label for="code">ログインコード</label>
        <input id="code" type="text" name="code" required autocomplete="one-time-code"
               placeholder="ABCDE-12345" style="text-transform:uppercase">
        <button class="primary" type="submit">ログイン</button>
      </form>
      <p class="alt">コードを紛失した場合は <a href="mailto:${esc(support)}">サポートまでご連絡ください</a></p>
    </div>`,
  );
}

export function welcomePage(opts: { loginCode?: string; email: string }): string {
  const codeBlock = opts.loginCode
    ? `<p>ログインコードは次のとおりです。<strong>この画面でしか表示されません。</strong>スクリーンショットを撮るか、控えておいてください。</p>
       <div class="code">${esc(opts.loginCode)}</div>
       <p class="hint">同じ内容をご登録のメールアドレス宛にもお送りしています（メール設定が有効な場合）。</p>`
    : `<p>ログインコードはご登録のメールアドレス宛にお送りしました。</p>`;

  return layout(
    'お申し込みありがとうございます',
    `<div class="card">
      <h1>お申し込みが完了しました</h1>
      <p class="lead">${esc(opts.email)} でご利用いただけます。</p>
      ${codeBlock}
      <a href="/app"><button class="primary" type="button">さっそく使ってみる</button></a>
      <p class="notice">最初に「店舗プロフィール」を登録すると、以降の返信文に店名・こだわり・署名が自動で反映されます。所要1分です。</p>
    </div>`,
  );
}

export function messagePage(title: string, message: string, linkHref = '/', linkLabel = 'トップへ戻る'): string {
  return layout(
    title,
    `<div class="card">
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(message)}</p>
      <a href="${esc(linkHref)}"><button class="primary" type="button">${esc(linkLabel)}</button></a>
    </div>`,
  );
}
