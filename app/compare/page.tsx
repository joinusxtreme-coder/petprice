import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';

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
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  const idList = (ids || '').split(',').filter(Boolean).slice(0, 3);

  let products: Product[] = [];
  if (idList.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id, name, current_price, brand, category, review_average, review_count, shop_name, item_url, affiliate_url')
      .in('id', idList);
    products = (data || []) as Product[];
    // Preserve order
    products = idList
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: '商品名', render: (p) => <Link href={`/product/${p.id}`} className="text-[#0058B3] hover:underline text-xs">{p.name}</Link> },
    { label: '現在価格', render: (p) => <span className="text-[#FF6600] font-bold text-sm">¥{p.current_price.toLocaleString()}</span> },
    { label: 'ブランド', render: (p) => <span className="text-xs">{p.brand || '-'}</span> },
    { label: 'カテゴリ', render: (p) => <span className="text-xs">{p.category}</span> },
    { label: 'レビュー平均', render: (p) => (
      <span className="text-xs">
        <span className="text-yellow-500">{'★'.repeat(Math.round(p.review_average || 0))}</span>
        {' '}{Number(p.review_average || 0).toFixed(1)}
      </span>
    )},
    { label: 'レビュー数', render: (p) => <span className="text-xs">{(p.review_count || 0).toLocaleString()}件</span> },
    { label: '販売店', render: (p) => <span className="text-xs">{p.shop_name || '-'}</span> },
    { label: '購入', render: (p) => (
      <a
        href={p.affiliate_url || p.item_url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#BF0000] text-white text-xs px-3 py-1.5 font-bold hover:bg-[#990000]"
      >
        楽天で購入
      </a>
    )},
  ];

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-3 py-4">
        <div className="bg-white border border-[#ddd]">
          <div className="bg-[#FF6600] text-white px-4 py-2 font-bold text-sm">商品比較</div>
          <div className="p-4">
            {products.length === 0 ? (
              <div className="text-xs text-[#999] py-4">
                比較する商品がありません。商品ページから「比較に追加」ボタンを押してください。
                <br />
                <Link href="/" className="text-[#0058B3] hover:underline mt-2 inline-block">トップへ戻る</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#ddd]">
                  <thead>
                    <tr className="bg-[#f8f8f8] border-b border-[#ddd]">
                      <th className="px-3 py-2 text-left font-bold text-[#555] w-28 border-r border-[#ddd]">項目</th>
                      {products.map((p) => (
                        <th key={p.id} className="px-3 py-2 text-left font-bold text-[#333] border-r border-[#ddd]">
                          {p.name.slice(0, 30)}{p.name.length > 30 ? '...' : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className="border-b border-[#eee]">
                        <td className="px-3 py-2 bg-[#f5f5f5] font-bold text-[#555] border-r border-[#ddd]">{row.label}</td>
                        {products.map((p) => (
                          <td key={p.id} className="px-3 py-2 border-r border-[#ddd]">{row.render(p)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
