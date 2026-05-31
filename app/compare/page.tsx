import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

interface Product {
  id: string;
  name: string;
  current_price: number;
  brand: string | null;
  category: string;
  review_average: number;
  review_count: number;
  shop_name: string | null;
  item_url: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  description: string | null;
}

// 商品名から内容量を抽出
function extractWeight(name: string): string {
  const multi = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)\s*[×xX]\s*(\d+)/i);
  if (multi) {
    const val = parseFloat(multi[1]);
    const unit = multi[2].toLowerCase();
    const cnt = parseInt(multi[3]);
    const kg = unit === 'kg' ? val * cnt : (val / 1000) * cnt;
    return `${multi[1]}${multi[2]}×${cnt}袋（計${kg}kg）`;
  }
  const single = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)(?![a-zA-Z])/i);
  if (single) return `${single[1]}${single[2]}`;
  const count = name.match(/(\d+)\s*(枚|個|袋|食|粒|シート)/);
  if (count) return `${count[1]}${count[2]}`;
  return '-';
}

// 1kgあたり価格を計算
function calcPerKg(name: string, price: number, category: string): string {
  if (!category.includes('food') && !category.includes('snack')) return '-';
  const multi = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)\s*[×xX]\s*(\d+)/i);
  if (multi) {
    const val = parseFloat(multi[1]);
    const unit = multi[2].toLowerCase();
    const cnt = parseInt(multi[3]);
    const kg = unit === 'kg' ? val * cnt : (val / 1000) * cnt;
    if (kg > 0) return `¥${Math.round(price / kg).toLocaleString()}/kg`;
  }
  const single = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)(?![a-zA-Z])/i);
  if (single) {
    const val = parseFloat(single[1]);
    const kg = single[2].toLowerCase() === 'kg' ? val : val / 1000;
    if (kg > 0) return `¥${Math.round(price / kg).toLocaleString()}/kg`;
  }
  return '-';
}

// フードタイプ抽出
function extractType(name: string): string {
  if (/フリーズドライ/.test(name)) return 'フリーズドライ';
  if (/ドライ|カリカリ/.test(name)) return 'ドライ';
  if (/パウチ/.test(name)) return 'パウチ';
  if (/缶詰|缶/.test(name)) return '缶詰';
  if (/ウェット|ウエット/.test(name)) return 'ウェット';
  if (/ジャーキー/.test(name)) return 'ジャーキー';
  if (/半生|セミモイスト/.test(name)) return '半生';
  return '-';
}

// 対象年齢
function extractAge(name: string): string {
  if (/パピー|子犬|子猫|キトン/.test(name)) return 'パピー・子猫用';
  if (/シニア|高齢|老犬|老猫/.test(name)) return 'シニア用';
  if (/成犬|成猫|アダルト/.test(name)) return '成犬・成猫用';
  return '-';
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  const idList = (ids || '').split(',').filter(Boolean).slice(0, 3);

  let products: Product[] = [];
  if (idList.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id, name, current_price, brand, category, review_average, review_count, shop_name, item_url, affiliate_url, image_url, description')
      .in('id', idList);
    products = (data || []) as Product[];
    products = idList
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }

  const isFoodCat = (cat: string) => cat.includes('food') || cat.includes('snack');

  const rows: { label: string; render: (p: Product) => React.ReactNode; highlight?: boolean }[] = [
    {
      label: '商品名', render: (p) => (
        <Link href={`/product/${p.id}`} className="text-[#0058B3] hover:underline text-xs leading-snug">
          {p.name}
        </Link>
      )
    },
    {
      label: '画像', render: (p) => p.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image_url} alt={p.name} className="w-20 h-20 object-contain mx-auto" />
      ) : <span className="text-2xl">🐾</span>
    },
    {
      label: '現在価格', highlight: true, render: (p) => (
        <span className="text-[#FF6600] font-bold text-base">¥{p.current_price.toLocaleString()}</span>
      )
    },
    {
      label: '1kgあたり', render: (p) => (
        <span className={`text-xs font-bold ${calcPerKg(p.name, p.current_price, p.category) !== '-' ? 'text-[#CC0000]' : 'text-[#999]'}`}>
          {calcPerKg(p.name, p.current_price, p.category)}
        </span>
      )
    },
    { label: 'カテゴリ', render: (p) => <span className="text-xs">{CATEGORY_CONFIG[p.category]?.label || p.category}</span> },
    { label: 'フードタイプ', render: (p) => <span className="text-xs">{isFoodCat(p.category) ? extractType(p.name) : '-'}</span> },
    { label: '内容量', render: (p) => <span className="text-xs">{extractWeight(p.name)}</span> },
    { label: '対象年齢', render: (p) => <span className="text-xs">{extractAge(p.name)}</span> },
    {
      label: 'レビュー評価', render: (p) => (
        <div className="text-xs">
          <span className="text-yellow-500">{'★'.repeat(Math.round(p.review_average || 0))}</span>
          <span className="ml-1 font-bold">{Number(p.review_average || 0).toFixed(1)}</span>
        </div>
      )
    },
    { label: 'レビュー数', render: (p) => <span className="text-xs">{(p.review_count || 0).toLocaleString()}件</span> },
    { label: 'ブランド', render: (p) => <span className="text-xs">{p.brand || '-'}</span> },
    { label: '販売店', render: (p) => <span className="text-xs">{p.shop_name || '-'}</span> },
    {
      label: '購入', render: (p) => (
        <a
          href={p.affiliate_url || p.item_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#BF0000] text-white text-xs px-3 py-1.5 font-bold hover:bg-[#990000]"
        >
          楽天で購入 →
        </a>
      )
    },
  ];

  // 最安値のインデックスを特定
  const cheapestIdx = products.length > 0
    ? products.reduce((minI, p, i) => p.current_price < products[minI].current_price ? i : minI, 0)
    : -1;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <span className="font-bold">商品比較</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-4">
        <div className="bg-white border border-[#ddd]">
          <div className="bg-[#FF6600] text-white px-4 py-2 font-bold text-sm flex items-center justify-between">
            <span>⚖️ 商品比較</span>
            <span className="text-xs opacity-80">最大3商品まで比較できます</span>
          </div>

          {products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">⚖️</p>
              <p className="text-sm text-[#666] mb-2">比較する商品がありません</p>
              <p className="text-xs text-[#999] mb-4">商品ページの「比較に追加」ボタンを押して商品を追加してください</p>
              <Link href="/" className="text-xs bg-[#FF6600] text-white px-4 py-2 hover:bg-[#e55a00]">商品を探す</Link>
            </div>
          ) : (
            <div className="p-4 overflow-x-auto">
              {/* 最安値バッジ */}
              {products.length > 1 && cheapestIdx >= 0 && (
                <div className="mb-3 text-xs text-[#CC0000] font-bold bg-[#fff0f0] border border-[#ffcccc] px-3 py-1.5 inline-block">
                  💰 最安値: {products[cheapestIdx].name.slice(0, 25)}... ¥{products[cheapestIdx].current_price.toLocaleString()}
                </div>
              )}
              <table className="w-full text-xs border border-[#ddd]">
                <thead>
                  <tr className="bg-[#f8f8f8] border-b border-[#ddd]">
                    <th className="px-3 py-2 text-left font-bold text-[#555] w-28 border-r border-[#ddd]">比較項目</th>
                    {products.map((p, i) => (
                      <th key={p.id} className={`px-3 py-2 text-center border-r border-[#ddd] ${i === cheapestIdx && products.length > 1 ? 'bg-[#fff8f0]' : ''}`}>
                        <div className="text-xs font-bold text-[#333] line-clamp-2 leading-snug">{p.name.slice(0, 30)}{p.name.length > 30 ? '...' : ''}</div>
                        {i === cheapestIdx && products.length > 1 && (
                          <span className="text-xs bg-[#CC0000] text-white px-1.5 py-0.5 mt-1 inline-block">最安値</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className={`border-b border-[#eee] ${row.highlight ? 'bg-[#fffbf8]' : ''}`}>
                      <td className="px-3 py-2 bg-[#f5f5f5] font-bold text-[#555] border-r border-[#ddd] whitespace-nowrap">{row.label}</td>
                      {products.map((p, i) => (
                        <td key={p.id} className={`px-3 py-2 border-r border-[#ddd] text-center ${i === cheapestIdx && row.highlight && products.length > 1 ? 'bg-[#fff0e8]' : ''}`}>
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
