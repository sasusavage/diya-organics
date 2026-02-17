'use client';

import { useEffect, useState } from 'react';

export default function PWASplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-splash">
      <div className="pwa-splash-logo flex flex-col items-center">
        <img src="/logo.png" alt="WIDAMA Pharmacy" className="w-24 h-24 object-contain mb-6" />
        <h1 className="text-white text-3xl font-bold font-serif mb-2">WIDAMA</h1>
        <p className="text-gold-300 text-xs uppercase tracking-[0.3em] font-medium">Pharmacy</p>
      </div>
      <div className="pwa-splash-dots flex gap-2 mt-10">
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
        <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
      </div>
    </div>
  );
}
