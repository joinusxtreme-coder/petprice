import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
const HEADERS = { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' };

const PROBES: [string, string][] = [
  ['ドッグフード', 'dog-food'],
  ['キャットフード', 'cat-food'],
  ['ペットシーツ', 'pet-sheets'],
  ['猫砂', 'cat-toilet'],
  ['キャットタワー', 'cat-tower'],
  ['犬 ハーネス', 'dog-walk'],
  ['ペットシャンプー 犬', 'dog-care'],
  ['インコ えさ', 'bird-food'],
  ['ハムスター ケージ', 'small-animal-goods'],
  ['水槽 アクアリウム', 'fish-tank'],
  ['爬虫類 ケージ', 'reptile-goods'],
  ['カブトムシ 飼育', 'insect-goods'],
];

async function main() {
  const genreMap: Record<string, Set<string>> = {};

  for (const [kw, cat] of PROBES) {
    const params = new URLSearchParams({
      applicationId: process.env.RAKUTEN_APP_ID!,
      accessKey: process.env.RAKUTEN_ACCESS_KEY!,
      keyword: kw,
      genreId: '101213',
      hits: '10',
      page: '1',
      formatVersion: '2',
    });
    const res = await fetch(`${API}?${params}`, { headers: HEADERS });
    if (!res.ok) { console.log(`${kw}: error ${res.status}`); continue; }
    const data = await res.json();
    const ids = new Set<string>((data.Items || []).map((i: { genreId: string }) => String(i.genreId)));
    console.log(`[${cat}] ${kw}: genreIds = ${[...ids].join(', ')}`);
    for (const id of ids) {
      if (!genreMap[id]) genreMap[id] = new Set();
      genreMap[id].add(cat);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== ジャンルIDまとめ ===');
  for (const [id, cats] of Object.entries(genreMap)) {
    console.log(`  ${id}: ${[...cats].join(', ')}`);
  }
}

main().catch(console.error);
