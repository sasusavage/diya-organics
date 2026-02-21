'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState, useEffect } from 'react';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/shop',
      label: 'Shop',
      icon: ShoppingBag,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      badge: cartCount,
    },
    {
      href: '/wishlist',
      label: 'Likes',
      icon: Heart,
      badge: wishlistCount,
    },
    {
      href: '/account',
      label: 'Me',
      icon: User,
    },
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-6 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      aria-label="Mobile navigation"
    >
      <div className="relative">
        {/* Floating Capsule Style */}
        <div className="bg-brand-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
          <div className={`grid grid-cols-5 ${isStandalone ? 'pb-2' : ''} py-2`}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 transition-all duration-300 relative group active:scale-95 ${active ? 'text-gold-300' : 'text-gray-400'
                    }`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-105 opacity-80'
                        }`}
                      strokeWidth={active ? 2.5 : 2}
                    />

                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-gold-400 text-brand-900 text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-brand-900">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 h-0 hidden'
                    }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
