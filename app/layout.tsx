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
    default: 'Diya Organics',
    template: '%s | Diya Organics',
  },
  description: 'Pure Ayurvedic Hair Care hand-manufactured with love in Ghana.',
  keywords: ['hair care', 'ayurvedic', 'organic', 'ghana', 'made in ghana'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Diya Organics',
    title: 'Diya Organics — Hand-Manufactured Ayurvedic Hair Care',
    description: 'Pure Ayurvedic hair care for thicker, healthier hair. 100% Made in Ghana.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Diya Organics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diya Organics — Premium Ayurvedic Hair Care',
    description: 'Pure Ayurvedic hair care for thicker, healthier hair. Hand-manufactured in Ghana.',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
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
  themeColor: '#000000',
  viewportFit: 'cover',
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Diya Organics',
  description: 'Pure Ayurvedic hair care hand-manufactured with love by Diya in Ghana.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
  foundingDate: '2020',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Haatso',
    addressLocality: 'Accra',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English',
    telephone: '0500590559',
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
