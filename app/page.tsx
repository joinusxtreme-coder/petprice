import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
  prev_price?: number;
}

interface ProductWithHistory extends Product {
  price_history?: { price: number; recorded_at: string }[];
}

async function getRankingProducts(petType: string, limit = 10): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average')
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
    .select('id, name, image_url, current_price, review_count, review_average, price_history(price, recorded_at)')
    .limit(100);

  if (!products) return [];

  return (products as ProductWithHistory[])
    .filter((p) => {
      const history = p.price_history || [];
      const prev = history
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      if (!prev) return false;
      return (p.current_price - prev.price) / prev.price <= -0.05;
    })
    .slice(0, 8)
    .map((p) => {
      const history = p.price_history || [];
      const prev = history
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return { ...p, prev_price: prev?.price };
    });
}

async function getNewArrivals(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average')
    .order('updated_at', { ascending: false })
    .limit(8);
  return (data as Product[]) || [];
}

const CATEGORIES = [
  { href: '/dog-food', label: 'ドッグフード', icon: '🐕', color: 'from-orange-400 to-amber-400' },
  { href: '/cat-food', label: 'キャットフード', icon: '🐈', color: 'from-purple-400 to-pink-400' },
  { href: '/dog-goods', label: '犬用品', icon: '🦴', color: 'from-blue-400 to-cyan-400' },
  { href: '/cat-goods', label: '猫用品', icon: '🐾', color: 'from-green-400 to-teal-400' },
];

export default async function HomePage() {
  const [dogProducts, catProducts, droppedProducts, newArrivals] = await Promise.all([
    getRankingProducts('dog', 10),
    getRankingProducts('cat', 10),
    getPriceDrop(),
    getNewArrivals(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#FF6B35] shrink-0 whitespace-nowrap">
            ペットプライス🐾
          </Link>
          <form action="/search" className="flex-1 max-w-xl">
            <div className="flex">
              <input
                name="q"
                placeholder="商品名・ブランドで検索..."
                className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              />
              <button type="submit" className="bg-[#FF6B35] text-white px-4 py-2 rounded-r-full text-sm font-medium hover:bg-[#e85d2a] transition-colors">
                検索
              </button>
            </div>
          </form>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 shrink-0">
            {CATEGORIES.map((c) => (
              <Link key={c.href} href={c.href} className="hover:text-[#FF6B35] transition-colors whitespace-nowrap">
                {c.icon} {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold bg-white/20 inline-block px-3 py-1 rounded-full mb-3">
              🎉 毎日価格自動更新中
            </p>
            <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
              ペット用品の最安値を<br className="hidden md:block" />かんたん比較
            </h1>
            <p className="opacity-90 mb-6 text-sm md:text-base">
              楽天市場の価格を毎日取得。30日間の価格推移グラフで買い時がわかる！
            </p>
            <form action="/search" className="flex max-w-md">
              <input
                name="q"
                placeholder="気になる商品を検索..."
                className="flex-1 rounded-l-full px-4 py-3 text-gray-800 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-[#2E4057] text-white px-5 py-3 rounded-r-full text-sm font-bold hover:bg-[#243348] transition-colors">
                検索
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity shadow-md w-28`}
              >
                <div className="text-3xl mb-1">{c.icon}</div>
                <div className="text-xs font-bold">{c.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#2E4057] text-white py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-center gap-8 text-xs md:text-sm">
          <span>📦 {dogProducts.length + catProducts.length}件以上の商品</span>
          <span>🔄 毎日価格更新</span>
          <span>📈 30日間価格グラフ</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Price Drop - 価格急落 */}
        {droppedProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                SALE
              </div>
              <h2 className="text-lg font-bold text-[#2E4057]">📉 今日の価格急落商品</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {droppedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Dog Ranking */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              <h2 className="text-lg font-bold text-[#2E4057]">犬カテゴリ 人気ランキング</h2>
            </div>
            <Link href="/dog-food" className="text-sm text-[#FF6B35] hover:underline font-medium">
              もっと見る →
            </Link>
          </div>
          {dogProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">データ取得中...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {dogProducts.slice(0, 10).map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* Cat Ranking */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐈</span>
              <h2 className="text-lg font-bold text-[#2E4057]">猫カテゴリ 人気ランキング</h2>
            </div>
            <Link href="/cat-food" className="text-sm text-[#FF6B35] hover:underline font-medium">
              もっと見る →
            </Link>
          </div>
          {catProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">データ取得中...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {catProducts.slice(0, 10).map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </div>
              <h2 className="text-lg font-bold text-[#2E4057]">🆕 新着商品</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Category cards */}
        <section>
          <h2 className="text-lg font-bold text-[#2E4057] mb-4">📂 カテゴリから探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 text-center hover:opacity-90 transition-all hover:-translate-y-1 shadow-md`}
              >
                <div className="text-4xl mb-2">{c.icon}</div>
                <div className="font-bold">{c.label}</div>
                <div className="text-xs opacity-80 mt-1">比較する →</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2E4057] text-white py-10 px-4 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-lg font-bold mb-2">ペットプライス🐾</p>
              <p className="text-sm opacity-70">楽天市場の商品情報を毎日自動取得・比較</p>
            </div>
            <div className="flex gap-8 text-sm opacity-70">
              <div>
                <p className="font-semibold opacity-100 mb-2">カテゴリ</p>
                {CATEGORIES.map((c) => (
                  <Link key={c.href} href={c.href} className="block hover:opacity-100 mb-1">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-6 pt-6 text-xs opacity-50 text-center">
            ※ 価格は楽天市場の情報をもとにしており、実際の価格と異なる場合があります。
          </div>
        </div>
      </footer>
    </div>
  );
}
