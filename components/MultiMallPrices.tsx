'use client';

import { useState, useEffect } from 'react';

interface Props {
  productName: string;
  rakutenPrice: number;
  rakutenUrl: string;
}

interface MallResult {
  mall: string;
  logo: string;
  color: string;
  price: number | null;
  url: string;
  badge?: string;
}

// Yahoo Shopping のアイテム検索API（無料・AppIDなしで公開エンドポイント利用）
// → AppID不要のWeb検索URLにフォールバック
async function fetchYahooPrice(keyword: string): Promise<number | null> {
  try {
    const appId = process.env.NEXT_PUBLIC_YAHOO_APP_ID;
    if (!appId) return null;
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${appId}&query=${encodeURIComponent(keyword)}&hits=1&sort=-score`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.hits?.[0]?.price;
    return price ? Number(price) : null;
  } catch {
    return null;
  }
}

// Amazon商品検索URL（PA-API不要。ユーザーが自分で検索できるリンク）
function buildAmazonUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.slice(0, 60));
  return `https://www.amazon.co.jp/s?k=${q}&tag=petprice-22`;
}

function buildYahooUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.slice(0, 60));
  return `https://shopping.yahoo.co.jp/search?p=${q}`;
}

function buildRakutenUrl(url: string): string {
  return url;
}

export default function MultiMallPrices({ productName, rakutenPrice, rakutenUrl }: Props) {
  const [yahooPrice, setYahooPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ブランド名・商品名の重要部分のみ抽出（括弧内やセール文言を除去）
    const cleanName = productName
      .replace(/【[^】]*】/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/[！!☆★♪◆▼▽]/g, '')
      .trim()
      .slice(0, 50);

    fetchYahooPrice(cleanName).then((p) => {
      setYahooPrice(p);
      setLoading(false);
    });
  }, [productName]);

  const cleanKeyword = productName
    .replace(/【[^】]*】/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
    .slice(0, 60);

  const malls: MallResult[] = [
    {
      mall: '楽天市場',
      logo: '🛒',
      color: '#BF0000',
      price: rakutenPrice,
      url: rakutenUrl,
      badge: '現在表示中',
    },
    {
      mall: 'Yahoo!ショッピング',
      logo: '🛍️',
      color: '#FF0033',
      price: yahooPrice,
      url: buildYahooUrl(cleanKeyword),
    },
    {
      mall: 'Amazon',
      logo: '📦',
      color: '#FF9900',
      price: null,
      url: buildAmazonUrl(cleanKeyword),
    },
  ];

  const minPrice = Math.min(
    ...malls.filter((m) => m.price !== null).map((m) => m.price as number)
  );

  return (
    <div className="bg-white border border-[#ddd] p-4 mt-4">
      <h3 className="font-bold text-sm text-[#333] mb-3">🏪 他モールでも探す</h3>

      <div className="space-y-2">
        {malls.map((m) => (
          <a
            key={m.mall}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-[#eee] px-3 py-2.5 hover:bg-[#f9f9f9] transition-colors group"
          >
            {/* ロゴ */}
            <span className="text-xl w-8 text-center shrink-0">{m.logo}</span>

            {/* モール名 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#333]" style={{ color: m.color }}>{m.mall}</span>
                {m.badge && (
                  <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5">{m.badge}</span>
                )}
                {m.price !== null && m.price === minPrice && m.mall !== '楽天市場' && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5">最安値候補</span>
                )}
              </div>
              <div className="text-xs text-[#999] truncate">{cleanKeyword}</div>
            </div>

            {/* 価格 */}
            <div className="shrink-0 text-right">
              {m.price !== null ? (
                <div>
                  <span className="text-base font-bold text-[#FF6600]">¥{m.price.toLocaleString()}</span>
                  {m.price < rakutenPrice && (
                    <div className="text-xs text-green-600 font-bold">
                      ¥{(rakutenPrice - m.price).toLocaleString()} お得
                    </div>
                  )}
                  {m.price > rakutenPrice && (
                    <div className="text-xs text-[#999]">
                      ¥{(m.price - rakutenPrice).toLocaleString()} 高め
                    </div>
                  )}
                </div>
              ) : loading && m.mall === 'Yahoo!ショッピング' ? (
                <span className="text-xs text-[#999]">取得中...</span>
              ) : (
                <span className="text-xs text-[#0058B3] group-hover:underline">検索して確認 →</span>
              )}
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-[#999] mt-2">
        ※ Yahoo!ショッピング・Amazonは検索ページに遷移します。価格は変動します。
      </p>
    </div>
  );
}
