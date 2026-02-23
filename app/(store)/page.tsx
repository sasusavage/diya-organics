'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Star,
  ChevronRight,
  Instagram,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import NewsletterSection from '@/components/NewsletterSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const { getSetting } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to safely parse JSON settings
  const getParsedSetting = (key: string, fallback: any) => {
    const setting = getSetting(key);
    if (!setting) return fallback;
    try {
      return JSON.parse(setting);
    } catch (e) {
      console.error(`Error parsing CMS setting ${key}:`, e);
      return fallback;
    }
  };

  // Home Hero Settings
  const heroImage = getSetting('home_hero_image') || '';
  const heroBadge = getSetting('home_hero_badge') || '';
  const heroTitle = getSetting('home_hero_title') || '';
  const heroDesc = getSetting('home_hero_desc') || '';
  const heroPrimaryText = getSetting('home_hero_cta_primary') || '';
  const heroSecondaryText = getSetting('home_hero_cta_secondary') || '';

  // Benefits Settings
  const benefits = getParsedSetting('home_benefits', []);

  // Featured Settings
  const featuredBadge = getSetting('home_featured_badge') || '';
  const featuredTitle = getSetting('home_featured_title') || '';
  const featuredLinkText = getSetting('home_featured_link') || '';

  // Testimonials Settings
  const testimonials = getParsedSetting('home_testimonials', []);

  // Fetch Featured Products from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      {/* ============================================
          HERO SECTION — Premium & Minimalist
          ============================================ */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-brand-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Organic Skincare Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/40 to-transparent" />
        </div>

        <div className="container relative z-10 px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-brand-500/20 backdrop-blur-md text-gold-300 border border-gold-300/20">
              <Sparkles className="w-3 h-3" />
              {heroBadge}
            </span>
            <h1
              className="mb-8 text-5xl md:text-7xl font-serif leading-[1.1] text-white"
              dangerouslySetInnerHTML={{ __html: heroTitle }}
            />
            <p className="mb-10 text-lg leading-relaxed text-brand-50/80 md:text-xl font-light">
              {heroDesc}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wider uppercase transition-all rounded-full bg-gold-400 text-brand-900 hover:bg-gold-300 shadow-gold"
              >
                {heroPrimaryText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider uppercase transition-all border rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                {heroSecondaryText}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Quality Badges (Desktop Only) */}
        <div className="absolute hidden lg:flex bottom-12 right-12 gap-6 z-20">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white/5 backdrop-blur-lg border border-white/10"
          >
            <Leaf className="w-6 h-6 text-gold-300 mb-1" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Vegan</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white/5 backdrop-blur-lg border border-white/10"
          >
            <ShieldCheck className="w-6 h-6 text-gold-300 mb-1" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Purity</span>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          BENEFITS SECTION — Trust & USPs
          ============================================ */}
      <section className="py-20 bg-white border-b border-sage-100">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
            {benefits.map((item: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center md:text-left flex flex-col items-center md:items-start"
              >
                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-sage-50 text-brand-600 transition-colors hover:bg-brand-50">
                  <i className={`${item.icon || 'ri-check-line'} text-2xl`}></i>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PRODUCTS — Best Sellers
          ============================================ */}
      <section className="py-24 bg-[#FDFCFB]">
        <div className="container px-6 mx-auto">
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-end justify-between gap-6 mb-16 md:flex-row"
          >
            <div className="max-w-xl text-left mr-auto">
              <span className="text-sm font-bold tracking-widest uppercase text-brand-600">{featuredBadge}</span>
              <h2
                className="mt-4 text-4xl font-serif md:text-5xl text-gray-900 leading-tight"
                dangerouslySetInnerHTML={{ __html: featuredTitle }}
              />
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 font-bold text-brand-900 border-b-2 border-gold-400 pb-1"
            >
              {featuredLinkText}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.compare_at_price}
                  image={product.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'}
                  rating={product.rating_avg || 5}
                  reviewCount={product.review_count || 0}
                  inStock={(product.quantity || 0) > 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION — Bento Social Proof
          ============================================ */}
      <section className="py-24 bg-sage-50/50">
        <div className="container px-6 mx-auto">
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-4xl font-serif md:text-5xl text-gray-900">{getSetting('home_testimonials_title') || 'Loved by Nature Lovers'}</h2>
            <p className="text-gray-500">{getSetting('home_testimonials_subtitle') || 'Join over 10,000 satisfied customers who switched to pure, botanical skincare.'}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Main Feature Testimonial */}
            {testimonials.length > 0 && (
              <motion.div
                {...fadeInUp}
                className="md:col-span-2 p-10 bg-white rounded-4xl border border-brand-100/50 shadow-sm flex flex-col justify-center"
              >
                <div className="flex gap-1 mb-6 text-gold-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-2xl font-serif italic leading-relaxed text-gray-800 mb-8">
                  &quot;{testimonials[0].quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 overflow-hidden rounded-full bg-sage-100">
                    <img src={testimonials[0].image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100"} alt="Customer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonials[0].author}</h4>
                    <p className="text-sm text-gray-400">{testimonials[0].role}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Side Callouts */}
            <div className="flex flex-col gap-6">
              <motion.div
                {...fadeInUp}
                className="p-8 bg-brand-900 text-white rounded-4xl flex flex-col items-center text-center justify-center flex-1"
              >
                <CheckCircle2 className="w-10 h-10 text-gold-300 mb-4" />
                <h3 className="text-2xl font-serif mb-2">98% Satisfied</h3>
                <p className="text-brand-50/60 text-sm">Rating based on 2,500+ verified customer reviews.</p>
              </motion.div>
              <motion.div
                {...fadeInUp}
                className="p-8 bg-gold-400 rounded-4xl text-brand-900 flex flex-col items-center text-center justify-center flex-1"
              >
                <Instagram className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">Share Your Glow</h3>
                <p className="text-brand-900/60 text-sm">Tag @diyaorganics to be featured on our page.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          NEWSLETTER SECTION
          ============================================ */}
      <NewsletterSection />
    </main>
  );
}
