import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-brand-50 via-white to-sage-50">
      {/* Decorative Cross */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <span className="text-brand-500 text-[400px] font-black">✚</span>
      </div>

      <div className="relative z-10">
        <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-8 mx-auto">
          <span className="text-4xl font-black text-brand-600">404</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">Page Not Found</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 shadow-brand"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="border-2 border-brand-200 hover:border-brand-300 text-brand-700 px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
