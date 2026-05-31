import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// カテゴリ別の厳格なキーワードフィルター
// 商品名がいずれかにマッチしなければ削除
const CATEGORY_REQUIRED: Record<string, RegExp> = {
  // ── ドッグフード: ブランド名は基本的に犬向けが明示される
  'dog-food':    /犬|ドッグ|dog|パピー|シニア犬|成犬|子犬|わんちゃん|ワン|ロイヤルカナン|ヒルズ|ニュートロ|アカナ|オリジン|グランデリ|モグワン|ナチュロル/i,
  // ── 犬のおやつ: ブランド名が犬向けを示す場合が多い。ジャーキー・ガムなど幅広く
  'dog-snack':   /犬|ドッグ|dog|ドギー|ゴン太|ビタワン|おやつ|トリーツ|ジャーキー|ガム|チーズ.*ワン|ワン.*チーズ|わんちゃん|ペット.*おやつ|おやつ.*ペット|スティック.*ドッグ/i,
  'dog-feeder':  /犬|ドッグ|給水|食器.*犬|犬.*食器|ペット.*食器|給水器/i,
  'dog-toilet':  /犬|ドッグ|トイレ|ペットシーツ|シーツ|おしっこシート|尿|マット.*犬/i,
  'dog-walk':    /犬|ドッグ|ハーネス|リード|首輪|散歩|鑑札|迷子|胴輪/i,
  'dog-care':    /犬|猫|ドッグ|キャット|ペット|グルーミング|シャンプー|ブラシ|爪切り|歯磨き|耳|目.*ケア|ノミ|ダニ|サプリ.*ペット|ペット.*サプリ/i,
  'dog-clothes': /犬|ドッグ|ペット.*服|ペット.*ウェア|ウェア.*ペット|犬服|ドッグウェア/i,
  'dog-toy':     /犬|ドッグ|ペット.*おもちゃ|おもちゃ.*犬|おもちゃ.*ペット|ロープ.*犬|ボール.*犬/i,
  'dog-goods':   /犬|ドッグ|ペット.*ベッド|ベッド.*ペット|ケージ.*犬|犬.*ケージ|ペット.*小屋|犬小屋/i,
  'dog-carrier': /犬|ドッグ|ペット.*キャリー|キャリー.*ペット|キャリーバッグ.*ペット|ペット.*バッグ|ペット.*カート/i,
  'cat-food':    /猫|キャット|キャットフード|cat.?food|子猫|シニア猫|にゃん|ネコ/i,
  'cat-feeder':  /猫|キャット|給水.*猫|猫.*給水|食器.*猫|猫.*食器|ペット.*食器/i,
  'cat-toilet':  /猫|キャット|トイレ.*猫|猫.*トイレ|猫砂|砂|ニャンとも|デオトイレ|システムトイレ/i,
  'cat-tower':   /猫|キャット|キャットタワー|猫タワー|タワー.*猫|爪とぎ|つめとぎ/i,
  'cat-toy':     /猫|キャット|ペット.*おもちゃ|おもちゃ.*猫|おもちゃ.*ペット|猫じゃらし/i,
  'cat-goods':   /猫|キャット|ペット.*ベッド|ベッド.*猫|ケージ.*猫|猫.*ケージ|猫.*ハウス|ペット.*マット/i,
  'cat-carrier': /猫|キャット|ペット.*キャリー|キャリー.*ペット|キャリーバッグ.*ペット|ペット.*バッグ|ペット.*カート/i,
  // ── ペットシーツ: 「シーツ」単体でOK（ベッドシーツはそもそもペットDBに入らない）
  'pet-sheets':  /シーツ|ペットシーツ|ペットシート|トイレシート|おしっこシート|尿取り|吸水|ネオシーツ|クリーンワン|スーパーワイド|消臭炭シート/i,
  // ── 鳥のえさ: 黒瀬ペットフードなどのブランド、ボレー粉・シード・ペレットも含む
  'bird-food':   /鳥|インコ|オウム|文鳥|カナリア|オカメ|コザクラ|セキセイ|バード|小鳥|ボレー|シード.*鳥|鳥.*シード|ペレット.*鳥|鳥.*ペレット|黒瀬|えさ.*鳥|鳥.*えさ/i,
  // ── 小動物フード: マペット・牧草・ペレットなども含む
  'small-animal-food': /ハムスター|うさぎ|ウサギ|フェレット|モルモット|チンチラ|デグー|小動物|マペット|牧草|ペレット.*小動物|小動物.*ペレット|ドワーフ/i,
  'small-animal-goods': /ハムスター|うさぎ|ウサギ|フェレット|モルモット|チンチラ|デグー|小動物/i,
  'fish-food':   /熱帯魚|金魚|メダカ|グッピー|コリドラス|ベタ|魚|フィッシュ|水槽|アクアリウム/i,
  'fish-tank':   /水槽|フィルター|エアーポンプ|ポンプ|アクアリウム|熱帯魚|金魚|メダカ|ろ過|照明.*水槽|水槽.*照明/i,
  'fish-goods':  /水草|アクアリウム|水槽|熱帯魚|金魚|メダカ|砂利|底砂|レイアウト.*水槽|魚/i,
  'reptile-food': /爬虫類|カメ|トカゲ|ヘビ|カエル|ゲッコー|イグアナ|コオロギ|ミルワーム|レオパ/i,
  'reptile-goods': /爬虫類|カメ|トカゲ|ヘビ|カエル|ゲッコー|イグアナ|テラリウム|レオパ/i,
  'insect-goods': /カブトムシ|クワガタ|昆虫|カブト|クワ|コクワ|ノコギリ|ミヤマ|幼虫|マット.*昆虫|昆虫.*マット|飼育.*昆虫|昆虫.*飼育/i,
};

async function main() {
  console.log('=== カテゴリ別 厳格クリーンアップ ===\n');

  let grandTotal = 0;

  for (const [category, pattern] of Object.entries(CATEGORY_REQUIRED)) {
    // カテゴリの全商品取得
    let allIds: { id: string; name: string }[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('category', category)
        .range(offset, offset + pageSize - 1);
      if (error) { console.error(`  fetch error: ${error.message}`); break; }
      if (!data || data.length === 0) break;
      allIds = allIds.concat(data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    const badIds = allIds.filter(p => !pattern.test(p.name)).map(p => p.id);

    if (badIds.length === 0) {
      console.log(`[${category}] ${allIds.length}件 → 削除なし ✓`);
      continue;
    }

    // サンプル表示
    const badSamples = allIds.filter(p => !pattern.test(p.name)).slice(0, 3).map(p => p.name.slice(0, 60));
    console.log(`[${category}] ${allIds.length}件中 ${badIds.length}件削除予定`);
    badSamples.forEach(n => console.log(`  例: ${n}`));

    // price_historyを先に削除
    const { error: phErr } = await supabase.from('price_history').delete().in('product_id', badIds);
    if (phErr) console.error(`  price_history delete error: ${phErr.message}`);

    // 商品削除（バッチ100件ずつ）
    let deleted = 0;
    for (let i = 0; i < badIds.length; i += 100) {
      const batch = badIds.slice(i, i + 100);
      const { error } = await supabase.from('products').delete().in('id', batch);
      if (error) console.error(`  delete error: ${error.message}`);
      else deleted += batch.length;
    }

    console.log(`  → ${deleted}件削除完了`);
    grandTotal += deleted;
  }

  console.log(`\n=== 完了: 計${grandTotal}件削除 ===`);
}

main().catch(console.error);
