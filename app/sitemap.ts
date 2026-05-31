import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'dog-food', 'dog-snack', 'dog-walk', 'dog-care', 'dog-goods',
  'cat-food', 'cat-snack', 'cat-toilet', 'cat-tower', 'cat-care', 'cat-goods',
  'pet-sheets',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petprice-sand.vercel.app';

  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('review_count', { ascending: false })
    .limit(5000);

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
