import React, { useState, useEffect } from 'react';
import { Sun, Moon, Quote as QuoteIcon, Sparkles } from 'lucide-react';
import { getQuoteForRole, Quote, TimeSessionInfo } from '../utils/quotes';

interface DailyQuoteBannerProps {
  role: 'anak_asuh' | 'wali_asuh' | 'orang_tua';
  className?: string;
}

export default function DailyQuoteBanner({ role, className = '' }: DailyQuoteBannerProps) {
  const [{ quote, sessionInfo }, setQuoteData] = useState<{ quote: Quote; sessionInfo: TimeSessionInfo }>(
    () => getQuoteForRole(role)
  );

  useEffect(() => {
    // Re-check quote every minute so at 06:00 and 16:00 it updates automatically
    const interval = setInterval(() => {
      setQuoteData(getQuoteForRole(role));
    }, 60000);

    return () => clearInterval(interval);
  }, [role]);

  // Role-based theme styling
  const themeStyles = {
    anak_asuh: {
      bg: "bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-amber-200/80 text-amber-950",
      accentBg: "bg-amber-500 text-white",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      iconColor: "text-amber-600",
      authorColor: "text-amber-700",
      roleLabel: "Inspirasi Anak Asuh",
    },
    wali_asuh: {
      bg: "bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 border-violet-200/80 text-violet-950",
      accentBg: "bg-violet-600 text-white",
      badgeBg: "bg-violet-100 text-violet-800 border-violet-200",
      iconColor: "text-violet-600",
      authorColor: "text-violet-700",
      roleLabel: "Nasihat Wali Asuh",
    },
    orang_tua: {
      bg: "bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 border-rose-200/80 text-rose-950",
      accentBg: "bg-rose-600 text-white",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      iconColor: "text-rose-600",
      authorColor: "text-rose-700",
      roleLabel: "Inspirasi Orang Tua",
    },
  }[role] || {
    bg: "bg-slate-50 border-slate-200 text-slate-800",
    accentBg: "bg-slate-700 text-white",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    iconColor: "text-slate-600",
    authorColor: "text-slate-600",
    roleLabel: "Kata Mutiara Hari Ini",
  };

  const isMorning = sessionInfo.session === 'pagi';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${themeStyles.bg} ${className}`}>
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <QuoteIcon className="w-28 h-28 text-current" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2.5 rounded-xl shrink-0 shadow-xs flex items-center justify-center ${themeStyles.accentBg}`}>
            {isMorning ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${themeStyles.badgeBg}`}>
                {themeStyles.roleLabel}
              </span>
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {sessionInfo.label} ({sessionInfo.timeRange})
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold italic leading-relaxed text-slate-800">
              "{quote.text}"
            </p>

            <p className={`text-[11px] font-extrabold not-italic ${themeStyles.authorColor}`}>
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
