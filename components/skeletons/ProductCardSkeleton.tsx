export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] bg-sage-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage-50 via-white to-sage-50 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded bg-gray-200"></div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <div className="h-5 bg-brand-100 rounded w-20"></div>
          <div className="h-4 bg-gray-100 rounded w-12"></div>
        </div>

        {/* Button (Mobile) */}
        <div className="mt-auto pt-2 lg:hidden">
          <div className="h-10 bg-brand-50 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
