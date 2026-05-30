import { createClient } from '@supabase/supabase-js';
import { searchProducts } from '../lib/rakuten';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KEYWORDS = [
  // フード
  'ドッグフード',
  'キャットフード',
  'ウェットフード 猫',
  'ウェットフード 犬',
  'パピーフード',
  'シニア犬 フード',
  'シニア猫 フード',
  '犬おやつ',
  '猫おやつ',
  // トイレ用品
  '猫砂',
  'ペットシーツ',
  '猫 トイレ',
  // 犬グッズ
  'ハーネス 犬',
  'リード 犬',
  '首輪 犬',
  'ペットベッド 犬',
  '犬 おもちゃ',
  '犬 キャリーバッグ',
  // 猫グッズ
  'キャットタワー',
  '猫 おもちゃ',
  'ペットベッド 猫',
  '猫 爪とぎ',
  // ケア用品
  'ペットシャンプー 犬',
  'ペットシャンプー 猫',
  '犬 サプリ',
];

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

function detectCategory(keyword: string, name: string): string {
  if (/フード|おやつ|ウェット/.test(keyword) || /フード|おやつ/.test(name)) {
    if (/ドッグ|犬|パピー|シニア犬/.test(name) || /犬|ドッグ|パピー|シニア犬/.test(keyword)) return 'dog-food';
    if (/キャット|猫|シニア猫/.test(name) || /猫|キャット|シニア猫/.test(keyword)) return 'cat-food';
  }
  if (/ペットシーツ|ハーネス|リード|首輪|ベッド|おもちゃ|キャリー|シャンプー|サプリ/.test(keyword) && /犬/.test(keyword)) return 'dog-goods';
  if (/猫砂|キャットタワー|爪とぎ/.test(keyword) || (/猫|キャット/.test(keyword) && /ベッド|おもちゃ|トイレ|シャンプー/.test(keyword))) return 'cat-goods';
  if (/ペットシーツ/.test(keyword)) return 'dog-goods';
  return 'other';
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
