import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; petType: string; dbCategory: string; group: string }> = {
  // 犬
  'dog-food':   { label: 'ドッグフード',     icon: '🐕', petType: 'dog', dbCategory: 'dog-food',   group: '犬' },
  'dog-snack':  { label: '犬のおやつ',       icon: '🦴', petType: 'dog', dbCategory: 'dog-snack',  group: '犬' },
  'dog-walk':   { label: 'お散歩用品',       icon: '🐕‍🦺', petType: 'dog', dbCategory: 'dog-walk',   group: '犬' },
  'dog-care':   { label: '犬のケア用品',     icon: '🛁', petType: 'dog', dbCategory: 'dog-care',   group: '犬' },
  'dog-goods':  { label: '犬用品',           icon: '🏠', petType: 'dog', dbCategory: 'dog-goods',  group: '犬' },
  // 猫
  'cat-food':   { label: 'キャットフード',   icon: '🐈', petType: 'cat', dbCategory: 'cat-food',   group: '猫' },
  'cat-snack':  { label: '猫のおやつ',       icon: '🐟', petType: 'cat', dbCategory: 'cat-snack',  group: '猫' },
  'cat-toilet': { label: 'トイレ・猫砂',     icon: '🪣', petType: 'cat', dbCategory: 'cat-toilet', group: '猫' },
  'cat-tower':  { label: 'キャットタワー',   icon: '🏰', petType: 'cat', dbCategory: 'cat-tower',  group: '猫' },
  'cat-care':   { label: '猫のケア用品',     icon: '✂️', petType: 'cat', dbCategory: 'cat-care',   group: '猫' },
  'cat-goods':  { label: '猫用品',           icon: '🧶', petType: 'cat', dbCategory: 'cat-goods',  group: '猫' },
  // 共通
  'pet-sheets': { label: 'ペットシーツ',     icon: '📄', petType: 'other', dbCategory: 'pet-sheets', group: 'その他' },
};

export const CATEGORY_GROUPS = [
  {
    label: '🐕 犬',
    items: ['dog-food', 'dog-snack', 'dog-walk', 'dog-care', 'dog-goods'],
  },
  {
    label: '🐈 猫',
    items: ['cat-food', 'cat-snack', 'cat-toilet', 'cat-tower', 'cat-care', 'cat-goods'],
  },
  {
    label: '🏠 共通',
    items: ['pet-sheets'],
  },
];

const PAGE_SIZE = 24;

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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#FF6B35] shrink-0">ペットプライス🐾</Link>
          <form action="/search" className="flex-1 max-w-xl">
            <div className="flex">
              <input name="q" placeholder="商品名・ブランドで検索..." className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
              <button type="submit" className="bg-[#FF6B35] text-white px-4 py-2 rounded-r-full text-sm font-medium">検索</button>
            </div>
          </form>
        </div>
      </header>

      {/* Category nav bar */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center">
                <span className="text-xs text-gray-400 px-3 py-3 whitespace-nowrap border-r">{group.label}</span>
                {group.items.map((key) => {
                  const c = CATEGORY_CONFIG[key];
                  return (
                    <Link
                      key={key}
                      href={`/${key}`}
                      className={`text-xs px-3 py-3 whitespace-nowrap hover:text-[#FF6B35] hover:bg-orange-50 transition-colors ${
                        key === category ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-gray-600'
                      }`}
                    >
                      {c.icon} {c.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-[#FF6B35]">ホーム</Link>
          <span>›</span>
          <span className="text-gray-700">{config.label}</span>
        </div>

        <h1 className="text-xl font-bold text-[#2E4057] mb-4">{config.icon} {config.label}</h1>

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
          {(config.petType === 'dog' || config.petType === 'cat') && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">年齢</label>
              <select name="age" defaultValue={sp.age || 'all'} className="border rounded px-2 py-1 text-sm">
                <option value="all">すべて</option>
                <option value="puppy">子犬・子猫</option>
                <option value="senior">シニア</option>
              </select>
            </div>
          )}
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
              <option value="review_count">人気順</option>
              <option value="price_asc">安い順</option>
              <option value="price_desc">高い順</option>
            </select>
          </div>
          <button type="submit" className="bg-[#FF6B35] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#e85d2a]">絞り込む</button>
        </form>

        <p className="text-sm text-gray-500 mb-4">{count?.toLocaleString()}件の商品</p>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🐾</p>
            <p>商品が見つかりませんでした</p>
            <p className="text-xs mt-2">毎日3時に商品を自動取得しています</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }}
                rank={page === 1 ? i + 1 : undefined}
              />
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
