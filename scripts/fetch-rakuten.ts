import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';

// 登録ドメインが www あり/なし どちらか不明なため両方試す
const REFERER_CANDIDATES = [
  'https://www.petprices.jp',
  'https://petprices.jp',
  'http://www.petprices.jp',
  'http://petprices.jp',
];
let ACTIVE_REFERER = REFERER_CANDIDATES[0];
const HEADERS = () => ({ Referer: ACTIVE_REFERER, Origin: ACTIVE_REFERER });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 楽天の実ジャンルID → サイトカテゴリ マッピング
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GENRE_CATEGORY: [string, string][] = [
  // ── ドッグフード
  ['565715', 'dog-food'],
  // ── 犬のおやつ
  ['409651', 'dog-snack'],
  ['404099', 'dog-snack'],
  ['206138', 'dog-snack'],
  ['404097', 'dog-snack'],
  ['206135', 'dog-snack'],   // おやつ（犬）
  // ── 食器・給水器(犬/ペット共通)
  ['206139', 'dog-feeder'],  // ペット用食器・給水器・給餌器（親）
  ['210756', 'dog-feeder'],  // 食器
  ['304226', 'dog-feeder'],  // 食器台・テーブル
  ['404114', 'dog-feeder'],  // 給水器
  // ── 犬トイレ
  ['206205', 'dog-toilet'],
  // ── お散歩・ハーネス
  ['210771', 'dog-walk'],
  ['404132', 'dog-walk'],
  // ── 犬ケア・グルーミング
  ['215319', 'dog-care'],
  ['206217', 'dog-care'],
  ['112933', 'dog-care'],
  ['112114', 'dog-care'],
  ['404102', 'dog-care'],
  // ── 犬服（ドッグウェア）
  ['206155', 'dog-clothes'],  // ドッグウェア（旧:206181,200431）
  // ── 犬おもちゃ
  ['215333', 'dog-toy'],  // おもちゃ（旧:215337,409796）
  ['215339', 'dog-toy'],  // ぬいぐるみ
  // ── 犬小屋・ケージ・ベッド
  ['206193', 'dog-goods'],
  ['206201', 'dog-goods'],
  // ── 犬キャリー
  ['206150', 'dog-carrier'],
  ['206151', 'dog-carrier'],  // リュックキャリー
  ['206152', 'dog-carrier'],
  ['206153', 'dog-carrier'],
  ['206154', 'dog-carrier'],  // カート
  // ── キャットフード
  ['565724', 'cat-food'],
  // ── 食器・給水器(猫)
  ['206297', 'cat-feeder'],
  // ── 猫トイレ・猫砂
  ['204174', 'cat-toilet'],
  // ── キャットタワー
  ['206265', 'cat-tower'],
  // ── 猫おやつ
  ['215352', 'cat-snack'],   // おやつ（猫）
  ['206345', 'cat-snack'],
  ['409780', 'cat-snack'],
  // ── 猫ケア・グルーミング
  ['404151', 'cat-care'],
  ['215355', 'cat-care'],
  ['206350', 'cat-care'],
  // ── 猫おもちゃ
  ['215363', 'cat-toy'],  // 猫じゃらし
  ['112121', 'cat-toy'],
  ['404161', 'cat-toy'],
  // ── 猫ベッド・マット
  ['206287', 'cat-goods'],
  ['409760', 'cat-goods'],
  // ── 猫キャリー
  ['206267', 'cat-carrier'],  // キャリーバッグ・カート
  ['206269', 'cat-carrier'],
  ['206271', 'cat-carrier'],
  ['404137', 'cat-carrier'],
  ['112107', 'cat-carrier'],
  ['404162', 'cat-carrier'],
  // ── ペットシーツ
  ['409755', 'pet-sheets'],
  // ── 鳥のえさ・用品
  ['204184', 'bird-food'],
  ['204185', 'bird-goods'],
  ['565706', 'bird-food'],
  // ── 小動物フード・用品
  ['565699', 'small-animal-food'],   // 小動物用品（旧:565702-565705）
  // ── 熱帯魚えさ
  ['507542', 'fish-food'],
  ['507550', 'fish-food'],
  // ── 水槽・フィルター
  ['206304', 'fish-tank'],   // 水槽・アクアリウム（親）
  ['206305', 'fish-tank'],
  ['206311', 'fish-tank'],
  ['565701', 'fish-tank'],   // 水槽・アクアリウム内装
  ['565726', 'fish-tank'],
  ['215405', 'fish-tank'],
  ['101217', 'fish-tank'],
  // ── 爬虫類えさ・用品
  ['560198', 'reptile-food'],  // 爬虫類・両生類（旧:560200）
  ['101218', 'reptile-goods'],
  // ── 昆虫飼育
  ['409839', 'insect-goods'],  // 昆虫（旧:509408）
];

// 重複ジャンルID除去
const UNIQUE_GENRES = (() => {
  const seen = new Set<string>();
  return GENRE_CATEGORY.filter(([id]) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
})();

// ━━━ ユーティリティ ━━━

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function isPetProduct(_name: string, _category: string): boolean {
  // 全ジャンルIDがペット専用カテゴリのため、キーワードフィルター不要
  return true;
}

function detectPetType(category: string): string {
  if (category.startsWith('dog')) return 'dog';
  if (category.startsWith('cat')) return 'cat';
  if (category.startsWith('bird')) return 'bird';
  if (category.startsWith('small')) return 'small';
  if (category.startsWith('fish')) return 'fish';
  if (category.startsWith('reptile')) return 'reptile';
  if (category.startsWith('insect')) return 'insect';
  return 'other';
}

function detectAgeGroup(name: string): string {
  if (/パピー|子犬|子猫|キトン|幼/.test(name)) return 'puppy';
  if (/シニア|高齢|老犬|老猫|7歳|11歳|12歳/.test(name)) return 'senior';
  return 'all';
}

const BRANDS = [
  'ロイヤルカナン','ヒルズ','ニュートロ','アカナ','オリジン','グランデリ',
  'サイエンスダイエット','ピュリナ','いなば','INABA','モグニャン','フリスキー',
  'カルカン','メディコート','ユニチャーム','アイリスオーヤマ','ライオン','花王',
  'ペットキッス','IAMS','アイムス','デオトイレ','ニャンとも','ファーミネーター',
];
function extractBrand(name: string): string {
  for (const b of BRANDS) if (name.includes(b)) return b;
  return '';
}

// ━━━ API ━━━

interface RakutenItem {
  itemCode: string; itemName: string; itemPrice: number;
  itemUrl: string; affiliateUrl?: string;
  mediumImageUrls?: string[]; shopName: string;
  reviewCount?: number; reviewAverage?: number;
  catchcopy?: string;
}

async function fetchPage(genreId: string, page: number, refererIdx = 0): Promise<{ items: RakutenItem[]; pageCount: number }> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '',
    genreId,
    hits: '30',
    page: String(page),
    sort: '-reviewCount',
    formatVersion: '2',
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS() });
  if (res.status === 429) {
    console.log('    ⚠ 429 レート制限 → 3秒待機');
    await sleep(3000);
    return fetchPage(genreId, page, refererIdx);
  }
  if (res.status === 403) {
    const body = await res.text();
    if (body.includes('HTTP_REFERRER_NOT_ALLOWED') && refererIdx < REFERER_CANDIDATES.length - 1) {
      // 別のRefererで再試行
      ACTIVE_REFERER = REFERER_CANDIDATES[refererIdx + 1];
      console.log(`    ⚠ Referer変更 → ${ACTIVE_REFERER}`);
      return fetchPage(genreId, page, refererIdx + 1);
    }
    console.error(`    API error 403: ${body.slice(0, 150)}`);
    return { items: [], pageCount: 0 };
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`    API error ${res.status}: ${body.slice(0, 150)}`);
    return { items: [], pageCount: 0 };
  }
  try {
    const data = await res.json();
    return { items: data.Items || [], pageCount: data.pageCount || 0 };
  } catch {
    console.error(`    JSON parse error (page ${page}) → skip`);
    return { items: [], pageCount: 0 };
  }
}

// ━━━ バッチupsert（高速化：個別upsertではなく一括処理）━━━

async function batchUpsertItems(items: RakutenItem[], category: string): Promise<number> {
  // 1) ペット関連でないものを除外
  const filtered = items.filter(item => isPetProduct(item.itemName, category));
  if (filtered.length === 0) return 0;

  const now = new Date().toISOString();
  const rows = filtered.map(item => ({
    rakuten_item_id: item.itemCode,
    name: item.itemName,
    category,
    pet_type: detectPetType(category),
    age_group: detectAgeGroup(item.itemName),
    brand: extractBrand(item.itemName) || null,
    image_url: item.mediumImageUrls?.[0]
      ? item.mediumImageUrls[0].replace('_ex=128x128', '_ex=400x400')
      : null,
    item_url: item.itemUrl,
    affiliate_url: item.affiliateUrl || item.itemUrl,
    current_price: item.itemPrice,
    shop_name: item.shopName,
    review_count: item.reviewCount ?? 0,
    review_average: item.reviewAverage ?? 0,
    description: item.catchcopy || null,
    updated_at: now,
  }));

  // 2) バッチupsert（30件まとめて1回のAPIコール）
  const { data: upserted, error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'rakuten_item_id' })
    .select('id, rakuten_item_id, current_price, shop_name');

  if (error) {
    console.error(`    batch upsert error: ${error.message}`);
    return 0;
  }

  if (!upserted || upserted.length === 0) return 0;

  // 3) 価格履歴をバッチinsert
  const priceHistoryRows = upserted.map((p: { id: string; current_price: number; shop_name: string }) => ({
    product_id: p.id,
    price: p.current_price,
    shop_name: p.shop_name,
  }));

  const { error: histError } = await supabase
    .from('price_history')
    .insert(priceHistoryRows);

  if (histError) {
    console.error(`    price_history insert error: ${histError.message}`);
  }

  return upserted.length;
}

// ━━━ メイン ━━━

async function main() {
  console.log('=== 楽天ペット商品 ジャンルID別全件取得（バッチ処理版）===');
  console.log(`対象ジャンル数: ${UNIQUE_GENRES.length}`);
  console.log(`開始: ${new Date().toLocaleString('ja-JP')}\n`);

  let grandTotal = 0;
  let genreIdx = 0;

  for (const [genreId, category] of UNIQUE_GENRES) {
    genreIdx++;
    console.log(`\n[${genreIdx}/${UNIQUE_GENRES.length}] genreId=${genreId} → ${category}`);

    // 1ページ目でpageCount確認
    const first = await fetchPage(genreId, 1);
    if (first.items.length === 0) { console.log('  0件'); continue; }

    // 最大50ページ（1500件）に制限してタイムアウト防止
    const maxPage = Math.min(first.pageCount, 50);
    let genreTotal = await batchUpsertItems(first.items, category);
    console.log(`  p1/${maxPage}: ${first.items.length}件 → DB登録${genreTotal}件`);

    for (let page = 2; page <= maxPage; page++) {
      await sleep(300); // 500ms → 300msに短縮
      const { items } = await fetchPage(genreId, page);
      if (items.length === 0) break;
      const cnt = await batchUpsertItems(items, category);
      genreTotal += cnt;
      if (page % 10 === 0) {
        console.log(`  p${page}/${maxPage}: 累計${genreTotal.toLocaleString()}件`);
      }
    }

    grandTotal += genreTotal;
    console.log(`  ✓ 完了: ${genreTotal.toLocaleString()}件 (累計 ${grandTotal.toLocaleString()}件)`);
    await sleep(500); // ジャンル間インターバル 1000ms → 500msに短縮
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`全完了！ 総件数: ${grandTotal.toLocaleString()}件`);
  console.log(`終了: ${new Date().toLocaleString('ja-JP')}`);
}

main().catch(console.error);
