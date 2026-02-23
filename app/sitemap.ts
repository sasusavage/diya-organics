import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.diya-organics.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Dynamic product pages
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active');

  const productPages = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic category pages
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('status', 'active');

  const categoryPages = (categories || []).map((category) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: new Date(category.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
