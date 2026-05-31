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

  // ━━━━━ 犬食器・給水器 ━━━━━
  ['犬 食器 ボウル フードボウル', 'dog-feeder'],
  ['犬 自動給水器 ウォーターファウンテン', 'dog-feeder'],
  ['犬 食器台 フードスタンド', 'dog-feeder'],
  ['犬 食器 ステンレス', 'dog-feeder'],
  ['ペット 給水ボトル 犬', 'dog-feeder'],

  // ━━━━━ 犬トイレ ━━━━━
  ['犬 トイレトレー ペット', 'dog-toilet'],
  ['犬 トイレ 囲い 壁付き', 'dog-toilet'],
  ['犬 トイレ しつけ', 'dog-toilet'],
  ['ペット トイレ 消臭 犬', 'dog-toilet'],

  // ━━━━━ 犬服 ━━━━━
  ['犬服 ドッグウェア', 'dog-clothes'],
  ['犬 レインコート 雨具', 'dog-clothes'],
  ['犬 セーター ニット', 'dog-clothes'],
  ['犬 Tシャツ タンクトップ', 'dog-clothes'],
  ['犬 パーカー コート', 'dog-clothes'],
  ['小型犬 服 ウェア', 'dog-clothes'],

  // ━━━━━ 犬おもちゃ ━━━━━
  ['犬 おもちゃ ロープ ぬいぐるみ', 'dog-toy'],
  ['犬 おもちゃ 電動 自動', 'dog-toy'],
  ['犬 おもちゃ ボール', 'dog-toy'],
  ['犬 噛む おもちゃ コング', 'dog-toy'],
  ['犬 おもちゃ 知育 パズル', 'dog-toy'],

  // ━━━━━ 犬キャリー ━━━━━
  ['犬 キャリーバッグ ペット', 'dog-carrier'],
  ['犬 リュック キャリー', 'dog-carrier'],
  ['犬 スリング バッグ', 'dog-carrier'],
  ['犬 ペットカート バギー', 'dog-carrier'],

  // ━━━━━ 猫食器・給水器 ━━━━━
  ['猫 食器 ボウル', 'cat-feeder'],
  ['猫 自動給水器', 'cat-feeder'],
  ['猫 食器 陶器 セラミック', 'cat-feeder'],
  ['猫 食器台 スタンド', 'cat-feeder'],

  // ━━━━━ 猫おもちゃ ━━━━━
  ['猫 おもちゃ 電動 自動', 'cat-toy'],
  ['猫 おもちゃ じゃらし 羽', 'cat-toy'],
  ['猫 おもちゃ ボール ねずみ', 'cat-toy'],
  ['猫 おもちゃ レーザー', 'cat-toy'],
  ['猫じゃらし おもちゃ', 'cat-toy'],

  // ━━━━━ 猫キャリー ━━━━━
  ['猫 キャリーバッグ', 'cat-carrier'],
  ['猫 キャリーケース ハードタイプ', 'cat-carrier'],
  ['猫 リュック キャリー', 'cat-carrier'],
  ['猫 バスケット 洗える', 'cat-carrier'],

  // ━━━━━ その他ペットトイレ ━━━━━
  ['ペット トイレ消臭 スプレー', 'pet-toilet'],
  ['ペット 消臭剤 トイレ', 'pet-toilet'],

  // ━━━━━ 鳥のえさ ━━━━━
  ['鳥 えさ 餌 インコ', 'bird-food'],
  ['オウム えさ ペレット', 'bird-food'],
  ['文鳥 えさ シード', 'bird-food'],
  ['インコ フード ペレット', 'bird-food'],
  ['小鳥 えさ 混合シード', 'bird-food'],
  ['鳥 おやつ フルーツ', 'bird-food'],

  // ━━━━━ 鳥かご・ケージ ━━━━━
  ['鳥かご インコ ケージ', 'bird-goods'],
  ['バードケージ 鳥 ゲージ', 'bird-goods'],
  ['インコ 放鳥 おもちゃ', 'bird-goods'],
  ['鳥 止まり木 パーチ', 'bird-goods'],
  ['インコ 水浴び 容器', 'bird-goods'],
  ['鳥 ブランコ おもちゃ', 'bird-goods'],
  ['鳥 巣箱 ハウス', 'bird-goods'],

  // ━━━━━ 小動物フード ━━━━━
  ['ハムスター えさ フード', 'small-animal-food'],
  ['うさぎ ペレット 牧草', 'small-animal-food'],
  ['フェレット フード えさ', 'small-animal-food'],
  ['モルモット えさ フード', 'small-animal-food'],
  ['チンチラ えさ フード', 'small-animal-food'],
  ['小動物 おやつ フード', 'small-animal-food'],
  ['うさぎ おやつ', 'small-animal-food'],

  // ━━━━━ 小動物用品 ━━━━━
  ['ハムスター ケージ 飼育セット', 'small-animal-goods'],
  ['うさぎ ケージ うさぎ用品', 'small-animal-goods'],
  ['ハムスター 回し車 回転', 'small-animal-goods'],
  ['小動物 砂浴び 砂', 'small-animal-goods'],
  ['うさぎ トイレ 飼育', 'small-animal-goods'],
  ['ハムスター 巣箱 ハウス', 'small-animal-goods'],
  ['フェレット ケージ ハンモック', 'small-animal-goods'],

  // ━━━━━ 熱帯魚・アクアリウム用エサ ━━━━━
  ['熱帯魚 えさ フレーク', 'fish-food'],
  ['金魚 えさ 餌', 'fish-food'],
  ['メダカ えさ 餌', 'fish-food'],
  ['グッピー えさ 熱帯魚フード', 'fish-food'],
  ['コリドラス えさ タブレット', 'fish-food'],
  ['亀 えさ レプトミン', 'fish-food'],

  // ━━━━━ 水槽・照明・フィルター ━━━━━
  ['水槽 アクアリウム セット', 'fish-tank'],
  ['水槽 LEDライト 照明', 'fish-tank'],
  ['外部フィルター アクアリウム', 'fish-tank'],
  ['上部フィルター 水槽', 'fish-tank'],
  ['水槽 小型 金魚鉢', 'fish-tank'],
  ['エアポンプ ブクブク 水槽', 'fish-tank'],
  ['水槽 ヒーター サーモスタット', 'fish-tank'],

  // ━━━━━ 水槽用品・水草 ━━━━━
  ['水草 アクアリウム 人工', 'fish-goods'],
  ['底砂 ソイル アクアリウム', 'fish-goods'],
  ['水槽 流木 石 レイアウト', 'fish-goods'],
  ['カルキ抜き 水質調整剤', 'fish-goods'],
  ['水槽 コケ取り 掃除', 'fish-goods'],
  ['水温計 デジタル 水槽', 'fish-goods'],

  // ━━━━━ 爬虫類・両生類用エサ ━━━━━
  ['爬虫類 えさ 人工フード', 'reptile-food'],
  ['カメ えさ フード', 'reptile-food'],
  ['トカゲ えさ コオロギ', 'reptile-food'],
  ['ヘビ えさ 冷凍マウス', 'reptile-food'],
  ['カエル えさ フード', 'reptile-food'],

  // ━━━━━ 爬虫類・両生類飼育用品 ━━━━━
  ['爬虫類 ケージ テラリウム', 'reptile-goods'],
  ['爬虫類 紫外線ライト UVB', 'reptile-goods'],
  ['爬虫類 保温球 ヒーター', 'reptile-goods'],
  ['爬虫類 温湿度計 パネルヒーター', 'reptile-goods'],
  ['カメ 飼育 水槽セット', 'reptile-goods'],
  ['爬虫類 床材 ウッドチップ', 'reptile-goods'],

  // ━━━━━ 昆虫飼育用品 ━━━━━
  ['カブトムシ 飼育 ケース', 'insect-goods'],
  ['クワガタ 飼育 ケース 幼虫', 'insect-goods'],
  ['昆虫マット 腐葉土 カブトムシ', 'insect-goods'],
  ['昆虫 ゼリー エサ カブトムシ', 'insect-goods'],
  ['昆虫 飼育ケース コンテナ', 'insect-goods'],
  ['カブトムシ 産卵 繁殖 マット', 'insect-goods'],
];

const KEYWORDS = KEYWORD_CATEGORY.map(([kw]) => kw);
const KEYWORD_TO_CATEGORY = new Map(KEYWORD_CATEGORY);

function detectPetType(name: string, keyword: string): string {
  if (/ドッグ|犬|わんこ|パピー|ワンちゃん/.test(name) || /犬|ドッグ|パピー/.test(keyword)) return 'dog';
  if (/キャット|猫|ねこ|ニャン/.test(name) || /猫|キャット/.test(keyword)) return 'cat';
  if (/インコ|オウム|文鳥|鳥|バード/.test(name) || /鳥|インコ|バード/.test(keyword)) return 'bird';
  if (/ハムスター|うさぎ|ウサギ|フェレット|モルモット|チンチラ|小動物/.test(name) || /ハムスター|うさぎ|小動物/.test(keyword)) return 'small';
  if (/熱帯魚|金魚|メダカ|グッピー|アクアリウム|水槽/.test(name) || /熱帯魚|金魚|メダカ|水槽/.test(keyword)) return 'fish';
  if (/爬虫類|カメ|トカゲ|ヘビ|カエル|両生類/.test(name) || /爬虫類|カメ|トカゲ/.test(keyword)) return 'reptile';
  if (/カブトムシ|クワガタ|昆虫/.test(name) || /昆虫|カブトムシ|クワガタ/.test(keyword)) return 'insect';
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
