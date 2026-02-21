import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CMSProvider } from '@/context/CMSContext';
import dynamic from 'next/dynamic';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: {
    default: 'Diya Organics — Premium Natural & Organic Products',
    template: '%s | Diya Organics',
  },
  description: 'Diya Organics — Your trusted source for 100% natural, organic, and eco-friendly products. Shop our curated collection for a healthier lifestyle.',
  keywords: [
    'Diya Organics', 'organic products Ghana', 'natural skincare', 'organic health supplements',
    'eco-friendly products', 'buy organic online Ghana', 'healthy living',
    'natural wellness', 'organic beauty', 'superfoods',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com'),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com',
    siteName: 'Diya Organics',
    title: 'Diya Organics — Premium Natural & Organic Products',
    description: 'Your trusted destination for premium organic and natural products. Enhancing your wellbeing with nature\'s best.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Diya Organics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diya Organics — Premium Natural & Organic Products',
    description: 'Premium organic and natural products for a healthier lifestyle. Order online today.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Diya Organics',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D6B4E',
  viewportFit: 'cover',
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Diya Organics',
  description: 'Premium natural and organic products for a healthier and sustainable lifestyle.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com'}/logo.png`,
  foundingDate: '2004',
  founder: {
    '@type': 'Person',
    name: 'Mr. Wisdom Amezah',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'WIDAMA Towers, Ashaiman Lebanon',
    addressLocality: 'Ashaiman',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="antialiased min-h-screen bg-white text-gray-900">
        <CMSProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <ChatWidget />
            </WishlistProvider>
          </CartProvider>
        </CMSProvider>
      </body>
    </html>
  );
}
