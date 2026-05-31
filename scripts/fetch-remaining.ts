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

// fetch-missing.ts の未完了分 + 主要カテゴリの残り
const GENRE_CATEGORY: [string, string][] = [
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
  // ── 爬虫類えさ・用品
  ['560200', 'reptile-food'],
  ['101218', 'reptile-goods'],
  // ── 昆虫飼育
  ['509408', 'insect-goods'],
];

const PET_KEYWORDS = /犬|猫|ドッグ|キャット|ペット|わんこ|ニャン|パピー|シニア犬|シニア猫|インコ|オウム|文鳥|鳥|ハムスター|うさぎ|ウサギ|フェレット|モルモット|水槽|アクアリウム|熱帯魚|金魚|メダカ|グッピー|コリドラス|爬虫類|カメ|トカゲ|ヘビ|カエル|カブトムシ|クワガタ|昆虫|ドッグフード|キャットフード|ペットシーツ|猫砂|キャットタワー|ハーネス|リード|首輪|グルーミング|ノミ|ダニ|デンタル|爪切り|ペットベッド/;

function isPetProduct(name: string, category: string): boolean {
  // アクア・爬虫類・昆虫系は商品名チェック不要（ジャンルが明確）
  if (['fish-food','fish-tank','fish-goods','reptile-food','reptile-goods','insect-goods'].includes(category)) return true;
  return PET_KEYWORDS.test(name);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

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

const BRANDS = ['ロイヤルカナン','ヒルズ','ニュートロ','アカナ','オリジン','グランデリ','サイエンスダイエット','ピュリナ','いなば','INABA','モグニャン','フリスキー','カルカン','メディコート','ユニチャーム','アイリスオーヤマ','ライオン','花王','ペットキッス','IAMS','アイムス','デオトイレ','ニャンとも','ファーミネーター'];
function extractBrand(name: string): string {
  for (const b of BRANDS) if (name.includes(b)) return b;
  return '';
}

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
    console.log('    ⚠ 429 → 5秒待機');
    await sleep(5000);
    return fetchPage(genreId, page);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`    API error ${res.status}: ${body.slice(0, 100)}`);
    return { items: [], pageCount: 0 };
  }
  let data: { Items?: RakutenItem[]; pageCount?: number };
  try {
    data = await res.json();
  } catch {
    console.error(`    JSON parse error (page ${page}) → skip`);
    return { items: [], pageCount: 0 };
  }
  return { items: data.Items || [], pageCount: data.pageCount || 0 };
}

async function upsertItems(items: RakutenItem[], category: string): Promise<number> {
  let count = 0;
  for (const item of items) {
    if (!isPetProduct(item.itemName, category)) continue;
    const imageRaw = item.mediumImageUrls?.[0] ?? null;
    const imageUrl = imageRaw ? imageRaw.replace('_ex=128x128', '_ex=400x400') : null;
    const { data: product, error } = await supabase.from('products').upsert({
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
    }, { onConflict: 'rakuten_item_id' }).select('id').single();
    if (error) continue;
    if (product) {
      count++;
      await supabase.from('price_history').insert({ product_id: product.id, price: item.itemPrice, shop_name: item.shopName });
    }
  }
  return count;
}

async function main() {
  console.log('=== 残カテゴリ補完フェッチ ===');
  const seen = new Set<string>();
  const unique = GENRE_CATEGORY.filter(([id]) => { if (seen.has(id)) return false; seen.add(id); return true; });
  let grandTotal = 0;
  let idx = 0;
  for (const [genreId, category] of unique) {
    idx++;
    console.log(`\n[${idx}/${unique.length}] genreId=${genreId} → ${category}`);
    const first = await fetchPage(genreId, 1);
    if (first.items.length === 0) { console.log('  0件'); continue; }
    const maxPage = Math.min(first.pageCount, 34);
    let genreTotal = await upsertItems(first.items, category);
    for (let page = 2; page <= maxPage; page++) {
      await sleep(600);
      const { items } = await fetchPage(genreId, page);
      if (items.length === 0) break;
      genreTotal += await upsertItems(items, category);
    }
    grandTotal += genreTotal;
    console.log(`  ✓ ${genreTotal}件 (累計 ${grandTotal}件)`);
    await sleep(1000);
  }
  console.log(`\n完了: 総${grandTotal}件`);
}

main().catch(console.error);
