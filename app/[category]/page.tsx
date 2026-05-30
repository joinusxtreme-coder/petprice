import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  { label: '犬', items: ['dog-food', 'dog-snack', 'dog-walk', 'dog-care', 'dog-goods'] },
  { label: '猫', items: ['cat-food', 'cat-snack', 'cat-toilet', 'cat-tower', 'cat-care', 'cat-goods'] },
  { label: '共通', items: ['pet-sheets'] },
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
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  if (!config) return {};
  return {
    title: `${config.label} 通販・価格比較 | ペットプライス`,
    description: `楽天市場の${config.label}を価格・レビューで比較。価格推移グラフで最安値・買い時がわかる。`,
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

  // トップ5（注目ランキング用）
  const { data: top5 } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average')
    .eq('category', config.dbCategory)
    .order('review_count', { ascending: false })
    .limit(5);

  // 全製品（絞り込み・ページング）
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

  const isFiltered = !!(sp.minPrice || sp.maxPrice || (sp.age && sp.age !== 'all') || sp.minReview);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b-2 border-[#FF6600]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペット<br /><span className="text-xs font-normal text-[#666]">価格比較</span></span>
          </Link>
          <form action="/search" className="flex-1 max-w-2xl flex">
            <input
              name="q"
              placeholder="メーカー、製品カテゴリ、製品名、型番..."
              className="flex-1 border border-[#ccc] border-r-0 px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
            />
            <button type="submit" className="bg-[#FF6600] text-white px-4 py-1.5 text-sm font-bold hover:bg-[#e55a00] whitespace-nowrap">
              検索
            </button>
          </form>
        </div>
      </header>

      {/* Page title */}
      <div className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-1.5">
          <div className="text-xs text-[#666] mb-1">
            <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
            <span className="mx-1">{'>'}</span>
            <Link href="/" className="text-[#0058B3] hover:underline">ペット</Link>
            <span className="mx-1">{'>'}</span>
            <span>{config.label}</span>
          </div>
          <h1 className="text-lg font-bold text-[#333] border-l-4 border-[#FF6600] pl-2">
            {config.label} 通販 価格比較
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
        <aside className="w-44 shrink-0 hidden md:block space-y-2">
          {/* 全製品ボタン */}
          <Link href={`/${category}`} className="block bg-[#FF6600] text-white text-sm font-bold text-center py-2 hover:bg-[#e55a00]">
            {config.label}<br />全製品を見る
          </Link>
          <div className="text-xs text-[#0058B3] hover:underline cursor-pointer text-center">
            全製品（{count?.toLocaleString()}製品）
          </div>

          {/* カテゴリ内検索 */}
          <div className="bg-white border border-[#ddd] p-2">
            <p className="text-xs text-[#666] mb-1 font-bold">すべての製品から検索</p>
            <form action="/search" className="flex">
              <input name="q" placeholder="製品名など" className="flex-1 border border-[#ccc] px-1 py-1 text-xs w-0 min-w-0 focus:outline-none focus:border-[#FF6600]" />
              <button type="submit" className="bg-[#ddd] px-1.5 text-xs border border-[#ccc] border-l-0 hover:bg-[#ccc]">🔍</button>
            </form>
          </div>

          {/* カテゴリ一覧 */}
          <div className="bg-white border border-[#ddd]">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1">{group.label}</div>
                {group.items.map((key) => {
                  const c = CATEGORY_CONFIG[key];
                  return (
                    <Link
                      key={key}
                      href={`/${key}`}
                      className={`flex items-center gap-1 px-2 py-1.5 text-xs border-b border-[#eee] hover:bg-[#FFF5EE] ${key === category ? 'bg-[#FFF5EE] text-[#FF6600] font-bold' : 'text-[#0058B3]'}`}
                    >
                      {c.icon} {c.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 絞り込み */}
          <div className="bg-white border border-[#ddd]">
            <div className="bg-[#666] text-white text-xs font-bold px-2 py-1">絞り込み条件</div>
            <form method="get" className="p-2 space-y-2">
              <div>
                <p className="text-xs font-bold text-[#333] mb-1">価格帯</p>
                <div className="flex items-center gap-1 text-xs">
                  <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none focus:border-[#FF6600]" />
                  <span>〜</span>
                  <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none focus:border-[#FF6600]" />
                </div>
                <span className="text-xs text-[#999]">円</span>
              </div>
              {(config.petType === 'dog' || config.petType === 'cat') && (
                <div>
                  <p className="text-xs font-bold text-[#333] mb-1">年齢</p>
                  <select name="age" defaultValue={sp.age || 'all'} className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none">
                    <option value="all">すべて</option>
                    <option value="puppy">子犬・子猫</option>
                    <option value="senior">シニア</option>
                  </select>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-[#333] mb-1">評価</p>
                <select name="minReview" defaultValue={sp.minReview || ''} className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none">
                  <option value="">すべて</option>
                  <option value="4">★4以上</option>
                  <option value="4.5">★4.5以上</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#FF6600] text-white text-xs font-bold py-1.5 hover:bg-[#e55a00]">
                絞り込み条件を一括追加
              </button>
              {isFiltered && (
                <Link href={`/${category}`} className="block text-center text-xs text-[#0058B3] hover:underline">
                  条件をクリア
                </Link>
              )}
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* 注目ランキング（トップ5）*/}
          {top5 && top5.length > 0 && !isFiltered && page === 1 && (
            <section className="bg-white border border-[#ddd]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">
                  🏆 {config.label} 注目ランキング
                </h2>
                <Link href={`/${category}?sort=review_count`} className="text-xs text-[#0058B3] hover:underline">
                  注目ランキングをもっと見る
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-0 divide-x divide-[#eee] p-2">
                {(top5 as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }[]).map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* 全製品リスト */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-[#333]">
                  人気売れ筋ランキング
                </h2>
                <span className="text-xs text-[#999]">{count?.toLocaleString()}件</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#666]">並び替え:</span>
                <form method="get" className="flex items-center gap-1">
                  <input type="hidden" name="minPrice" value={sp.minPrice || ''} />
                  <input type="hidden" name="maxPrice" value={sp.maxPrice || ''} />
                  <input type="hidden" name="age" value={sp.age || ''} />
                  <input type="hidden" name="minReview" value={sp.minReview || ''} />
                  <select name="sort" defaultValue={sort} className="border border-[#ccc] text-xs px-1 py-1 focus:outline-none focus:border-[#FF6600]">
                    <option value="review_count">人気順</option>
                    <option value="price_asc">安い順</option>
                    <option value="price_desc">高い順</option>
                  </select>
                  <button type="submit" className="text-xs bg-[#ddd] border border-[#ccc] px-2 py-1 hover:bg-[#ccc]">並替</button>
                </form>
              </div>
            </div>

            {!products || products.length === 0 ? (
              <div className="text-center py-12 text-[#999]">
                <p className="text-3xl mb-2">🐾</p>
                <p className="text-sm">商品が見つかりませんでした</p>
                <p className="text-xs mt-1">毎日3時に商品を自動取得しています</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-0 divide-x divide-y divide-[#eee] p-0">
                {(products as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }[]).map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    rank={page === 1 && !isFiltered ? i + 6 : undefined}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1 py-4 border-t border-[#eee]">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1 border border-[#ccc] text-sm text-[#0058B3] hover:bg-[#f0f0f0]">
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
                      className={`px-3 py-1 border text-sm ${p === page ? 'bg-[#FF6600] text-white border-[#FF6600]' : 'border-[#ccc] text-[#0058B3] hover:bg-[#f0f0f0]'}`}
                    >
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1 border border-[#ccc] text-sm text-[#0058B3] hover:bg-[#f0f0f0]">
                    次 ›
                  </Link>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white mt-6 py-4 px-3 text-xs text-center text-[#aaa]">
        <p className="font-bold text-white mb-1">ペットプライス - ペット用品価格比較</p>
        <p>楽天市場の商品情報を毎日自動取得・比較しています。</p>
        <p className="mt-1">※ 価格は楽天市場の情報をもとにしており、実際の価格と異なる場合があります。</p>
      </footer>
    </div>
  );
}
