'use client';

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';

export default function Footer() {
  const { getSetting, getContentList } = useCMS();
  const siteName = getSetting('site_name') || 'Diya Organics';
  const siteLogo = getSetting('site_logo') || '/favicon/favicon.ico';
  const siteEmail = getSetting('contact_email') || '';
  const sitePhone = getSetting('contact_phone') || '';
  const siteAddress = getSetting('contact_address') || '';
  const footerDescription = getSetting('footer_description') || '';
  const footerCopyright = getSetting('footer_copyright') || `All rights reserved. Diya Organics — Haatso, Accra, Ghana.`;
  const footerCtaTitle = getSetting('footer_cta_title') || '';
  const footerCtaSubtitle = getSetting('footer_cta_subtitle') || '';

  // Social links from settings
  const socialLinks = [
    { key: 'social_facebook', icon: 'ri-facebook-fill', label: 'Facebook' },
    { key: 'social_instagram', icon: 'ri-instagram-line', label: 'Instagram' },
    { key: 'social_twitter', icon: 'ri-twitter-x-line', label: 'X' },
    { key: 'social_whatsapp', icon: 'ri-whatsapp-line', label: 'WhatsApp' },
    { key: 'social_tiktok', icon: 'ri-tiktok-line', label: 'TikTok' },
    { key: 'social_youtube', icon: 'ri-youtube-line', label: 'YouTube' },
    { key: 'social_snapchat', icon: 'ri-snapchat-line', label: 'Snapchat' },
  ].filter(s => {
    const url = getSetting(s.key);
    return url && url.length > 0;
  });

  // CMS-managed footer links (with hardcoded fallbacks)
  const cmsShopLinks = getContentList('footer', 'shop_link_');
  const cmsSupportLinks = getContentList('footer', 'support_link_');
  const cmsCompanyLinks = getContentList('footer', 'company_link_');

  const shopLinks = cmsShopLinks.length > 0
    ? cmsShopLinks.map(l => ({ label: l.title || '', href: l.button_url || '#' }))
    : [
      { label: 'All Products', href: '/shop' },
      { label: 'Categories', href: '/categories' },
      { label: 'Featured Items', href: '/shop?featured=true' },
      { label: 'New Arrivals', href: '/shop?sort=newest' },
    ];

  const supportLinks = cmsSupportLinks.length > 0
    ? cmsSupportLinks.map(l => ({ label: l.title || '', href: l.button_url || '#' }))
    : [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns Policy', href: '/returns' },
      { label: 'Track Order', href: '/order-tracking' },
    ];

  const companyLinks = cmsCompanyLinks.length > 0
    ? cmsCompanyLinks.map(l => ({ label: l.title || '', href: l.button_url || '#' }))
    : [
      { label: 'About Brand Store', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-700 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gold-400/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Top CTA Strip - Compact */}
      <div className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-400/20 rounded-lg flex items-center justify-center">
                <i className="ri-capsule-line text-lg text-gold-300"></i>
              </div>
              <p className="text-sm font-medium">
                <span className="font-bold text-white block md:inline md:mr-2">{footerCtaTitle}</span>
                <span className="text-white/60 hidden md:inline">{footerCtaSubtitle}</span>
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-gold-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Contact Support <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">

          {/* Brand Column - Full width on mobile, 4 cols on desktop */}
          <div className="col-span-2 md:col-span-4 lg:pr-8">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <img src={siteLogo} alt={siteName} className="h-8 w-auto object-contain" />
              <div>
                <span className="text-white font-bold text-lg block leading-none">DIYA</span>
                <span className="text-gold-300 text-[9px] uppercase tracking-[0.2em] font-medium">Organics</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              {footerDescription}
            </p>

            <div className="flex flex-col gap-2 mb-6 text-sm text-white/70">
              <a href={`tel:${sitePhone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:text-white transition-colors">
                <i className="ri-phone-fill text-gold-400"></i> {sitePhone}
              </a>
              <a href={`mailto:${siteEmail}`} className="flex items-center gap-3 hover:text-white transition-colors">
                <i className="ri-mail-fill text-gold-400"></i> {siteEmail}
              </a>
              <div className="flex items-start gap-3">
                <i className="ri-map-pin-fill text-gold-400 mt-1"></i>
                <span className="max-w-[200px]">{siteAddress}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {(socialLinks.length > 0 ? socialLinks : [
                { icon: 'ri-facebook-fill', label: 'Facebook' },
                { icon: 'ri-instagram-line', label: 'Instagram' },
                { icon: 'ri-twitter-x-line', label: 'X' },
              ]).slice(0, 5).map((social, idx) => (
                <a
                  key={idx}
                  href={'#'}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-gold-400 hover:text-brand-900 flex items-center justify-center transition-all text-white/60"
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 opacity-80">Shop</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-300 text-sm transition-colors block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 opacity-80">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-300 text-sm transition-colors block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 opacity-80">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-300 text-sm transition-colors block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods - Compact */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex gap-2">
                <i className="ri-visa-line text-2xl text-white/50"></i>
                <i className="ri-mastercard-line text-2xl text-white/50"></i>
                <i className="ri-secure-payment-line text-2xl text-white/50"></i>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar - Ultra Compact */}
      <div className="bg-brand-800/50 py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://moolre.com" target="_blank" className="hover:text-gold-300 transition-colors">Powered by Moolre</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
