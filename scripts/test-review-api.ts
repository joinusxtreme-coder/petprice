import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const HEADERS = { Referer: 'https://petprice-sand.vercel.app', Origin: 'https://petprice-sand.vercel.app' };

// テスト: いくつかのエンドポイントパターンを試す
async function tryReviewApi(label: string, url: string) {
  console.log(`\n[${label}]`);
  console.log(`URL: ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${text.slice(0, 300)}`);
}

async function main() {
  const appId = process.env.RAKUTEN_APP_ID!;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY!;
  // ペットシーツ商品のitemCode (実在する)
  const itemCode = 'pet-madoca:10000097';

  // 1. 新エンドポイント + accessKey
  await tryReviewApi('新API + accessKey',
    `https://openapi.rakuten.co.jp/ichibams/api/IchibaItemReview/Search/20220601?applicationId=${appId}&accessKey=${accessKey}&itemCode=${encodeURIComponent(itemCode)}&hits=3&formatVersion=2`);

  // 2. 旧エンドポイント + UUIDアプリID
  await tryReviewApi('旧API + UUID appId',
    `https://app.rakuten.co.jp/services/api/IchibaItemReview/Search/20170427?applicationId=${appId}&itemCode=${encodeURIComponent(itemCode)}&hits=3&formatVersion=2`);

  // 3. 旧エンドポイント + accessKey
  await tryReviewApi('旧API + accessKey',
    `https://app.rakuten.co.jp/services/api/IchibaItemReview/Search/20170427?applicationId=${appId}&accessKey=${accessKey}&itemCode=${encodeURIComponent(itemCode)}&hits=3&formatVersion=2`);

  // 4. itemCaptionも含めて商品情報を確認
  await tryReviewApi('商品詳細 itemCaption確認',
    `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?applicationId=${appId}&accessKey=${accessKey}&keyword=%E3%83%9A%E3%83%83%E3%83%88%E3%82%B7%E3%83%BC%E3%83%84&genreId=101213&hits=1&page=1&formatVersion=2`);
}

main().catch(console.error);
