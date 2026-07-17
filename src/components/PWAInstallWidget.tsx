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
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-extrabold text-[10px] rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer border border-white/20 uppercase tracking-wider"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>Instal Aplikasi</span>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto w-full px-4 pt-3 pb-1"
      >
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden border border-indigo-400/30 text-left">
          
          {/* Subtle background glow graphics */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -mb-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white cursor-pointer"
            title="Sembunyikan Banner"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            {/* Left Content */}
            <div className="flex-1 space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-pink-300 animate-spin-slow" />
                  Fitur PWA WaliAsuhku
                </span>
                {isIframe && (
                  <span className="bg-amber-500/30 text-amber-200 font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/20">
                    Mode Preview IFrame
                  </span>
                )}
              </div>
              
              <h2 className="text-sm md:text-base font-black tracking-tight leading-snug">
                Instal Aplikasi WaliAsuhku Langsung di Perangkat Anda!
              </h2>
              
              <p className="text-[11px] text-white/95 leading-relaxed font-medium">
                Nikmati akses instan penuh tanpa browser, notifikasi dorong real-time, loading ultra-cepat, dan perlindungan privasi enkripsi end-to-end yang lebih stabil.
              </p>

              {/* Contextual Guides if not installable directly */}
              {!isInstallable && !isIframe && (
                <div className="pt-2">
                  {platform === 'ios' ? (
                    <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-[10px] space-y-1.5">
                      <p className="font-bold text-pink-200 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" />
                        Panduan Khusus iOS (Safari):
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-white/90 font-medium">
                        <li>Ketuk tombol <span className="bg-white/20 px-1.5 py-0.5 rounded font-extrabold inline-flex items-center gap-1"><Share className="w-3 h-3 inline" /> "Bagikan" (Share)</span> di bagian bawah layar Safari.</li>
                        <li>Gulir ke bawah dan ketuk pilihan <span className="bg-white/20 px-1.5 py-0.5 rounded font-extrabold inline-flex items-center gap-1"><Plus className="w-3 h-3 inline" /> "Tambahkan ke Layar Utama" (Add to Home Screen)</span>.</li>
                        <li>Ketuk <span className="font-bold text-pink-300">"Tambah"</span> di pojok kanan atas untuk menyelesaikan instalasi.</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-[10px] space-y-1">
                      <p className="font-bold text-indigo-200 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Bagaimana cara menginstalnya?
                      </p>
                      <p className="text-white/80 leading-normal">
                        Buka menu setelan browser Anda (tanda titik tiga di pojok kanan atas) lalu pilih <span className="font-bold text-white">"Instal aplikasi"</span> atau <span className="font-bold text-white">"Tambahkan ke Layar Utama"</span> untuk memasang WaliAsuhku.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isIframe && (
                <div className="bg-amber-500/20 rounded-2xl p-3 border border-amber-500/30 text-[10px] space-y-1">
                  <p className="font-bold text-amber-200 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Kendala IFrame Terdeteksi:
                  </p>
                  <p className="text-white/90 leading-normal">
                    Browser memblokir instalasi PWA di dalam panel pratinjau (iframe). Klik tombol <span className="font-bold text-amber-200">"Buka di Tab Baru"</span> untuk melepas batasan dan langsung menginstal dalam 1 klik!
                  </p>
                </div>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-start lg:self-center w-full sm:w-auto">
              {/* Trigger Direct Native Installation if installable */}
              {isInstallable && !isIframe && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-black/15 hover:scale-[1.02] active:scale-95 text-center"
                >
                  <Download className="w-4 h-4 text-indigo-600 animate-bounce" />
                  <span>INSTAL SEKARANG JUGA</span>
                </button>
              )}

              {/* Breakout of iframe button */}
              {isIframe && (
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-95 text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>BUKA DI TAB BARU</span>
                </button>
              )}

              {/* Standard info feedback if neither iframe nor installable prompt is available (e.g. desktop manual or already installed) */}
              {!isInstallable && !isIframe && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="px-4 py-2 bg-white/10 border border-white/10 text-white/90 rounded-2xl text-[10px] font-bold flex items-center gap-1.5 justify-center">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Mendukung Android, iOS, Windows, macOS</span>
                  </div>
                </div>
              )}

              {/* Install Success Overlay State */}
              {installSuccess && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 shrink-0 bg-white/20 p-0.5 rounded-full" />
                  <span>Aplikasi berhasil diinstal!</span>
                </motion.div>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
