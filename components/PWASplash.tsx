'use client';

import { useEffect, useState } from 'react';
import { useCMS } from '@/context/CMSContext';

export default function PWASplash() {
  const { getSetting } = useCMS();
  const siteName = getSetting('site_name') || 'Diya Organics';
  const siteLogo = getSetting('site_logo') || '/logo.png';
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-splash bg-brand-900">
      <div className="pwa-splash-logo flex flex-col items-center">
        <img src={siteLogo} alt={siteName} className="w-24 h-24 object-contain mb-6" />
        <h1 className="text-white text-3xl font-bold font-serif mb-2 leading-none">DIYA</h1>
        <p className="text-gold-300 text-[10px] uppercase tracking-[0.4em] font-medium">Organics</p>
      </div>
      <div className="pwa-splash-dots flex gap-2 mt-10">
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
      </div>
    </div>
  );
}
