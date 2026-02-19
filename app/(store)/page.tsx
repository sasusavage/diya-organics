'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';

import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import NewsletterSection from '@/components/NewsletterSection';
import { usePageTitle } from '@/hooks/usePageTitle';

// Default slides fallback
const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    tag: 'Test Validation',
    title: 'Validating Image Load',
    subtitle: 'If you see the image background, the URL is working. If green, the image is blocked.',
    cta_text: 'Shop Medicines',
    cta_link: '/shop',
    image_url: 'https://jwqgkjcjawsvbdlgtqxo.supabase.co/storage/v1/object/public/hero-assets/images/8wvku2awupa_1771319209665.jpg',
  },
  {
    id: 'default-2',
    tag: 'Wholesale & Retail',
    title: 'Pharmaceutical Excellence in Ghana',
    subtitle: 'From wholesale distribution to retail pharmacy — WIDAMA Towers, Ashaiman Lebanon. Serving healthcare professionals and families.',
    cta_text: 'Browse Products',
    cta_link: '/shop',
    image_url: null,
  },
  {
    id: 'default-3',
    tag: 'Training & Manufacturing',
    title: 'Building the Future of Healthcare',
    subtitle: 'WIDAMA Training Institute and manufacturing arm — empowering the next generation of pharmacy professionals across Ghana.',
    cta_text: 'Our Services',
    cta_link: '/about',
    image_url: null,
  },
];

export default function Home() {
  usePageTitle('');
  const { getContent, getContentList, getSetting } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

  // Fetch active hero slides from Supabase
  const [slides, setSlides] = useState<any[]>([]);

  // Default slides fallback


  useEffect(() => {
    async function fetchSlides() {
      console.log('Fetching slides...');
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*');
      //.eq('is_active', true)
      //.order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching slides:', error);
        // alert('Error fetching slides: ' + error.message); // Commented out to avoid spam, but useful if needed
      }

      console.log('Slides data:', data);

      if (data && data.length > 0) {
        setSlides(data);
      } else {
        console.warn('No slides found, using defaults.');
        setSlides(DEFAULT_SLIDES);
      }
    }
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData || []);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, image_url, metadata')
          .eq('status', 'active')
          .order('name');

        if (categoriesError) throw categoriesError;

        const featuredCategories = (categoriesData || []).filter(
          (cat: any) => cat.metadata?.featured === true
        );
        setCategories(featuredCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('stats-section');
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);



  // CMS-driven content
  const cmsServices = getContentList('homepage', 'service_').filter(b => b.block_key !== 'services_header');
  const cmsTrustBadges = getContentList('homepage', 'trust_badge_');
  const cmsStats = getContentList('homepage', 'stat_').filter(b => b.block_key !== 'stats_header');
  const servicesHeader = getContent('homepage', 'services_header');
  const statsHeader = getContent('homepage', 'stats_header');
  const aboutHeader = getContent('homepage', 'about_header');
  const aboutCard = getContent('homepage', 'about_card');
  const aboutValues = getContentList('homepage', 'about_value_');
  const aboutTestimonial = getContent('homepage', 'about_testimonial');
  const ctaBanner = getContent('homepage', 'cta_banner');
  const productsHeader = getContent('homepage', 'products_header');
  const categoriesHeader = getContent('homepage', 'categories_header');

  // Fallback data for when CMS hasn't loaded
  const services = cmsServices.length > 0 ? cmsServices.map(s => ({
    icon: s.metadata?.icon || 'ri-capsule-line',
    title: s.title || '',
    description: s.content || '',
    color: s.metadata?.color || 'from-brand-500 to-brand-700',
    link: s.metadata?.link || '/about'
  })) : [
    { icon: 'ri-medicine-bottle-line', title: 'Retail Pharmacy', description: 'Walk-in and online pharmaceutical dispensing with expert pharmacist consultation.', color: 'from-brand-500 to-brand-700', link: '/shop' },
    { icon: 'ri-global-line', title: 'Wholesale Distribution', description: 'Bulk pharmaceutical supply to hospitals, clinics, and pharmacies across Ghana.', color: 'from-brand-400 to-brand-600', link: '/contact' },
    { icon: 'ri-microscope-line', title: 'Manufacturing', description: 'Production of quality pharmaceutical products meeting international standards.', color: 'from-gold-400 to-gold-600', link: '/about' },
    { icon: 'ri-book-open-line', title: 'Training Institute', description: 'WIDAMA Training Institute — educating future pharmacy professionals.', color: 'from-pharmacy-blue to-brand-600', link: '/about' },
  ];

  const trustBadges = cmsTrustBadges.length > 0 ? cmsTrustBadges.map(b => ({
    icon: b.metadata?.icon || 'ri-shield-check-line',
    label: b.title || '',
    sublabel: b.subtitle || '',
  })) : [
    { icon: 'ri-shield-check-line', label: 'FDA Approved', sublabel: 'Licensed Pharmacy' },
    { icon: 'ri-verified-badge-line', label: 'Genuine Products', sublabel: '100% Authentic' },
    { icon: 'ri-truck-line', label: 'Fast Delivery', sublabel: 'Nationwide Shipping' },
    { icon: 'ri-customer-service-2-line', label: 'Expert Support', sublabel: 'Pharmacist On Call' },
  ];

  const stats = cmsStats.length > 0 ? cmsStats.map(s => ({
    value: s.title || '',
    label: s.subtitle || '',
    suffix: s.metadata?.suffix || '',
  })) : [
    { value: '20+', label: 'Years of Service', suffix: '' },
    { value: '10K', label: 'Products Available', suffix: '+' },
    { value: '50K', label: 'Happy Customers', suffix: '+' },
    { value: '24/7', label: 'Customer Support', suffix: '' },
  ];

  return (
    <main className="flex-col items-center justify-between min-h-screen">

      {/* ============================================
          HERO SECTION — Cinematic Full-Screen
          ============================================ */}
      <section className="relative w-full min-h-[85vh] md:min-h-[92vh] overflow-hidden bg-brand-900">

        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-20 right-[10%] w-72 h-72 bg-brand-400/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-float-medium" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-300/5 rounded-full blur-2xl animate-morph" />

          {/* Pharmacy cross pattern */}
          <div className="absolute top-10 left-10 opacity-[0.03] text-white text-[300px] font-black leading-none select-none">✚</div>
          <div className="absolute bottom-10 right-10 opacity-[0.03] text-white text-[200px] font-black leading-none select-none rotate-12">✚</div>
        </div>

        {/* Hero Content */}
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 flex items-center transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            {/* Background Media (Image or Video) */}
            <div className="absolute inset-0 z-0">
              {slide.video_url ? (
                <video
                  src={slide.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : slide.image_url ? (
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Default gradient background if no media
                <div className="w-full h-full bg-transparent" />
              )}
              {/* Dark Overlay for readability */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <div className="text-center lg:text-left">
                  <p
                    key={`tag-${currentSlide}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-gold-300 text-sm font-semibold tracking-wider uppercase mb-8 animate-fade-in-up border border-white/10"
                  >
                    <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></span>
                    {slide.tag}
                  </p>

                  <h1
                    key={`heading-${currentSlide}`}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-[1.1] animate-fade-in-up"
                    style={{ animationDelay: '0.15s' }}
                  >
                    {slide.title}
                  </h1>

                  <p
                    key={`sub-${currentSlide}`}
                    className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: '0.3s' }}
                  >
                    {slide.subtitle || slide.subtext}
                  </p>

                  <div
                    key={`cta-${currentSlide}`}
                    className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up justify-center lg:justify-start"
                    style={{ animationDelay: '0.45s' }}
                  >
                    <Link
                      href={slide.cta_link || (slide.cta ? slide.cta.href : '/shop')}
                      className="px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-full font-semibold hover:shadow-[0_0_20px_rgba(212,168,83,0.4)] transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                    >
                      {slide.cta_text || (slide.cta ? slide.cta.text : 'Shop Now')}
                    </Link>
                    <Link
                      href="/contact"
                      className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 backdrop-blur-sm transition-all w-full sm:w-auto"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>

                {/* Right: Floating Visuals (Only shown if NO background media is present to avoid clutter, or keep them?) */}
                {/* For now, we hide the 3D elements if media is present, or just let them overlay. 
                    Let's keep them primarily for the default look. */}
                {!slide.image_url && !slide.video_url && (
                  <div className="hidden lg:block relative h-[600px] animate-fade-in">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[500px] h-[500px]">
                        {/* Glowing ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-gold-400/20 animate-pulse-soft" />
                        <div className="absolute inset-4 rounded-full border border-brand-300/10" />

                        {/* Center emblem */}
                        <div className="absolute inset-8 bg-gradient-to-br from-white/10 to-white/5 rounded-full backdrop-blur-xl flex flex-col items-center justify-center border border-white/10">
                          <div className="text-7xl text-gold-400 mb-3 animate-heartbeat">✚</div>
                          <div className="text-white font-serif text-2xl font-bold">WIDAMA</div>
                          <div className="text-gold-300 text-xs uppercase tracking-[0.3em] mt-1">Est. 2004</div>
                        </div>

                        {/* Orbiting Elements */}
                        {[
                          { icon: 'ri-capsule-line', angle: 0 },
                          { icon: 'ri-microscope-line', angle: 90 },
                          { icon: 'ri-flask-line', angle: 180 },
                          { icon: 'ri-shield-check-line', angle: 270 },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="absolute w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 text-gold-300 text-xl"
                            style={{
                              top: `${50 + 42 * Math.sin((item.angle * Math.PI) / 180)}%`,
                              left: `${50 + 42 * Math.cos((item.angle * Math.PI) / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.5}s`,
                            }}
                          >
                            <i className={item.icon}></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}{/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${index === currentSlide
                ? 'w-10 h-2.5 bg-gold-400'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 42C384 44 480 58 576 63C672 68 768 64 864 56C960 48 1056 36 1152 33C1248 30 1344 36 1392 39L1440 42V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V60Z" fill="#F4F7F5" />
          </svg>
        </div>
      </section>

      {/* ============================================
          TRUST BADGES BAR
          ============================================ */}
      <section className="bg-sage-50 py-6 border-b border-sage-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${badge.icon} text-brand-600 text-lg`}></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{badge.label}</p>
                  <p className="text-xs text-gray-500">{badge.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION
          ============================================ */}
      {/* ============================================
          SERVICES SECTION (Redesigned Bento Grid)
          ============================================ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-100 text-brand-600 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                {servicesHeader?.metadata?.tag || 'Our Expertise'}
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gray-900 leading-[1.1] mb-6">
                {servicesHeader?.title || <>Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">Healthcare</span> Solutions</>}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {servicesHeader?.subtitle || 'From retail pharmacy to wholesale distribution, manufacturing, and professional training — WIDAMA Pharmacy is your complete, trusted healthcare partner.'}
              </p>
            </div>

            <Link
              href="/about"
              className="hidden md:inline-flex items-center gap-2 text-brand-900 font-bold border-b-2 border-gold-400 pb-1 hover:text-brand-700 transition-colors"
            >
              Explore Our Services <i className="ri-arrow-right-line"></i>
            </Link>
          </AnimatedSection>

          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
            {services.map((service, index) => {
              // Layout logic: 1st and 4th item span 2 columns
              const isLarge = index === 0 || index === 3;

              return (
                <Link
                  href={service.link}
                  key={index}
                  className={`group relative rounded-[2.5rem] p-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-white/60 ${isLarge ? 'md:col-span-2' : 'md:col-span-1'
                    } bg-white`}
                >
                  {/* Background Gradient & Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />

                  {/* Decorative Circle */}
                  <div className={`absolute -right-10 -top-10 w-64 h-64 bg-gradient-to-br ${service.color} opacity-[0.05] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ease-out`} />

                  <div className="relative h-full flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      {/* Clean Icon Style: Transparent background, gradient text */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 -ml-2`}>
                        <i className={`${service.icon} text-4xl bg-gradient-to-br ${service.color} bg-clip-text text-transparent`}></i>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white group-hover:bg-brand-600 group-hover:border-brand-600 transition-colors duration-300">
                        <i className="ri-arrow-right-up-line text-gray-400 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3 group-hover:text-brand-800 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </AnimatedGrid>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-brand-900 font-bold border-b-2 border-gold-400 pb-1"
            >
              Explore Our Services <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          CATEGORIES SECTION
          ============================================ */}
      <section className="py-16 md:py-24 bg-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">{categoriesHeader?.metadata?.tag || 'Browse Our Range'}</p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-3">{categoriesHeader?.title || 'Shop by Category'}</h2>
              <p className="text-gray-500 text-lg max-w-md">{categoriesHeader?.subtitle || 'Find exactly what you need for your health and wellness'}</p>
            </div>
            <Link href="/categories" className="hidden md:flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors bg-brand-50 px-5 py-2.5 rounded-full hover:bg-brand-100">
              View All <i className="ri-arrow-right-line"></i>
            </Link>
          </AnimatedSection>

          <AnimatedGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link href={`/shop?category=${category.slug}`} key={category.id} className="group cursor-pointer block relative">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src={category.image || category.image_url || 'https://via.placeholder.com/600x800?text=' + encodeURIComponent(category.name)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={75}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                    <h3 className="font-serif font-bold text-white text-xl md:text-2xl mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{category.name}</h3>
                    <div className="flex items-center text-gold-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                      <span className="uppercase tracking-wider text-xs">Shop Now</span>
                      <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </AnimatedGrid>

          <div className="mt-8 text-center md:hidden">
            <Link href="/categories" className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              View All Categories <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PRODUCTS
          ============================================ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">{productsHeader?.metadata?.tag || 'Curated For You'}</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">{productsHeader?.title || 'Featured Products'}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{productsHeader?.subtitle || 'Hand-picked pharmaceuticals and health essentials'}</p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || product.price)) : undefined;
                const totalVariantStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : 0;
                const effectiveStock = hasVariants ? totalVariantStock : product.quantity;

                const colorVariants: ColorVariant[] = [];
                const seenColors = new Set<string>();
                for (const v of variants) {
                  const colorName = (v as any).option2;
                  if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
                    const hex = getColorHex(colorName);
                    if (hex) {
                      seenColors.add(colorName.toLowerCase().trim());
                      colorVariants.push({ name: colorName.trim(), hex });
                    }
                  }
                }

                return (
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
                    badge={product.featured ? 'Featured' : undefined}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
            </AnimatedGrid>
          )}

          <div className="text-center mt-16">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 bg-brand-600 text-white px-10 py-4 rounded-full font-bold text-base hover:bg-brand-700 transition-all duration-300 shadow-brand hover:shadow-brand-lg hover:-translate-y-1"
            >
              View All Products
              <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS / COUNTER SECTION
          ============================================ */}
      <section id="stats-section" className="py-20 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-900 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">{statsHeader?.title || 'Trusted by Thousands Across Ghana'}</h2>
            <p className="text-brand-200 text-lg max-w-2xl mx-auto">{statsHeader?.subtitle || 'Founded in 2004 by Mr. Wisdom Amezah, WIDAMA Pharmacy has grown into a leading healthcare provider.'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-gold-400 mb-2 font-sans">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-white/70 font-medium text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          ABOUT / WHY CHOOSE US
          ============================================ */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image/Visual */}
            <AnimatedSection className="relative">
              <div className="relative">
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-10 text-white overflow-hidden">
                  {/* Decorative cross */}
                  <div className="absolute top-6 right-6 text-white/10 text-8xl font-black">✚</div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gold-400/20 rounded-2xl flex items-center justify-center mb-6">
                      <i className="ri-heart-pulse-line text-3xl text-gold-300"></i>
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-4">{aboutCard?.title || 'Your Health Partner Since 2004'}</h3>
                    <p className="text-white/70 text-lg leading-relaxed mb-6">
                      {aboutCard?.content || 'WIDAMA Pharmacy was founded by Mr. Wisdom Amezah with a vision to make quality healthcare accessible to every Ghanaian. Today, we are one of the most trusted names in pharmaceutical services.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">✚ Licensed Pharmacy</span>
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">🏭 Manufacturing</span>
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">🎓 Training</span>
                    </div>
                  </div>
                </div>

                {/* Floating testimonial card */}
                <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl p-5 shadow-float max-w-[240px] border border-gray-100 z-20 hidden md:block">
                  <div className="flex items-center gap-1 text-gold-400 mb-2">
                    {[...Array(5)].map((_, i) => <i key={i} className="ri-star-fill text-sm"></i>)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{aboutTestimonial?.content || 'WIDAMA is my trusted pharmacy. Always genuine medicines and excellent service.'}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">— {aboutTestimonial?.metadata?.author || 'Satisfied Customer'}</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Content */}
            <AnimatedSection>
              <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">{aboutHeader?.metadata?.tag || 'Why Choose WIDAMA'}</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-6">
                {aboutHeader?.title || <>More Than Just a <span className="text-gradient-brand">Pharmacy</span></>}
              </h2>
              <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                {aboutHeader?.subtitle || 'We combine pharmaceutical expertise with a commitment to excellence, integrity, and respect for human life. Our comprehensive healthcare ecosystem serves individuals, businesses, and healthcare professionals.'}
              </p>

              <div className="space-y-6">
                {(aboutValues.length > 0 ? aboutValues.map(v => ({
                  icon: v.metadata?.icon || 'ri-star-line',
                  title: v.title || '',
                  description: v.content || '',
                })) : [
                  { icon: 'ri-shield-star-line', title: 'Integrity First', description: 'We never compromise on the quality and authenticity of our products.' },
                  { icon: 'ri-lightbulb-line', title: 'Innovation Driven', description: 'Constantly improving our services and product range to serve you better.' },
                  { icon: 'ri-medal-line', title: 'Commitment to Excellence', description: 'Every interaction reflects our dedication to the highest standards.' },
                  { icon: 'ri-heart-line', title: 'Respect for Human Life', description: 'Every product we stock, every service we provide serves to improve lives.' },
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <i className={`${item.icon} text-xl text-brand-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors"
                >
                  Read Our Full Story
                  <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA BANNER
          ============================================ */}
      <section className="py-20 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            {ctaBanner?.title || <>Ready to Experience <br className="hidden md:block" /> Healthcare Excellence?</>}
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            {ctaBanner?.content || 'Visit us at WIDAMA Towers, Ashaiman Lebanon, or shop online for genuine medicines and health products delivered nationwide.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ctaBanner?.button_url || '/shop'}
              className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-300 text-brand-900 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-gold hover:shadow-lg hover:-translate-y-1"
            >
              <i className="ri-shopping-bag-line"></i>
              {ctaBanner?.button_text || 'Shop Now'}
            </Link>
            <Link
              href={ctaBanner?.metadata?.secondary_button_url || '/contact'}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
            >
              <i className="ri-phone-line"></i>
              {ctaBanner?.metadata?.secondary_button_text || 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />

    </main>
  );
}
