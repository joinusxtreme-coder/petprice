import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductListItem from '@/components/ProductListItem';
import { CATEGORY_GROUPS, CATEGORY_CONFIG } from './[category]/page';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
  shop_name?: string;
  prev_price?: number;
}

interface ProductWithHistory extends Product {
  price_history?: { price: number; recorded_at: string }[];
}

async function getRanking(petType: string, limit = 10): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('pet_type', petType)
    .order('review_count', { ascending: false })
    .limit(limit);
  return (data as Product[]) || [];
}

async function getPriceDrop(): Promise<Product[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name, price_history(price, recorded_at)')
    .limit(200);
  if (!products) return [];
  return (products as ProductWithHistory[])
    .filter((p) => {
      const prev = (p.price_history || [])
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return prev && (p.current_price - prev.price) / prev.price <= -0.05;
    })
    .slice(0, 10)
    .map((p) => {
      const prev = (p.price_history || [])
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return { ...p, prev_price: prev?.price };
    });
}

export default async function HomePage() {
  const [dogRanking, catRanking, dropped] = await Promise.all([
    getRanking('dog', 10),
    getRanking('cat', 10),
    getPriceDrop(),
  ]);

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-[#E4007F] shrink-0">
              ペットプライス
            </Link>
            <form action="/search" className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  name="q"
                  placeholder="商品名・ブランドで検索..."
                  className="flex-1 border border-gray-300 rounded-l px-4 py-2.5 text-sm focus:outline-none focus:border-[#E4007F]"
                />
                <button
                  type="submit"
                  className="bg-[#E4007F] text-white px-6 py-2.5 rounded-r text-sm font-bold hover:bg-[#c0006a] transition-colors"
                >
                  検索
                </button>
              </div>
            </form>
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 shrink-0">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              毎日3時更新
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-4">
        {/* Left Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <div className="bg-white border border-gray-200 rounded">
            <div className="bg-[#E4007F] px-3 py-2 text-xs font-bold text-white rounded-t">
              カテゴリ一覧
            </div>
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 border-b border-t border-gray-200">
                  {group.label}
                </div>
                {group.items.map((key) => {
                  const c = CATEGORY_CONFIG[key];
                  return (
                    <Link
                      key={key}
                      href={`/${key}`}
                      className="flex items-center gap-2 px-3 py-2 text-xs border-b border-gray-100 text-gray-700 hover:bg-pink-50 hover:text-[#E4007F] transition-colors"
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* Price Drop */}
          {dropped.length > 0 && (
            <section className="bg-white border border-gray-200 rounded">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">SALE</span>
                  <h2 className="text-sm font-bold text-gray-800">📉 今日の値下がり商品</h2>
                </div>
                <span className="text-xs text-gray-400">{dropped.length}件</span>
              </div>
              <div className="divide-y divide-gray-100">
                {dropped.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="px-4 py-3">
                    <ProductListItem product={p} rank={i + 1} />
                  </div>
                ))}
              </div>
              {dropped.length > 5 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <Link href="/dog-food" className="text-xs text-[#E4007F] hover:underline">
                    もっと見る →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Dog Ranking */}
          <section className="bg-white border border-gray-200 rounded">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🐕 犬用品 人気ランキング TOP10</h2>
              <Link href="/dog-food" className="text-xs text-[#E4007F] hover:underline">もっと見る</Link>
            </div>
            {dogRanking.length === 0 ? (
              <p className="text-xs text-gray-400 p-4">データ取得中...</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {dogRanking.map((p, i) => (
                  <div key={p.id} className="px-4 py-3">
                    <ProductListItem product={p} rank={i + 1} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Cat Ranking */}
          <section className="bg-white border border-gray-200 rounded">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🐈 猫用品 人気ランキング TOP10</h2>
              <Link href="/cat-food" className="text-xs text-[#E4007F] hover:underline">もっと見る</Link>
            </div>
            {catRanking.length === 0 ? (
              <p className="text-xs text-gray-400 p-4">データ取得中...</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {catRanking.map((p, i) => (
                  <div key={p.id} className="px-4 py-3">
                    <ProductListItem product={p} rank={i + 1} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* About */}
          <section className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-2">ペットプライスについて</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              ペットプライスは、楽天市場のペット用品の価格を毎日自動取得・比較するサービスです。
              30日間の価格推移グラフで最安値・買い時を確認できます。
              ドッグフード・キャットフード・猫砂・ペットシーツなど幅広いカテゴリに対応。
            </p>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-4 text-xs">
            <div>
              <p className="font-bold mb-1">ペットプライス</p>
              <p className="text-gray-400">楽天市場の商品情報を毎日自動取得・比較</p>
            </div>
            <div className="flex gap-8 text-gray-400">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="font-bold text-gray-200 mb-1">{group.label}</p>
                  {group.items.map((key) => (
                    <Link key={key} href={`/${key}`} className="block hover:text-white mb-1">
                      {CATEGORY_CONFIG[key].label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4 text-xs text-gray-500 text-center">
            ※ 価格は楽天市場の情報をもとにしており、実際の価格と異なる場合があります。
          </div>
        </div>
      </footer>
    </div>
  );
}
