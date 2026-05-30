import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    petType?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';

  let query = supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average', { count: 'exact' });

  if (q) query = query.ilike('name', `%${q}%`);
  if (sp.petType && sp.petType !== 'all') query = query.eq('pet_type', sp.petType);
  if (sp.minPrice) query = query.gte('current_price', Number(sp.minPrice));
  if (sp.maxPrice) query = query.lte('current_price', Number(sp.maxPrice));

  query = query.order('review_count', { ascending: false }).limit(40);

  const { data: products, count } = await query;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[#FF6B35] shrink-0">ペットプライス🐾</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-[#2E4057] mb-6">検索</h1>

        <form method="get" className="bg-white rounded-xl p-4 shadow mb-6 space-y-3">
          <div>
            <input
              name="q"
              defaultValue={q}
              placeholder="キーワードを入力..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select name="petType" defaultValue={sp.petType || 'all'} className="border rounded-lg px-3 py-2 text-sm">
              <option value="all">すべてのペット</option>
              <option value="dog">犬</option>
              <option value="cat">猫</option>
              <option value="other">その他</option>
            </select>
            <div className="flex items-center gap-1">
              <input name="minPrice" defaultValue={sp.minPrice} placeholder="下限" className="w-20 border rounded-lg px-2 py-2 text-sm" />
              <span className="text-sm">〜</span>
              <input name="maxPrice" defaultValue={sp.maxPrice} placeholder="上限" className="w-20 border rounded-lg px-2 py-2 text-sm" />
              <span className="text-sm">円</span>
            </div>
          </div>
          <button type="submit" className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg text-sm font-semibold">検索する</button>
        </form>

        {q && <p className="text-sm text-gray-500 mb-4">「{q}」の検索結果: {count?.toLocaleString()}件</p>}

        {!products || products.length === 0 ? (
          <p className="text-gray-500">{q ? '商品が見つかりませんでした。' : 'キーワードを入力して検索してください。'}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
