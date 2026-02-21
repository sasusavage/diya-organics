'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, ListChecks, Star } from 'lucide-react';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';

// Map common color names to hex values for swatches
const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match (e.g. "Light Blue" -> "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = []
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  const MAX_SWATCHES = 5;

  const formatPrice = (val: number) => `GH\u20B5${val.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-3xl h-full flex flex-col border border-sage-100 hover:border-brand-200 overflow-hidden transition-all duration-500 hover:shadow-2xl shadow-sm"
    >
      <Link href={`/product/${slug}`} className="relative block aspect-[4/5] overflow-hidden bg-sage-50">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />

        {/* Exclusive Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {badge && (
            <span className="bg-brand-900/90 backdrop-blur-md text-gold-300 text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full border border-gold-300/20">
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-gold-400 text-brand-900 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
        </div>

        {/* Heart / Wishlist would go here */}

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Restocking</span>
          </div>
        )}

        {/* Hover Action Strip */}
        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out hidden lg:block z-20">
            {hasVariants ? (
              <span className="w-full bg-brand-900 text-gold-300 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-widest shadow-xl">
                <ListChecks className="w-4 h-4" />
                <span>Choose Variant</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({
                    id, name, price, image, quantity: moq || 1, slug, maxStock: maxStock || 50, moq: moq || 1
                  });
                }}
                className="w-full bg-brand-900 text-gold-300 hover:bg-black py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center space-x-3 text-xs uppercase tracking-widest shadow-2xl"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{moq > 1 ? `Add ${moq} items` : 'Add to Bag'}</span>
              </button>
            )}
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-gold-400 fill-current' : 'text-gray-200'}`} />
          ))}
          <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">{reviewCount} Reviews</span>
        </div>

        <Link href={`/product/${slug}`}>
          <h3 className="font-serif text-lg leading-tight text-gray-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
        </Link>

        {colorVariants.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {colorVariants.slice(0, MAX_SWATCHES).map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(activeColor === color.name ? null : color.name);
                }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${activeColor === color.name
                  ? 'border-brand-600 scale-125'
                  : 'border-white hover:scale-110 shadow-sm'
                  }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-[11px] text-gray-400 line-through mb-0.5">{formatPrice(originalPrice)}</span>
            )}
            <span className="text-brand-900 font-black text-base">
              {hasVariants && minVariantPrice ? `From ${formatPrice(minVariantPrice)}` : formatPrice(price)}
            </span>
          </div>

          <div className="lg:hidden">
            <button
              disabled={!inStock}
              onClick={(e) => {
                e.preventDefault();
                if (hasVariants) { window.location.href = `/product/${slug}`; return; }
                addToCart({ id, name, price, image, quantity: moq || 1, slug, maxStock: maxStock || 50, moq: moq || 1 });
              }}
              className="w-10 h-10 bg-sage-50 text-brand-900 rounded-full flex items-center justify-center hover:bg-brand-900 hover:text-white transition-all disabled:opacity-50"
            >
              {hasVariants ? <ListChecks className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
