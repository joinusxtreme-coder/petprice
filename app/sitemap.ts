import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petprice.vercel.app';

  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('updated_at', { ascending: false });

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p: { id: string; updated_at: string }) => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/dog-food`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cat-food`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/dog-goods`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cat-goods`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...productUrls,
  ];
}
