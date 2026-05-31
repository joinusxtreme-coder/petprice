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
  catchcopy?: string;
  itemCaption?: string;
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

/** item_url から楽天アイテムコード（shopname:itemcode）を抽出 */
export function extractItemCode(itemUrl: string): string | null {
  const m = itemUrl?.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?#]+)/);
  return m ? `${m[1]}:${m[2]}` : null;
}

export interface RakutenItemDetail {
  itemCode: string;
  itemName: string;
  itemCaption: string;
  catchcopy: string;
  itemPrice: number;
  itemUrl: string;
  mediumImageUrls: string[];
  shopName: string;
}

/** 楽天APIから商品詳細（itemCaption含む）を取得。Next.jsキャッシュ1時間 */
export async function fetchItemDetail(itemCode: string): Promise<RakutenItemDetail | null> {
  try {
    const params = new URLSearchParams({
      applicationId: process.env.RAKUTEN_APP_ID!,
      itemCode,
      formatVersion: '2',
    });
    const res = await fetch(
      `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = (data.Items || [])[0];
    if (!item) return null;
    return {
      itemCode: item.itemCode || '',
      itemName: item.itemName || '',
      itemCaption: item.itemCaption || '',
      catchcopy: item.catchcopy || '',
      itemPrice: item.itemPrice || 0,
      itemUrl: item.itemUrl || '',
      mediumImageUrls: item.mediumImageUrls || [],
      shopName: item.shopName || '',
    };
  } catch {
    return null;
  }
}

/**
 * itemCaption（商品説明HTML/テキスト）から正確なスペックを抽出
 * 確実に存在するものだけ返す（不確かなものは空文字）
 */
export function parseItemCaption(caption: string): {
  ingredients: string;
  calorie: string;
  weightFromCaption: string;
  guaranteedAnalysis: string;
} {
  // HTMLタグを除去
  const text = caption.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

  // 原材料（〜の後ろの文字列を取得）
  let ingredients = '';
  const ingredM = text.match(/原材料(?:名)?[：:・\s]*([^\n。]{10,200})/);
  if (ingredM) ingredients = ingredM[1].trim().slice(0, 200);

  // カロリー・エネルギー
  let calorie = '';
  const calM = text.match(/(?:エネルギー|カロリー|熱量)[：:\s]*(\d[\d.,/以上\s]*(?:kcal|kJ)[^、。\n]{0,30})/i);
  if (calM) calorie = calM[1].trim();
  else {
    const calM2 = text.match(/(\d+(?:\.\d+)?)\s*[Kk][Cc]al\s*\/\s*100\s*g/);
    if (calM2) calorie = `${calM2[1]} kcal/100g`;
  }

  // 保証成分（粗タンパク質など）
  let guaranteedAnalysis = '';
  const gaM = text.match(/(?:保証成分|粗タンパク質)[：:\s]*([^\n。]{10,150})/);
  if (gaM) guaranteedAnalysis = gaM[1].trim().slice(0, 150);

  // 内容量（captionから）
  let weightFromCaption = '';
  const wM = text.match(/内容量[：:\s]*([^\n。]{2,30})/);
  if (wM) weightFromCaption = wM[1].trim();

  return { ingredients, calorie, weightFromCaption, guaranteedAnalysis };
}
