import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
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

async function getRanking(petType: string, limit = 5): Promise<Product[]> {
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
    .slice(0, 5)
    .map((p) => {
      const prev = (p.price_history || [])
        .filter((h) => new Date(h.recorded_at) < yesterday)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return { ...p, prev_price: prev?.price };
    });
}

export default async function HomePage() {
  const [dogTop5, catTop5, dropped] = await Promise.all([
    getRanking('dog', 5),
    getRanking('cat', 5),
    getPriceDrop(),
  ]);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b-2 border-[#FF6600]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <div className="text-[#FF6600] font-bold text-2xl leading-none">ペットプライス</div>
            <div className="text-xs text-[#666]">「買ってよかった」をすべてのひとに。</div>
          </Link>
          <form action="/search" className="flex-1 max-w-2xl flex">
            <input
              name="q"
              placeholder="何をお探しですか？（メーカー、製品カテゴリ、製品名、型番...）"
              className="flex-1 border border-[#ccc] border-r-0 px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
            />
            <button type="submit" className="bg-[#FF6600] text-white px-5 py-2 text-sm font-bold hover:bg-[#e55a00]">
              検索
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
        <aside className="w-44 shrink-0 hidden md:block space-y-2">
          <div className="bg-white border border-[#ddd]">
            <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1.5">カテゴリ一覧</div>
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="bg-[#f0f0f0] text-[#555] text-xs font-bold px-2 py-1 border-t border-[#ddd]">{group.label}</div>
                {group.items.map((key) => {
                  const c = CATEGORY_CONFIG[key];
                  return (
                    <Link
                      key={key}
                      href={`/${key}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#0058B3] hover:bg-[#FFF5EE] hover:text-[#FF6600] border-b border-[#eee] transition-colors"
                    >
                      {c.icon} {c.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-3">

          {/* 値下がり */}
          {dropped.length > 0 && (
            <section className="bg-white border border-[#ddd]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">
                  <span className="text-red-600 mr-1">▼</span>今日の値下がり商品
                </h2>
                <span className="text-xs text-[#999]">{dropped.length}件</span>
              </div>
              <div className="divide-y divide-[#eee] px-3">
                {dropped.map((p, i) => (
                  <ProductListItem key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* 犬 注目ランキング */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🐕 犬用品 注目ランキング</h2>
              <Link href="/dog-food" className="text-xs text-[#0058B3] hover:underline">注目ランキングをもっと見る</Link>
            </div>
            {dogTop5.length === 0 ? (
              <p className="text-xs text-[#999] p-3">データ取得中...</p>
            ) : (
              <div className="grid grid-cols-5 gap-0 divide-x divide-[#eee] p-2">
                {(dogTop5 as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }[]).map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            )}
            <div className="text-center py-2 border-t border-[#eee]">
              <Link href="/dog-food" className="text-xs text-white bg-[#FF6600] px-4 py-1.5 hover:bg-[#e55a00] inline-block">
                人気売れ筋ランキングをもっと見る
              </Link>
            </div>
          </section>

          {/* 猫 注目ランキング */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🐈 猫用品 注目ランキング</h2>
              <Link href="/cat-food" className="text-xs text-[#0058B3] hover:underline">注目ランキングをもっと見る</Link>
            </div>
            {catTop5.length === 0 ? (
              <p className="text-xs text-[#999] p-3">データ取得中...</p>
            ) : (
              <div className="grid grid-cols-5 gap-0 divide-x divide-[#eee] p-2">
                {(catTop5 as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }[]).map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            )}
            <div className="text-center py-2 border-t border-[#eee]">
              <Link href="/cat-food" className="text-xs text-white bg-[#FF6600] px-4 py-1.5 hover:bg-[#e55a00] inline-block">
                人気売れ筋ランキングをもっと見る
              </Link>
            </div>
          </section>

          {/* サイト説明 */}
          <section className="bg-white border border-[#ddd] p-3">
            <h2 className="text-sm font-bold text-[#333] border-l-4 border-[#FF6600] pl-2 mb-2">ペットプライスとは</h2>
            <p className="text-xs text-[#666] leading-relaxed">
              ペットプライスは、楽天市場のペット用品の価格を毎日自動取得・比較するサービスです。
              ドッグフード・キャットフード・猫砂・ペットシーツなど幅広いカテゴリに対応。
              30日間の価格推移グラフで最安値・買い時を確認できます。
            </p>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white mt-6 py-4 px-3 text-xs text-center text-[#aaa]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4 mb-3">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="font-bold text-white mb-1">{group.label}</p>
              {group.items.map((key) => (
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
