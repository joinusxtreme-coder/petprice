/**
 * 不足カテゴリ補充スクリプト
 * 猫おやつ・猫ケア・鳥用品・小動物用品の追加ジャンルを取得
 */
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

// 新規追加ジャンルのみ
const NEW_GENRES: [string, string][] = [
  ['206345', 'cat-snack'],   // 猫おやつ 5,006件
  ['409780', 'cat-snack'],   // 猫おやつ2 728件
  ['404151', 'cat-care'],    // 猫ケア 1,238件
  ['215355', 'cat-care'],    // 猫ケア2 4,903件
  ['206350', 'cat-care'],    // 猫グルーミング 24,945件
  ['204185', 'bird-goods'],  // 鳥用品 10,870件
  ['565706', 'bird-food'],   // 鳥おやつ 1,847件
  ['565703', 'small-animal-goods'], // 小動物用品 4,149件
];

const PET_KEYWORDS = /犬|猫|ドッグ|キャット|ペット|インコ|オウム|文鳥|鳥|ハムスター|うさぎ|ウサギ|フェレット|モルモット|水槽|アクアリウム|熱帯魚|金魚|メダカ|爬虫類|カメ|トカゲ|カブトムシ|クワガタ|昆虫|ドッグフード|キャットフード|ペットシーツ|猫砂|キャットタワー|ハーネス|リード|首輪|グルーミング|ノミ|ダニ|デンタル|爪切り|ペットベッド|ケージ|フード 犬|フード 猫/;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function isPetProduct(name: string, category: string): boolean {
  if (['cat-snack','cat-care','bird-food','bird-goods','small-animal-goods'].includes(category)) {
    return PET_KEYWORDS.test(name) || true; // 猫ケア・鳥は全部対象
  }
  return PET_KEYWORDS.test(name);
}

function detectPetType(category: string): string {
  if (category.startsWith('dog')) return 'dog';
  if (category.startsWith('cat')) return 'cat';
  if (category.startsWith('bird')) return 'bird';
  if (category.startsWith('small')) return 'small';
  return 'other';
}

function detectAgeGroup(name: string): string {
  if (/パピー|子犬|子猫|キトン|幼/.test(name)) return 'puppy';
  if (/シニア|高齢|老犬|老猫|7歳|11歳|12歳/.test(name)) return 'senior';
  return 'all';
}

const BRANDS = ['ロイヤルカナン','ヒルズ','ニュートロ','アカナ','いなば','INABA','カルカン','ユニチャーム','アイリスオーヤマ','ライオン'];
function extractBrand(name: string): string {
  for (const b of BRANDS) if (name.includes(b)) return b;
  return '';
}

async function fetchPage(genreId: string, page: number): Promise<{ items: any[]; pageCount: number }> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '',
    genreId, hits: '30', page: String(page),
    sort: '-reviewCount', formatVersion: '2',
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  if (res.status === 429) {
    console.log('    ⚠ 429 → 5秒待機');
    await sleep(5000);
    return fetchPage(genreId, page);
  }
  if (!res.ok) return { items: [], pageCount: 0 };
  try {
    const data = await res.json();
    return { items: data.Items || [], pageCount: data.pageCount || 0 };
  } catch { return { items: [], pageCount: 0 }; }
}

async function upsertItems(items: any[], category: string): Promise<number> {
  let count = 0;
  for (const item of items) {
    if (!isPetProduct(item.itemName, category)) continue;
    const imageUrl = item.mediumImageUrls?.[0]?.replace('_ex=128x128', '_ex=400x400') ?? null;
    const { data: product, error } = await supabase.from('products').upsert({
      rakuten_item_id: item.itemCode,
      name: item.itemName, category,
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
    if (!error && product) {
      count++;
      await supabase.from('price_history').insert({
        product_id: product.id, price: item.itemPrice, shop_name: item.shopName,
      });
    }
  }
  return count;
}

async function main() {
  console.log('=== 不足ジャンル追加フェッチ ===');
  let grandTotal = 0;
  for (const [genreId, category] of NEW_GENRES) {
    console.log(`\ngenreId=${genreId} → ${category}`);
    const first = await fetchPage(genreId, 1);
    if (!first.items.length) { console.log('  0件'); continue; }
    const maxPage = Math.min(first.pageCount, 100);
    let total = await upsertItems(first.items, category);
    console.log(`  p1/${maxPage}: ${first.items.length}件 → ${total}件追加`);
    for (let p = 2; p <= maxPage; p++) {
      await sleep(500);
      const { items } = await fetchPage(genreId, p);
      if (!items.length) break;
      total += await upsertItems(items, category);
      if (p % 10 === 0) console.log(`  p${p}/${maxPage}: 累計${total}件`);
    }
    grandTotal += total;
    console.log(`  ✓ ${total.toLocaleString()}件 (累計 ${grandTotal.toLocaleString()}件)`);
    await sleep(1000);
  }
  console.log(`\n完了！総追加: ${grandTotal.toLocaleString()}件`);
}

main().catch(console.error);
