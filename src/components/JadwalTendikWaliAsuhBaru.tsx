import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Search, UserCheck, Shield, ChevronLeft, ChevronRight, Printer, Sparkles, Sun, Sunset, Moon, Coffee, Filter, Info, X, Download, FileText, Loader2, Users, BarChart3, CheckCircle2, Briefcase, FileSpreadsheet, TrendingUp, ArrowUpDown } from 'lucide-react';
import { generateJadwalTendikWaliAsuhBaruPDF, generateRekapHariKerjaTendikBaruPDF } from '../utils/pdfGenerator';

export interface TendikWaliAsuhBaruItem {
  no: number;
  nama: string;
  tandem: string;
  shifts: {
    Senin: string;
    Selasa: string;
    Rabu: string;
    Kamis: string;
    Jumat: string;
    Sabtu: string;
    Minggu: string;
  };
}

export const TENDIK_WALI_ASUH_BARU_DATA: TendikWaliAsuhBaruItem[] = [
  {
    no: 1,
    nama: "Moh. Asrofi",
    tandem: "Muji Santoso",
    shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" }
  },
  {
    no: 2,
    nama: "Ambikha Widya Asmara",
    tandem: "Dewi Askinu",
    shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "P" }
  },
  {
    no: 3,
    nama: "Prisilia Dwi Isnawati",
    tandem: "Eky Venty Pricillia",
    shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" }
  },
  {
    no: 4,
    nama: "Yusak Wasis Pratonggo",
    tandem: "A. Zainudin Sholeh",
    shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "P" }
  },
  {
    no: 5,
    nama: "Anita Kurniawati",
    tandem: "Eko Wahyudi",
    shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "M", Minggu: "LP" }
  },
  {
    no: 6,
    nama: "Siti Maslukah",
    tandem: "Chusfia Hanik Wihayati",
    shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 7,
    nama: "Retnowati",
    tandem: "Teguh Cahyono",
    shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 8,
    nama: "Herlina Ratu Belia",
    tandem: "Dwi Chusnul Mufid",
    shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" }
  },
  {
    no: 9,
    nama: "Latifa Dyah Ratna Dewi",
    tandem: "Afida Saidatul Fuadia",
    shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "P", Minggu: "S" }
  },
  {
    no: 10,
    nama: "Adityo Rizky Winarno",
    tandem: "Ahmad Fadkhurriza Ivakhudin",
    shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 11,
    nama: "Chiva Uswahul Suci",
    tandem: "Deni Furitrinofi",
    shifts: { Senin: "S", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" }
  },
  {
    no: 12,
    nama: "Theresa Inganta Ginting",
    tandem: "Abisarwan Rafif",
    shifts: { Senin: "S", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 13,
    nama: "Anggelika Simanjuntak",
    tandem: "Suhariyono",
    shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "P", Minggu: "S" }
  },
  {
    no: 14,
    nama: "Tiara Devi Cristina Sihombing",
    tandem: "Amirul Mu’minin Rofico Putra Kurnia",
    shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" }
  },
  {
    no: 15,
    nama: "Hiras Mando Rajagukguk",
    tandem: "Aris Mahmud Syafi’i",
    shifts: { Senin: "P", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 16,
    nama: "Rani Novita Asmi",
    tandem: "Hariyadi",
    shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 17,
    nama: "Ade Kurnia",
    tandem: "Moch. Chabib",
    shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" }
  },
  {
    no: 18,
    nama: "Inung Khuzaimatul Bariyah Y.",
    tandem: "Nanang Arifin",
    shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "S" }
  }
];

export const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
export type DayName = typeof DAYS_LIST[number];

export const SHIFT_LEGEND: Record<string, { label: string; desc: string; time: string; color: string; bg: string; textCol: string; border: string; icon: string }> = {
  P: { label: 'Pagi (P)', desc: 'Shift Pagi Utama', time: '07.00 - 15.00 WIB', color: 'emerald', bg: 'bg-emerald-100', textCol: 'text-emerald-800', border: 'border-emerald-300', icon: '☀️' },
  S: { label: 'Sore (S)', desc: 'Shift Sore', time: '15.00 - 23.00 WIB', color: 'amber', bg: 'bg-amber-100', textCol: 'text-amber-800', border: 'border-amber-300', icon: '🌆' },
  M: { label: 'Malam (M)', desc: 'Shift Malam', time: '23.00 - 07.00 WIB', color: 'indigo', bg: 'bg-indigo-100', textCol: 'text-indigo-800', border: 'border-indigo-300', icon: '🌙' },
  LP: { label: 'Lepas Piket / Off (LP)', desc: 'Lepas Piket Pasca Shift / Off', time: 'Bebas Tugas Piket', color: 'sky', bg: 'bg-sky-100', textCol: 'text-sky-800', border: 'border-sky-300', icon: '🛌' }
};

export const MONTHS_CONFIG = [
  { id: '2026-08', label: 'Agustus 2026', totalDays: 31, year: 2026, month: 7 },
  { id: '2026-09', label: 'September 2026', totalDays: 30, year: 2026, month: 8 },
  { id: '2026-10', label: 'Oktober 2026', totalDays: 31, year: 2026, month: 9 },
  { id: '2026-11', label: 'November 2026', totalDays: 30, year: 2026, month: 10 },
  { id: '2026-12', label: 'Desember 2026', totalDays: 31, year: 2026, month: 11 },
  { id: '2027-01', label: 'Januari 2027', totalDays: 31, year: 2027, month: 0 },
  { id: '2027-02', label: 'Februari 2027', totalDays: 28, year: 2027, month: 1 },
];

interface JadwalTendikWaliAsuhBaruProps {
  onBack?: () => void;
  compact?: boolean;
}

export default function JadwalTendikWaliAsuhBaru({ onBack, compact = false }: JadwalTendikWaliAsuhBaruProps) {
  // Determine current day of the week name in Indonesian
  const todayObj = new Date();
  const dayIndex = todayObj.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const dayNameMapping: DayName[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNameMapping[dayIndex];

  const [selectedDay, setSelectedDay] = useState<DayName>(currentDayName);
  const [activeView, setActiveView] = useState<'daily' | 'matrix' | 'rekap' | 'search'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Month state for Rekap
  const [selectedMonthId, setSelectedMonthId] = useState<string>('2026-08');
  const [rekapSortKey, setRekapSortKey] = useState<'no' | 'nama' | 'totalKerja' | 'jamKerja' | 'malam'>('totalKerja');
  const [rekapSortOrder, setRekapSortOrder] = useState<'asc' | 'desc'>('desc');

  const selectedMonthConfig = useMemo(() => {
    return MONTHS_CONFIG.find(m => m.id === selectedMonthId) || MONTHS_CONFIG[0];
  }, [selectedMonthId]);

  // Calculate day counts in selected month
  const monthDayCounts = useMemo(() => {
    const counts: Record<DayName, number> = {
      Senin: 0,
      Selasa: 0,
      Rabu: 0,
      Kamis: 0,
      Jumat: 0,
      Sabtu: 0,
      Minggu: 0
    };

    const { year, month, totalDays } = selectedMonthConfig;
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, month, d);
      const name = dayNameMapping[dt.getDay()];
      counts[name] = (counts[name] || 0) + 1;
    }

    return counts;
  }, [selectedMonthConfig]);

  // Calculate Monthly Rekap Data for each Tendik
  const rekapData = useMemo(() => {
    return TENDIK_WALI_ASUH_BARU_DATA.map(item => {
      let countPagi = 0;
      let countSore = 0;
      let countMalam = 0;
      let countLP = 0;

      DAYS_LIST.forEach(d => {
        const code = item.shifts[d];
        const multiplier = monthDayCounts[d] || 0;
        if (code === 'P') countPagi += multiplier;
        else if (code === 'S') countSore += multiplier;
        else if (code === 'M') countMalam += multiplier;
        else if (code === 'LP') countLP += multiplier;
      });

      const totalHariKerja = countPagi + countSore + countMalam;
      const totalJamKerja = totalHariKerja * 8; // 8 jam per shift
      const percentageWork = Math.round((totalHariKerja / selectedMonthConfig.totalDays) * 100);

      return {
        ...item,
        countPagi,
        countSore,
        countMalam,
        countLP,
        totalHariKerja,
        totalJamKerja,
        percentageWork
      };
    });
  }, [monthDayCounts, selectedMonthConfig]);

  // Filtered & Sorted Rekap Data
  const sortedRekapData = useMemo(() => {
    let result = [...rekapData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.nama.toLowerCase().includes(q) || item.tandem.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let valA: any = a[rekapSortKey as keyof typeof a];
      let valB: any = b[rekapSortKey as keyof typeof b];

      if (typeof valA === 'string') {
        return rekapSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return rekapSortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [rekapData, searchQuery, rekapSortKey, rekapSortOrder]);

  // Summary Metrics for Rekap
  const rekapMetrics = useMemo(() => {
    const totalTendik = rekapData.length;
    const grandTotalShiftKerja = rekapData.reduce((acc, curr) => acc + curr.totalHariKerja, 0);
    const grandTotalJamKerja = rekapData.reduce((acc, curr) => acc + curr.totalJamKerja, 0);
    const avgHariKerja = totalTendik > 0 ? (grandTotalShiftKerja / totalTendik).toFixed(1) : '0';
    const grandTotalMalam = rekapData.reduce((acc, curr) => acc + curr.countMalam, 0);
    const grandTotalSore = rekapData.reduce((acc, curr) => acc + curr.countSore, 0);
    const grandTotalPagi = rekapData.reduce((acc, curr) => acc + curr.countPagi, 0);
    const grandTotalLP = rekapData.reduce((acc, curr) => acc + curr.countLP, 0);

    return {
      totalTendik,
      grandTotalShiftKerja,
      grandTotalJamKerja,
      avgHariKerja,
      grandTotalMalam,
      grandTotalSore,
      grandTotalPagi,
      grandTotalLP
    };
  }, [rekapData]);

  // Officers on selectedDay
  const officersOnDuty = TENDIK_WALI_ASUH_BARU_DATA.map(item => ({
    ...item,
    shiftCode: item.shifts[selectedDay] || 'LP'
  }));

  const pagiOfficers = officersOnDuty.filter(o => o.shiftCode === 'P');
  const soreOfficers = officersOnDuty.filter(o => o.shiftCode === 'S');
  const malamOfficers = officersOnDuty.filter(o => o.shiftCode === 'M');
  const lpOfficers = officersOnDuty.filter(o => o.shiftCode === 'LP');

  const filteredData = TENDIK_WALI_ASUH_BARU_DATA.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = item.nama.toLowerCase().includes(q) || item.tandem.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (filterShift === 'all') return true;
    return item.shifts[selectedDay] === filterShift;
  });

  const getShiftBadgeStyle = (code: string) => {
    switch (code) {
      case 'P':
        return 'bg-emerald-500 text-white font-black';
      case 'S':
        return 'bg-amber-500 text-white font-black';
      case 'M':
        return 'bg-indigo-600 text-white font-black';
      case 'LP':
        return 'bg-sky-100 text-sky-800 font-bold border border-sky-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwalTendikWaliAsuhBaruPDF(selectedDay);
    } catch (err) {
      console.error('Gagal membuat PDF Jadwal Tendik Baru:', err);
      alert('Terjadi kesalahan saat membuat file PDF. Silakan coba lagi.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportRekapCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Tendik Wali Asuh,Tandem Pengasuhan,Bulan,Total Hari Bulan,Shift Pagi (Hari),Shift Sore (Hari),Shift Malam (Hari),TOTAL HARI KERJA (Hari),Lepas Piket / Off (Hari),Total Jam Kerja (Jam),Beban Kerja (%)\n";
    rekapData.forEach(item => {
      csvContent += `"${item.no}","${item.nama}","${item.tandem}","${selectedMonthConfig.label}","${selectedMonthConfig.totalDays}","${item.countPagi}","${item.countSore}","${item.countMalam}","${item.totalHariKerja}","${item.countLP}","${item.totalJamKerja}","${item.percentageWork}%"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Hari_Kerja_Tendik_Baru_${selectedMonthConfig.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintRekapPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateRekapHariKerjaTendikBaruPDF(
        selectedMonthConfig.label,
        selectedMonthConfig.totalDays,
        rekapData
      );
    } catch (err) {
      console.error('Failed to generate Rekap PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-rose-500/20">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-rose-300" />
                SRT 1 KABUPATEN KEDIRI
              </span>
              <span className="text-xs font-bold bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow-xs">
                SE Nomor 4749/2026
              </span>
              <span className="text-xs font-bold bg-rose-500/80 text-white px-3 py-1 rounded-full shadow-xs border border-rose-400/40">
                Pola 1P - 4S - 1M - 1LP
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              JADWAL KERJA 18 WALI ASUH BARU
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Jadwal pembagian shift kerja individual dan pasangan tandem pengasuhan siswa Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri (Pola: M → LP/Off → Sore).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              type="button"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 border border-amber-300/60 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-900" />
                  <span>Cetak PDF Jadwal SE 4749</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-rose-200" />
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
            onClick={() => setActiveView('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'daily'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Piket Hari {selectedDay}</span>
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {pagiOfficers.length + soreOfficers.length + malamOfficers.length} Bertugas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'matrix'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tabel Matriks Mingguan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('rekap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'rekap'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>Rekap Hari Kerja Bulanan</span>
            <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {selectedMonthConfig.totalDays} Hari
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'search'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Cari Tendik & Tandem</span>
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            Pilih Hari:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {DAYS_LIST.map(d => {
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY SHIFT DUTY OFFICERS */}
      {activeView === 'daily' && (
        <div className="space-y-6">
          {/* Summary Alert */}
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-100/60 border border-rose-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-700/20 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Tendik Wali Asuh Bertugas - Hari {selectedDay}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Total <span className="font-bold text-rose-700">{pagiOfficers.length + soreOfficers.length + malamOfficers.length} Tendik</span> aktif bertugas mendampingi siswa bersama pasangan tandemnya.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-rose-200/50">
                <span>☀️ Pagi: {pagiOfficers.length}</span>
                <span className="text-slate-300">|</span>
                <span>🌆 Sore: {soreOfficers.length}</span>
                <span className="text-slate-300">|</span>
                <span>🌙 Malam: {malamOfficers.length}</span>
                <span className="text-slate-300">|</span>
                <span>🛌 LP: {lpOfficers.length}</span>
              </div>
            </div>
          </div>

          {/* 3 SHIFTS CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. SHIFT PAGI */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Shift Pagi (P)</h4>
                      <p className="text-[10px] text-slate-400 font-bold">07.00 - 15.00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    {pagiOfficers.length} Personel
                  </span>
                </div>

                {pagiOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift pagi hari ini</p>
                ) : (
                  <div className="space-y-2.5">
                    {pagiOfficers.map(item => (
                      <div
                        key={item.no}
                        className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-50 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                              {item.no}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.nama}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold">
                            Pagi
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 bg-white/80 p-2 rounded-xl border border-emerald-200/60">
                          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Tandem Pengasuhan: <strong className="font-extrabold text-slate-800">{item.tandem}</strong></span>
                        </div>
                      </div>
                    ))}
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
                      <h4 className="text-sm font-extrabold text-slate-800">Shift Sore (S)</h4>
                      <p className="text-[10px] text-slate-400 font-bold">15.00 - 23.00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                    {soreOfficers.length} Personel
                  </span>
                </div>

                {soreOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift sore hari ini</p>
                ) : (
                  <div className="space-y-2.5">
                    {soreOfficers.map(item => (
                      <div
                        key={item.no}
                        className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 hover:bg-amber-50 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                              {item.no}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.nama}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold">
                            Sore
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                          <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Tandem Pengasuhan: <strong className="font-extrabold text-slate-800">{item.tandem}</strong></span>
                        </div>
                      </div>
                    ))}
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
                      <h4 className="text-sm font-extrabold text-slate-800">Shift Malam (M)</h4>
                      <p className="text-[10px] text-slate-400 font-bold">23.00 - 07.00 WIB</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200">
                    {malamOfficers.length} Personel
                  </span>
                </div>

                {malamOfficers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada petugas shift malam hari ini</p>
                ) : (
                  <div className="space-y-2.5">
                    {malamOfficers.map(item => (
                      <div
                        key={item.no}
                        className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-50 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                              {item.no}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.nama}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold">
                            Malam
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 bg-white/80 p-2 rounded-xl border border-indigo-200/60">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Tandem Pengasuhan: <strong className="font-extrabold text-slate-800">{item.tandem}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LEPAS PIKET / OFF SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Lepas Piket / Off (LP) Hari {selectedDay} ({lpOfficers.length} Personel)
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
              {lpOfficers.map(item => (
                <div
                  key={item.no}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.nama}</p>
                    <p className="text-[10px] text-slate-500">Tandem: {item.tandem}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-sky-100 text-sky-800 font-extrabold border border-sky-300">
                    LP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY MATRIX TABLE */}
      {activeView === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Tabel Matriks Kerja 18 Wali Asuh Baru (SE No. 4749/2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                SRT 1 KABUPATEN KEDIRI - Pola 1P - 4S - 1M - 1LP (M → LP/Off → Sore)
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              <Info className="w-3.5 h-3.5 text-rose-600" />
              <span>Rotasi mingguan sesuai Surat Edaran resmi</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold text-[11px]">
                  <th className="px-3 py-3 border-r border-slate-700 w-10 text-center">No.</th>
                  <th className="px-4 py-3 border-r border-slate-700 min-w-[180px]">Nama Wali Asuh</th>
                  <th className="px-4 py-3 border-r border-slate-700 min-w-[180px]">Tandem Pengasuhan</th>
                  {DAYS_LIST.map(d => (
                    <th
                      key={d}
                      className={`px-3 py-3 border-r border-slate-700 text-center min-w-[50px] ${
                        d === selectedDay ? 'bg-rose-700 text-white font-black' : ''
                      }`}
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center bg-emerald-900 border-r border-slate-700 w-10" title="Shift Pagi">P</th>
                  <th className="px-2 py-3 text-center bg-amber-900 border-r border-slate-700 w-10" title="Shift Sore">S</th>
                  <th className="px-2 py-3 text-center bg-indigo-900 border-r border-slate-700 w-10" title="Shift Malam">M</th>
                  <th className="px-2 py-3 text-center bg-sky-900 w-12" title="Lepas Piket / Off">LP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {TENDIK_WALI_ASUH_BARU_DATA.map(item => {
                  const shiftsArr = Object.values(item.shifts);
                  const countP = shiftsArr.filter(s => s === 'P').length;
                  const countS = shiftsArr.filter(s => s === 'S').length;
                  const countM = shiftsArr.filter(s => s === 'M').length;
                  const countLP = shiftsArr.filter(s => s === 'LP').length;

                  return (
                    <tr key={item.no} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 border-r border-slate-200">
                        {item.no}
                      </td>
                      <td className="px-4 py-2.5 font-extrabold text-slate-900 border-r border-slate-200">
                        {item.nama}
                        {item.nama.includes('Anita Kurniawati') && (
                          <span className="ml-1 text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md font-bold">
                            Ibadah Minggu
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-600 border-r border-slate-200">
                        {item.tandem}
                      </td>
                      {DAYS_LIST.map(d => {
                        const code = item.shifts[d];
                        const isSelected = d === selectedDay;
                        return (
                          <td
                            key={d}
                            onClick={() => setSelectedDay(d)}
                            className={`px-2 py-2 text-center border-r border-slate-200 cursor-pointer ${
                              isSelected ? 'bg-rose-50 ring-2 ring-rose-500 z-10' : ''
                            }`}
                          >
                            <span className={`inline-block w-7 h-7 leading-7 rounded-lg text-[10px] ${getShiftBadgeStyle(code)}`}>
                              {code}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-slate-200">{countP}</td>
                      <td className="px-2 py-2 text-center font-bold text-amber-700 bg-amber-50/50 border-r border-slate-200">{countS}</td>
                      <td className="px-2 py-2 text-center font-bold text-indigo-700 bg-indigo-50/50 border-r border-slate-200">{countM}</td>
                      <td className="px-2 py-2 text-center font-bold text-sky-700 bg-sky-50/50">{countLP}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: REKAP HARI KERJA BULANAN */}
      {activeView === 'rekap' && (
        <div className="space-y-6">
          {/* Top Control Bar for Month Selection & Export */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-extrabold text-slate-800">Pilih Periode Bulan:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {MONTHS_CONFIG.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonthId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      selectedMonthId === m.id
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.label} ({m.totalDays} H)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handlePrintRekapPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Cetak PDF Rekap</span>
              </button>

              <button
                onClick={handleExportRekapCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-rose-50 to-rose-100/60 p-4 rounded-2xl border border-rose-200/80 space-y-1">
              <div className="flex items-center justify-between text-rose-700">
                <span className="text-[11px] font-extrabold uppercase tracking-wide">Rata-rata Hari Kerja</span>
                <Briefcase className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-rose-900">{rekapMetrics.avgHariKerja} <span className="text-xs font-bold text-rose-700">Hari / Tendik</span></p>
              <p className="text-[10px] text-rose-600 font-semibold">Selama {selectedMonthConfig.label}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 p-4 rounded-2xl border border-indigo-200/80 space-y-1">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="text-[11px] font-extrabold uppercase tracking-wide">Total Jam Kerja</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-indigo-900">{rekapMetrics.grandTotalJamKerja.toLocaleString('id-ID')} <span className="text-xs font-bold text-indigo-700">Jam</span></p>
              <p className="text-[10px] text-indigo-600 font-semibold">18 Tendik (8 jam/shift)</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[11px] font-extrabold uppercase tracking-wide">Total Shift Bertugas</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-900">{rekapMetrics.grandTotalShiftKerja} <span className="text-xs font-bold text-amber-700">Shift</span></p>
              <p className="text-[10px] text-amber-700 font-semibold">Pagi, Sore & Malam</p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100/60 p-4 rounded-2xl border border-sky-200/80 space-y-1">
              <div className="flex items-center justify-between text-sky-700">
                <span className="text-[11px] font-extrabold uppercase tracking-wide">Total Off / Lepas Piket</span>
                <Coffee className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-sky-900">{rekapMetrics.grandTotalLP} <span className="text-xs font-bold text-sky-700">Hari Off</span></p>
              <p className="text-[10px] text-sky-600 font-semibold">Istirahat & Bebas Piket</p>
            </div>
          </div>

          {/* Search & Sort Table Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama Tendik atau Tandem..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
                </span>
                {[
                  { key: 'totalKerja', label: 'Hari Kerja' },
                  { key: 'nama', label: 'Nama' },
                  { key: 'jamKerja', label: 'Jam Kerja' },
                  { key: 'malam', label: 'Shift Malam' }
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (rekapSortKey === s.key) {
                        setRekapSortOrder(rekapSortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setRekapSortKey(s.key as any);
                        setRekapSortOrder('desc');
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      rekapSortKey === s.key
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label} {rekapSortKey === s.key ? (rekapSortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Table for Monthly Work Days Rekap */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                    <th className="px-3 py-3 text-center border-r border-slate-800 w-12">No</th>
                    <th className="px-4 py-3 border-r border-slate-800">Nama Tendik Wali Asuh</th>
                    <th className="px-4 py-3 border-r border-slate-800">Tandem Pengasuhan</th>
                    <th className="px-3 py-3 text-center bg-emerald-900 border-r border-slate-800" title="Shift Pagi (07.00 - 15.00)">Shift Pagi (P)</th>
                    <th className="px-3 py-3 text-center bg-amber-900 border-r border-slate-800" title="Shift Sore (15.00 - 23.00)">Shift Sore (S)</th>
                    <th className="px-3 py-3 text-center bg-indigo-900 border-r border-slate-800" title="Shift Malam (23.00 - 07.00)">Shift Malam (M)</th>
                    <th className="px-4 py-3 text-center bg-rose-800 text-white border-r border-slate-800">TOTAL HARI KERJA</th>
                    <th className="px-3 py-3 text-center bg-sky-900 border-r border-slate-800">Off / LP</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800">Total Jam Kerja</th>
                    <th className="px-3 py-3 text-center">Beban Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sortedRekapData.map((item, idx) => {
                    return (
                      <tr key={item.no} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-3 py-3 text-center font-bold text-slate-400 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center shrink-0">
                              {item.no}
                            </div>
                            <span>{item.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600 border-r border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.tandem}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-800 bg-emerald-50/60 border-r border-slate-200">
                          {item.countPagi} Hari
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-amber-800 bg-amber-50/60 border-r border-slate-200">
                          {item.countSore} Hari
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-indigo-800 bg-indigo-50/60 border-r border-slate-200">
                          {item.countMalam} Hari
                        </td>
                        <td className="px-4 py-3 text-center border-r border-slate-200 bg-rose-50/70">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-700 text-white font-black text-xs shadow-2xs">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{item.totalHariKerja} Hari</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-sky-800 bg-sky-50/60 border-r border-slate-200">
                          {item.countLP} Hari
                        </td>
                        <td className="px-3 py-3 text-center font-extrabold text-slate-800 border-r border-slate-200">
                          {item.totalJamKerja} Jam
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-extrabold text-slate-700">{item.percentageWork}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-rose-600 rounded-full"
                                style={{ width: `${Math.min(item.percentageWork, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SEARCH TENDIK & TANDEM */}
      {activeView === 'search' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama Wali Asuh atau Tandem (contoh: Moh. Asrofi, Anita, Muji Santoso...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-xs font-bold text-slate-500 shrink-0">Filter Shift Hari {selectedDay}:</span>
                {['all', 'P', 'S', 'M', 'LP'].map(code => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredData.map(item => {
                const todayShift = item.shifts[selectedDay];
                const details = SHIFT_LEGEND[todayShift] || SHIFT_LEGEND.LP;

                return (
                  <div
                    key={item.no}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3 hover:border-rose-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {item.no}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{item.nama}</h4>
                          <p className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-rose-600" />
                            Tandem: <span className="text-slate-800 font-extrabold">{item.tandem}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Shift Hari {selectedDay}:</span>
                        <span className={`text-xs px-2.5 py-1 rounded-xl ${getShiftBadgeStyle(todayShift)}`}>
                          {details.icon} {todayShift}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                      <span>Status Tugas Hari {selectedDay}:</span>
                      <span className="font-bold text-slate-800">{details.label} ({details.time})</span>
                    </div>

                    {/* Weekly Schedule Mini Grid */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Jadwal Mingguan (Senin - Minggu):</span>
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS_LIST.map(d => {
                          const sh = item.shifts[d];
                          const isSel = d === selectedDay;
                          return (
                            <button
                              key={d}
                              onClick={() => setSelectedDay(d)}
                              className={`flex flex-col items-center justify-center p-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                                isSel ? 'ring-2 ring-rose-500 scale-105 z-10' : ''
                              } ${getShiftBadgeStyle(sh)}`}
                            >
                              <span className="opacity-70 text-[8px]">{d.substring(0, 3)}</span>
                              <span>{sh}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & OFFICIAL SIGNATURE INFO */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-600">
            <h4 className="font-extrabold text-slate-800 text-sm">Catatan & Ketentuan Operasional Surat Edaran</h4>
            <p>• <strong>Kode shift:</strong> P = Pagi (07.00-15.00) - S = Sore (15.00-23.00) - M = Malam (23.00-07.00) - LP = Lepas Piket/Off</p>
            <p>• <strong>Sifat Jadwal:</strong> Jadwal kerja bersifat individual; nama tandem menunjukkan pasangan pengasuhan siswa.</p>
            <p>• <strong>Catatan Khusus:</strong> Anita Kurniawati memperoleh LP hari Minggu untuk ibadah.</p>
          </div>
        </div>

        {/* Signature Box */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2 text-xs text-slate-800">
          <div className="text-slate-500 text-[11px]">
            <p className="font-bold text-slate-700">SRT 1 KABUPATEN KEDIRI</p>
            <p>Aplikasi Resmi WaliAsuhku - Dokumen Terverifikasi Digital</p>
          </div>

          <div className="text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 min-w-[220px]">
            <p className="font-semibold text-slate-600">Mengetahui,</p>
            <p className="font-extrabold text-slate-900">Kepala SRT 1 Kabupaten Kediri</p>
            <div className="h-10"></div>
            <p className="font-black text-slate-900 text-sm">Fadeli, S.Pd., M.Pd.</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 196905211992031008</p>
          </div>
        </div>
      </div>
    </div>
  );
}
