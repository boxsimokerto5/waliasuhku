import React, { useState } from 'react';
import { Calendar, Clock, Search, UserCheck, Shield, ChevronLeft, ChevronRight, Printer, Sparkles, Sun, Sunset, Moon, Coffee, HeartHandshake, Filter, Info, X, Download, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateJadwalWaliAsuhPDF, generateJadwalPiketHarianPDF } from '../utils/pdfGenerator';

export interface WaliAsuhSchedule {
  id: number;
  name: string;
  shifts: string[]; // 31 items for Aug 1-31
  totals: {
    P: number;
    FUL: number;
    S: number;
    M: number;
    LP: number;
    OFF: number;
    P1: number;
    P2: number;
    P3: number;
    JK: number;
  };
}

export const WALI_ASUH_SCHEDULES: WaliAsuhSchedule[] = [
  {
    id: 1,
    name: "Suhariyono",
    shifts: ["M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 }
  },
  {
    id: 2,
    name: "Rindani",
    shifts: ["LP", "O", "P2", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"],
    totals: { P: 8, FUL: 12, S: 3, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 199 }
  },
  {
    id: 3,
    name: "Hariadi",
    shifts: ["O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M"],
    totals: { P: 6, FUL: 14, S: 4, M: 3, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 214 }
  },
  {
    id: 4,
    name: "Moch. Chabib",
    shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP"],
    totals: { P: 7, FUL: 13, S: 4, M: 4, LP: 3, OFF: 0, P1: 7, P2: 0, P3: 0, JK: 215 }
  },
  {
    id: 5,
    name: "Dewi Askinu",
    shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 }
  },
  {
    id: 6,
    name: "Aris Mahmud Syafi'i",
    shifts: ["S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 }
  },
  {
    id: 7,
    name: "Erna Rizkiani",
    shifts: ["S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2"],
    totals: { P: 8, FUL: 11, S: 4, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 209 }
  },
  {
    id: 8,
    name: "Chusfia Hanik Wihayati",
    shifts: ["S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"],
    totals: { P: 7, FUL: 12, S: 4, M: 4, LP: 4, OFF: 0, P1: 7, P2: 0, P3: 0, JK: 208 }
  },
  {
    id: 9,
    name: "A. Zainudin Sholeh",
    shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 3, P2: 2, P3: 0, JK: 208 }
  },
  {
    id: 10,
    name: "Abisarwan Rafif",
    shifts: ["LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "C", "C", "C", "C", "C", "C", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S"],
    totals: { P: 3, FUL: 11, S: 3, M: 4, LP: 4, OFF: 2, P1: 0, P2: 1, P3: 6, JK: 154 }
  },
  {
    id: 11,
    name: "Dwi Chusnul Mufid",
    shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"],
    totals: { P: 8, FUL: 12, S: 4, M: 3, LP: 4, OFF: 2, P1: 1, P2: 5, P3: 0, JK: 218 }
  },
  {
    id: 12,
    name: "Amirul Mu'minin Rofico P.K.",
    shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP"],
    totals: { P: 6, FUL: 14, S: 4, M: 4, LP: 3, OFF: 2, P1: 4, P2: 0, P3: 0, JK: 216 }
  },
  {
    id: 13,
    name: "Nanang Arifin",
    shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 5, P2: 0, P3: 0, JK: 208 }
  },
  {
    id: 14,
    name: "Muji Santoso",
    shifts: ["S", "S", "S", "M", "LP", "O", "P3", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 4, P2: 1, P3: 0, JK: 208 }
  },
  {
    id: 15,
    name: "Deni Furitrinofi",
    shifts: ["S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P"],
    totals: { P: 7, FUL: 12, S: 4, M: 4, LP: 4, OFF: 1, P1: 3, P2: 3, P3: 0, JK: 209 }
  },
  {
    id: 16,
    name: "Eko Wahyudi",
    shifts: ["S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 2, P2: 4, P3: 0, JK: 207 }
  },
  {
    id: 17,
    name: "Eky Venty Pricilia",
    shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"],
    totals: { P: 8, FUL: 11, S: 4, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 209 }
  },
  {
    id: 18,
    name: "Teguh Cahyono",
    shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"],
    totals: { P: 7, FUL: 13, S: 4, M: 3, LP: 4, OFF: 2, P1: 1, P2: 4, P3: 0, JK: 217 }
  },
  {
    id: 19,
    name: "Akhmad Fadkhurriza I",
    shifts: ["S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 5, P2: 0, P3: 0, JK: 208 }
  },
  {
    id: 20,
    name: "Afida Saidatul Fuadia",
    shifts: ["S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S"],
    totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 }
  }
];

export const SHIFT_DETAILS: Record<string, { label: string; desc: string; time: string; badgeBg: string; textCol: string; borderCol: string; icon: string }> = {
  P: { label: 'Jaga Pagi (P)', desc: 'Piket Pagi Utama', time: '07:00 - 16:00', badgeBg: 'bg-emerald-100', textCol: 'text-emerald-800', borderCol: 'border-emerald-300', icon: '☀️' },
  P2: { label: 'Jaga Pagi 2 (P2)', desc: 'Piket Pagi Shift 2', time: '07:00 - 15:00', badgeBg: 'bg-teal-100', textCol: 'text-teal-800', borderCol: 'border-teal-300', icon: '🌤️' },
  P3: { label: 'Jaga Pagi 3 (P3)', desc: 'Piket Pagi Shift 3', time: '08:00 - 16:00', badgeBg: 'bg-green-100', textCol: 'text-green-800', borderCol: 'border-green-300', icon: '🌿' },
  S: { label: 'Jaga Sore (S)', desc: 'Piket Sore / Petang', time: '15:00 - 22:00', badgeBg: 'bg-amber-100', textCol: 'text-amber-800', borderCol: 'border-amber-300', icon: '🌆' },
  M: { label: 'Jaga Malam (M)', desc: 'Piket Malam / Subuh', time: '15:00 - 08:00', badgeBg: 'bg-indigo-100', textCol: 'text-indigo-800', borderCol: 'border-indigo-300', icon: '🌙' },
  LP: { label: 'Lepas Piket (LP)', desc: 'Istirahat Pasca Malam', time: 'Pasca Piket Malam', badgeBg: 'bg-sky-100', textCol: 'text-sky-800', borderCol: 'border-sky-300', icon: '🛌' },
  O: { label: 'Off / Libur (O)', desc: 'Hari Libur Piket', time: 'Libur', badgeBg: 'bg-rose-100', textCol: 'text-rose-800', borderCol: 'border-rose-300', icon: '☕' },
  C: { label: 'Cuti (C)', desc: 'Cuti Resmi', time: 'Cuti', badgeBg: 'bg-purple-100', textCol: 'text-purple-800', borderCol: 'border-purple-300', icon: '🌴' }
};

interface JadwalWaliAsuhProps {
  onBack?: () => void;
  compact?: boolean;
}

export default function JadwalWaliAsuh({ onBack, compact = false }: JadwalWaliAsuhProps) {
  // Get today's day number in August (or default to 1st if outside August)
  const todayDate = new Date();
  const currentDayInAug = (todayDate.getMonth() === 7 && todayDate.getFullYear() === 2026)
    ? Math.min(Math.max(todayDate.getDate(), 1), 31)
    : 1;

  const [selectedDay, setSelectedDay] = useState<number>(currentDayInAug);
  const [activeView, setActiveView] = useState<'today' | 'table' | 'search'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');

  // Days array 1..31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Officers on duty on selectedDay
  const officersOnDuty = WALI_ASUH_SCHEDULES.map(staff => ({
    name: staff.name,
    shiftCode: staff.shifts[selectedDay - 1] || 'O',
    id: staff.id
  }));

  // Grouped officers by shift category for selected day
  const pagiOfficers = officersOnDuty.filter(o => ['P', 'P2', 'P3'].includes(o.shiftCode));
  const soreOfficers = officersOnDuty.filter(o => o.shiftCode === 'S');
  const malamOfficers = officersOnDuty.filter(o => o.shiftCode === 'M');
  const offOfficers = officersOnDuty.filter(o => ['LP', 'O', 'C'].includes(o.shiftCode));

  // Search filtered schedules
  const filteredSchedules = WALI_ASUH_SCHEDULES.filter(s => {
    const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchName) return false;
    if (filterShift === 'all') return true;
    return s.shifts[selectedDay - 1] === filterShift;
  });

  const getShiftBadgeStyle = (code: string) => {
    switch (code) {
      case 'P':
        return 'bg-emerald-500 text-white font-extrabold';
      case 'P2':
        return 'bg-teal-500 text-white font-extrabold';
      case 'P3':
        return 'bg-green-600 text-white font-extrabold';
      case 'S':
        return 'bg-amber-500 text-white font-extrabold';
      case 'M':
        return 'bg-indigo-600 text-white font-extrabold';
      case 'LP':
        return 'bg-sky-100 text-sky-800 font-bold border border-sky-300';
      case 'O':
        return 'bg-slate-100 text-slate-500 font-medium border border-slate-200';
      case 'C':
        return 'bg-rose-100 text-rose-700 font-bold border border-rose-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingDailyPDF, setIsGeneratingDailyPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwalWaliAsuhPDF();
    } catch (err) {
      console.error('Gagal membuat PDF Matriks:', err);
      alert('Terjadi kesalahan saat memproses file PDF Matriks. Silakan coba lagi.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadDailyPDF = async () => {
    try {
      setIsGeneratingDailyPDF(true);
      await generateJadwalPiketHarianPDF(selectedDay);
    } catch (err) {
      console.error('Gagal membuat PDF Piket Harian:', err);
      alert('Terjadi kesalahan saat memproses file PDF Piket Harian. Silakan coba lagi.');
    } finally {
      setIsGeneratingDailyPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-500/20">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                Sekolah Rakyat Menengah Atas 24 Kediri
              </span>
              <span className="text-xs font-bold bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow-xs">
                Agustus 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Jadwal Pembagian Shift Wali Asuh
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Sistem informasi piket terpadu untuk memantau keberadaan petugas Wali Asuh yang siap mendampingi dan menjaga keselamatan siswa/siswi di asrama.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadDailyPDF}
              disabled={isGeneratingDailyPDF}
              type="button"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 border border-amber-300/60 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingDailyPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-900" />
                  <span>Cetak PDF Piket Harian ({selectedDay} Agt)</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              type="button"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-300/40 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Cetak PDF Sebulan (Matriks)</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>Print Browser</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                type="button"
                className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-100 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Tutup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto p-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'today'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Piket Hari Ini ({selectedDay} Agt)</span>
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {officersOnDuty.filter(o => !['LP', 'O', 'C'].includes(o.shiftCode)).length} Bertugas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'table'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tabel Matriks Agustus (1-31)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'search'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Cari Personel Wali Asuh</span>
          </button>
        </div>

        {/* Date Quick Selector Slider */}
        <div className="flex items-center gap-2 px-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Tanggal:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))}
              disabled={selectedDay <= 1}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-slate-800 px-2 min-w-[70px] text-center">
              {selectedDay} Agt 2026
            </span>
            <button
              onClick={() => setSelectedDay(prev => Math.min(31, prev + 1))}
              disabled={selectedDay >= 31}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Buttons Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Pilih Tanggal Bulan Agustus 2026:
          </span>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            Dipilih: Tanggal {selectedDay} Agustus
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {days.map(d => {
            const isSelected = selectedDay === d;
            const isToday = d === currentDayInAug;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex flex-col items-center justify-center min-w-[38px] h-11 rounded-xl text-xs font-black transition-all cursor-pointer relative shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-105'
                    : isToday
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] font-bold opacity-80">Agt</span>
                <span className="text-xs">{d}</span>
                {isToday && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: TODAY'S DUTY OFFICERS */}
      {activeView === 'today' && (
        <div className="space-y-6">
          {/* Summary Alert */}
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-emerald-100/60 border border-emerald-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Wali Asuh Piket - Tanggal {selectedDay} Agustus 2026
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Total <span className="font-bold text-emerald-700">{pagiOfficers.length + soreOfficers.length + malamOfficers.length} Wali Asuh</span> bertugas aktif mendampingi siswa hari ini.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200/50">
                <span>☀️ Pagi: {pagiOfficers.length}</span>
                <span className="text-slate-300">|</span>
                <span>🌆 Sore: {soreOfficers.length}</span>
                <span className="text-slate-300">|</span>
                <span>🌙 Malam: {malamOfficers.length}</span>
              </div>

              <button
                type="button"
                onClick={handleDownloadDailyPDF}
                disabled={isGeneratingDailyPDF}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingDailyPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Cetak PDF ({selectedDay} Agt)</span>
              </button>
            </div>
          </div>

          {/* 3 SHIFT CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. SHIFT PAGI */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Jaga Pagi</h4>
                      <p className="text-[10px] text-slate-400 font-bold">07:00 - 16:00 / 15:00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    {pagiOfficers.length} Personel
                  </span>
                </div>

                {pagiOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift pagi</p>
                ) : (
                  <div className="space-y-2">
                    {pagiOfficers.map(officer => {
                      const details = SHIFT_DETAILS[officer.shiftCode] || SHIFT_DETAILS.P;
                      return (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 hover:bg-emerald-50 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {officer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{officer.name}</p>
                              <p className="text-[10px] text-emerald-700 font-semibold">{details.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-lg ${getShiftBadgeStyle(officer.shiftCode)}`}>
                            {officer.shiftCode} ({details.time})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. SHIFT SORE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sunset className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Jaga Sore</h4>
                      <p className="text-[10px] text-slate-400 font-bold">15:00 - 22:00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                    {soreOfficers.length} Personel
                  </span>
                </div>

                {soreOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift sore</p>
                ) : (
                  <div className="space-y-2">
                    {soreOfficers.map(officer => {
                      const details = SHIFT_DETAILS.S;
                      return (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-100/80 hover:bg-amber-50 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {officer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{officer.name}</p>
                              <p className="text-[10px] text-amber-700 font-semibold">{details.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-lg ${getShiftBadgeStyle(officer.shiftCode)}`}>
                            S (15:00 - 22:00)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. SHIFT MALAM */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Jaga Malam</h4>
                      <p className="text-[10px] text-slate-400 font-bold">15:00 - 08:00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200">
                    {malamOfficers.length} Personel
                  </span>
                </div>

                {malamOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift malam</p>
                ) : (
                  <div className="space-y-2">
                    {malamOfficers.map(officer => {
                      const details = SHIFT_DETAILS.M;
                      return (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 hover:bg-indigo-50 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {officer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{officer.name}</p>
                              <p className="text-[10px] text-indigo-700 font-semibold">{details.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-lg ${getShiftBadgeStyle(officer.shiftCode)}`}>
                            M (15:00 - 08:00)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OFF / LEPAS PIKET / CUTI SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Petugas Lepas Piket, Libur (Off), atau Cuti Hari Ini ({offOfficers.length})
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
              {offOfficers.map(officer => {
                const details = SHIFT_DETAILS[officer.shiftCode] || SHIFT_DETAILS.O;
                return (
                  <div
                    key={officer.id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]" title={officer.name}>
                      {officer.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${getShiftBadgeStyle(officer.shiftCode)}`}>
                      {officer.shiftCode}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL MONTHLY MATRIX TABLE */}
      {activeView === 'table' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Matriks Pembagian Shift Wali Asuh - Agustus 2026
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel lengkap seluruh 20 personel Wali Asuh selama 31 hari di bulan Agustus 2026
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Geser ke kanan untuk melihat tanggal berikutnya</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-center text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-extrabold text-[11px]">
                    <th className="sticky left-0 bg-slate-900 z-20 px-3 py-2.5 text-left border-r border-slate-700 min-w-[160px]">
                      No / Nama Wali Asuh
                    </th>
                    {days.map(d => (
                      <th
                        key={d}
                        className={`px-2 py-2 border-r border-slate-700 min-w-[34px] ${
                          d === selectedDay ? 'bg-emerald-600 text-white font-black' : ''
                        }`}
                      >
                        {d}
                      </th>
                    ))}
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Total Shift Pagi">P</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Pagi Full">FUL</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Total Shift Sore">S</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Total Shift Malam">M</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Lepas Piket">LP</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Off / Libur">OFF</th>
                    <th className="bg-slate-900 px-2 py-2 border-r border-slate-700 min-w-[32px]" title="Jam Kerja Total">JK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {WALI_ASUH_SCHEDULES.map((staff, idx) => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 bg-white font-bold text-slate-800 text-left px-3 py-2 border-r border-slate-200 z-10 shadow-xs whitespace-nowrap">
                        <span className="text-slate-400 font-mono text-[10px] mr-1.5">{idx + 1}.</span>
                        {staff.name}
                      </td>
                      {staff.shifts.map((shift, dayIdx) => {
                        const dayNum = dayIdx + 1;
                        const isSelected = dayNum === selectedDay;
                        return (
                          <td
                            key={dayIdx}
                            onClick={() => setSelectedDay(dayNum)}
                            className={`px-1 py-1 border-r border-slate-200 cursor-pointer font-extrabold text-[10px] transition-all ${
                              isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50 z-10' : ''
                            }`}
                          >
                            <span className={`inline-block w-6 h-6 leading-6 rounded-md ${getShiftBadgeStyle(shift)}`}>
                              {shift}
                            </span>
                          </td>
                        );
                      })}
                      <td className="font-bold text-emerald-700 bg-slate-50 border-r border-slate-200">{staff.totals.P}</td>
                      <td className="font-bold text-teal-700 bg-slate-50 border-r border-slate-200">{staff.totals.FUL}</td>
                      <td className="font-bold text-amber-700 bg-slate-50 border-r border-slate-200">{staff.totals.S}</td>
                      <td className="font-bold text-indigo-700 bg-slate-50 border-r border-slate-200">{staff.totals.M}</td>
                      <td className="font-bold text-sky-700 bg-slate-50 border-r border-slate-200">{staff.totals.LP}</td>
                      <td className="font-bold text-slate-500 bg-slate-50 border-r border-slate-200">{staff.totals.OFF}</td>
                      <td className="font-extrabold text-slate-900 bg-emerald-100/60 border-r border-slate-200">{staff.totals.JK}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SEARCH INDIVIDUAL OFFICERS */}
      {activeView === 'search' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama Wali Asuh (contoh: Suhariyono, Rindani...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-xs font-bold text-slate-500 shrink-0">Filter Shift:</span>
                {['all', 'P', 'P2', 'P3', 'S', 'M', 'LP', 'O', 'C'].map(code => (
                  <button
                    key={code}
                    onClick={() => setFilterShift(code)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      filterShift === code
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {code === 'all' ? 'Semua' : code}
                  </button>
                ))}
              </div>
            </div>

            {/* Search results cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredSchedules.map(staff => {
                const todayShift = staff.shifts[selectedDay - 1] || 'O';
                const details = SHIFT_DETAILS[todayShift] || SHIFT_DETAILS.O;

                return (
                  <div
                    key={staff.id}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{staff.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold">Total Jam Kerja Bulan Ini: {staff.totals.JK} Jam</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Shift Tgl {selectedDay} Agt:</span>
                        <span className={`text-xs px-2.5 py-1 rounded-xl ${getShiftBadgeStyle(todayShift)}`}>
                          {details.icon} {todayShift}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                      <span>Status Shift Tanggal {selectedDay}:</span>
                      <span className="font-bold text-slate-800">{details.label} ({details.time})</span>
                    </div>

                    {/* Quick 31-day mini timeline */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Ringkasan 31 Hari:</span>
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                        {staff.shifts.map((sh, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedDay(idx + 1)}
                            className={`w-5 h-6 rounded flex items-center justify-center text-[9px] font-black cursor-pointer shrink-0 ${
                              selectedDay === idx + 1 ? 'ring-2 ring-emerald-500 scale-110 z-10' : ''
                            } ${getShiftBadgeStyle(sh)}`}
                            title={`Tgl ${idx + 1}: ${sh}`}
                          >
                            {sh}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PETUNJUK / LEGEND BOX */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Info className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Petunjuk & Keterangan Kode Shift Wali Asuh
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
          {Object.entries(SHIFT_DETAILS).map(([code, item]) => (
            <div key={code} className={`p-2.5 rounded-2xl border ${item.borderCol} ${item.badgeBg} text-left space-y-1`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${item.textCol}`}>
                  {item.icon} {code}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">{item.label}</p>
              <p className="text-[10px] text-slate-600 font-semibold">{item.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .overflow-x-auto {
            overflow: visible !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 3px 2px !important;
            font-size: 7pt !important;
          }
        }
      `}</style>
    </div>
  );
}
