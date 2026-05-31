import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
const HEADERS = { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 楽天の実ジャンルID → サイトカテゴリ マッピング
// (probe-genres.ts / probe-genres2.ts で実測済み)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GENRE_CATEGORY: [string, string][] = [
  // ── ドッグフード
  ['565715', 'dog-food'],
  // ── 犬のおやつ
  ['409651', 'dog-snack'],
  ['404099', 'dog-snack'],
  ['206138', 'dog-snack'],
  ['404097', 'dog-snack'],
  // ── 食器・給水器(犬)
  ['210756', 'dog-feeder'],
  ['304226', 'dog-feeder'],
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
  // ── 犬服
  ['206181', 'dog-clothes'],
  ['200431', 'dog-clothes'],
  // ── 犬おもちゃ
  ['215337', 'dog-toy'],
  ['215339', 'dog-toy'],
  ['409796', 'dog-toy'],
  // ── 犬小屋・ケージ・ベッド
  ['206193', 'dog-goods'],
  ['206201', 'dog-goods'],
  // ── 犬キャリー
  ['206150', 'dog-carrier'],
  ['206151', 'dog-carrier'],
  ['206152', 'dog-carrier'],
  ['206153', 'dog-carrier'],
  // ── キャットフード
  ['565724', 'cat-food'],
  // ── 食器・給水器(猫)
  ['206297', 'cat-feeder'],
  // ── 猫トイレ・猫砂
  ['204174', 'cat-toilet'],
  // ── キャットタワー
  ['206265', 'cat-tower'],
  // ── 猫ケア
  // (dog-careと共通ジャンルのため省略)
  // ── 猫おもちゃ
  ['215363', 'cat-toy'],
  ['112121', 'cat-toy'],
  ['404161', 'cat-toy'],
  // ── 猫ベッド・マット
  ['206287', 'cat-goods'],
  ['409760', 'cat-goods'],
  // ── 猫キャリー
  ['206269', 'cat-carrier'],
  ['206271', 'cat-carrier'],
  ['404137', 'cat-carrier'],
  ['112107', 'cat-carrier'],
  ['404162', 'cat-carrier'],
  // ── ペットシーツ
  ['409755', 'pet-sheets'],
  // ── 鳥のえさ
  ['204184', 'bird-food'],
  // ── 小動物フード
  ['565702', 'small-animal-food'],
  ['565705', 'small-animal-food'],
  // ── 小動物用品
  ['565704', 'small-animal-goods'],
  // ── 熱帯魚えさ
  ['507542', 'fish-food'],
  ['507550', 'fish-food'],
  // ── 水槽・フィルター
  ['206305', 'fish-tank'],
  ['206311', 'fish-tank'],
  ['565726', 'fish-tank'],
  ['215405', 'fish-tank'],
  ['101217', 'fish-tank'],
  // ── 水槽用品・水草
  ['215403', 'fish-goods'],
  ['215400', 'fish-goods'],
  ['567261', 'fish-goods'],
  ['215425', 'fish-goods'],
  ['206322', 'fish-goods'],
  ['203100', 'fish-goods'],
  ['215402', 'fish-goods'],
  // ── 爬虫類えさ・用品
  ['560200', 'reptile-food'],
  ['101218', 'reptile-goods'],
  // ── 昆虫飼育
  ['509408', 'insect-goods'],
];

// 重複ジャンルID除去（最初のカテゴリを優先）
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

// ペット関連商品かどうかのフィルター
const PET_KEYWORDS = /犬|猫|ドッグ|キャット|ペット|わんこ|ニャン|パピー|シニア犬|シニア猫|インコ|オウム|文鳥|鳥|ハムスター|うさぎ|ウサギ|フェレット|モルモット|水槽|アクアリウム|熱帯魚|金魚|メダカ|爬虫類|カメ|トカゲ|カブトムシ|クワガタ|昆虫|ドッグフード|キャットフード|ペットシーツ|猫砂|キャットタワー|ハーネス|リード|首輪|グルーミング|ノミ|ダニ|デンタル|爪切り|ペットベッド|ケージ|フード 犬|フード 猫/;

function isPetProduct(name: string, category: string): boolean {
  // カテゴリが明確にペット系なら緩め
  if (['dog-food','cat-food','dog-snack','cat-snack','cat-toilet','cat-tower',
       'bird-food','bird-goods','small-animal-food','small-animal-goods',
       'fish-food','fish-tank','fish-goods','reptile-food','reptile-goods','insect-goods',
       'pet-sheets'].includes(category)) {
    // それでも明らかに無関係なものは除外（名前にペット系単語が全くない）
    // ただし水槽・アクア系は商品名が英語等もあるので緩く
    if (['fish-food','fish-tank','fish-goods','reptile-food','reptile-goods','insect-goods'].includes(category)) return true;
    return PET_KEYWORDS.test(name);
  }
  return PET_KEYWORDS.test(name);
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

async function fetchPage(genreId: string, page: number): Promise<{ items: RakutenItem[]; pageCount: number }> {
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
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  if (res.status === 429) {
    console.log('    ⚠ 429 レート制限 → 5秒待機');
    await sleep(5000);
    return fetchPage(genreId, page); // リトライ
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

async function upsertItems(items: RakutenItem[], category: string): Promise<number> {
  let count = 0;
  let skipped = 0;
  for (const item of items) {
    // ペット関係ない商品を除外
    if (!isPetProduct(item.itemName, category)) {
      skipped++;
      continue;
    }
    const imageRaw = item.mediumImageUrls?.[0] ?? null;
    const imageUrl = imageRaw ? imageRaw.replace('_ex=128x128', '_ex=400x400') : null;

    const { data: product, error } = await supabase
      .from('products')
      .upsert({
        rakuten_item_id: item.itemCode,
        name: item.itemName,
        category,
        pet_type: detectPetType(category),
        age_group: detectAgeGroup(item.itemName),
        brand: extractBrand(item.itemName) || null,
        image_url: imageUrl,
        item_url: item.itemUrl,
        affiliate_url: item.affiliateUrl || item.itemUrl,
        current_price: item.itemPrice,
        shop_name: item.shopName,
        review_count: item.reviewCount ?? 0,
        review_average: item.reviewAverage ?? 0,
        description: item.catchcopy || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'rakuten_item_id' })
      .select('id')
      .single();

    if (error) { console.error(`    upsert error: ${error.message}`); continue; }
    if (skipped > 0) { /* logged at end */ }
    if (product) {
      count++;
      await supabase.from('price_history').insert({
        product_id: product.id,
        price: item.itemPrice,
        shop_name: item.shopName,
      });
    }
  }
  return count;
}

// ━━━ メイン ━━━

async function main() {
  console.log('=== 楽天ペット商品 ジャンルID別全件取得 ===');
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

    const maxPage = Math.min(first.pageCount, 100);
    let genreTotal = await upsertItems(first.items, category);
    console.log(`  p1/${maxPage}: ${first.items.length}件`);

    for (let page = 2; page <= maxPage; page++) {
      await sleep(500);
      const { items } = await fetchPage(genreId, page);
      if (items.length === 0) break;
      genreTotal += await upsertItems(items, category);
      if (page % 20 === 0) {
        console.log(`  p${page}/${maxPage}: 累計${genreTotal.toLocaleString()}件`);
      }
    }

    grandTotal += genreTotal;
    console.log(`  ✓ 完了: ${genreTotal.toLocaleString()}件 (累計 ${grandTotal.toLocaleString()}件)`);
    await sleep(1000); // ジャンル間インターバル
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`全完了！ 総件数: ${grandTotal.toLocaleString()}件`);
  console.log(`終了: ${new Date().toLocaleString('ja-JP')}`);
}

main().catch(console.error);
