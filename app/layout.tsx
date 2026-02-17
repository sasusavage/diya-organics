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
    default: 'WIDAMA Pharmacy — Quality Medicines & Healthcare Since 2004',
    template: '%s | WIDAMA Pharmacy',
  },
  description: 'WIDAMA Pharmacy — Ghana\'s trusted source for quality medicines, health products, and pharmaceutical services. Wholesale, retail, manufacturing, and training since 2004. Visit us at WIDAMA Towers, Ashaiman Lebanon.',
  keywords: [
    'WIDAMA Pharmacy', 'pharmacy Ghana', 'medicines online', 'health products',
    'pharmaceutical wholesale', 'buy medicine online Ghana', 'pharmacy Ashaiman',
    'WIDAMA Towers', 'pharmaceutical services', 'health supplements',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com'),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.widamapharmacy.com',
    siteName: 'WIDAMA Pharmacy',
    title: 'WIDAMA Pharmacy — Quality Medicines & Healthcare Since 2004',
    description: 'Ghana\'s trusted pharmacy for quality medicines, health products, and pharmaceutical services. Wholesale, retail, manufacturing, and training.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WIDAMA Pharmacy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WIDAMA Pharmacy — Quality Medicines & Healthcare',
    description: 'Ghana\'s trusted pharmacy since 2004. Quality medicines, health products, pharmaceutical services.',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WIDAMA Pharmacy',
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
  name: 'WIDAMA Pharmacy',
  description: 'Quality medicines, health products, and pharmaceutical services. Wholesale, retail, manufacturing, and training since 2004.',
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
