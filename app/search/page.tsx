import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SiteHeader from '@/components/SiteHeader';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/app/[category]/page';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    petType?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';

  let query = supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name', { count: 'exact' });

  if (q) query = query.ilike('name', `%${q}%`);
  if (sp.petType && sp.petType !== 'all') query = query.eq('pet_type', sp.petType);
  if (sp.minPrice) query = query.gte('current_price', Number(sp.minPrice));
  if (sp.maxPrice) query = query.lte('current_price', Number(sp.maxPrice));

  query = query.order('review_count', { ascending: false }).limit(40);

  const { data: products, count } = await query;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <Link href="/" className="text-[#0058B3] hover:underline">ペット</Link>
          <span className="mx-1">{'>'}</span>
          <span>検索</span>
          {q && <><span className="mx-1">{'>'}</span><span>「{q}」</span></>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
        <aside className="w-44 shrink-0 hidden md:block">
          {SIDEBAR_GROUPS.map((section) => (
            <div key={section.label} className="border border-[#ddd] border-b-0 mb-0">
              <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1.5">{section.label}</div>
              {section.subgroups.map((sub) => (
                <div key={sub.label}>
                  <div className="bg-[#f5f5f5] text-[#666] text-xs px-2 py-1 border-t border-[#eee] font-bold">{sub.label}</div>
                  {sub.keys.map((key) => {
                    const c = CATEGORY_CONFIG[key];
                    return (
                      <Link
                        key={key}
                        href={`/${key}`}
                        className="block px-3 py-1.5 text-xs text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE] border-t border-[#eee] transition-colors"
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="border-t border-[#eee]" />
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* 検索フォーム */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h1 className="text-sm font-bold text-[#333]">🔍 キーワード検索</h1>
            </div>
            <form method="get" className="p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="製品名・メーカーなど"
                  className="flex-1 border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                />
                <button type="submit" className="bg-[#FF6600] text-white px-4 py-1.5 text-sm font-bold hover:bg-[#e55a00] whitespace-nowrap">
                  検索する
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[#666]">ペット種別:</span>
                  <select name="petType" defaultValue={sp.petType || 'all'} className="border border-[#ccc] px-2 py-1 text-xs focus:outline-none">
                    <option value="all">すべて</option>
                    <option value="dog">犬</option>
                    <option value="cat">猫</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#666]">価格帯:</span>
                  <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-16 border border-[#ccc] px-1 py-1 text-xs focus:outline-none" />
                  <span>〜</span>
                  <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-16 border border-[#ccc] px-1 py-1 text-xs focus:outline-none" />
                  <span>円</span>
                </div>
              </div>
            </form>
          </div>

          {/* 検索結果 */}
          <div className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">
                {q ? `「${q}」の検索結果` : '検索結果'}
              </h2>
              {count != null && (
                <span className="text-xs text-[#999]">{count.toLocaleString()}件</span>
              )}
            </div>

            {!products || products.length === 0 ? (
              <div className="text-center py-12 text-[#999]">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm">
                  {q ? `「${q}」に一致する商品が見つかりませんでした` : 'キーワードを入力して検索してください'}
                </p>
                {q && <p className="text-xs mt-1">別のキーワードをお試しください</p>}
              </div>
            ) : (
              <div className="grid grid-cols-4 divide-x divide-y divide-[#eee]">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white mt-6 py-4 px-3 text-xs text-[#aaa]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 mb-3">
          {SIDEBAR_GROUPS.map((section) => (
            <div key={section.label}>
              <p className="font-bold text-white mb-1">{section.label}</p>
              {section.subgroups.flatMap((sub) => sub.keys).map((key) => (
                <Link key={key} href={`/${key}`} className="block text-[#aaa] hover:text-white mb-0.5">
                  {CATEGORY_CONFIG[key].label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-[#555] pt-3 text-center">
          <p>ペットプライス - ペット用品 通販・価格比較</p>
          <p className="mt-1">楽天市場の商品情報を毎日自動取得・比較。※ 価格は実際の価格と異なる場合があります。</p>
        </div>
      </footer>
    </div>
  );
}
