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
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // Fetch Hero Slides & Featured Products
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Slides
        const { data: slidesData } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (slidesData && slidesData.length > 0) {
          setHeroSlides(slidesData);
        } else {
          // Fallback to CMS settings if no slides are defined in the specific table
          setHeroSlides([{
            id: 'cms-fallback',
            title: heroTitle,
            subtitle: heroDesc,
            tag: heroBadge,
            image_url: heroImage,
            cta_text: heroPrimaryText,
            cta_link: '/shop',
            secondary_cta_text: heroSecondaryText,
            secondary_cta_link: '/about'
          }]);
        }

        // Fetch Products
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [heroTitle, heroDesc, heroBadge, heroImage, heroPrimaryText, heroSecondaryText]);

  // Slideshow interval
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides]);

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
      <section className="relative h-[90vh] w-full overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          {heroSlides.length > 0 && (
            <motion.div
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* Background Image - No Full Overlay */}
              <div className="absolute inset-0">
                {heroSlides[currentSlide].image_url ? (
                  <Image
                    src={heroSlides[currentSlide].image_url}
                    alt={heroSlides[currentSlide].title || "Hero Image"}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-brand-200 animate-pulse" />
                  </div>
                )}
                {/* Text Protection Gradient: Bottom-up on mobile, Left-to-right on desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent md:bg-gradient-to-r md:from-white/95 md:via-white/50 md:to-transparent" />
              </div>

              {/* Text Content - Bottom on mobile, Center on desktop */}
              <div className="container relative z-10 h-full px-6 mx-auto flex flex-col justify-end pb-20 md:pb-0 md:justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-xl md:max-w-2xl"
                >
                  {heroSlides[currentSlide].tag && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase rounded-full bg-brand-900 text-white shadow-lg shadow-brand-900/10">
                      <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold-400" />
                      {heroSlides[currentSlide].tag}
                    </span>
                  )}
                  <h1
                    className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-7xl font-serif leading-[1.2] md:leading-[1.1] text-brand-950"
                    dangerouslySetInnerHTML={{ __html: heroSlides[currentSlide].title }}
                  />
                  <p className="mb-8 md:mb-10 text-base md:text-xl leading-relaxed text-brand-900/80 font-light max-w-lg">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={heroSlides[currentSlide].cta_link || '/shop'}
                      className="group inline-flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all rounded-full bg-brand-900 text-white hover:bg-brand-800 shadow-xl shadow-brand-900/20"
                    >
                      {heroSlides[currentSlide].cta_text || 'Shop Collection'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    {(heroSlides[currentSlide].secondary_cta_text || heroSecondaryText) && (
                      <Link
                        href={heroSlides[currentSlide].secondary_cta_link || '/about'}
                        className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all border-2 rounded-full border-brand-900/10 text-brand-900 hover:bg-white hover:border-brand-900/20 shadow-sm"
                      >
                        {heroSlides[currentSlide].secondary_cta_text || heroSecondaryText}
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slideshow Progress Bar */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-brand-900' : 'w-3 bg-brand-900/20'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute hidden xl:flex flex-col bottom-12 right-12 gap-4 z-20">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-brand-600" />
            </div>
            <span className="text-xs font-bold text-brand-900 uppercase tracking-widest text-[10px]">100% Organic</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>
            <span className="text-xs font-bold text-brand-900 uppercase tracking-widest text-[10px]">Ayurvedic</span>
          </motion.div>
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
          BENEFITS SECTION — Trust & USPs (Moved to Bottom)
          ============================================ */}
      <section className="py-24 bg-white border-t border-sage-100">
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
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-3xl bg-sage-50 text-brand-600 transition-all hover:bg-brand-900 hover:text-white hover:rotate-6 group">
                  <i className={`${item.icon || 'ri-check-line'} text-3xl`}></i>
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 uppercase tracking-tight">{item.title}</h3>
                <p className="text-base leading-relaxed text-gray-500 font-light">{item.desc}</p>
              </motion.div>
            ))}
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
