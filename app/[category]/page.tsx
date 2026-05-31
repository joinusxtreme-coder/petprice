import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductListItem from '@/components/ProductListItem';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CATEGORY_CONFIG, SIDEBAR_GROUPS, POPULAR_SEARCHES, FOOD_FEATURE_TAGS, FOOD_CATEGORIES } from '@/lib/categories';

export { CATEGORY_CONFIG, SIDEBAR_GROUPS } from '@/lib/categories';

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
    feature?: string;
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
  const isPricePerKgSort = sort === 'price_per_kg' && FOOD_CATEGORIES.includes(category);

  // トップ5（注目ランキング用）
  const { data: top5 } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', config.dbCategory)
    .order('review_count', { ascending: false })
    .limit(5);

  // 満足度ランキング（評価順）
  const { data: ratingTop } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', config.dbCategory)
    .gte('review_count', 5)
    .order('review_average', { ascending: false })
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

  // ブランド一覧（サイドバー用）
  const { data: brandRows } = await supabase
    .from('products')
    .select('brand')
    .eq('category', config.dbCategory)
    .not('brand', 'is', null)
    .neq('brand', '');
  const brandCounts: Record<string, number> = {};
  for (const row of brandRows || []) {
    if (row.brand) brandCounts[row.brand] = (brandCounts[row.brand] || 0) + 1;
  }
  const brands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // 全製品（絞り込み・ページング）
  let query = supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name', { count: 'exact' })
    .eq('category', config.dbCategory);

  if (sp.minPrice) query = query.gte('current_price', Number(sp.minPrice));
  if (sp.maxPrice) query = query.lte('current_price', Number(sp.maxPrice));
  if (sp.age && sp.age !== 'all') query = query.eq('age_group', sp.age);
  if (sp.minReview) query = query.gte('review_average', Number(sp.minReview));
  if (sp.brand) query = query.eq('brand', sp.brand);
  if (sp.feature) query = query.ilike('name', `%${sp.feature}%`);

  if (isPricePerKgSort) {
    // 1kgあたり価格ソート: 大量取得してJS側でソート
    query = query.order('review_count', { ascending: false }).limit(200);
  } else if (sort === 'price_asc') query = query.order('current_price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('current_price', { ascending: false });
  else query = query.order('review_count', { ascending: false });

  if (!isPricePerKgSort) query = query.range(from, from + PAGE_SIZE - 1);

  const { data: rawProducts, count } = await query;

  // 1kgあたり価格ソート処理
  function extractWeightKg(name: string): number {
    const multi = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)\s*[×xX×]\s*(\d+)/i);
    if (multi) {
      const val = parseFloat(multi[1]);
      const unit = multi[2].toLowerCase();
      const cnt = parseInt(multi[3]);
      return (unit === 'kg' ? val : val / 1000) * cnt;
    }
    const single = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)(?![a-zA-Z])/i);
    if (single) {
      const val = parseFloat(single[1]);
      return single[2].toLowerCase() === 'kg' ? val : val / 1000;
    }
    return 0;
  }

  let products = rawProducts;
  if (isPricePerKgSort && rawProducts) {
    const withPpk = rawProducts
      .map((p) => {
        const wkg = extractWeightKg(p.name);
        return { ...p, ppk: wkg > 0 ? p.current_price / wkg : Infinity };
      })
      .filter((p) => p.ppk < Infinity)
      .sort((a, b) => a.ppk - b.ppk);
    products = withPpk.slice(from, from + PAGE_SIZE) as typeof rawProducts;
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ ...sp, ...overrides } as Record<string, string>);
    return `/${category}?${p.toString()}`;
  }

  const isFiltered = !!(sp.minPrice || sp.maxPrice || (sp.age && sp.age !== 'all') || sp.minReview || sp.brand || sp.feature);
  const isFoodCategory = FOOD_CATEGORIES.includes(category);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

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

          {/* 症状・目的別フィルター（フード系のみ） */}
          {isFoodCategory && (
            <div className="bg-white border border-[#ddd]">
              <div className="bg-[#0058B3] text-white text-xs font-bold px-2 py-1">目的・特徴で絞り込む</div>
              {FOOD_FEATURE_TAGS.map((tag) => (
                <Link
                  key={tag.keyword}
                  href={sp.feature === tag.keyword ? `/${category}` : `/${category}?feature=${encodeURIComponent(tag.keyword)}`}
                  className={`flex items-center px-2 py-1.5 text-xs border-t border-[#eee] hover:bg-[#EEF5FF] transition-colors ${
                    sp.feature === tag.keyword ? 'text-[#0058B3] font-bold bg-[#EEF5FF]' : 'text-[#333]'
                  }`}
                >
                  {sp.feature === tag.keyword ? '✓ ' : '　'}{tag.label}
                </Link>
              ))}
            </div>
          )}

          {/* ブランドフィルター */}
          {brands.length > 0 && (
            <div className="bg-white border border-[#ddd]">
              <div className="bg-[#666] text-white text-xs font-bold px-2 py-1">シリーズ・ブランド</div>
              {brands.map(([brand, cnt]) => (
                <Link
                  key={brand}
                  href={`/${category}?brand=${encodeURIComponent(brand)}`}
                  className={`flex justify-between items-center px-2 py-1 text-xs border-t border-[#eee] hover:bg-[#FFF5EE] ${sp.brand === brand ? 'text-[#FF6600] font-bold bg-[#FFF5EE]' : 'text-[#0058B3]'}`}
                >
                  <span>{brand}</span>
                  <span className="text-[#999]">({cnt})</span>
                </Link>
              ))}
              {sp.brand && (
                <Link href={`/${category}`} className="block text-center text-xs text-[#999] hover:text-[#FF6600] py-1 border-t border-[#eee]">
                  ✕ クリア
                </Link>
              )}
            </div>
          )}

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

          {/* 満足度ランキング */}
          {ratingTop && ratingTop.length > 0 && !isFiltered && page === 1 && (
            <section className="bg-white border border-[#ddd]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">⭐ {config.label} 満足度ランキング</h2>
                <span className="text-xs text-[#999]">レビュー評価順</span>
              </div>
              <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                {(ratingTop as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={i + 1} />
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

          {/* フィルター適用中バッジ */}
          {sp.feature && (
            <div className="bg-[#EEF5FF] border border-[#0058B3] px-3 py-2 flex items-center gap-2 text-xs">
              <span className="text-[#0058B3] font-bold">🔍 絞り込み中:</span>
              <span className="bg-[#0058B3] text-white px-2 py-0.5 font-bold">{sp.feature}</span>
              <Link href={`/${category}`} className="ml-auto text-[#999] hover:text-[#FF6600]">✕ 解除</Link>
            </div>
          )}

          {/* 全製品リスト */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-[#333]">
                  {sp.feature ? `「${sp.feature}」の商品` : '人気売れ筋ランキング'}
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
                  <input type="hidden" name="feature" value={sp.feature || ''} />
                  <select name="sort" defaultValue={sort} className="border border-[#ccc] text-xs px-1 py-1 focus:outline-none focus:border-[#FF6600]">
                    <option value="review_count">人気順</option>
                    <option value="price_asc">安い順</option>
                    <option value="price_desc">高い順</option>
                    {isFoodCategory && <option value="price_per_kg">1kgあたり安い順</option>}
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
              <div className="grid grid-cols-5 divide-x divide-y divide-[#eee]">
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

      <SiteFooter />
    </div>
  );
}
