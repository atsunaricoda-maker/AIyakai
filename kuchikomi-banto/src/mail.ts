import type { Env } from './types';

/**
 * Resend 経由のメール送信。RESEND_API_KEY 未設定でも動作を止めない
 * （その場合ログインコードは画面表示のみになる）。
 */
export async function sendMail(
  env: Env,
  opts: { to: string; subject: string; text: string },
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || 'クチコミ番頭 <onboarding@resend.dev>',
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error('メール送信失敗', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('メール送信エラー', err);
    return false;
  }
}

export function loginCodeMail(env: Env, loginCode: string): { subject: string; text: string } {
  const base = env.APP_BASE_URL.replace(/\/$/, '');
  return {
    subject: '【クチコミ番頭】ログインコードのお知らせ',
    text: [
      'クチコミ番頭をご利用いただきありがとうございます。',
      '',
      'ログインコード:',
      `  ${loginCode}`,
      '',
      `ログインページ: ${base}/login`,
      '',
      'このコードは再発行するまで有効です。第三者に共有しないでください。',
      'コードを紛失した場合は、ログイン済みの画面から再発行できます。',
      '',
      `お問い合わせ: ${env.SUPPORT_EMAIL}`,
    ].join('\n'),
  };
}
