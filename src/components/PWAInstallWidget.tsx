import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Laptop, ExternalLink, X, Check, Sparkles, Share, Plus, HelpCircle } from 'lucide-react';

export default function PWAInstallWidget() {
  const [isIframe, setIsIframe] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // 1. Detect if inside an iframe
    const inIframe = window.self !== window.top;
    setIsIframe(inIframe);

    // 2. Detect if already installed / running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // 3. Check if standard prompt is available
    setIsInstallable(!!(window as any).deferredPrompt);

    // 4. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(ua);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // 5. Setup event listeners for custom events dispatched from main.tsx
    const handlePromptAvailable = () => {
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) {
      // If prompt is not available, try to provide feedback
      console.log('Prompt instalasi tidak tersedia secara langsung.');
      return;
    }

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallSuccess(true);
      }
    } catch (err) {
      console.error('Error during installation choice:', err);
    } finally {
      // Clear the saved prompt since it can only be used once
      (window as any).deferredPrompt = null;
    }
  };

  const handleOpenInNewTab = () => {
    // Open current location in a new tab without iframe constraints
    const newWindow = window.open(window.location.href, '_blank');
    if (newWindow) {
      newWindow.focus();
    }
  };

  // If already running standalone, don't show the setup banners
  if (isInstalled && !installSuccess) {
    return null;
  }

  if (!showBanner) {
    // Simple floating button to let user re-open or trigger PWA install if they dismissed it but still want it
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowBanner(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-[10px] rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 uppercase tracking-wider"
        >
          <Download className="w-3 h-3 animate-bounce" />
          <span>Instal Aplikasi</span>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-4 right-4 z-40 max-w-[320px] w-[calc(100vw-32px)] text-left"
      >
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Subtle background glow graphics */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-6 -mb-8 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-3 right-3 p-1 hover:bg-white/15 rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Sembunyikan"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-3 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-200" />
                PWA
              </span>
              {isIframe && (
                <span className="bg-amber-500/20 text-amber-300 font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-500/15">
                  IFrame
                </span>
              )}
            </div>

            <h3 className="text-xs font-extrabold tracking-tight leading-snug">
              Instal Aplikasi WaliAsuhku
            </h3>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              Dapatkan akses instan penuh tanpa browser, notifikasi dorong real-time, dan loading ultra-cepat.
            </p>

            {/* Contextual Instructions or Buttons */}
            <div className="pt-1">
              {isIframe ? (
                <div className="space-y-2">
                  <p className="text-[9px] text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 leading-relaxed">
                    Browser membatasi instalasi di dalam preview. Buka di tab baru untuk menginstal dalam 1-klik!
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>BUKA DI TAB BARU</span>
                  </button>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-500/15 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>INSTAL SEKARANG</span>
                </button>
              ) : platform === 'ios' ? (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 text-[9px] space-y-1">
                  <p className="font-bold text-pink-300 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Langkah Safari (iOS):
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-300 leading-normal">
                    <li>Ketuk tombol <Share className="w-2.5 h-2.5 inline" /> Bagikan</li>
                    <li>Pilih <Plus className="w-2.5 h-2.5 inline" /> Tambah ke Layar Utama</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 text-[9px] text-slate-300 leading-normal">
                  Buka menu setelan browser Anda, lalu pilih <span className="font-bold text-white">"Instal"</span> atau <span className="font-bold text-white">"Tambahkan ke Layar Utama"</span>.
                </div>
              )}
            </div>

            {/* Success Overlay state */}
            {installSuccess && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-600 text-white p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Check className="w-3.5 h-3.5 shrink-0 bg-white/20 p-0.5 rounded-full" />
                <span>Instalasi PWA Berhasil!</span>
              </motion.div>
            )}

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
