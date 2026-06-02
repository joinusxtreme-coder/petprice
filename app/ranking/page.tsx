export const revalidate = 300;

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORY_CONFIG, SIDEBAR_GROUPS } from '@/lib/categories';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';
export const metadata = { title: '人気ランキング | ペットプライス' };

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
  shop_name?: string;
  category: string;
}

const RANKING_CATEGORIES = [
  { key: 'dog-food', label: 'ドッグフード' },
  { key: 'cat-food', label: 'キャットフード' },
  { key: 'dog-snack', label: '犬のおやつ' },
  { key: 'cat-snack', label: '猫のおやつ' },
  { key: 'pet-sheets', label: 'ペットシーツ' },
  { key: 'cat-litter', label: '猫砂' },
  { key: 'cat-toilet', label: 'キャットトイレ' },
  { key: 'dog-care', label: '犬ケア用品' },
];

async function getRanking(category: string, period: 'weekly' | 'monthly' | 'all', limit = 30): Promise<Product[]> {
  if (period === 'all') {
    const { data } = await supabase
      .from('products')
      .select('id, name, image_url, current_price, review_count, review_average, shop_name, category')
      .eq('category', category)
      .order('review_count', { ascending: false })
      .limit(limit);
    return (data as Product[]) || [];
  }

  // 週間・月間：最近price_historyが更新されている商品を対象にする
  const days = period === 'weekly' ? 7 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentIds } = await supabase
    .from('price_history')
    .select('product_id')
    .gte('recorded_at', since)
    .limit(500);

  const ids = [...new Set((recentIds || []).map((r: { product_id: string }) => r.product_id))];
  if (ids.length === 0) {
    // フォールバック: 全件からレビュー順
    const { data } = await supabase
      .from('products')
      .select('id, name, image_url, current_price, review_count, review_average, shop_name, category')
      .eq('category', category)
      .order('review_count', { ascending: false })
      .limit(limit);
    return (data as Product[]) || [];
  }

  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name, category')
    .eq('category', category)
    .in('id', ids)
    .order('review_count', { ascending: false })
    .limit(limit);
  return (data as Product[]) || [];
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; period?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category || 'dog-food';
  const period = (params.period || 'all') as 'weekly' | 'monthly' | 'all';

  const products = await getRanking(selectedCategory, period, 30);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const periodLabel = { weekly: '週間', monthly: '月間', all: '総合' }[period];
  const categoryLabel = RANKING_CATEGORIES.find((c) => c.key === selectedCategory)?.label || selectedCategory;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <span className="font-bold">人気ランキング</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* サイドバー */}
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

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-[#ddd]">
            <div className="px-4 py-3 border-b border-[#ddd] bg-[#f8f8f8] flex items-center justify-between">
              <h1 className="text-base font-bold text-[#333]">🏆 {categoryLabel} {periodLabel}ランキング</h1>
              <span className="text-xs text-[#999]">{products.length}件</span>
            </div>

            {/* カテゴリ選択 */}
            <div className="px-4 py-3 border-b border-[#eee] flex flex-wrap gap-2">
              {RANKING_CATEGORIES.map((c) => (
                <Link
                  key={c.key}
                  href={`/ranking?category=${c.key}&period=${period}`}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    selectedCategory === c.key
                      ? 'bg-[#FF6600] text-white border-[#FF6600]'
                      : 'bg-white text-[#333] border-[#ddd] hover:border-[#FF6600]'
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>

            {/* 期間選択 */}
            <div className="px-4 py-2 border-b border-[#eee] flex gap-2 items-center">
              <span className="text-xs text-[#666]">期間：</span>
              {[
                { key: 'all', label: '総合（全期間）' },
                { key: 'monthly', label: '月間（直近30日）' },
                { key: 'weekly', label: '週間（直近7日）' },
              ].map((p) => (
                <Link
                  key={p.key}
                  href={`/ranking?category=${selectedCategory}&period=${p.key}`}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    period === p.key
                      ? 'bg-[#333] text-white border-[#333]'
                      : 'bg-white text-[#333] border-[#ddd] hover:border-[#333]'
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </div>

            {period !== 'all' && (
              <div className="px-4 py-2 bg-[#f0f8ff] border-b border-[#ddd] text-xs text-[#0058B3]">
                ℹ️ {periodLabel}ランキングは、直近{period === 'weekly' ? '7' : '30'}日間に価格更新のあった商品をレビュー数順で表示しています
              </div>
            )}

            {/* ランキングリスト */}
            <div className="divide-y divide-[#f0f0f0]">
              {products.length === 0 ? (
                <p className="p-6 text-sm text-[#999] text-center">データがありません</p>
              ) : (
                products.map((p, i) => (
                  <Link key={p.id} href={`/product/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-[#FFF5EE] transition-colors">
                    {/* 順位 */}
                    <div className="w-10 text-center shrink-0">
                      {i < 3 ? (
                        <>
                          <div style={{ color: medalColors[i], fontSize: 22 }}>{'●'}</div>
                          <div className="text-xs font-bold" style={{ color: medalColors[i] }}>{i + 1}位</div>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-[#999]">{i + 1}</span>
                      )}
                    </div>

                    {/* 画像 */}
                    <div className="w-16 h-16 shrink-0 bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">🐾</span>
                      )}
                    </div>

                    {/* 商品情報 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0058B3] hover:underline line-clamp-2 leading-snug mb-1">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[#999]">
                        <span className="text-yellow-500">
                          {'★'.repeat(Math.round(p.review_average))}{'☆'.repeat(5 - Math.round(p.review_average))}
                        </span>
                        <span>{Number(p.review_average).toFixed(1)}（{p.review_count.toLocaleString()}件）</span>
                        {p.shop_name && <span className="hidden sm:inline">| {p.shop_name}</span>}
                      </div>
                    </div>

                    {/* 価格 */}
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-[#CC0000]">¥{p.current_price.toLocaleString()}</p>
                      <p className="text-xs text-[#999]">税込</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
