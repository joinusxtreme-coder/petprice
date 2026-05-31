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

export async function searchProducts(keyword: string, page = 1): Promise<RakutenItem[]> {
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APP_ID!,
    accessKey: process.env.RAKUTEN_ACCESS_KEY!,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '',
    keyword,
    hits: '30',
    page: String(page),
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

export interface RakutenReview {
  reviewId: string;
  title: string;
  body: string;
  reviewDate: string;
  reviewer: string;
  rate: number;
}

export async function fetchItemReviews(itemCode: string, hits = 5): Promise<RakutenReview[]> {
  try {
    const params = new URLSearchParams({
      applicationId: process.env.RAKUTEN_APP_ID!,
      itemCode,
      hits: String(hits),
      page: '1',
      formatVersion: '2',
    });
    const res = await fetch(
      `https://app.rakuten.co.jp/services/api/IchibaItemReview/Search/20170427?${params}`,
      { headers: { 'Referer': 'https://petprice-sand.vercel.app' }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Items || []).map((r: Record<string, unknown>) => ({
      reviewId: String(r.reviewId || ''),
      title: String(r.title || ''),
      body: String(r.body || ''),
      reviewDate: String(r.reviewDate || ''),
      reviewer: String(r.reviewer || '匿名'),
      rate: Number(r.rate || 0),
    }));
  } catch {
    return [];
  }
}

export function buildAffiliateUrl(url: string): string {
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (!affiliateId) return url;
  return `https://af.moshimo.com/af/c/click?a_id=${affiliateId}&p_id=54&pc_id=54&pl_id=616&url=${encodeURIComponent(url)}`;
}
