// トップページ: 5分キャッシュ
export const revalidate = 300;

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductListItem from '@/components/ProductListItem';
import RecentlyViewed from '@/components/RecentlyViewed';
import SiteHeader from '@/components/SiteHeader';
import PetRecommendations from '@/components/PetRecommendations';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/lib/categories';
import { COLUMNS } from '@/lib/columns';
import SiteFooter from '@/components/SiteFooter';
import { SidebarAdWidget, InlineFoodAd } from '@/components/A8Ads';

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

async function getRanking(category: string, limit = 5): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', category)
    .order('review_count', { ascending: false })
    .limit(limit);
  return (data as Product[]) || [];
}

async function getDogRanking(limit = 5): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .in('category', ['dog-food', 'dog-snack', 'dog-care', 'dog-toy', 'dog-goods', 'dog-walk', 'dog-clothes', 'dog-feeder', 'dog-toilet', 'dog-carrier'])
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
  const [dogRanking, dogFoodRanking, catFoodRanking, catSnackRanking, petSheetsRanking, dropped] = await Promise.all([
    getDogRanking(5),
    getRanking('dog-food', 5),
    getRanking('cat-food', 5),
    getRanking('cat-snack', 5),
    getRanking('pet-sheets', 5),
    getPriceDrop(),
  ]);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <span>ペット</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
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

          {/* A8.net 広告 */}
          <div className="mt-3">
            <SidebarAdWidget />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* 閲覧履歴 */}
          <RecentlyViewed />

          {/* ペット情報連動おすすめ（ログイン時のみ表示） */}
          <PetRecommendations />

          {/* 値下がり商品（最上部に移動・目立たせる） */}
          {dropped.length > 0 && (
            <section className="bg-white border-2 border-[#CC0000]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#CC0000] bg-[#CC0000]">
                <h2 className="text-sm font-bold text-white">
                  ▼ 今日の値下がり商品
                </h2>
                <span className="text-xs text-white opacity-80">{dropped.length}件</span>
              </div>
              <div className="px-3">
                {dropped.map((p, i) => (
                  <ProductListItem key={p.id} product={p} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* キーワード検索 */}
          <div className="bg-white border border-[#ddd] px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-[#555] shrink-0 font-bold">🔍 キーワード検索</span>
            <form action="/search" className="flex flex-1 items-center gap-2">
              <input name="q" placeholder="製品名・メーカーなど" className="flex-1 border border-[#ccc] border-r-0 px-2 py-1 text-xs focus:outline-none focus:border-[#FF6600]" />
              <label className="text-xs text-[#666] flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <input type="radio" name="scope" value="all" defaultChecked /> すべて
              </label>
              <label className="text-xs text-[#666] flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <input type="radio" name="scope" value="pet" /> ペット用品内
              </label>
              <button className="bg-[#FF6600] text-white px-3 py-1 text-xs hover:bg-[#e55a00] shrink-0">検索</button>
            </form>
          </div>

          {/* ペット カテゴリランキング */}
          <section className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🏆 ペット カテゴリランキング</h2>
            </div>

            {/* 犬用品 人気ランキング */}
            <div className="border-b border-[#eee]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee] bg-[#fafafa]">
                <span className="text-xs font-bold text-[#333]">犬用品 人気ランキング</span>
                <Link href="/dog-food" className="text-xs text-[#0058B3] hover:underline">犬用品 人気ランキング ›</Link>
              </div>
              {dogRanking.length === 0 ? (
                <p className="text-xs text-[#999] p-3">データがありません</p>
              ) : (
                <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                  {dogRanking.map((p, i) => (
                    <ProductCard key={p.id} product={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* ドッグフード 人気ランキング */}
            <div className="border-b border-[#eee]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee] bg-[#fafafa]">
                <span className="text-xs font-bold text-[#333]">ドッグフード 人気ランキング</span>
                <Link href="/dog-food" className="text-xs text-[#0058B3] hover:underline">ドッグフード 人気ランキング ›</Link>
              </div>
              {dogFoodRanking.length === 0 ? (
                <p className="text-xs text-[#999] p-3">データがありません</p>
              ) : (
                <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                  {dogFoodRanking.map((p, i) => (
                    <ProductCard key={p.id} product={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* キャットフード 人気ランキング */}
            <div className="border-b border-[#eee]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee] bg-[#fafafa]">
                <span className="text-xs font-bold text-[#333]">キャットフード 人気ランキング</span>
                <Link href="/cat-food" className="text-xs text-[#0058B3] hover:underline">キャットフード 人気ランキング ›</Link>
              </div>
              {catFoodRanking.length === 0 ? (
                <p className="text-xs text-[#999] p-3">データがありません</p>
              ) : (
                <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                  {catFoodRanking.map((p, i) => (
                    <ProductCard key={p.id} product={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* 猫のおやつ 人気ランキング */}
            <div className="border-b border-[#eee]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee] bg-[#fafafa]">
                <span className="text-xs font-bold text-[#333]">猫のおやつ 人気ランキング</span>
                <Link href="/cat-snack" className="text-xs text-[#0058B3] hover:underline">猫のおやつ 人気ランキング ›</Link>
              </div>
              {catSnackRanking.length === 0 ? (
                <p className="text-xs text-[#999] p-3">データがありません</p>
              ) : (
                <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                  {catSnackRanking.map((p, i) => (
                    <ProductCard key={p.id} product={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* ペットシーツ 人気ランキング */}
            <div>
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee] bg-[#fafafa]">
                <span className="text-xs font-bold text-[#333]">ペットシーツ 人気ランキング</span>
                <Link href="/pet-sheets" className="text-xs text-[#0058B3] hover:underline">ペットシーツ 人気ランキング ›</Link>
              </div>
              {petSheetsRanking.length === 0 ? (
                <p className="text-xs text-[#999] p-3">データがありません</p>
              ) : (
                <div className="grid grid-cols-5 divide-x divide-[#eee] p-2">
                  {petSheetsRanking.map((p, i) => (
                    <ProductCard key={p.id} product={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </section>


          {/* コラム新着 */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">📝 専門家コラム</h2>
              <Link href="/column" className="text-xs text-[#0058B3] hover:underline">コラム一覧 ›</Link>
            </div>
            <div className="divide-y divide-[#eee]">
              {COLUMNS.slice(0, 4).map((col) => (
                <Link key={col.slug} href={`/column/${col.slug}`} className="flex gap-3 px-3 py-2 hover:bg-[#FFF5EE] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0058B3] group-hover:text-[#FF6600] leading-snug line-clamp-1">{col.title}</p>
                    <p className="text-xs text-[#999] mt-0.5 line-clamp-1">{col.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-[#999]">{col.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* コミュニティ */}
          <section className="bg-white border border-[#ddd]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">💬 コミュニティ</h2>
              <Link href="/community" className="text-xs text-[#0058B3] hover:underline">掲示板へ ›</Link>
            </div>
            <div className="px-3 py-4 text-center space-y-2">
              <p className="text-xs text-[#666]">ペットの食事・健康について、みんなで情報共有しましょう！</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['ドッグフード選び', 'シニア犬の食事', 'グレインフリー', 'キャットフード比較', '療法食'].map((tag) => (
                  <Link key={tag} href={`/community?tag=${encodeURIComponent(tag)}`}
                    className="text-xs bg-[#f0f0f0] text-[#555] px-2 py-0.5 hover:bg-[#FFF5EE] hover:text-[#FF6600] border border-[#ddd]">
                    #{tag}
                  </Link>
                ))}
              </div>
              <Link href="/community" className="inline-block mt-1 bg-[#FF6600] text-white text-xs px-4 py-1.5 hover:bg-[#e55a00]">
                コミュニティを見る
              </Link>
            </div>
          </section>

          {/* A8.net アフィリエイト広告 */}
          <InlineFoodAd />

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

      <SiteFooter />
    </div>
  );
}
