import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/callback',
          '/checkout/',
          '/account/',
          '/cart',
          '/order-tracking',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
