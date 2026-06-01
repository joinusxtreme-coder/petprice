import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ price: null });

  const appId = process.env.NEXT_PUBLIC_YAHOO_APP_ID;
  if (!appId) return NextResponse.json({ price: null });

  try {
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${appId}&query=${encodeURIComponent(query)}&hits=1&sort=-score`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ price: null });
    const json = await res.json();
    const price = json?.hits?.[0]?.price ?? null;
    return NextResponse.json({ price: price ? Number(price) : null });
  } catch {
    return NextResponse.json({ price: null });
  }
}
