/**
 * ペットフード 成分安全スコア計算
 * 商品名・成分情報から 0〜100 のスコアを算出する
 *
 * スコアの基準：
 *  85〜100 : ★★★★★ 最高品質
 *  70〜84  : ★★★★☆ 高品質
 *  55〜69  : ★★★☆☆ 標準品質
 *  40〜54  : ★★☆☆☆ やや注意
 *  0〜39   : ★☆☆☆☆ 要注意
 */

export interface IngredientScoreResult {
  score: number;           // 0〜100
  stars: number;           // 1〜5
  label: string;           // "最高品質" など
  color: string;           // CSSカラー
  bgColor: string;
  pros: string[];          // 良い点
  cons: string[];          // 懸念点
  applicable: boolean;     // スコア算出可能か（フード系のみ）
}

// ────────────────────────────────────────
// ポジティブキーワード（+点）
// ────────────────────────────────────────
const POSITIVE: Array<{ pattern: RegExp; points: number; label: string }> = [
  { pattern: /チキン|鶏肉|ラム|サーモン|マグロ|かつお|タラ|白身魚|ターキー|ビーフ|牛肉|豚肉|鴨肉|ダック/i, points: 15, label: '動物性たんぱく質が主原料' },
  { pattern: /グレインフリー|穀物不使用|grain.?free/i, points: 10, label: 'グレインフリー' },
  { pattern: /無添加|添加物不使用|保存料不使用/i, points: 10, label: '無添加・保存料不使用' },
  { pattern: /ヒューマングレード|人間用|食品規格/i, points: 8, label: 'ヒューマングレード原材料' },
  { pattern: /オーガニック|有機/i, points: 8, label: 'オーガニック原材料' },
  { pattern: /総合栄養食/i, points: 5, label: 'AAFCO総合栄養食基準クリア' },
  { pattern: /オメガ3|DHA|EPA|フィッシュオイル|亜麻仁油/i, points: 5, label: 'オメガ3脂肪酸配合' },
  { pattern: /プロバイオティクス|乳酸菌|ビフィズス菌/i, points: 4, label: '腸内環境サポート配合' },
  { pattern: /スーパーフード|ブルーベリー|クランベリー|かぼちゃ|ほうれん草/i, points: 4, label: 'スーパーフード配合' },
  { pattern: /フリーズドライ/i, points: 5, label: 'フリーズドライ製法（栄養素を保持）' },
  { pattern: /関節サポート|コンドロイチン|グルコサミン/i, points: 3, label: '関節サポート成分配合' },
  { pattern: /皮膚|被毛|毛艶|コート/i, points: 3, label: '皮膚・被毛ケア成分配合' },
  { pattern: /療法食|処方食/i, points: 5, label: '獣医師推奨療法食' },
];

// ────────────────────────────────────────
// ネガティブキーワード（-点）
// ────────────────────────────────────────
const NEGATIVE: Array<{ pattern: RegExp; points: number; label: string }> = [
  { pattern: /副産物|ミートミール|チキンミール(?!.*フリーレンジ)/i, points: -8, label: '副産物・ミール原料を含む' },
  { pattern: /着色料|人工着色|合成着色/i, points: -10, label: '人工着色料使用' },
  { pattern: /BHA|BHT|エトキシキン/i, points: -12, label: '合成酸化防止剤（BHA/BHT）使用' },
  { pattern: /コーンシロップ|果糖ぶどう糖|砂糖|ショ糖/i, points: -8, label: '添加糖分を含む' },
  { pattern: /プロピレングリコール/i, points: -10, label: 'プロピレングリコール使用（猫には危険）' },
  { pattern: /人工香料|合成香料|フレーバー(?!.*チキン|.*ビーフ|.*サーモン)/i, points: -5, label: '人工香料使用' },
  { pattern: /小麦|コーン|大豆|とうもろこし/i, points: -5, label: 'アレルゲンになりやすい穀物を含む' },
  { pattern: /塩分過多|塩化ナトリウム|食塩/i, points: -3, label: '塩分添加あり' },
];

// ────────────────────────────────────────
// カテゴリ判定（フード系のみスコア算出）
// ────────────────────────────────────────
const FOOD_CATEGORIES = [
  'dog-dry-food', 'dog-wet-food', 'dog-snack',
  'cat-dry-food', 'cat-wet-food', 'cat-snack',
  'dog-food', 'cat-food', 'snack',
];

export function calcIngredientScore(
  name: string,
  ingredients: string | null | undefined,
  category: string
): IngredientScoreResult {
  // フード系でなければスコア算出不可
  const isFood = FOOD_CATEGORIES.some((c) => category.includes(c.split('-').pop()!)) ||
    /フード|おやつ|ジャーキー|ビスケット|缶詰|パウチ|スナック/i.test(name);

  if (!isFood) {
    return {
      score: 0, stars: 0, label: '対象外', color: '#999', bgColor: '#f5f5f5',
      pros: [], cons: [], applicable: false,
    };
  }

  const text = `${name} ${ingredients ?? ''}`;
  let score = 50; // ベーススコア
  const pros: string[] = [];
  const cons: string[] = [];

  for (const p of POSITIVE) {
    if (p.pattern.test(text)) {
      score += p.points;
      pros.push(p.label);
    }
  }

  for (const n of NEGATIVE) {
    if (n.pattern.test(text)) {
      score += n.points; // マイナス
      cons.push(n.label);
    }
  }

  // クランプ
  score = Math.max(0, Math.min(100, score));

  const stars = score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;
  const { label, color, bgColor } = getScoreDisplay(score);

  return { score, stars, label, color, bgColor, pros, cons, applicable: true };
}

function getScoreDisplay(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 85) return { label: '最高品質', color: '#15803d', bgColor: '#dcfce7' };
  if (score >= 70) return { label: '高品質',   color: '#0369a1', bgColor: '#e0f2fe' };
  if (score >= 55) return { label: '標準品質', color: '#92400e', bgColor: '#fef3c7' };
  if (score >= 40) return { label: 'やや注意', color: '#c2410c', bgColor: '#ffedd5' };
  return              { label: '要注意',   color: '#991b1b', bgColor: '#fee2e2' };
}

export function renderStars(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
