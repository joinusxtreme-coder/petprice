import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductListItem from '@/components/ProductListItem';

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; petType: string; dbCategory: string; group: string }> = {
  'dog-food':   { label: 'ドッグフード',   icon: '🐕', petType: 'dog', dbCategory: 'dog-food',   group: '犬用品' },
  'dog-snack':  { label: '犬のおやつ',     icon: '🦴', petType: 'dog', dbCategory: 'dog-snack',  group: '犬用品' },
  'dog-walk':   { label: 'お散歩用品',     icon: '🐕‍🦺', petType: 'dog', dbCategory: 'dog-walk',   group: '犬用品' },
  'dog-care':   { label: '犬のケア用品',   icon: '🛁', petType: 'dog', dbCategory: 'dog-care',   group: '犬用品' },
  'dog-goods':  { label: '犬用品',         icon: '🏠', petType: 'dog', dbCategory: 'dog-goods',  group: '犬用品' },
  'cat-food':   { label: 'キャットフード', icon: '🐈', petType: 'cat', dbCategory: 'cat-food',   group: '猫用品' },
  'cat-snack':  { label: '猫のおやつ',     icon: '🐟', petType: 'cat', dbCategory: 'cat-snack',  group: '猫用品' },
  'cat-toilet': { label: 'トイレ・猫砂',   icon: '🪣', petType: 'cat', dbCategory: 'cat-toilet', group: '猫用品' },
  'cat-tower':  { label: 'キャットタワー', icon: '🏰', petType: 'cat', dbCategory: 'cat-tower',  group: '猫用品' },
  'cat-care':   { label: '猫のケア用品',   icon: '✂️', petType: 'cat', dbCategory: 'cat-care',   group: '猫用品' },
  'cat-goods':  { label: '猫用品',         icon: '🧶', petType: 'cat', dbCategory: 'cat-goods',  group: '猫用品' },
  'pet-sheets': { label: 'ペットシーツ',   icon: '📄', petType: 'other', dbCategory: 'pet-sheets', group: '共通' },
};

// Flat groups (used by footer etc.)
export const CATEGORY_GROUPS = [
  { label: '犬用品', items: ['dog-food', 'dog-snack', 'dog-walk', 'dog-care', 'dog-goods'] },
  { label: '猫用品', items: ['cat-food', 'cat-snack', 'cat-toilet', 'cat-tower', 'cat-care', 'cat-goods'] },
  { label: '共通', items: ['pet-sheets'] },
];

// Sidebar with sub-groups (kakaku.com style)
export const SIDEBAR_GROUPS = [
  {
    label: '犬用品',
    subgroups: [
      { label: 'フード・食事', keys: ['dog-food', 'dog-snack'] },
      { label: 'お散歩・アウトドア', keys: ['dog-walk'] },
      { label: 'ヘルスケア', keys: ['dog-care'] },
      { label: 'ハウス・バッグ', keys: ['dog-goods'] },
    ],
  },
  {
    label: '猫用品',
    subgroups: [
      { label: 'フード・食事', keys: ['cat-food', 'cat-snack'] },
      { label: 'トイレ・衛生用品', keys: ['cat-toilet'] },
      { label: 'キャットタワー・ケージ', keys: ['cat-tower', 'cat-goods'] },
      { label: 'ヘルスケア', keys: ['cat-care'] },
    ],
  },
  {
    label: '共通',
    subgroups: [
      { label: 'トイレ用品', keys: ['pet-sheets'] },
    ],
  },
];

// カテゴリ別 人気検索条件（kakaku.com の「人気検索条件」タグクラウド相当）
export const POPULAR_SEARCHES: Record<string, string[]> = {
  'dog-food':   ['ヒルズ', 'ロイヤルカナン', 'ニュートロ', 'アカナ', 'グランデリ', '療法食', '無添加', '穀物不使用', '小型犬', 'シニア', 'パピー', '国産'],
  'dog-snack':  ['ジャーキー', 'デンタルガム', '無添加', '国産', 'ガム', '骨'],
  'dog-walk':   ['小型犬', 'ハーネス', '伸縮リード', '首輪', 'マナーウェア'],
  'dog-care':   ['シャンプー', 'サプリ', 'デンタル', 'グルーミング', '爪切り'],
  'dog-goods':  ['ケージ', 'ベッド', 'おもちゃ', 'キャリー', '給水器', '服'],
  'cat-food':   ['ロイヤルカナン', 'ヒルズ', 'ニュートロ', 'モグニャン', '療法食', '無添加', '穀物不使用', '子猫', 'シニア', '尿路ケア', 'インドア', '毛玉ケア'],
  'cat-snack':  ['ちゅーる', 'INABA', '無添加', 'パウチ', '国産'],
  'cat-toilet': ['鉱物系', '木系', '紙系', 'おから', 'シリカゲル', 'システムトイレ', '消臭'],
  'cat-tower':  ['大型', 'スリム', '突っ張り', '据え置き', '麻縄'],
  'cat-care':   ['シャンプー', 'グルーミング', 'デンタル', 'サプリ', '爪切り'],
  'cat-goods':  ['電動おもちゃ', 'ベッド', 'ドーム型', '給水器', 'ハンモック', 'キャリー'],
  'pet-sheets': ['ワイド', 'スーパーワイド', '厚型', 'レギュラー', '業務用', '消臭'],
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
    brand?: string;
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
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', config.dbCategory)
    .order('review_count', { ascending: false })
    .limit(5);

  // 新着商品（過去60日以内に登録/更新）
  const since60 = new Date();
  since60.setDate(since60.getDate() - 60);
  const { data: newProducts } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', config.dbCategory)
    .gte('updated_at', since60.toISOString())
    .order('updated_at', { ascending: false })
    .limit(4);

  // 全製品（絞り込み・ページング）
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

  const isFiltered = !!(sp.minPrice || sp.maxPrice || (sp.age && sp.age !== 'all') || sp.minReview || sp.brand);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      {/* Top orange line */}
      <div className="bg-[#FF6600] h-1" />

      {/* Header */}
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
            <span className="text-[#666] text-base">🐾 ペット</span>
          </Link>
          <form action="/search" className="flex-1 max-w-lg flex">
            <input
              name="q"
              placeholder="キーワード検索"
              className="flex-1 border border-[#ccc] border-r-0 px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
            />
            <button type="submit" className="bg-[#FF6600] text-white px-4 py-1.5 text-sm font-bold hover:bg-[#e55a00]">
              検索
            </button>
          </form>
        </div>
      </header>

      {/* Page title bar */}
      <div className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-1.5">
          <div className="text-xs text-[#666] mb-1">
            <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
            <span className="mx-1">{'>'}</span>
            <Link href="/" className="text-[#0058B3] hover:underline">ペット</Link>
            <span className="mx-1">{'>'}</span>
            <span>{config.label}</span>
          </div>
          <h1 className="text-base font-bold text-[#333]">
            {config.label} 通販 価格比較
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
        <aside className="w-44 shrink-0 hidden md:block space-y-2">
          {/* 全製品ボタン */}
          <Link href={`/${category}`} className="block bg-[#FF6600] text-white text-sm font-bold text-center py-2 px-2 hover:bg-[#e55a00]">
            {config.label}<br />全製品を見る
          </Link>
          <div className="text-center">
            <span className="text-xs text-[#0058B3]">全製品（{count?.toLocaleString() ?? '—'}製品）</span>
          </div>

          {/* カテゴリ内検索 */}
          <div className="bg-white border border-[#ddd] p-2">
            <p className="text-xs text-[#666] mb-1 font-bold">すべての製品から検索</p>
            <form action="/search" className="flex">
              <input name="q" placeholder="製品名など" className="flex-1 border border-[#ccc] px-1 py-1 text-xs w-0 min-w-0 focus:outline-none focus:border-[#FF6600]" />
              <button type="submit" className="bg-[#ddd] px-1.5 text-xs border border-[#ccc] border-l-0 hover:bg-[#ccc]">🔍</button>
            </form>
          </div>

          {/* 絞り込み */}
          <div className="bg-white border border-[#ddd]">
            <div className="bg-[#666] text-white text-xs font-bold px-2 py-1">▼ 絞り込み条件</div>
            <form method="get" className="p-2 space-y-2">
              <div>
                <p className="text-xs font-bold text-[#333] mb-1">価格帯</p>
                <div className="flex items-center gap-1 text-xs">
                  <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none" />
                  <span>〜</span>
                  <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-full border border-[#ccc] px-1 py-1 text-xs focus:outline-none" />
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
              <button type="submit" className="w-full bg-[#555] text-white text-xs font-bold py-1.5 hover:bg-[#444]">
                絞り込み条件を一括追加
              </button>
              {isFiltered && (
                <Link href={`/${category}`} className="block text-center text-xs text-[#0058B3] hover:underline">
                  条件をクリア
                </Link>
              )}
            </form>
          </div>

          {/* カテゴリ一覧（サブグループ付き） */}
          <div className="bg-white border border-[#ddd]">
            <div className="bg-[#f0f0f0] text-[#555] text-xs font-bold px-2 py-1.5 border-b border-[#ddd]">カテゴリ一覧</div>
            {SIDEBAR_GROUPS.map((section) => (
              <div key={section.label}>
                <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1">{section.label}</div>
                {section.subgroups.map((sub) => (
                  <div key={sub.label}>
                    <div className="bg-[#f5f5f5] text-[#777] text-xs px-2 py-1 border-t border-[#eee]">{sub.label}</div>
                    {sub.keys.map((key) => {
                      const c = CATEGORY_CONFIG[key];
                      return (
                        <Link
                          key={key}
                          href={`/${key}`}
                          className={`block px-3 py-1.5 text-xs border-t border-[#eee] transition-colors ${
                            key === category
                              ? 'bg-[#FFF5EE] text-[#FF6600] font-bold'
                              : 'text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE]'
                          }`}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* キーワード検索 */}
          <div className="bg-white border border-[#ddd] px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-[#666] shrink-0">🔍 キーワード検索</span>
            <form action="/search" className="flex flex-1 gap-2 items-center">
              <input name="q" placeholder="製品名・メーカーなど" className="flex-1 border border-[#ccc] border-r-0 px-2 py-1 text-xs focus:outline-none focus:border-[#FF6600]" />
              <label className="text-xs text-[#666] flex items-center gap-1 cursor-pointer">
                <input type="radio" name="scope" value="all" defaultChecked /> すべて
              </label>
              <label className="text-xs text-[#666] flex items-center gap-1 cursor-pointer">
                <input type="radio" name="scope" value="cat" /> このカテゴリ内で
              </label>
              <button className="bg-[#FF6600] text-white px-3 py-1 text-xs hover:bg-[#e55a00]">検索</button>
            </form>
          </div>

          {/* 注目ランキング（トップ5）*/}
          {top5 && top5.length > 0 && !isFiltered && page === 1 && (
            <section className="bg-white border border-[#ddd]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">
                  ⭐ {config.label} 注目ランキング
                </h2>
                <Link href={`/${category}?sort=review_count`} className="text-xs text-[#0058B3] hover:underline">
                  注目ランキングをもっと見る
                </Link>
              </div>
              <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                {(top5 as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* 人気検索条件タグクラウド */}
          {POPULAR_SEARCHES[category] && !isFiltered && page === 1 && (
            <section className="bg-white border border-[#ddd]">
              <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-xs font-bold text-[#333]">{config.label} 人気検索条件</h2>
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES[category].map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="inline-block border border-[#0058B3] text-[#0058B3] text-xs px-2 py-0.5 hover:bg-[#0058B3] hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 新着商品（登録60日以内） */}
          {newProducts && newProducts.length > 0 && !isFiltered && page === 1 && (
            <section className="bg-white border border-[#ddd]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">🆕 新着{config.label}（登録60日以内）</h2>
                <span className="text-xs text-[#999]">{newProducts.length}件</span>
              </div>
              <div className="px-3">
                {(newProducts as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p, i) => (
                  <ProductListItem key={p.id} product={p} rank={i + 1} />
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
                {count != null && (
                  <span className="text-xs text-[#999]">{count.toLocaleString()}件</span>
                )}
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
              <div className="grid grid-cols-4 divide-x divide-y divide-[#eee]">
                {(products as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p, i) => (
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
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 mb-3">
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
        <div className="border-t border-[#555] pt-3">
          <p>ペットプライス - ペット用品 通販・価格比較</p>
          <p className="mt-1">楽天市場の商品情報を毎日自動取得・比較。※ 価格は実際の価格と異なる場合があります。</p>
        </div>
      </footer>
    </div>
  );
}
