'use client';

import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';

export default function NewsletterSection() {
  const { getSetting } = useCMS();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const newsletterTitle = getSetting('newsletter_title') || 'Join the Diya Inner Circle';
  const newsletterSubtitle = getSetting('newsletter_subtitle') || 'Get exclusive access to new botanical launches, organic skincare tips, and special wellness offers.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="py-24 bg-[#F8F9FA] relative overflow-hidden border-t border-sage-100">
      {/* Decorative botanical-style circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-brand-100 rounded-3xl shadow-sm mb-8">
          <i className="ri-leaf-line text-2xl text-brand-600"></i>
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-6 leading-tight">
          {newsletterTitle}
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          {newsletterSubtitle}
        </p>

        {submitted ? (
          <div className="animate-fade-in-up bg-white border border-brand-100 rounded-[2rem] p-8 max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-3xl text-brand-600"></i>
            </div>
            <p className="font-bold text-gray-900 text-xl mb-1">Welcome to the Club!</p>
            <p className="text-gray-500">You&apos;ll be the first to hear from us.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-6 py-5 border-2 border-sage-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 text-gray-900 bg-white transition-all shadow-sm outline-none"
            />
            <button
              type="submit"
              className="px-10 py-5 bg-brand-900 text-gold-300 rounded-2xl font-bold tracking-wider hover:bg-brand-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 uppercase text-sm"
            >
              Join Now
            </button>
          </form>
        )}

        <p className="text-[11px] text-gray-400 mt-8 uppercase tracking-widest font-bold">
          We respect your privacy. No spam, just pure goodness.
        </p>
      </div>
    </section>
  );
}
