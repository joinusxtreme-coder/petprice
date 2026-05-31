import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RAKUTEN_API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
const GENRE_API  = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaGenre/Search/20220601';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 楽天ペットジャンルID → サイトカテゴリ のマッピング
// 101213 = ペット用品 トップ（子ジャンルを動的取得してページング）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GENRE_CATEGORY_MAP: Record<string, string> = {
  // ── 犬用品 ──
  '101214': 'dog-food',      // ドッグフード
  '101240': 'dog-snack',     // 犬のおやつ
  '566948': 'dog-feeder',    // 食器・給水器(犬)
  '101221': 'dog-toilet',    // トイレ用品(犬)
  '101218': 'dog-walk',      // リード・ハーネス・首輪
  '101216': 'dog-care',      // ケア・グルーミング(犬)
  '566942': 'dog-clothes',   // ドッグウェア
  '566944': 'dog-toy',       // 犬のおもちゃ
  '101217': 'dog-goods',     // ケージ・ベッド・ハウス
  '566946': 'dog-carrier',   // キャリーバッグ(犬)
  // ── 猫用品 ──
  '101228': 'cat-food',      // キャットフード
  '101241': 'cat-snack',     // 猫のおやつ
  '566955': 'cat-feeder',    // 食器・給水器(猫)
  '101234': 'cat-toilet',    // トイレ・猫砂
  '101232': 'cat-tower',     // キャットタワー・爪とぎ
  '101230': 'cat-care',      // ケア・グルーミング(猫)
  '566957': 'cat-toy',       // 猫のおもちゃ
  '101231': 'cat-goods',     // ベッド・マット
  '566959': 'cat-carrier',   // キャリーバッグ(猫)
  // ── 共通 ──
  '101222': 'pet-sheets',    // ペットシーツ
  '566961': 'pet-toilet',    // その他トイレ用品
  // ── 鳥・小動物 ──
  '101243': 'bird-food',     // 鳥のえさ
  '101244': 'bird-goods',    // 鳥かご・用品
  '101246': 'small-animal-food',   // 小動物フード
  '101247': 'small-animal-goods',  // 小動物用品
  // ── 熱帯魚・アクアリウム ──
  '101249': 'fish-food',     // 魚のえさ
  '101250': 'fish-tank',     // 水槽・フィルター
  '101251': 'fish-goods',    // アクアリウム用品
  // ── 爬虫類・両生類 ──
  '101254': 'reptile-food',  // 爬虫類えさ
  '101255': 'reptile-goods', // 爬虫類飼育用品
  // ── 昆虫 ──
  '101257': 'insect-goods',  // 昆虫飼育用品
};

// ペットトップジャンルID（子ジャンルを自動取得する場合のルート）
const PET_ROOT_GENRE_ID = '101213';

// ━━━ ユーティリティ ━━━

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function detectPetType(name: string, category: string): string {
  if (category.startsWith('dog')) return 'dog';
  if (category.startsWith('cat')) return 'cat';
  if (category.startsWith('bird')) return 'bird';
  if (category.startsWith('small')) return 'small';
  if (category.startsWith('fish')) return 'fish';
  if (category.startsWith('reptile')) return 'reptile';
  if (category.startsWith('insect')) return 'insect';
  if (/ドッグ|犬/.test(name)) return 'dog';
  if (/キャット|猫/.test(name)) return 'cat';
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

// ━━━ API呼び出し ━━━

async function getSubGenres(genreId: string): Promise<{ genreId: string; genreName: string }[]> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    genreId,
    formatVersion: '2',
  });
  const res = await fetch(`${GENRE_API}?${params}`, {
    headers: { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const children = data.children || [];
  return children.map((c: { genreId: number; genreName: string }) => ({
    genreId: String(c.genreId),
    genreName: c.genreName,
  }));
}

async function fetchPageByGenre(
  genreId: string,
  page: number
): Promise<{ items: unknown[]; pageCount: number }> {
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
  const res = await fetch(`${RAKUTEN_API}?${params}`, {
    headers: { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`    API error ${res.status}: ${body.slice(0, 200)}`);
    return { items: [], pageCount: 0 };
  }
  const data = await res.json();
  return { items: data.Items || [], pageCount: data.pageCount || 0 };
}

// ━━━ Supabase upsert ━━━

async function upsertItems(
  rawItems: unknown[],
  category: string
): Promise<number> {
  let count = 0;
  for (const raw of rawItems) {
    const item = raw as {
      itemCode: string; itemName: string; itemPrice: number;
      itemUrl: string; affiliateUrl?: string;
      mediumImageUrls?: string[]; shopName: string;
      reviewCount?: number; reviewAverage?: number;
    };
    const imageRaw = item.mediumImageUrls?.[0] ?? null;
    const imageUrl = imageRaw ? imageRaw.replace('_ex=128x128', '_ex=400x400') : null;

    const productData = {
      rakuten_item_id: item.itemCode,
      name: item.itemName,
      category,
      pet_type: detectPetType(item.itemName, category),
      age_group: detectAgeGroup(item.itemName),
      brand: extractBrand(item.itemName) || null,
      image_url: imageUrl,
      item_url: item.itemUrl,
      affiliate_url: item.affiliateUrl || item.itemUrl,
      current_price: item.itemPrice,
      shop_name: item.shopName,
      review_count: item.reviewCount ?? 0,
      review_average: item.reviewAverage ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { data: product, error } = await supabase
      .from('products')
      .upsert(productData, { onConflict: 'rakuten_item_id' })
      .select('id')
      .single();

    if (error) { console.error(`    upsert error: ${error.message}`); continue; }

    if (product) {
      count++;
      await supabase.from('price_history').insert({
        product_id: product.id,
        price: item.itemPrice,
        shop_name: item.shopName,
      }).then(({ error: e }) => {
        if (e && !e.message.includes('duplicate')) {
          console.error(`    price_history error: ${e.message}`);
        }
      });
    }
  }
  return count;
}

// ━━━ メイン ━━━

async function fetchGenre(genreId: string, category: string, genreName: string) {
  console.log(`\n  [${category}] ジャンル "${genreName}" (${genreId})`);
  let totalForGenre = 0;

  // 1ページ目でpageCountを取得、最大100ページ
  const first = await fetchPageByGenre(genreId, 1);
  if (first.items.length === 0) { console.log('    → 0件'); return 0; }
  totalForGenre += await upsertItems(first.items, category);
  console.log(`    p1: ${first.items.length}件 (全${first.pageCount}ページ)`);

  const maxPage = Math.min(first.pageCount, 100); // 楽天APIはpage最大100
  for (let page = 2; page <= maxPage; page++) {
    await sleep(500);
    const { items } = await fetchPageByGenre(genreId, page);
    if (items.length === 0) break;
    totalForGenre += await upsertItems(items, category);
    if (page % 10 === 0) console.log(`    p${page}: 累計${totalForGenre}件`);
  }

  console.log(`    → 完了: ${totalForGenre}件`);
  return totalForGenre;
}

async function main() {
  console.log('=== 楽天ペット商品 ジャンル別全件取得 ===');
  console.log(`開始時刻: ${new Date().toLocaleString('ja-JP')}\n`);

  // Step1: ルートジャンルの子ジャンルを取得して、未マッピングのジャンルを確認
  console.log(`ペットルートジャンル(${PET_ROOT_GENRE_ID})の子ジャンル一覧を取得中...`);
  const rootChildren = await getSubGenres(PET_ROOT_GENRE_ID);
  console.log(`子ジャンル ${rootChildren.length}件:`);
  for (const g of rootChildren) {
    const mapped = GENRE_CATEGORY_MAP[g.genreId] || '(未マッピング)';
    console.log(`  ${g.genreId}: ${g.genreName} → ${mapped}`);
  }

  // Step2: マッピング済みジャンルを順番に処理
  let grandTotal = 0;
  const entries = Object.entries(GENRE_CATEGORY_MAP);
  console.log(`\n合計 ${entries.length} ジャンルを処理します\n`);

  for (const [genreId, category] of entries) {
    // 子ジャンルを持つ場合は子ジャンルも処理
    const children = await getSubGenres(genreId);
    await sleep(300);

    if (children.length > 0) {
      console.log(`\nジャンル ${genreId}(${category}) → 子ジャンル${children.length}件を処理`);
      for (const child of children) {
        grandTotal += await fetchGenre(child.genreId, category, child.genreName);
        await sleep(1000);
      }
    } else {
      grandTotal += await fetchGenre(genreId, category, category);
      await sleep(1000);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`全処理完了！ 総upsert件数: ${grandTotal.toLocaleString()}件`);
  console.log(`終了時刻: ${new Date().toLocaleString('ja-JP')}`);
}

main().catch(console.error);
