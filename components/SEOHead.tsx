import type { Metadata } from 'next';

const SITE_NAME = 'Diya Organics';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.diya-organics.com';
const SITE_DESCRIPTION = 'Diya Organics — Hand-manufactured Ayurvedic hair care by Diya in Ghana. Pure, natural solutions for stronger, thicker, and lusher hair.';
const DEFAULT_KEYWORDS = [
  'Diya Organics', 'hair care Ghana', 'ayurvedic hair care', 'organics hair care',
  'made in Ghana', 'Haatso hair care', 'natural hair products Ghana',
  'hair growth oil Ghana', 'herbal hair care', 'pure ayurvedic hair',
];

export function StructuredData({ data }: { data: any }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateMetadata({
  title = '',
  description = SITE_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const absoluteImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url ? `${SITE_URL}${url}` : undefined,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: url ? `${SITE_URL}${url}` : SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_GH',
      type: type as any,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateProductSchema(product: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string;
  sku?: string;
  slug?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  category?: string;
  availability?: string; // override specific availability string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image ? (product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`) : `${SITE_URL}/og-image.jpg`,
    sku: product.sku || '',
    url: product.slug ? `${SITE_URL}/product/${product.slug}` : '',
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency || 'GHS',
      price: product.price,
      availability: product.availability
        ? `https://schema.org/${product.availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`
        : (product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'),
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    aggregateRating: product.rating
      ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      }
      : undefined,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon/favicon.ico`,
    foundingDate: '2020',
    founder: {
      '@type': 'Person',
      name: 'Diya',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Haatso',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}