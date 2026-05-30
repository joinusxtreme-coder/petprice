import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import ProductCard from '@/components/ProductCard';

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

async function getTopProducts(petType: string, limit = 5): Promise<Product[]> {
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
    .limit(50);

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
    .slice(0, 6)
    .map((p) => {
      const history = p.price_history || [];
      const prev = history
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return { ...p, prev_price: prev?.price };
    });
}

export default async function HomePage() {
  const [dogProducts, catProducts, droppedProducts] = await Promise.all([
    getTopProducts('dog'),
    getTopProducts('cat'),
    getPriceDrop(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[#FF6B35] shrink-0">ペットプライス🐾</Link>
          <form action="/search" className="flex-1 max-w-md">
            <input
              name="q"
              placeholder="商品名を検索..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </form>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">ペット用品の最安値を<br />かんたん比較</h1>
        <p className="text-lg opacity-90 mb-8">楽天市場の価格を毎日自動取得。価格推移グラフで買い時がわかる！</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { href: '/dog-food', label: '🐕 ドッグフード' },
            { href: '/cat-food', label: '🐈 キャットフード' },
            { href: '/dog-goods', label: '🦴 犬用品' },
            { href: '/cat-goods', label: '🐾 猫用品' },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="bg-white text-[#FF6B35] font-semibold px-5 py-2 rounded-full hover:shadow-md transition-shadow">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Dog Top 5 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#2E4057]">🐕 犬カテゴリ 人気TOP5</h2>
            <Link href="/dog-food" className="text-sm text-[#FF6B35] hover:underline">もっと見る →</Link>
          </div>
          {dogProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">データを取得中です...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dogProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Cat Top 5 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#2E4057]">🐈 猫カテゴリ 人気TOP5</h2>
            <Link href="/cat-food" className="text-sm text-[#FF6B35] hover:underline">もっと見る →</Link>
          </div>
          {catProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">データを取得中です...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {catProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Price Drop */}
        {droppedProducts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#2E4057] mb-4">📉 今日の価格急落商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {droppedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2E4057] text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-bold mb-2">ペットプライス🐾</p>
          <p className="text-sm opacity-70">楽天市場の商品情報を毎日自動取得・比較しています。</p>
          <p className="text-xs opacity-50 mt-4">※ 価格は楽天市場の情報をもとにしており、実際の価格と異なる場合があります。</p>
        </div>
      </footer>
    </div>
  );
}
