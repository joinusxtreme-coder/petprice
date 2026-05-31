const RAKUTEN_API_ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';

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

export async function searchProducts(keyword: string, page = 1): Promise<RakutenItem[]> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '',
    keyword,
    hits: '30',
    page: String(page),
    sort: '-reviewCount',
    formatVersion: '2',
    genreId: '101213',
  });

  const res = await fetch(`${RAKUTEN_API_ENDPOINT}?${params}`);
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
