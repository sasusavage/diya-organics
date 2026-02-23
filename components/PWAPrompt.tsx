'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show prompt after 30 seconds if available
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed && deferredPrompt) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop */}
      <div className="pwa-prompt-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Sheet */}
      <div className="pwa-prompt-sheet relative w-full max-w-lg mx-4 mb-6 bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
            <img src="/logo.png" alt="Store Company" className="w-10 h-10 object-contain" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Install Store Company</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Add our app to your home screen for quick access to medicines, order tracking, and more.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleDismiss}
              className="flex-1 px-6 py-3 text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              Not Now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-brand"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
