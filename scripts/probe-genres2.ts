import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
const HEADERS = { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' };

const PROBES: [string, string][] = [
  ['キャットフード', 'cat-food'],
  ['ペットシーツ', 'pet-sheets'],
  ['犬 おやつ ジャーキー', 'dog-snack'],
  ['猫 おやつ ちゅーる', 'cat-snack'],
  ['犬 食器 ボウル', 'dog-feeder'],
  ['犬 トイレトレー', 'dog-toilet'],
  ['犬服 ドッグウェア', 'dog-clothes'],
  ['犬 おもちゃ ボール', 'dog-toy'],
  ['犬小屋 ケージ', 'dog-goods'],
  ['犬 キャリーバッグ', 'dog-carrier'],
  ['猫 食器 ボウル', 'cat-feeder'],
  ['猫 おもちゃ 電動', 'cat-toy'],
  ['猫 ハウス ベッド', 'cat-goods'],
  ['猫 キャリーバッグ', 'cat-carrier'],
  ['鳥かご インコ', 'bird-goods'],
  ['うさぎ ペレット', 'small-animal-food'],
  ['熱帯魚 えさ', 'fish-food'],
  ['水草 アクアリウム', 'fish-goods'],
  ['爬虫類 えさ', 'reptile-food'],
  ['カブトムシ 飼育ケース', 'insect-goods'],
];

async function main() {
  await new Promise(r => setTimeout(r, 3000)); // レート制限回避

  const genreMap: Record<string, string> = {};

  for (const [kw, cat] of PROBES) {
    await new Promise(r => setTimeout(r, 1500));
    const params = new URLSearchParams({
      applicationId: process.env.RAKUTEN_APP_ID!,
      accessKey: process.env.RAKUTEN_ACCESS_KEY!,
      keyword: kw,
      genreId: '101213',
      hits: '10',
      page: '1',
      formatVersion: '2',
    });
    try {
      const res = await fetch(`${API}?${params}`, { headers: HEADERS });
      if (!res.ok) { console.log(`[${cat}] ${kw}: error ${res.status}`); continue; }
      const data = await res.json();
      const ids = [...new Set<string>((data.Items || []).map((i: { genreId: string }) => String(i.genreId)))];
      console.log(`[${cat}] ${kw}: genreIds = ${ids.join(', ')}`);
      for (const id of ids) {
        if (!genreMap[id]) genreMap[id] = cat;
      }
    } catch (e) {
      console.log(`[${cat}] error: ${e}`);
    }
  }

  console.log('\n=== 追加ジャンルIDまとめ ===');
  for (const [id, cat] of Object.entries(genreMap)) {
    console.log(`  '${id}': '${cat}',`);
  }
}

main().catch(console.error);
