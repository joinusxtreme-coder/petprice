import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PriceChart from '@/components/PriceChart';
import AlertForm from '@/components/AlertForm';
import AffiliateButton from '@/components/AffiliateButton';
import ProductCard from '@/components/ProductCard';

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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevHistory = (history || []).filter((h: { recorded_at: string }) => new Date(h.recorded_at) < yesterday);
  const prevPrice = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].price : null;
  const priceDiff = prevPrice ? product.current_price - prevPrice : null;

  const { data: related } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average')
    .eq('pet_type', product.pet_type)
    .neq('id', id)
    .order('review_count', { ascending: false })
    .limit(4);

  const stars = Math.round(product.review_average || 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[#FF6B35] shrink-0">ペットプライス🐾</Link>
          <form action="/search" className="flex-1 max-w-md">
            <input name="q" placeholder="商品名を検索..." className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back */}
        <Link href={`/${product.category}`} className="text-sm text-[#FF6B35] hover:underline">← 一覧に戻る</Link>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl">🐾</div>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-lg font-bold text-[#333333] leading-snug">{product.name}</h1>
              {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}

              <div>
                <div className="text-3xl font-bold text-red-600">¥{product.current_price.toLocaleString()}</div>
                {priceDiff !== null && (
                  <div className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full mt-2 ${priceDiff < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {priceDiff < 0 ? '▼' : '▲'}{Math.abs(priceDiff).toLocaleString()}円 昨日より{priceDiff < 0 ? '安い！' : '高い'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-yellow-400 text-lg">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                <span>{product.review_average}</span>
                <span>({(product.review_count || 0).toLocaleString()}件)</span>
              </div>

              {product.shop_name && <p className="text-sm text-gray-500">販売店: {product.shop_name}</p>}

              <AffiliateButton url={product.affiliate_url || product.item_url || '#'} className="w-full" />
            </div>
          </div>
        </div>

        {/* Price Chart */}
        {history && history.length > 1 && <PriceChart history={history} />}

        {/* Alert Form */}
        <AlertForm productId={product.id} currentPrice={product.current_price} />

        {/* Related Products */}
        {related && related.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#2E4057] mb-4">関連商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
