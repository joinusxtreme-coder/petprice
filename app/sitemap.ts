import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '@/lib/categories';

// サイトマップはビルド時ではなくリクエスト時に生成（タイムアウト回避）
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1時間キャッシュ

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.petprices.jp';

  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('review_count', { ascending: false })
    .limit(2000); // 5000→2000に削減してタイムアウト回避

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p: { id: string; updated_at: string }) => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...categoryUrls,
    ...productUrls,
  ];
}
