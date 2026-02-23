'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('About Us');
  const { getSetting } = useCMS();
  const [activeTab, setActiveTab] = useState('story');

  const siteName = getSetting('site_name') || '';
  const siteFounder = getSetting('about_founder_name') || '';
  const siteEstYear = getSetting('about_est_year') || '';
  const siteFounderRole = getSetting('about_founder_role') || '';
  const siteFounderQuote = getSetting('about_founder_quote') || '';

  const heroImage = getSetting('about_hero_image');
  const heroTitle = getSetting('about_hero_title') || '';
  const heroSubtitle = getSetting('about_hero_subtitle') || '';

  const storyP1 = getSetting('about_story_p1') || '';
  const storyP2 = getSetting('about_story_p2') || '';
  const storyP3 = getSetting('about_story_p3') || '';

  const missionText = getSetting('about_mission_text') || '';
  const visionText = getSetting('about_vision_text') || '';

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

  const coreValues = getParsedSetting('about_core_values', []);

  const milestones = getParsedSetting('about_milestones', []);

  const services = getParsedSetting('about_services', []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-24 md:py-32 overflow-hidden"
        style={heroImage ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(14, 45, 33, 0.9), rgba(14, 45, 33, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] text-[400px] font-black pointer-events-none select-none">🌿</div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-gold-300 text-sm font-semibold tracking-wider uppercase mb-6 border border-white/10">
            <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
            Est. {siteEstYear}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 py-3">
            {[
              { key: 'story', label: 'Our Story', icon: 'ri-book-open-line' },
              { key: 'mission', label: 'Mission & Vision', icon: 'ri-focus-3-line' },
              { key: 'services', label: 'Our Services', icon: 'ri-service-line' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'
                  }`}
              >
                <i className={`${tab.icon} text-base`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* OUR STORY */}
        {activeTab === 'story' && (
          <div className="animate-fade-in-up">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">The Beginning</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 font-serif">How It All Started</h2>
                <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
                  <p>{storyP1}</p>
                  <p>{storyP2}</p>
                  <p>{storyP3}</p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-12 text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-white/10 text-7xl font-black">🌿</div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <i className="ri-user-star-line text-4xl text-gold-300"></i>
                    </div>
                    <h3 className="text-white text-2xl font-serif font-bold mb-2">{siteFounder}</h3>
                    <p className="text-gold-300 text-sm font-medium uppercase tracking-wider mb-4">{siteFounderRole}</p>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                      &ldquo;{siteFounderQuote}&rdquo;
                    </p>
                  </div>
                </div>
                <div className="absolute -z-10 top-6 -right-6 w-full h-full border-2 border-brand-100 rounded-[2rem] hidden lg:block"></div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="text-center mb-14">
                <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">Our Journey</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Milestones That Define Us</h2>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-400 to-gold-400 md:-translate-x-px"></div>

                <div className="space-y-12">
                  {milestones.map((milestone: any, index: number) => (
                    <div key={index} className={`relative flex items-start gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Dot */}
                      <div className="absolute left-[16px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-brand-500 rounded-full border-4 border-white shadow-brand z-10 mt-6"></div>

                      {/* Content */}
                      <div className={`ml-14 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-brand transition-all duration-300">
                          <span className="inline-block px-3 py-1 bg-brand-50 text-brand-600 text-sm font-bold rounded-full mb-3">{milestone.year}</span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed">{milestone.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MISSION & VISION */}
        {activeTab === 'mission' && (
          <div className="animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {/* Mission */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 text-white/10 text-8xl font-black leading-none">✚</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gold-400/20 rounded-2xl flex items-center justify-center mb-8">
                    <i className="ri-focus-3-line text-3xl text-gold-300"></i>
                  </div>
                  <h3 className="text-3xl font-serif font-bold mb-4">Our Mission</h3>
                  <p className="text-white/80 text-lg leading-relaxed">{missionText}</p>
                </div>
              </div>

              {/* Vision */}
              <div className="bg-gradient-to-br from-gold-50 to-gold-100/50 rounded-[2rem] p-10 border border-gold-200 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-gold-200 text-8xl font-black leading-none">✦</div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-8">
                    <i className="ri-eye-line text-3xl text-brand-600"></i>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{visionText}</p>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="text-center mb-14">
              <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">What Drives Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Our Core Values</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {coreValues.map((value: any, index: number) => (
                <div key={index} className={`bg-white rounded-2xl p-8 border ${value.borderColor || 'border-gray-100'} transition-all duration-300 hover:shadow-lg group`}>
                  <div className={`w-14 h-14 ${value.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <i className={`${value.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-14">
              <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">Our Offerings</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mb-4">Our Commitment</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Diya Organics operates on the principle of purity, ensuring every product is hand-manufactured with the finest Ayurvedic ingredients.</p>
            </div>

            <div className="space-y-8">
              {services.map((service: any, index: number) => (
                <div key={index} className="bg-white rounded-3xl border border-gray-100 hover:border-brand-200 hover:shadow-brand-lg transition-all duration-500 overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 md:p-10 flex flex-col justify-center">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                        <i className={`${service.icon} text-3xl text-gold-300`}></i>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white mb-2">{service.title}</h3>
                    </div>
                    <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center">
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.description}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(service.features || []).map((feature: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-2 text-sm text-gray-700">
                            <i className="ri-check-line text-brand-500 text-base"></i>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            Experience the {siteName} Difference
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Experience the purity of our hand-manufactured products, made with love and time-tested Ayurvedic wisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-300 text-brand-900 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-gold hover:shadow-lg hover:-translate-y-1"
            >
              <i className="ri-shopping-bag-line"></i>
              Start Shopping
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
            >
              <i className="ri-phone-line"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
