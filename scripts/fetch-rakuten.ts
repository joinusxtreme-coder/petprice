import { createClient } from '@supabase/supabase-js';
import { searchProducts } from '../lib/rakuten';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 全楽天ペット商品を網羅する120+キーワード
const KEYWORD_CATEGORY: [string, string][] = [
  // ━━━━━ ドッグフード ━━━━━
  ['ドッグフード', 'dog-food'],
  ['ドライフード 犬', 'dog-food'],
  ['ウェットフード 犬', 'dog-food'],
  ['パピーフード 犬', 'dog-food'],
  ['シニア犬 フード', 'dog-food'],
  ['小型犬 ドッグフード', 'dog-food'],
  ['中型犬 ドッグフード', 'dog-food'],
  ['大型犬 ドッグフード', 'dog-food'],
  ['療法食 犬', 'dog-food'],
  ['無添加 ドッグフード', 'dog-food'],
  ['穀物不使用 ドッグフード', 'dog-food'],
  ['グレインフリー ドッグフード', 'dog-food'],
  ['国産 ドッグフード', 'dog-food'],
  ['ヒルズ サイエンスダイエット 犬', 'dog-food'],
  ['ロイヤルカナン 犬', 'dog-food'],
  ['ニュートロ ドッグフード', 'dog-food'],
  ['アカナ ドッグフード', 'dog-food'],
  ['オリジン ドッグフード', 'dog-food'],
  ['グランデリ ドッグフード', 'dog-food'],
  ['犬 缶詰 フード', 'dog-food'],
  ['犬 パウチ フード', 'dog-food'],
  ['犬 総合栄養食', 'dog-food'],
  ['ピュリナ ドッグチャウ', 'dog-food'],
  ['いなば 犬 フード', 'dog-food'],
  ['ドッグフード 低カロリー', 'dog-food'],
  ['ドッグフード 高タンパク', 'dog-food'],

  // ━━━━━ 犬のおやつ ━━━━━
  ['犬おやつ', 'dog-snack'],
  ['ドッグおやつ', 'dog-snack'],
  ['犬 ジャーキー', 'dog-snack'],
  ['犬 デンタルガム', 'dog-snack'],
  ['犬 ガム おやつ', 'dog-snack'],
  ['犬 おやつ 無添加', 'dog-snack'],
  ['犬 おやつ 国産', 'dog-snack'],
  ['犬 おやつ クッキー', 'dog-snack'],
  ['犬 おやつ 骨', 'dog-snack'],
  ['犬 ヘルシースナック', 'dog-snack'],
  ['犬 ビスケット おやつ', 'dog-snack'],

  // ━━━━━ お散歩用品 ━━━━━
  ['ハーネス 犬', 'dog-walk'],
  ['リード 犬', 'dog-walk'],
  ['首輪 犬', 'dog-walk'],
  ['伸縮リード 犬', 'dog-walk'],
  ['犬 ハーネス 小型犬', 'dog-walk'],
  ['犬 胴輪', 'dog-walk'],
  ['犬 散歩 リュック', 'dog-walk'],
  ['犬 散歩 ポーチ', 'dog-walk'],
  ['犬 マナーウェア', 'dog-walk'],

  // ━━━━━ 犬のケア用品 ━━━━━
  ['ペットシャンプー 犬', 'dog-care'],
  ['犬 サプリメント', 'dog-care'],
  ['犬 歯ブラシ デンタル', 'dog-care'],
  ['犬 ブラシ グルーミング', 'dog-care'],
  ['犬 爪切り ペット', 'dog-care'],
  ['犬 耳掃除 イヤークリーナー', 'dog-care'],
  ['犬 コンディショナー リンス', 'dog-care'],
  ['犬 健康管理 サプリ', 'dog-care'],
  ['犬 防虫 ノミダニ', 'dog-care'],
  ['犬 目薬 点眼', 'dog-care'],

  // ━━━━━ 犬用品 ━━━━━
  ['ペットベッド 犬', 'dog-goods'],
  ['犬 おもちゃ', 'dog-goods'],
  ['犬 キャリーバッグ', 'dog-goods'],
  ['犬 ケージ サークル', 'dog-goods'],
  ['犬 食器 ボウル', 'dog-goods'],
  ['犬 自動給水器', 'dog-goods'],
  ['犬 服 ウェア', 'dog-goods'],
  ['犬 レインコート', 'dog-goods'],
  ['犬小屋 ハウス', 'dog-goods'],
  ['犬 マット クッション', 'dog-goods'],
  ['犬 トイレトレー', 'dog-goods'],
  ['犬 おむつ マナーパンツ', 'dog-goods'],

  // ━━━━━ キャットフード ━━━━━
  ['キャットフード', 'cat-food'],
  ['ウェットフード 猫', 'cat-food'],
  ['シニア猫 フード', 'cat-food'],
  ['子猫 フード キトン', 'cat-food'],
  ['療法食 猫', 'cat-food'],
  ['猫 ドライフード', 'cat-food'],
  ['猫 缶詰 フード', 'cat-food'],
  ['猫 パウチ フード', 'cat-food'],
  ['猫 総合栄養食', 'cat-food'],
  ['猫 フード 国産', 'cat-food'],
  ['猫 フード 無添加', 'cat-food'],
  ['猫 フード 穀物不使用', 'cat-food'],
  ['猫 グレインフリー フード', 'cat-food'],
  ['ロイヤルカナン 猫', 'cat-food'],
  ['ヒルズ キャットフード', 'cat-food'],
  ['ニュートロ キャットフード', 'cat-food'],
  ['モグニャン キャットフード', 'cat-food'],
  ['猫 フード 尿路ケア', 'cat-food'],
  ['猫 フード インドア', 'cat-food'],
  ['猫 フード 毛玉ケア', 'cat-food'],
  ['猫 フード 高齢猫', 'cat-food'],
  ['ピュリナ ワン 猫', 'cat-food'],
  ['いなば 猫 フード', 'cat-food'],
  ['フリスキー キャットフード', 'cat-food'],
  ['カルカン キャットフード', 'cat-food'],

  // ━━━━━ 猫のおやつ ━━━━━
  ['猫おやつ', 'cat-snack'],
  ['猫 おやつ ちゅーる', 'cat-snack'],
  ['猫 おやつ ちゅ〜る', 'cat-snack'],
  ['INABA ちゅーる 猫', 'cat-snack'],
  ['猫 おやつ 無添加', 'cat-snack'],
  ['猫 おやつ パウチ', 'cat-snack'],
  ['猫 スナック トリーツ', 'cat-snack'],
  ['猫 おやつ 歯磨き', 'cat-snack'],
  ['猫 おやつ 国産', 'cat-snack'],

  // ━━━━━ トイレ・猫砂 ━━━━━
  ['猫砂', 'cat-toilet'],
  ['猫 トイレ', 'cat-toilet'],
  ['猫砂 鉱物系', 'cat-toilet'],
  ['猫砂 木系 ウッド', 'cat-toilet'],
  ['猫砂 紙系', 'cat-toilet'],
  ['猫砂 おから', 'cat-toilet'],
  ['猫砂 シリカゲル', 'cat-toilet'],
  ['システムトイレ 猫', 'cat-toilet'],
  ['猫 トイレ 本体', 'cat-toilet'],
  ['猫砂 大容量 業務用', 'cat-toilet'],
  ['猫 トイレ 砂取りマット', 'cat-toilet'],
  ['猫 消臭 トイレ砂', 'cat-toilet'],

  // ━━━━━ キャットタワー ━━━━━
  ['キャットタワー', 'cat-tower'],
  ['猫 爪とぎ', 'cat-tower'],
  ['キャットウォーク', 'cat-tower'],
  ['猫 タワー 大型', 'cat-tower'],
  ['猫 タワー 突っ張り', 'cat-tower'],
  ['猫 爪とぎ 段ボール', 'cat-tower'],
  ['猫 爪とぎ 麻', 'cat-tower'],
  ['キャットポール 猫', 'cat-tower'],

  // ━━━━━ 猫のケア用品 ━━━━━
  ['ペットシャンプー 猫', 'cat-care'],
  ['猫 ブラシ グルーミング', 'cat-care'],
  ['猫 歯ブラシ デンタル', 'cat-care'],
  ['猫 爪切り ネイルカッター', 'cat-care'],
  ['猫 サプリメント', 'cat-care'],
  ['猫 グルーミング スプレー', 'cat-care'],
  ['猫 ノミダニ 駆除', 'cat-care'],
  ['猫 目薬 涙やけ', 'cat-care'],

  // ━━━━━ 猫用品 ━━━━━
  ['ペットベッド 猫', 'cat-goods'],
  ['猫 おもちゃ', 'cat-goods'],
  ['猫 キャリーバッグ', 'cat-goods'],
  ['猫 食器 ボウル', 'cat-goods'],
  ['猫 自動給水器', 'cat-goods'],
  ['猫 ハウス ドーム', 'cat-goods'],
  ['猫 ケージ 室内', 'cat-goods'],
  ['猫 ハンモック', 'cat-goods'],
  ['猫 おもちゃ 電動 自動', 'cat-goods'],
  ['猫 マット クッション', 'cat-goods'],

  // ━━━━━ ペットシーツ ━━━━━
  ['ペットシーツ', 'pet-sheets'],
  ['ペットシーツ ワイド', 'pet-sheets'],
  ['ペットシーツ 厚型 スーパー', 'pet-sheets'],
  ['ペットシーツ スーパーワイド', 'pet-sheets'],
  ['ペットシーツ 業務用 大容量', 'pet-sheets'],
  ['犬 おしっこシート トイレシート', 'pet-sheets'],
  ['ペットシーツ 消臭 抗菌', 'pet-sheets'],
  ['ペットシーツ レギュラー 薄型', 'pet-sheets'],
  ['ペットシーツ ダブルストップ', 'pet-sheets'],
];

const KEYWORDS = KEYWORD_CATEGORY.map(([kw]) => kw);
const KEYWORD_TO_CATEGORY = new Map(KEYWORD_CATEGORY);

function detectPetType(name: string, keyword: string): string {
  if (/ドッグ|犬|わんこ|パピー|ワンちゃん/.test(name) || /犬|ドッグ|パピー/.test(keyword)) return 'dog';
  if (/キャット|猫|ねこ|ニャン/.test(name) || /猫|キャット/.test(keyword)) return 'cat';
  return 'other';
}

function detectAgeGroup(name: string): string {
  if (/パピー|子犬|子猫|キトン|幼/.test(name)) return 'puppy';
  if (/シニア|高齢|老犬|老猫|11歳|12歳|13歳|7歳以上/.test(name)) return 'senior';
  return 'all';
}

function detectCategory(keyword: string): string {
  return KEYWORD_TO_CATEGORY.get(keyword) || 'other';
}

// ブランド抽出（商品名から）
function extractBrand(name: string): string {
  const brands = [
    'ロイヤルカナン', 'ヒルズ', 'ニュートロ', 'アカナ', 'オリジン',
    'グランデリ', 'グラン・デリ', 'サイエンスダイエット', 'ピュリナ',
    'いなば', 'INABA', 'モグニャン', 'フリスキー', 'カルカン',
    'ネスレ', 'メディコート', 'シュプレモ', 'ナチュラルチョイス',
    'プリスクリプション', 'デオトイレ', 'ニャンとも', 'ファーミネーター',
    'アイリスオーヤマ', 'ライオン', '花王', 'ユニチャーム',
    'ペットキッス', 'IAMS', 'アイムス',
  ];
  for (const brand of brands) {
    if (name.includes(brand)) return brand;
  }
  return '';
}

async function main() {
  console.log('Starting Rakuten product fetch...');
  console.log(`Total keywords: ${KEYWORDS.length}`);
  let totalUpserted = 0;

  for (const keyword of KEYWORDS) {
    console.log(`\nFetching: "${keyword}"`);
    for (let page = 1; page <= 10; page++) {
      try {
        const items = await searchProducts(keyword, page);
        if (items.length === 0) {
          console.log(`  Page ${page}: 0 items (stop)`);
          break;
        }
        console.log(`  Page ${page}: ${items.length} items`);

        for (const item of items) {
          const petType = detectPetType(item.itemName, keyword);
          const ageGroup = detectAgeGroup(item.itemName);
          const category = detectCategory(keyword);
          const rawImageUrl = item.mediumImageUrls?.[0] || null;
          const imageUrl = rawImageUrl ? rawImageUrl.replace('_ex=128x128', '_ex=400x400') : null;
          const brand = extractBrand(item.itemName);

          const productData = {
            rakuten_item_id: item.itemCode,
            name: item.itemName,
            category,
            pet_type: petType,
            age_group: ageGroup,
            brand: brand || null,
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
            if (historyError && !historyError.message.includes('duplicate')) {
              console.error(`  Error inserting price history:`, historyError.message);
            }
          }
        }

        // Rakuten API レート制限対応
        await new Promise((r) => setTimeout(r, 600));
      } catch (err) {
        console.error(`Error fetching "${keyword}" page ${page}:`, err);
        break;
      }
    }
    // キーワード間の待機
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\nDone! Total upserted: ${totalUpserted}`);
}

main().catch(console.error);
