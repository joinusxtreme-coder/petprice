import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
const HEADERS = { Referer: 'https://www.petprices.jp', Origin: 'https://www.petprices.jp' };

const GENRE_CATEGORY: [string, string][] = [
  ['565715', 'dog-food'],
  ['409651', 'dog-snack'],
  ['404099', 'dog-snack'],
  ['206138', 'dog-snack'],
  ['404097', 'dog-snack'],
  ['210756', 'dog-feeder'],
  ['304226', 'dog-feeder'],
  ['206205', 'dog-toilet'],
  ['210771', 'dog-walk'],
  ['404132', 'dog-walk'],
  ['215319', 'dog-care'],
  ['206217', 'dog-care'],
  ['112933', 'dog-care'],
  ['112114', 'dog-care'],
  ['404102', 'dog-care'],
  ['206181', 'dog-clothes'],
  ['200431', 'dog-clothes'],
  ['215337', 'dog-toy'],
  ['215339', 'dog-toy'],
  ['409796', 'dog-toy'],
  ['206193', 'dog-goods'],
  ['206201', 'dog-goods'],
  ['206150', 'dog-carrier'],
  ['206151', 'dog-carrier'],
  ['206152', 'dog-carrier'],
  ['206153', 'dog-carrier'],
  ['565724', 'cat-food'],
  ['206297', 'cat-feeder'],
  ['204174', 'cat-toilet'],
  ['206265', 'cat-tower'],
  ['206345', 'cat-snack'],
  ['409780', 'cat-snack'],
  ['404151', 'cat-care'],
  ['215355', 'cat-care'],
  ['206350', 'cat-care'],
  ['215363', 'cat-toy'],
  ['112121', 'cat-toy'],
  ['404161', 'cat-toy'],
  ['206287', 'cat-goods'],
  ['409760', 'cat-goods'],
  ['206269', 'cat-carrier'],
  ['206271', 'cat-carrier'],
  ['404137', 'cat-carrier'],
  ['112107', 'cat-carrier'],
  ['404162', 'cat-carrier'],
  ['409755', 'pet-sheets'],
  ['204184', 'bird-food'],
  ['204185', 'bird-goods'],
  ['565706', 'bird-food'],
  ['565702', 'small-animal-food'],
  ['565705', 'small-animal-food'],
  ['565703', 'small-animal-goods'],
  ['565704', 'small-animal-goods'],
  ['507542', 'fish-food'],
  ['507550', 'fish-food'],
  ['206305', 'fish-tank'],
  ['206311', 'fish-tank'],
  ['565726', 'fish-tank'],
  ['215405', 'fish-tank'],
  ['101217', 'fish-tank'],
  ['560200', 'reptile-food'],
  ['101218', 'reptile-goods'],
  ['509408', 'insect-goods'],
];

async function checkGenre(genreId: string): Promise<number> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    genreId,
    hits: '1',
    page: '1',
    formatVersion: '2',
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  if (!res.ok) return -1;
  const data = await res.json();
  return data.count ?? 0;
}

async function main() {
  console.log('genreId\t\tcategory\t\tcount\tstatus');
  console.log('─'.repeat(70));
  for (const [genreId, category] of GENRE_CATEGORY) {
    const count = await checkGenre(genreId);
    const status = count === 0 ? '❌ 0件' : count < 0 ? '⚠ エラー' : `✅ ${count.toLocaleString()}件`;
    console.log(`${genreId}\t${category.padEnd(20)}\t${status}`);
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
