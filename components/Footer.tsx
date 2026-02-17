'use client';

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';

export default function Footer() {
  const { getSetting, getContentList } = useCMS();
  const siteName = getSetting('site_name') || 'WIDAMA Pharmacy';
  const siteEmail = getSetting('contact_email') || 'info@widamapharmacy.com';
  const sitePhone = getSetting('contact_phone') || '+233 XX XXX XXXX';
  const siteAddress = getSetting('contact_address') || 'WIDAMA Towers, Ashaiman Lebanon, Ghana';
  const footerDescription = getSetting('footer_description') || 'Your trusted healthcare partner since 2004. Quality medicines, wholesale distribution, manufacturing, and professional training — all under one roof.';
  const footerCopyright = getSetting('footer_copyright') || `All rights reserved. Licensed Pharmacy — WIDAMA Towers, Ashaiman Lebanon, Ghana.`;
  const footerCtaTitle = getSetting('footer_cta_title') || 'Need Pharmaceutical Advice?';
  const footerCtaSubtitle = getSetting('footer_cta_subtitle') || 'Our licensed pharmacists are here to help.';

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
      { label: 'About WIDAMA', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      {/* Top CTA Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-400/20 rounded-xl flex items-center justify-center">
                <i className="ri-capsule-line text-2xl text-gold-300"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">{footerCtaTitle}</h3>
                <p className="text-white/60 text-sm">{footerCtaSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-brand-900 px-6 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5"
              >
                <i className="ri-phone-line"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <img src="/logo.png" alt={siteName} className="h-12 w-auto object-contain" />
              <div>
                <span className="text-white font-bold text-xl block leading-tight">WIDAMA</span>
                <span className="text-gold-300 text-[10px] uppercase tracking-[0.25em] font-medium">Pharmacy</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">
              {footerDescription}
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <i className="ri-map-pin-line text-gold-400"></i>
                <span>{siteAddress}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <i className="ri-phone-line text-gold-400"></i>
                <a href={`tel:${sitePhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{sitePhone}</a>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <i className="ri-mail-line text-gold-400"></i>
                <a href={`mailto:${siteEmail}`} className="hover:text-white transition-colors">{siteEmail}</a>
              </div>
            </div>

            {/* Social Links — only renders if at least one URL is configured */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={getSetting(social.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-gold-400/20 rounded-xl flex items-center justify-center text-white/60 hover:text-gold-300 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <i className={`${social.icon} text-lg`}></i>
                  </a>
                ))}
              </div>
            )}
            {socialLinks.length === 0 && (
              <div className="flex items-center gap-3">
                {[
                  { icon: 'ri-facebook-fill', label: 'Facebook' },
                  { icon: 'ri-instagram-line', label: 'Instagram' },
                  { icon: 'ri-twitter-x-line', label: 'X' },
                  { icon: 'ri-whatsapp-line', label: 'WhatsApp' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-10 h-10 bg-white/10 hover:bg-gold-400/20 rounded-xl flex items-center justify-center text-white/60 hover:text-gold-300 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <i className={`${social.icon} text-lg`}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop Column */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-gold-300 text-sm transition-colors inline-flex items-center gap-1 group">
                    <i className="ri-arrow-right-s-line text-xs opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-gold-300 text-sm transition-colors inline-flex items-center gap-1 group">
                    <i className="ri-arrow-right-s-line text-xs opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-gold-300 text-sm transition-colors inline-flex items-center gap-1 group">
                    <i className="ri-arrow-right-s-line text-xs opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-8">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Payment Methods</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg">
                  <i className="ri-smartphone-line text-sm text-white/60"></i>
                  <span className="text-[10px] text-white/60 font-medium">Mobile Money</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg">
                  <i className="ri-bank-card-line text-sm text-white/60"></i>
                  <span className="text-[10px] text-white/60 font-medium">Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs text-center md:text-left">
              &copy; {currentYear} {siteName}. {footerCopyright}
            </p>
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              <span>·</span>
              <Link href="/faqs" className="hover:text-white/60 transition-colors">FAQs</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
