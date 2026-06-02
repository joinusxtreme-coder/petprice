import { NextRequest, NextResponse } from 'next/server';

/**
 * 商品名からYahoo検索に最適なキーワードを生成する
 * - 長すぎるキーワードはヒット0になるため短く絞る
 * - ブランド名・製品名・容量を優先する
 */
function buildYahooKeyword(name: string): string {
  let k = name
    // 括弧内の説明文を除去
    .replace(/【[^】]*】/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    // 絵文字・特殊文字
    .replace(/[！!☆★♪◆▼▽✨🐾🐕🐈]/g, ' ')
    // 汎用マーケティング文言（商品名の末尾によく付く）
    .replace(/送料無料|まとめ買い|お得|セット|セール|SALE|\d+個まとめ/gi, ' ')
    // ペット種別汎用ワード（ブランドの一部でない場合だけ除去）
    .replace(/\s+(犬|猫|ペット|ドッグ|ドック|キャット|ネコ)\s+/g, ' ')
    .replace(/\s+(幼犬|仔犬|子犬|老犬|成犬|パピー|シニア犬|成猫|子猫|老猫)\s+/g, ' ')
    .replace(/\s+(シニア|アダルト|ジュニア|全年齢|全犬種|全猫種|全月齢)\s+/g, ' ')
    .replace(/\s+(小粒|中粒|大粒|超小粒)\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 重量・容量情報を抽出（例: 1.8kg, 500g, 3kg×2袋）
  const sizeMatch = k.match(/\d+(?:\.\d+)?\s*(?:kg|g)\b/i);

  // 単語単位で分割し、累計30文字になるまで取る
  const words = k.split(/\s+/).filter(Boolean);
  let keyword = '';
  for (const w of words) {
    if ((keyword + ' ' + w).trim().length > 28) break;
    keyword = (keyword + ' ' + w).trim();
  }

  // サイズがキーワードに含まれていなければ追加
  if (sizeMatch && !keyword.includes(sizeMatch[0])) {
    const candidate = (keyword + ' ' + sizeMatch[0]).trim();
    if (candidate.length <= 40) keyword = candidate;
  }

  return keyword || name.slice(0, 20);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ price: null });

  const appId = process.env.NEXT_PUBLIC_YAHOO_APP_ID;
  if (!appId) return NextResponse.json({ price: null });

  // クライアントから商品名が来た場合はキーワード最適化する
  // （既に短いクエリはそのまま使う）
  const optimizedQuery = query.length > 30 ? buildYahooKeyword(query) : query;

  try {
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${appId}&query=${encodeURIComponent(optimizedQuery)}&hits=1&sort=-score`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ price: null });
    const json = await res.json();
    const price = json?.hits?.[0]?.price ?? null;
    return NextResponse.json({ price: price ? Number(price) : null, keyword: optimizedQuery });
  } catch {
    return NextResponse.json({ price: null });
  }
}
