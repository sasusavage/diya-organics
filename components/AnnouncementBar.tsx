'use client';

import { useState, useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';

export default function AnnouncementBar() {
    const [isDismissed, setIsDismissed] = useState(false);
    const { getSetting } = useCMS();

    const text = getSetting('announcement_text');
    const enabled = getSetting('announcement_enabled') === 'true';

    // Don't render if disabled, explicitly dismissed, or no text
    if (!enabled || isDismissed || !text) return null;

    return (
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3">
                <p className="text-xs sm:text-sm font-medium text-center truncate">
                    {text}
                </p>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <i className="ri-close-line text-sm"></i>
                </button>
            </div>
        </div>
    );
}
