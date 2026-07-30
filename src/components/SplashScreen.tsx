import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HeartHandshake, BookOpen, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export default function SplashScreen({ onFinish, minDurationMs = 2800 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.round((elapsed / minDurationMs) * 100), 100);
      
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          if (onFinish) {
            onFinish();
          }
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinish]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-6 select-none overflow-hidden"
        >
          {/* Subtle Ambient Glowing Background Orbs matching Login Theme */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Subtle Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="pt-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-400/30 text-indigo-200 text-xs font-medium backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
            <span>Sistem Informasi Pengasuhan Anak Asuh</span>
          </motion.div>

          {/* Central Logo & Title Block */}
          <div className="flex flex-col items-center text-center my-auto z-10 max-w-md px-4">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 120, damping: 15 }}
              className="relative mb-6"
            >
              {/* Outer Glowing Ring */}
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-50 blur-xl animate-pulse" />
              
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-2xl border border-white/20 flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />
                  
                  {/* Heart Icon matching Login Screen Logo */}
                  <HeartHandshake className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-[0_0_15px_rgba(236,72,153,0.7)]" />
                </div>
              </div>
            </motion.div>

            {/* Main App Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-pink-200 drop-shadow-sm">
                Wali Asuhku
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-6 bg-indigo-400/50" />
                <h2 className="text-base sm:text-lg font-bold text-pink-300 uppercase tracking-[0.25em] drop-shadow">
                  Sekolah Rakyat
                </h2>
                <span className="h-[1px] w-6 bg-indigo-400/50" />
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal"
            >
              Platform terpadu pendampingan, monitoring karakter, dan komunikasi wali asuh anak asuh.
            </motion.p>
          </div>

          {/* Bottom Progress Bar & Footer */}
          <div className="w-full max-w-xs z-10 pb-6 flex flex-col items-center">
            {/* Progress percentage & text */}
            <div className="w-full flex justify-between items-center text-[11px] text-indigo-200/90 mb-2 font-mono">
              <span>Menyiapkan aplikasi...</span>
              <span className="font-bold text-pink-300">{progress}%</span>
            </div>

            {/* Bar Track */}
            <div className="w-full h-2 bg-slate-900/80 border border-indigo-500/30 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Footer Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400"
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Terenkripsi</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-pink-400" />
                <span>Sekolah Rakyat</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
