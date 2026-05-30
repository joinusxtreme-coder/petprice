import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductListItem from '@/components/ProductListItem';
import ProductCard from '@/components/ProductCard';

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; petType: string; dbCategory: string; group: string }> = {
  'dog-food':   { label: 'ドッグフード',   icon: '🐕', petType: 'dog', dbCategory: 'dog-food',   group: '犬' },
  'dog-snack':  { label: '犬のおやつ',     icon: '🦴', petType: 'dog', dbCategory: 'dog-snack',  group: '犬' },
  'dog-walk':   { label: 'お散歩用品',     icon: '🐕‍🦺', petType: 'dog', dbCategory: 'dog-walk',   group: '犬' },
  'dog-care':   { label: '犬のケア用品',   icon: '🛁', petType: 'dog', dbCategory: 'dog-care',   group: '犬' },
  'dog-goods':  { label: '犬用品',         icon: '🏠', petType: 'dog', dbCategory: 'dog-goods',  group: '犬' },
  'cat-food':   { label: 'キャットフード', icon: '🐈', petType: 'cat', dbCategory: 'cat-food',   group: '猫' },
  'cat-snack':  { label: '猫のおやつ',     icon: '🐟', petType: 'cat', dbCategory: 'cat-snack',  group: '猫' },
  'cat-toilet': { label: 'トイレ・猫砂',   icon: '🪣', petType: 'cat', dbCategory: 'cat-toilet', group: '猫' },
  'cat-tower':  { label: 'キャットタワー', icon: '🏰', petType: 'cat', dbCategory: 'cat-tower',  group: '猫' },
  'cat-care':   { label: '猫のケア用品',   icon: '✂️', petType: 'cat', dbCategory: 'cat-care',   group: '猫' },
  'cat-goods':  { label: '猫用品',         icon: '🧶', petType: 'cat', dbCategory: 'cat-goods',  group: '猫' },
  'pet-sheets': { label: 'ペットシーツ',   icon: '📄', petType: 'other', dbCategory: 'pet-sheets', group: '共通' },
};

export const CATEGORY_GROUPS = [
  { label: '🐕 犬', items: ['dog-food', 'dog-snack', 'dog-walk', 'dog-care', 'dog-goods'] },
  { label: '🐈 猫', items: ['cat-food', 'cat-snack', 'cat-toilet', 'cat-tower', 'cat-care', 'cat-goods'] },
  { label: '🏠 共通', items: ['pet-sheets'] },
];

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
    view?: string;
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
  const view = sp.view || 'list';
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name', { count: 'exact' })
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
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-[#E4007F] shrink-0">
            ペットプライス
          </Link>
          <form action="/search" className="flex-1 max-w-xl">
            <div className="flex">
              <input
                name="q"
                placeholder="商品名・ブランドで検索..."
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-[#E4007F]"
              />
              <button
                type="submit"
                className="bg-[#E4007F] text-white px-5 py-2 rounded-r text-sm font-bold hover:bg-[#c0006a] transition-colors"
              >
                検索
              </button>
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-4">
        {/* Left Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <div className="bg-white border border-gray-200 rounded">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 border-b border-gray-200">
                  {group.label}
                </div>
                {group.items.map((key) => {
                  const c = CATEGORY_CONFIG[key];
                  return (
                    <Link
                      key={key}
                      href={`/${key}`}
                      className={`flex items-center gap-2 px-3 py-2 text-xs border-b border-gray-100 hover:bg-pink-50 hover:text-[#E4007F] transition-colors ${
                        key === category
                          ? 'bg-pink-50 text-[#E4007F] font-bold border-l-2 border-[#E4007F]'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Price filter */}
          <div className="bg-white border border-gray-200 rounded mt-3">
            <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 border-b border-gray-200">
              価格で絞り込む
            </div>
            <form method="get" className="p-3 space-y-2">
              <input type="hidden" name="sort" value={sort} />
              <input type="hidden" name="view" value={view} />
              <div className="flex items-center gap-1 text-xs">
                <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-full border rounded px-2 py-1 text-xs" />
                <span>〜</span>
                <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-full border rounded px-2 py-1 text-xs" />
                <span>円</span>
              </div>
              {(config.petType === 'dog' || config.petType === 'cat') && (
                <select name="age" defaultValue={sp.age || 'all'} className="w-full border rounded px-2 py-1 text-xs">
                  <option value="all">年齢: すべて</option>
                  <option value="puppy">子犬・子猫</option>
                  <option value="senior">シニア</option>
                </select>
              )}
              <select name="minReview" defaultValue={sp.minReview || ''} className="w-full border rounded px-2 py-1 text-xs">
                <option value="">評価: すべて</option>
                <option value="4">★4以上</option>
                <option value="4.5">★4.5以上</option>
              </select>
              <button type="submit" className="w-full bg-[#E4007F] text-white py-1.5 rounded text-xs font-bold hover:bg-[#c0006a]">
                絞り込む
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-[#E4007F]">ホーム</Link>
            <span>›</span>
            <span className="text-gray-600">{config.label}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded">
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-gray-800">{config.icon} {config.label}</h1>
                <span className="text-xs text-gray-500">{count?.toLocaleString()}件</span>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
                  <Link
                    href={buildUrl({ view: 'list', page: '1' })}
                    className={`px-3 py-1.5 ${view === 'list' ? 'bg-[#E4007F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    ≡ リスト
                  </Link>
                  <Link
                    href={buildUrl({ view: 'grid', page: '1' })}
                    className={`px-3 py-1.5 ${view === 'grid' ? 'bg-[#E4007F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    ⊞ グリッド
                  </Link>
                </div>
                {/* Sort */}
                <form method="get">
                  <input type="hidden" name="view" value={view} />
                  <input type="hidden" name="minPrice" value={sp.minPrice || ''} />
                  <input type="hidden" name="maxPrice" value={sp.maxPrice || ''} />
                  <input type="hidden" name="age" value={sp.age || ''} />
                  <input type="hidden" name="minReview" value={sp.minReview || ''} />
                  <select
                    name="sort"
                    defaultValue={sort}
                    onChange="this.form.submit()"
                    className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E4007F]"
                  >
                    <option value="review_count">人気順</option>
                    <option value="price_asc">安い順</option>
                    <option value="price_desc">高い順</option>
                  </select>
                  <button type="submit" className="ml-1 text-xs text-[#E4007F] underline">並替</button>
                </form>
              </div>
            </div>

            {/* Products */}
            {!products || products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-3">🐾</p>
                <p className="text-sm">商品が見つかりませんでした</p>
                <p className="text-xs mt-2 text-gray-300">毎日3時に商品を自動取得しています</p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
                {products.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }}
                    rank={page === 1 ? i + 1 : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {products.map((p, i) => (
                  <div key={p.id} className="px-4 py-3">
                    <ProductListItem
                      product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }}
                      rank={page === 1 ? i + 1 : undefined}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1 py-4 border-t border-gray-100">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    ‹ 前
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = Math.max(1, page - 3) + i;
                  if (p > totalPages) return null;
                  return (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`px-3 py-1.5 rounded text-sm border ${
                        p === page
                          ? 'bg-[#E4007F] text-white border-[#E4007F]'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    次 ›
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
