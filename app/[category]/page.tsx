import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const CATEGORY_CONFIG: Record<string, { label: string; petType: string; dbCategory: string }> = {
  'dog-food': { label: 'ドッグフード', petType: 'dog', dbCategory: 'dog-food' },
  'cat-food': { label: 'キャットフード', petType: 'cat', dbCategory: 'cat-food' },
  'dog-goods': { label: '犬用品', petType: 'dog', dbCategory: 'dog-goods' },
  'cat-goods': { label: '猫用品', petType: 'cat', dbCategory: 'cat-goods' },
};

const PAGE_SIZE = 20;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    age?: string;
    minReview?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  if (!config) return {};
  return {
    title: `${config.label}の最安値比較 | ペットプライス`,
    description: `楽天市場の${config.label}を価格・レビューで比較。価格推移グラフで買い時がわかる。`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const sp = await searchParams;
  const config = CATEGORY_CONFIG[category];
  if (!config) notFound();

  const page = Number(sp.page || 1);
  const sort = sp.sort || 'review_count';
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average', { count: 'exact' })
    .eq('category', config.dbCategory);

  if (sp.minPrice) query = query.gte('current_price', Number(sp.minPrice));
  if (sp.maxPrice) query = query.lte('current_price', Number(sp.maxPrice));
  if (sp.age && sp.age !== 'all') query = query.eq('age_group', sp.age);
  if (sp.minReview) query = query.gte('review_average', Number(sp.minReview));

  if (sort === 'price_asc') query = query.order('current_price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('current_price', { ascending: false });
  else query = query.order('review_count', { ascending: false });

  query = query.range(from, from + PAGE_SIZE - 1);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ ...sp, ...overrides } as Record<string, string>);
    return `/${category}?${p.toString()}`;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[#FF6B35] shrink-0">ペットプライス🐾</Link>
          <form action="/search" className="flex-1 max-w-md">
            <input name="q" placeholder="商品名を検索..." className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#2E4057] mb-6">{config.label}</h1>

        {/* Filters */}
        <form method="get" className="bg-white rounded-xl p-4 shadow mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">価格帯</label>
            <div className="flex items-center gap-1">
              <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-20 border rounded px-2 py-1 text-sm" />
              <span className="text-sm">〜</span>
              <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-20 border rounded px-2 py-1 text-sm" />
              <span className="text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">年齢</label>
            <select name="age" defaultValue={sp.age || 'all'} className="border rounded px-2 py-1 text-sm">
              <option value="all">すべて</option>
              <option value="puppy">子犬・子猫</option>
              <option value="senior">シニア</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">評価</label>
            <select name="minReview" defaultValue={sp.minReview || ''} className="border rounded px-2 py-1 text-sm">
              <option value="">すべて</option>
              <option value="4">★4以上</option>
              <option value="4.5">★4.5以上</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">並び替え</label>
            <select name="sort" defaultValue={sort} className="border rounded px-2 py-1 text-sm">
              <option value="review_count">レビュー数順</option>
              <option value="price_asc">安い順</option>
              <option value="price_desc">高い順</option>
            </select>
          </div>
          <button type="submit" className="bg-[#FF6B35] text-white px-4 py-1.5 rounded-lg text-sm font-semibold">絞り込む</button>
        </form>

        <p className="text-sm text-gray-500 mb-4">{count?.toLocaleString()}件</p>

        {!products || products.length === 0 ? (
          <p className="text-gray-500">商品が見つかりませんでした。</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">← 前へ</Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, page - 2) + i;
              if (p > totalPages) return null;
              return (
                <Link key={p} href={buildUrl({ page: String(p) })}
                  className={`px-4 py-2 rounded-lg text-sm ${p === page ? 'bg-[#FF6B35] text-white' : 'border hover:bg-gray-100'}`}>
                  {p}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">次へ →</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
