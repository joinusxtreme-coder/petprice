import { createClient } from '@supabase/supabase-js';
import { searchProducts } from '../lib/rakuten';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// keyword → category のマッピング
const KEYWORD_CATEGORY: [string, string][] = [
  // ドッグフード
  ['ドッグフード',      'dog-food'],
  ['ウェットフード 犬', 'dog-food'],
  ['パピーフード',      'dog-food'],
  ['シニア犬 フード',   'dog-food'],
  // 犬おやつ
  ['犬おやつ',         'dog-snack'],
  ['ドッグおやつ',     'dog-snack'],
  ['犬 ジャーキー',    'dog-snack'],
  // お散歩用品
  ['ハーネス 犬',      'dog-walk'],
  ['リード 犬',        'dog-walk'],
  ['首輪 犬',          'dog-walk'],
  // 犬のケア
  ['ペットシャンプー 犬', 'dog-care'],
  ['犬 サプリ',        'dog-care'],
  ['犬 歯ブラシ',      'dog-care'],
  // 犬用品
  ['ペットベッド 犬',  'dog-goods'],
  ['犬 おもちゃ',      'dog-goods'],
  ['犬 キャリーバッグ','dog-goods'],
  ['犬 ケージ',        'dog-goods'],
  // キャットフード
  ['キャットフード',   'cat-food'],
  ['ウェットフード 猫','cat-food'],
  ['シニア猫 フード',  'cat-food'],
  ['子猫 フード',      'cat-food'],
  // 猫おやつ
  ['猫おやつ',         'cat-snack'],
  ['猫 おやつ ちゅーる','cat-snack'],
  ['猫 おやつ ちゅ〜る','cat-snack'],
  // トイレ・猫砂
  ['猫砂',             'cat-toilet'],
  ['猫 トイレ',        'cat-toilet'],
  ['猫砂 鉱物',        'cat-toilet'],
  ['猫砂 木',          'cat-toilet'],
  // キャットタワー
  ['キャットタワー',   'cat-tower'],
  ['猫 爪とぎ',        'cat-tower'],
  ['キャットウォーク', 'cat-tower'],
  // 猫のケア
  ['ペットシャンプー 猫','cat-care'],
  ['猫 ブラシ',        'cat-care'],
  // 猫用品
  ['ペットベッド 猫',  'cat-goods'],
  ['猫 おもちゃ',      'cat-goods'],
  ['猫 キャリーバッグ','cat-goods'],
  // ペットシーツ
  ['ペットシーツ',     'pet-sheets'],
  ['ペットシーツ ワイド','pet-sheets'],
  ['ペットシーツ 厚型', 'pet-sheets'],
];

const KEYWORDS = KEYWORD_CATEGORY.map(([kw]) => kw);

function detectPetType(name: string, keyword: string): string {
  if (/ドッグ|犬|わんこ|パピー/.test(name) || /犬|ドッグ|パピー/.test(keyword)) return 'dog';
  if (/キャット|猫|ねこ/.test(name) || /猫|キャット/.test(keyword)) return 'cat';
  return 'other';
}

function detectAgeGroup(name: string): string {
  if (/パピー|子犬|子猫/.test(name)) return 'puppy';
  if (/シニア|高齢|老犬|老猫/.test(name)) return 'senior';
  return 'all';
}

// keyword → category マップ（実行時に構築）
const KEYWORD_TO_CATEGORY = new Map(KEYWORD_CATEGORY);

function detectCategory(keyword: string, _name: string): string {
  return KEYWORD_TO_CATEGORY.get(keyword) || 'other';
}

async function main() {
  console.log('Starting Rakuten product fetch...');
  let totalUpserted = 0;

  for (const keyword of KEYWORDS) {
    console.log(`\nFetching: ${keyword}`);
    for (let page = 1; page <= 3; page++) {
      try {
        const items = await searchProducts(keyword, page);
        if (items.length === 0) break;
        console.log(`  Page ${page}: ${items.length} items`);

        for (const item of items) {
          const petType = detectPetType(item.itemName, keyword);
          const ageGroup = detectAgeGroup(item.itemName);
          const category = detectCategory(keyword, item.itemName);
          const rawImageUrl = item.mediumImageUrls?.[0] || null;
          const imageUrl = rawImageUrl ? rawImageUrl.replace('_ex=128x128', '_ex=400x400') : null;

          const productData = {
            rakuten_item_id: item.itemCode,
            name: item.itemName,
            category,
            pet_type: petType,
            age_group: ageGroup,
            image_url: imageUrl,
            item_url: item.itemUrl,
            affiliate_url: item.affiliateUrl || item.itemUrl,
            current_price: item.itemPrice,
            shop_name: item.shopName,
            review_count: item.reviewCount || 0,
            review_average: item.reviewAverage || 0,
            updated_at: new Date().toISOString(),
          };

          const { data: product, error: upsertError } = await supabase
            .from('products')
            .upsert(productData, { onConflict: 'rakuten_item_id' })
            .select('id')
            .single();

          if (upsertError) {
            console.error(`  Error upserting ${item.itemCode}:`, upsertError.message);
            continue;
          }

          if (product) {
            totalUpserted++;
            const { error: historyError } = await supabase.from('price_history').insert({
              product_id: product.id,
              price: item.itemPrice,
              shop_name: item.shopName,
            });
            if (historyError) {
              console.error(`  Error inserting price history:`, historyError.message);
            }
          }
        }

        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error fetching ${keyword} page ${page}:`, err);
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\nDone! Total upserted: ${totalUpserted}`);
}

main().catch(console.error);
