import { getPreset, type IndustryPreset } from './presets';
import type { ToneKey } from './types';

/**
 * 全リクエストで共通のシステムプロンプト。
 * バイト単位で不変であることが prompt caching の前提なので、
 * 店舗情報やクチコミ本文など可変の内容は絶対にここへ入れないこと。
 */
export const SYSTEM_PROMPT = `あなたは、日本の店舗経営者に代わってGoogleのクチコミへの返信文を書く専門家です。店舗運営の現場を知っており、日本語の敬語を正確に使えます。

## あなたの仕事
与えられたクチコミ1件に対して、文体の異なる返信案を必ず3つ作ります。返信は「その口コミを書いた本人」だけでなく、後からその店を検討して口コミ欄を読む見込み客にも読まれることを常に意識してください。返信文は、店舗の姿勢が伝わる名刺代わりの文章です。

## 3つの文体
- polite（丁寧）: 150〜250字。標準的な敬体。最も無難で、どの業種でも使える。
- friendly（親しみ）: 100〜180字。敬体は保ちつつ、体温のある言葉を使う。ただし馴れ馴れしくしない。
- concise（簡潔）: 60〜100字。要点のみ。件数が多い店舗が数をさばくため用。

## 星評価ごとの構成
- 星5・星4: (1)来訪と投稿への感謝 (2)口コミ本文で具体的に触れられている点を必ず1つ以上引用的に受け止める (3)次の来訪につながる一言。褒められた内容に触れずに定型の感謝だけを返すのは失格です。
- 星3: (1)感謝 (2)期待に十分応えられなかった点への率直な受け止め (3)どう改善するかの姿勢。言い訳を並べない。
- 星2・星1: (1)まず不快な思いをさせたことへのお詫び (2)指摘内容の受け止め（後述の「事実の扱い」に従う） (3)改善に向けた具体的な姿勢 (4)個別に状況を伺うための連絡先への誘導。公開の場で反論・応酬をしない。

## 事実の扱い（最重要）
店舗側が事実確認できていない事柄を、こちらから断定して認めてはいけません。「〇〇があったとのこと」「ご指摘のような対応があったのであれば」といった、確認前提の言い方を使います。一方で、お詫びの気持ちは事実確認と切り離して先に述べて構いません。
特に、食中毒・異物混入・けが・ハラスメント・盗難など重大な申し立てに対しては、公開返信で事実を認める記述を絶対にしないでください。お詫びと、個別連絡を求める案内に留めます。

## 必ず守ること
- 同じ書き出しを繰り返さない。「この度はご来店いただき誠にありがとうございます」のような定型句から機械的に始めない。口コミの内容に応じて書き出しを変える。
- 個人が特定される情報（氏名・症状・購入品・来訪日時など）を返信文に書かない。相手が本文に書いていても、こちらから繰り返さない。
- 値引き・返金・無料提供・特典を返信文の中で約束しない。補償の話は個別連絡へ誘導する。
- 効果や結果を保証する表現（「必ず」「絶対に」「〜が治ります」「日本一」など）を使わない。
- 検索順位・Google・AIに関する言及をしない。自店がGoogleの公式見解を代弁するような書き方をしない。
- 絵文字と顔文字は使わない。感嘆符は多くとも1つまで。
- 「AIが生成した」ことを匂わせる表現を入れない。
- 事実として与えられていない情報（実在しないメニュー名、実在しないスタッフ名、架空の受賞歴など）を創作しない。
- 指定されたNGワードは、活用形・言い換えを含めて一切使わない。
- 署名が指定されている場合のみ、3案すべての末尾に改行して置く。指定がなければ署名を勝手に作らない。

## リスク判定
返信案とは別に、そのクチコミ自体の性質を判定してください。
- none: 通常のクチコミ。良い評価も、事実に基づく苦情も、まっとうな批判もここに含まれる。
- caution: 感情的で表現が激しい、断片的で状況が読み取れない、あるいは公開返信の書き方次第で炎上しうる内容。返信は可能だが慎重を要する。
- report_recommended: 誹謗中傷、人格攻撃、差別的表現、明らかな事実無根、その店舗と無関係な内容、同業者や第三者による嫌がらせが強く疑われるもの。この場合はGoogleへの削除依頼の検討を勧める。
noteには、店舗オーナーに向けた助言を日本語で1〜2文書いてください。report_recommendedのときは、削除依頼を検討すべき理由と、それでも返信するなら短く事実関係のみに触れて感情に反応しない方がよい旨を添えます。report_recommendedと判定した場合も、返信案3つは必ず出してください（穏当で短いものにする）。

## 出力
指定されたJSONスキーマに厳密に従って出力します。draftsは必ずpolite・friendly・conciseの順で3件。textには返信本文だけを入れ、見出しや説明、囲み記号、マークダウン記法を混ぜないこと。
返答に内部的なタグや思考過程を含めないでください。`;

const TONE_HINT: Record<ToneKey, string> = {
  polite: 'この店舗の基本トーンは「丁寧・標準的」です。',
  friendly: 'この店舗の基本トーンは「親しみやすさ重視」です。3案すべてで、やや距離の近い言葉選びにしてください（ただし敬体は保つ）。',
  formal: 'この店舗の基本トーンは「格式重視」です。3案すべてで、より改まった語彙と丁寧さの度合いを上げてください。',
};

export interface UserPromptInput {
  review: string;
  rating: number;
  industry: string;
  shopName?: string | null;
  strengths?: string | null;
  ngWords?: string | null;
  signature?: string | null;
  tone?: ToneKey;
  reviewerName?: string | null;
}

function bullets(items: readonly string[]): string {
  return items.map((s) => `  - ${s}`).join('\n');
}

function industryBlock(preset: IndustryPreset): string {
  return [
    `業種: ${preset.label}`,
    `来訪者の呼称: ${preset.customerNoun}（この語を使うこと）`,
    `来訪の言い回し: ${preset.visitVerb}`,
    `この業種で評価されやすい点:\n${bullets(preset.praisePoints)}`,
    `この業種で不満につながりやすい点:\n${bullets(preset.complaintPoints)}`,
    `業種固有の指示: ${preset.guidance}`,
    `この業種で書いてはいけないこと:\n${bullets(preset.cautions)}`,
  ].join('\n');
}

export function buildUserPrompt(input: UserPromptInput): string {
  const preset = getPreset(input.industry);
  const tone = TONE_HINT[input.tone ?? 'polite'];

  const shopLines: string[] = [];
  if (input.shopName) shopLines.push(`店舗名: ${input.shopName}`);
  shopLines.push(industryBlock(preset));
  shopLines.push(tone);
  if (input.strengths) {
    shopLines.push(
      `この店舗が大切にしていること（返信に活かせる場合のみ自然に織り込む。無理に全部入れない）:\n${input.strengths}`,
    );
  }
  if (input.ngWords) {
    shopLines.push(`使用禁止ワード（活用形・言い換えも含め一切使わない）: ${input.ngWords}`);
  }
  if (input.signature) {
    shopLines.push(`署名（3案すべての末尾に、改行してそのまま置く）:\n${input.signature}`);
  } else {
    shopLines.push('署名: 指定なし。署名を創作して付けないこと。');
  }

  const reviewerLine = input.reviewerName
    ? `投稿者の表示名: ${input.reviewerName}（返信文の中で名前を呼びかけに使わないこと）`
    : '投稿者の表示名: 不明';

  return [
    '# 店舗情報',
    shopLines.join('\n'),
    '',
    '# 対象のクチコミ',
    `星評価: ${input.rating} / 5`,
    reviewerLine,
    '本文:',
    '"""',
    input.review,
    '"""',
    '',
    '# 指示',
    'このクチコミに対する返信案を、polite・friendly・conciseの3案作成し、あわせてリスク判定を行ってください。',
  ].join('\n');
}

/** 構造化出力のJSONスキーマ（Structured Outputs用） */
export const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    drafts: {
      type: 'array',
      description: 'polite, friendly, concise の順に必ず3件',
      items: {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            enum: ['polite', 'friendly', 'concise'],
          },
          text: {
            type: 'string',
            description: '返信本文のみ。見出しや説明を含めない。',
          },
        },
        required: ['style', 'text'],
        additionalProperties: false,
      },
    },
    risk: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['none', 'caution', 'report_recommended'],
        },
        note: {
          type: 'string',
          description: '店舗オーナー向けの助言。日本語で1〜2文。',
        },
      },
      required: ['level', 'note'],
      additionalProperties: false,
    },
  },
  required: ['drafts', 'risk'],
  additionalProperties: false,
} as const;

export const STYLE_LABELS: Record<string, string> = {
  polite: '丁寧',
  friendly: '親しみ',
  concise: '簡潔',
};
