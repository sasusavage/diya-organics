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
    default: 'Store Platform',
    template: '%s | Store Platform',
  },
  description: 'Your premium shopping destination for quality products.',
  keywords: ['shopping', 'ecommerce', 'store'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Platform Store',
    title: 'Modern E-Commerce Solution',
    description: 'High-quality products for your needs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Brand Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Store — Premium Natural & Organic Products',
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
    title: 'Store App',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
  viewportFit: 'cover',
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Store Brand',
  description: 'Providing quality products to our customers.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Main Street',
    addressLocality: 'City',
    addressRegion: 'Region',
    addressCountry: 'US',
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
