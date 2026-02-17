'use client';

import { useState, useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';

export default function AnnouncementBar() {
    const [isVisible, setIsVisible] = useState(true);
    const { getActiveBanners } = useCMS();

    const banners = getActiveBanners('announcement');

    // Default announcement if no banners
    const defaultText = '🏥 Free delivery on orders over GH₵200 • Licensed Pharmacy • Genuine Products Only';

    // Use the first active banner or default
    const announcementText = banners.length > 0
        ? banners[0].title || defaultText
        : defaultText;

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3">
                <p className="text-xs sm:text-sm font-medium text-center truncate">
                    {announcementText}
                </p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <i className="ri-close-line text-sm"></i>
                </button>
            </div>
        </div>
    );
}
