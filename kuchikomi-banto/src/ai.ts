import Anthropic from '@anthropic-ai/sdk';
import { REPLY_SCHEMA, STYLE_LABELS, SYSTEM_PROMPT, buildUserPrompt, type UserPromptInput } from './prompts';
import type { DraftStyle, Env, GenerationResult, ReplyDraft, RiskLevel } from './types';

/** 返信生成が失敗した理由。呼び出し側が利用者向け文言に変換する。 */
export type GenerationErrorCode =
  | 'refused'      // 安全性判定で生成が拒否された
  | 'malformed'    // モデル出力がスキーマ通りに解釈できなかった
  | 'upstream'     // Claude API 側のエラー
  | 'timeout';

export class GenerationError extends Error {
  constructor(
    public readonly code: GenerationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

const STYLE_ORDER: DraftStyle[] = ['polite', 'friendly', 'concise'];
const RISK_LEVELS: RiskLevel[] = ['none', 'caution', 'report_recommended'];

function client(env: Env): Anthropic {
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    // Workers 上では fetch がグローバルにあるため追加設定は不要。
    // 1リクエストあたりの上限を明示しておく（ミリ秒）。
    timeout: 120_000,
    maxRetries: 2,
  });
}

/** モデル出力（JSON文字列）を検証して正規化する。 */
function parseResult(raw: string): { drafts: ReplyDraft[]; risk: { level: RiskLevel; note: string } } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GenerationError('malformed', 'モデル出力がJSONとして解釈できませんでした');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new GenerationError('malformed', 'モデル出力がオブジェクトではありません');
  }

  const obj = parsed as Record<string, unknown>;
  const rawDrafts = obj.drafts;
  if (!Array.isArray(rawDrafts) || rawDrafts.length === 0) {
    throw new GenerationError('malformed', '返信案が含まれていません');
  }

  const byStyle = new Map<DraftStyle, string>();
  for (const item of rawDrafts) {
    if (typeof item !== 'object' || item === null) continue;
    const d = item as Record<string, unknown>;
    const style = d.style;
    const text = d.text;
    if (typeof style !== 'string' || typeof text !== 'string') continue;
    if (!STYLE_ORDER.includes(style as DraftStyle)) continue;
    const trimmed = text.trim();
    if (trimmed.length === 0) continue;
    byStyle.set(style as DraftStyle, trimmed);
  }

  // 3案そろわなくても、1案以上あれば返す（利用者にとっては空振りより有用）
  const drafts: ReplyDraft[] = STYLE_ORDER.filter((s) => byStyle.has(s)).map((s) => ({
    style: s,
    label: STYLE_LABELS[s] ?? s,
    text: byStyle.get(s) as string,
  }));

  if (drafts.length === 0) {
    throw new GenerationError('malformed', '有効な返信案が1件も得られませんでした');
  }

  const rawRisk = obj.risk;
  let level: RiskLevel = 'none';
  let note = '';
  if (typeof rawRisk === 'object' && rawRisk !== null) {
    const r = rawRisk as Record<string, unknown>;
    if (typeof r.level === 'string' && RISK_LEVELS.includes(r.level as RiskLevel)) {
      level = r.level as RiskLevel;
    }
    if (typeof r.note === 'string') note = r.note.trim();
  }

  return { drafts, risk: { level, note } };
}

/**
 * クチコミ1件から返信案3つとリスク判定を生成する。
 *
 * モデルは Claude Opus 5 を既定とし、環境変数 ANTHROPIC_MODEL で差し替え可能。
 * - 安定するシステムプロンプトに cache_control を置き、店舗情報とクチコミ本文は
 *   user メッセージ側に置くことで、リクエスト間でプレフィックスキャッシュが効く。
 * - Structured Outputs でJSON構造を保証する。
 * - 安全性判定で拒否された場合は stop_reason === 'refusal' になるため、
 *   content を読む前に必ず確認する。
 */
export async function generateReplies(env: Env, input: UserPromptInput): Promise<GenerationResult> {
  const anthropic = client(env);
  const model = env.ANTHROPIC_MODEL || 'claude-opus-5';
  const effort = env.ANTHROPIC_EFFORT || 'medium';

  let message: Anthropic.Beta.BetaMessage;
  try {
    message = await anthropic.beta.messages.create({
      model,
      max_tokens: 8000,
      // 安全性判定で拒否された場合に、サーバ側で推奨モデルへ自動フォールバックする。
      // 利用者に 500 を返す代わりに応答を返せる。
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: {
        effort,
        format: { type: 'json_schema', schema: REPLY_SCHEMA },
      },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);
  } catch (err) {
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
      throw new GenerationError('timeout', '生成がタイムアウトしました');
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new GenerationError('upstream', `Claude API エラー: ${detail}`);
  }

  // content を読む前に必ず stop_reason を確認する。
  if (message.stop_reason === 'refusal') {
    throw new GenerationError('refused', 'このクチコミ本文に対しては返信案を生成できませんでした');
  }

  const text = message.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!text) {
    throw new GenerationError('malformed', 'モデルから本文が返りませんでした');
  }

  const { drafts, risk } = parseResult(text);

  return {
    drafts,
    risk,
    usage: {
      inputTokens:
        message.usage.input_tokens +
        (message.usage.cache_read_input_tokens ?? 0) +
        (message.usage.cache_creation_input_tokens ?? 0),
      outputTokens: message.usage.output_tokens,
    },
  };
}

/** 利用者に見せるエラーメッセージ。内部の詳細は漏らさない。 */
export function userFacingMessage(code: GenerationErrorCode): string {
  switch (code) {
    case 'refused':
      return 'この内容では返信案を作成できませんでした。本文を短くするか、表現を変えてお試しください。';
    case 'malformed':
      return '返信案の生成に失敗しました。もう一度お試しください。';
    case 'timeout':
      return '混み合っているようです。少し時間をおいてもう一度お試しください。';
    case 'upstream':
    default:
      return '一時的に返信案を作成できませんでした。少し時間をおいてお試しください。';
  }
}
