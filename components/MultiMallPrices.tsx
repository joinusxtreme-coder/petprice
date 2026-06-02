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

async function fetchYahooPrice(productName: string): Promise<{ price: number | null; keyword: string }> {
  try {
    // 商品名全体をサーバーに送り、サーバー側でキーワード最適化する
    const res = await fetch(`/api/yahoo-price?q=${encodeURIComponent(productName)}`);
    if (!res.ok) return { price: null, keyword: productName.slice(0, 30) };
    const json = await res.json();
    return { price: json?.price ?? null, keyword: json?.keyword ?? productName.slice(0, 30) };
  } catch {
    return { price: null, keyword: productName.slice(0, 30) };
  }
}

function buildAmazonUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.slice(0, 60));
  return `https://www.amazon.co.jp/s?k=${q}&tag=petprice-22`;
}

function buildYahooUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.slice(0, 60));
  return `https://shopping.yahoo.co.jp/search?p=${q}`;
}

export default function MultiMallPrices({ productName, rakutenPrice, rakutenUrl }: Props) {
  const [yahooPrice, setYahooPrice] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 表示用の短いキーワード（括弧などを除去）
  const displayKeyword = productName
    .replace(/【[^】]*】/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .trim()
    .slice(0, 40);

  useEffect(() => {
    fetchYahooPrice(productName).then(({ price, keyword }) => {
      setYahooPrice(price);
      setSearchKeyword(keyword || displayKeyword);
      setLoading(false);
    });
  }, [productName, displayKeyword]);

  const yahooSearchUrl = buildYahooUrl(searchKeyword || displayKeyword);

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
      url: yahooSearchUrl,
    },
    {
      mall: 'Amazon',
      logo: '📦',
      color: '#FF9900',
      price: null,
      url: buildAmazonUrl(displayKeyword),
    },
  ];

  const prices = malls.filter((m) => m.price !== null).map((m) => m.price as number);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <div className="space-y-2">
      {malls.map((m) => (
        <a
          key={m.mall}
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border border-[#eee] px-3 py-2.5 hover:bg-[#f9f9f9] transition-colors group"
        >
          <span className="text-xl w-8 text-center shrink-0">{m.logo}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: m.color }}>{m.mall}</span>
              {m.badge && (
                <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5">{m.badge}</span>
              )}
              {m.price !== null && minPrice !== null && m.price === minPrice && m.mall !== '楽天市場' && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5">最安値候補</span>
              )}
            </div>
            <div className="text-xs text-[#999] truncate">{displayKeyword}</div>
          </div>

          <div className="shrink-0 text-right">
            {m.price !== null ? (
              <div>
                <span className="text-base font-bold text-[#FF6600]">¥{m.price.toLocaleString()}</span>
                {m.price < rakutenPrice && (
                  <div className="text-xs text-green-600 font-bold">¥{(rakutenPrice - m.price).toLocaleString()} お得</div>
                )}
                {m.price > rakutenPrice && (
                  <div className="text-xs text-[#999]">¥{(m.price - rakutenPrice).toLocaleString()} 高め</div>
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
      <p className="text-xs text-[#999] mt-1">
        ※ Yahoo!価格は自動取得（1時間キャッシュ）。Amazonは検索ページへ遷移します。価格は変動します。
      </p>
    </div>
  );
}
