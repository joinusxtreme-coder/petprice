import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PriceChart from '@/components/PriceChart';
import AlertForm from '@/components/AlertForm';
import AffiliateButton from '@/components/AffiliateButton';
import ProductCard from '@/components/ProductCard';
import { CATEGORY_CONFIG, SIDEBAR_GROUPS } from '@/app/[category]/page';
import { fetchItemReviews } from '@/lib/rakuten';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data: product } = await supabase.from('products').select('name, current_price').eq('id', id).single();
  if (!product) return {};
  return {
    title: `${product.name}の最安値・価格比較 | ペットプライス`,
    description: `${product.name}の楽天市場最安値${product.current_price.toLocaleString()}円。30日間の価格推移グラフで買い時がわかる。`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: product }, { data: history }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('price_history')
      .select('price, recorded_at')
      .eq('product_id', id)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true }),
  ]);

  if (!product) notFound();

  // 楽天レビュー取得
  const reviews = product.rakuten_item_id
    ? await fetchItemReviews(product.rakuten_item_id, 5)
    : [];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevHistory = (history || []).filter((h: { recorded_at: string }) => new Date(h.recorded_at) < yesterday);
  const prevPrice = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].price : null;
  const priceDiff = prevPrice ? product.current_price - prevPrice : null;

  const { data: related } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', product.category)
    .neq('id', id)
    .order('review_count', { ascending: false })
    .limit(4);

  // カテゴリ内ランキング順位を計算（自分より review_count が多い商品数 + 1）
  const { count: rankCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category', product.category)
    .gt('review_count', product.review_count);
  const rankPosition = (rankCount ?? 0) + 1;

  const stars = Math.round(product.review_average || 0);
  const config = CATEGORY_CONFIG[product.category];

  // 価格の最安値・最高値
  const allPrices = (history || []).map((h: { price: number }) => h.price);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      {/* Top orange stripe */}
      <div className="bg-[#FF6600] h-1" />

      {/* Header */}
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
            <span className="text-[#666] text-base ml-1">🐾 ペット</span>
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <Link href="/" className="text-[#0058B3] hover:underline">ペット</Link>
          {config && (
            <>
              <span className="mx-1">{'>'}</span>
              <Link href={`/${product.category}`} className="text-[#0058B3] hover:underline">{config.label}</Link>
            </>
          )}
          <span className="mx-1">{'>'}</span>
          <span className="line-clamp-1">{product.name.slice(0, 30)}...</span>
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
                        className={`block px-3 py-1.5 text-xs border-t border-[#eee] transition-colors ${
                          key === product.category
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
              <div className="border-t border-[#eee]" />
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* Product Info */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h1 className="text-sm font-bold text-[#333] leading-snug">{product.name}</h1>
            </div>
            <div className="p-3 flex gap-4">
              {/* Image */}
              <div className="shrink-0 w-48 h-48 relative bg-white border border-[#eee] overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="192px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl text-[#ccc]">🐾</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* 店舗名 */}
                {product.shop_name && (
                  <p className="text-xs text-[#999]">販売: {product.shop_name}</p>
                )}

                {/* 価格 */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#FF6600]">
                      ¥{product.current_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#999]">（税込）</span>
                  </div>
                  {priceDiff !== null && (
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 mt-1 ${priceDiff < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {priceDiff < 0 ? '▼' : '▲'} {Math.abs(priceDiff).toLocaleString()}円 昨日より{priceDiff < 0 ? '値下がり！' : '値上がり'}
                    </div>
                  )}
                </div>

                {/* 最安値情報 */}
                {minPrice && minPrice < product.current_price && (
                  <div className="text-xs text-[#666] bg-[#f8f8f8] border border-[#eee] px-2 py-1">
                    過去30日最安値: <span className="font-bold text-[#CC0000]">¥{minPrice.toLocaleString()}</span>
                  </div>
                )}

                {/* 売れ筋ランキング */}
                {config && (
                  <div className="flex items-center gap-2 text-xs bg-[#FFF5EE] border border-[#FFD0B0] px-2 py-1">
                    <span className="text-[#FF6600] font-bold">売れ筋ランキング</span>
                    <span className="font-bold text-[#CC0000] text-sm">{rankPosition}位</span>
                    <span className="text-[#999]">({config.label}カテゴリ)</span>
                    <Link href={`/${product.category}`} className="text-[#0058B3] hover:underline ml-auto">ランキングを見る</Link>
                  </div>
                )}

                {/* 星評価 */}
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-base">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                  <span className="text-sm text-[#FF6600] font-bold">{product.review_average}</span>
                  <span className="text-xs text-[#0058B3] hover:underline cursor-pointer">
                    （{(product.review_count || 0).toLocaleString()}件のレビュー）
                  </span>
                </div>

                {/* 購入ボタン */}
                <div>
                  <AffiliateButton url={product.affiliate_url || product.item_url || '#'} className="w-full" />
                </div>

                {/* カテゴリ一覧へ */}
                {config && (
                  <Link href={`/${product.category}`} className="text-xs text-[#0058B3] hover:underline">
                    ← {config.label}の一覧に戻る
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* レビュー・評価 */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">⭐ 楽天市場のレビュー</h2>
            </div>
            <div className="p-3">
              {product.review_count > 0 ? (
                <>
                  {/* 総合評価 */}
                  <div className="flex items-center gap-4 mb-4 pb-3 border-b border-[#eee]">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-[#FF6600]">{Number(product.review_average).toFixed(1)}</div>
                      <div className="text-yellow-500 text-xl mt-1">
                        {'★'.repeat(Math.round(product.review_average))}{'☆'.repeat(5 - Math.round(product.review_average))}
                      </div>
                      <div className="text-xs text-[#999] mt-0.5">{product.review_count.toLocaleString()}件</div>
                    </div>
                    <div className="flex-1">
                      {[5,4,3,2,1].map((star) => {
                        // 各星の割合をreview_averageから概算
                        const avg = product.review_average;
                        const pct = star === Math.round(avg) ? 45
                          : star === Math.ceil(avg) ? 25
                          : star === Math.floor(avg) ? 20
                          : star > avg ? Math.max(0, (star - avg) * 3)
                          : Math.max(0, (avg - star) * 3);
                        return (
                          <div key={star} className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-[#666] w-4">{star}</span>
                            <span className="text-yellow-400 text-xs">★</span>
                            <div className="flex-1 bg-[#eee] h-2 rounded">
                              <div className="bg-yellow-400 h-2 rounded" style={{ width: `${Math.min(100, pct * 2)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* レビュー一覧 */}
                  {reviews.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {reviews.map((r) => (
                        <div key={r.reviewId} className="border border-[#eee] p-3 bg-[#fafafa]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-500 text-sm">
                              {'★'.repeat(r.rate)}{'☆'.repeat(5 - r.rate)}
                            </span>
                            <span className="text-xs font-bold text-[#333]">{r.title}</span>
                          </div>
                          <p className="text-xs text-[#555] leading-relaxed line-clamp-4">{r.body}</p>
                          <p className="text-xs text-[#999] mt-1">{r.reviewer} · {r.reviewDate}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* 全レビューを楽天で見る */}
                  <div className="text-center">
                    <a
                      href={`${product.item_url}#reviewlistWrapper`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#BF0000] text-white text-sm font-bold px-6 py-2 hover:bg-[#990000] transition-colors"
                    >
                      楽天市場で全{product.review_count.toLocaleString()}件のレビューを見る →
                    </a>
                    <p className="text-xs text-[#999] mt-2">※ レビューは楽天市場の商品ページに移動します</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#999] text-center py-4">まだレビューがありません</p>
              )}
            </div>
          </div>

          {/* 価格推移グラフ */}
          {history && history.length > 1 && (
            <div className="bg-white border border-[#ddd]">
              <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">📈 過去30日間の価格推移</h2>
              </div>
              <div className="p-3">
                <PriceChart history={history} />
                <p className="text-xs text-[#999] mt-1">● 赤い点が最安値</p>
              </div>
            </div>
          )}

          {/* 価格アラート */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🔔 価格アラート設定</h2>
            </div>
            <div className="p-3">
              <AlertForm productId={product.id} currentPrice={product.current_price} />
            </div>
          </div>

          {/* 関連商品 */}
          {related && related.length > 0 && (
            <section className="bg-white border border-[#ddd]">
              <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">関連商品</h2>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#eee] p-2">
                {(related as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white mt-6 py-4 px-3 text-xs text-[#aaa]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 mb-3">
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
        <div className="border-t border-[#555] pt-3 text-center">
          <p>ペットプライス - ペット用品 通販・価格比較</p>
          <p className="mt-1">楽天市場の商品情報を毎日自動取得・比較。※ 価格は実際の価格と異なる場合があります。</p>
        </div>
      </footer>
    </div>
  );
}
