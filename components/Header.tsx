'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'Diya Organics';
  const siteLogo = getSetting('site_logo') || '/favicon/favicon.ico';
  const sitePhone = getSetting('contact_phone') || '0500590559';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <AnnouncementBar />

      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-brand-500/5 border-b border-brand-100/50'
        : 'bg-white border-b border-gray-100'
        }`}>
        <div className="safe-area-top" />
        <nav aria-label="Main navigation" className="relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-20 grid grid-cols-[auto_1fr_auto] items-center gap-4">

              {/* Left: Mobile Menu + Logo */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 -ml-2 text-gray-900 hover:text-brand-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <i className="ri-menu-line text-2xl"></i>
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-3 select-none group"
                  aria-label="Go to homepage"
                >
                  <img src={siteLogo} alt={siteName} className="h-10 md:h-12 w-auto object-contain" />
                  <div className="hidden md:flex flex-col">
                    <span className="text-brand-700 font-bold text-lg leading-tight tracking-tight">DIYA</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-medium">Organics</span>
                  </div>
                </Link>
              </div>

              {/* Center: Navigation Links (Desktop) */}
              <div className="hidden lg:flex items-center justify-center space-x-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative py-2 text-[13px] uppercase tracking-[0.15em] font-semibold text-gray-700 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 bg-gradient-to-r from-brand-500 to-brand-300 transition-transform duration-300 ease-out group-hover:scale-x-100 rounded-full" />
                  </Link>
                ))}
              </div>

              {/* Right: Icons */}
              <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                {/* Search */}
                <button
                  className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                >
                  <i className="ri-search-line text-xl"></i>
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200 relative hidden sm:flex items-center justify-center"
                  aria-label="Wishlist"
                >
                  <i className="ri-heart-line text-xl"></i>
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Account */}
                {user ? (
                  <Link
                    href="/account"
                    className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200 hidden sm:flex items-center justify-center"
                    aria-label="Account"
                  >
                    <i className="ri-user-line text-xl"></i>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200 hidden sm:flex items-center justify-center"
                    aria-label="Login"
                  >
                    <i className="ri-user-line text-xl"></i>
                  </Link>
                )}

                {/* Cart */}
                <div className="relative">
                  <button
                    className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200 relative"
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    aria-label="Cart"
                  >
                    <i className="ri-shopping-bag-line text-xl"></i>
                    {cartCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[9px] font-bold text-brand-900 ring-2 ring-white animate-scale-in">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl animate-fade-in-up overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Search Products</h3>
                  <p className="text-sm text-gray-500 mt-1">Find organic skincare, supplements & more</p>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organic products, supplements..."
                    className="w-full px-5 py-4 pr-14 border-2 border-brand-100 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-base bg-sage-50 transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    <i className="ri-search-line text-lg"></i>
                  </button>
                </div>
              </form>
              {/* Quick Links */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Skincare', 'Supplements', 'Essential Oils', 'Superfoods'].map((term) => (
                  <button
                    key={term}
                    onClick={() => { setSearchQuery(term); }}
                    className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm rounded-full hover:bg-brand-100 transition-colors font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Mobile Menu Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                <img src={siteLogo} alt={siteName} className="h-9 w-auto object-contain" />
                <div className="flex flex-col">
                  <span className="text-brand-700 font-bold text-base leading-tight">DIYA</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-brand-400 font-medium">Organics</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { label: 'Home', href: '/', icon: 'ri-home-4-line' },
                { label: 'Shop All Products', href: '/shop', icon: 'ri-store-2-line' },
                { label: 'Categories', href: '/categories', icon: 'ri-layout-grid-line' },
                { label: 'About Brand Store', href: '/about', icon: 'ri-information-line' },
                { label: 'Contact Us', href: '/contact', icon: 'ri-phone-line' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${link.icon} text-xl text-brand-400`}></i>
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-gray-100 my-3"></div>

              {[
                { label: 'Track Order', href: '/order-tracking', icon: 'ri-map-pin-line' },
                { label: 'Wishlist', href: '/wishlist', icon: 'ri-heart-line' },
                { label: 'My Account', href: '/account', icon: 'ri-user-line' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${link.icon} text-lg text-gray-400`}></i>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="p-5 border-t border-gray-100 bg-sage-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <i className="ri-phone-line text-brand-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Need help?</p>
                  <p className="text-sm font-semibold text-gray-800">{sitePhone}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}