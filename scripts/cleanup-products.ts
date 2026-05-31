import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ペット関連キーワード（これを含まない商品は削除）
const PET_KEYWORDS = /犬|猫|ドッグ|キャット|ペット|わんこ|パピー|インコ|オウム|文鳥|鳥|ハムスター|うさぎ|ウサギ|フェレット|モルモット|水槽|アクアリウム|熱帯魚|金魚|メダカ|グッピー|コリドラス|爬虫類|カメ|トカゲ|ヘビ|カエル|カブトムシ|クワガタ|昆虫|ドッグフード|キャットフード|ペットシーツ|猫砂|キャットタワー|ハーネス|リード|首輪|グルーミング|ノミ|ダニ|ペットベッド|デオトイレ|ニャンとも/;

// ジャンル系はペット名が英語でも許容（水槽・爬虫類等）
const PET_CATEGORIES_LOOSE = ['fish-food','fish-tank','fish-goods','reptile-food','reptile-goods','insect-goods'];

async function main() {
  console.log('=== ペット無関係商品の削除 ===\n');

  // 全商品を取得（1000件ずつ）
  let offset = 0;
  let deleteCount = 0;
  let keepCount = 0;

  while (true) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category')
      .range(offset, offset + 999);

    if (error) { console.error('fetch error:', error.message); break; }
    if (!products || products.length === 0) break;

    const toDelete: string[] = [];

    for (const p of products) {
      // ルーズカテゴリは除外しない
      if (PET_CATEGORIES_LOOSE.includes(p.category)) {
        keepCount++;
        continue;
      }
      if (!PET_KEYWORDS.test(p.name)) {
        toDelete.push(p.id);
        console.log(`  DELETE [${p.category}] ${p.name.slice(0, 60)}`);
      } else {
        keepCount++;
      }
    }

    // バッチ削除
    if (toDelete.length > 0) {
      const { error: delError } = await supabase
        .from('products')
        .delete()
        .in('id', toDelete);
      if (delError) console.error('delete error:', delError.message);
      else deleteCount += toDelete.length;
    }

    offset += products.length;
    console.log(`  処理済: ${offset}件 / 削除: ${deleteCount}件 / 保持: ${keepCount}件`);

    if (products.length < 1000) break;
  }

  console.log(`\n完了: 削除=${deleteCount}件, 保持=${keepCount}件`);
}

main().catch(console.error);
