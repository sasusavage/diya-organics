'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // In a real implementation, this would call an API
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="py-20 bg-sage-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-gold-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="ri-mail-send-line text-2xl text-brand-600"></i>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4">
          Stay Healthy, Stay Informed
        </h2>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Subscribe to our newsletter for health tips, new product alerts, and exclusive offers from WIDAMA Pharmacy.
        </p>

        {submitted ? (
          <div className="animate-fade-in-up bg-brand-50 border border-brand-200 rounded-2xl p-6 max-w-md mx-auto">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-line text-2xl text-brand-600"></i>
            </div>
            <p className="font-semibold text-brand-700">Thank you for subscribing!</p>
            <p className="text-brand-600 text-sm mt-1">You&apos;ll receive our latest updates soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-4 border-2 border-brand-100 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-base bg-white transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400 mt-4">
          No spam. Unsubscribe anytime. Your privacy matters to us.
        </p>
      </div>
    </section>
  );
}
