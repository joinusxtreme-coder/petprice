import { createClient } from '@supabase/supabase-js';
import { searchProducts } from '../lib/rakuten';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KEYWORDS = ['ドッグフード', 'キャットフード', '猫砂', 'ペットシーツ', '犬おやつ', '猫おやつ'];

function detectPetType(name: string): string {
  if (/ドッグ|犬|わんこ/i.test(name)) return 'dog';
  if (/キャット|猫|ねこ/i.test(name)) return 'cat';
  return 'other';
}

function detectAgeGroup(name: string): string {
  if (/パピー|子犬|子猫/i.test(name)) return 'puppy';
  if (/シニア|高齢|老犬|老猫/i.test(name)) return 'senior';
  return 'all';
}

function detectCategory(keyword: string, name: string): string {
  if (/フード|おやつ/.test(keyword) || /フード|おやつ/.test(name)) {
    if (/ドッグ|犬/.test(name) || keyword === 'ドッグフード' || keyword === '犬おやつ') return 'dog-food';
    if (/キャット|猫/.test(name) || keyword === 'キャットフード' || keyword === '猫おやつ') return 'cat-food';
  }
  if (keyword === 'ペットシーツ') return 'dog-goods';
  if (keyword === '猫砂') return 'cat-goods';
  return 'other';
}

async function main() {
  console.log('Starting Rakuten product fetch...');

  for (const keyword of KEYWORDS) {
    console.log(`Fetching: ${keyword}`);
    try {
      const items = await searchProducts(keyword);
      console.log(`  Got ${items.length} items`);

      for (const item of items) {
        const petType = detectPetType(item.itemName);
        const ageGroup = detectAgeGroup(item.itemName);
        const category = detectCategory(keyword, item.itemName);
        const imageUrl = item.mediumImageUrls?.[0]?.imageUrl || null;

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

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Error fetching ${keyword}:`, err);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
