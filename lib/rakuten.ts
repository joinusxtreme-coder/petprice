// 2026年5月以降の新エンドポイント
const RAKUTEN_API_ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';

export interface RakutenItem {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  mediumImageUrls: string[];
  shopName: string;
  reviewCount: number;
  reviewAverage: number;
  genreId: string;
  tagIds: number[];
}

export interface RakutenSearchResponse {
  Items: RakutenItem[];
  count: number;
  page: number;
  pageCount: number;
}

export async function searchProducts(keyword: string): Promise<RakutenItem[]> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID!,
    keyword,
    hits: '30',
    sort: '-reviewCount',
    formatVersion: '2',
    genreId: '101213',
  });

  const res = await fetch(`${RAKUTEN_API_ENDPOINT}?${params}`, {
    headers: {
      'Referer': 'https://petprice.jp',
      'Origin': 'https://petprice.jp',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Rakuten API error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.Items || [];
}

export function buildAffiliateUrl(url: string): string {
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (!affiliateId) return url;
  return `https://af.moshimo.com/af/c/click?a_id=${affiliateId}&p_id=54&pc_id=54&pl_id=616&url=${encodeURIComponent(url)}`;
}
