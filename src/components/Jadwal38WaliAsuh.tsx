import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Search, UserCheck, Shield, ChevronLeft, ChevronRight, Printer, Sparkles, Sun, Sunset, Moon, Coffee, Filter, Info, X, Download, FileText, Loader2, Users, CheckCircle2, Briefcase, FileSpreadsheet, ArrowUpDown } from 'lucide-react';
import { generateJadwal38WaliAsuhPDF } from '../utils/pdfGenerator';

export interface WaliAsuh38Item {
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

export const WALI_ASUH_38_DATA: WaliAsuh38Item[] = [
  { no: 1, nama: "A. Zainudin Sholeh", tandem: "Yusak Wasis Pratonggo", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 2, nama: "Abisarwan Rafif", tandem: "Theresa Inganta Ginting", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 3, nama: "Aris Mahmud Syafi’i", tandem: "Hiras Mando Rajagukguk", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 4, nama: "Chusfia Hanik Wihayati", tandem: "Siti Maslukah", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 5, nama: "Ahmad Fadkhurriza Ivakhudin", tandem: "Adityo Rizky Winarno", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 6, nama: "Amirul Mu’minin Rofico Putra Kurnia", tandem: "Tiara Devi Cristina Sihombing", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 7, nama: "Dwi Chusnul Mufid", tandem: "Herlina Ratu Belia", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 8, nama: "Eko Wahyudi", tandem: "Anita Kurniawati", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 9, nama: "Deni Furitrinofi", tandem: "Chiva Uswahul Suci", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "M" } },
  { no: 10, nama: "Muji Santoso", tandem: "Moh. Asrofi", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 11, nama: "Nanang Arifin", tandem: "Inung Khuzaimatul Bariyah Y.", shifts: { Senin: "Off", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 12, nama: "Teguh Cahyono", tandem: "Retnowati", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "M" } },
  { no: 13, nama: "Afida Saidatul Fuadia", tandem: "Latifa Dyah Ratna Dewi", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 14, nama: "Eky Venty Pricillia", tandem: "Ambikha Widya Asmara", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 15, nama: "Moch. Chabib", tandem: "Ade Kurnia", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 16, nama: "Rindani", tandem: "—", shifts: { Senin: "Off", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 17, nama: "Erna Rizkiani", tandem: "—", shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 18, nama: "Hariyadi", tandem: "Rani Novita Asmi", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "M" } },
  { no: 19, nama: "Suhariyono", tandem: "Anggelika Simanjuntak", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 20, nama: "Dewi Askinu", tandem: "Prisilia Dwi Isnawati", shifts: { Senin: "P", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 21, nama: "Moh. Asrofi", tandem: "Muji Santoso", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 22, nama: "Ambikha Widya Asmara", tandem: "Dewi Askinu", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 23, nama: "Prisilia Dwi Isnawati", tandem: "Eky Venty Pricillia", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 24, nama: "Yusak Wasis Pratonggo", tandem: "A. Zainudin Sholeh", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 25, nama: "Anita Kurniawati", tandem: "Eko Wahyudi", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "M", Minggu: "Off" } },
  { no: 26, nama: "Siti Maslukah", tandem: "Chusfia Hanik Wihayati", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 27, nama: "Retnowati", tandem: "Teguh Cahyono", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 28, nama: "Herlina Ratu Belia", tandem: "Dwi Chusnul Mufid", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 29, nama: "Latifa Dyah Ratna Dewi", tandem: "Afida Saidatul Fuadia", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 30, nama: "Adityo Rizky Winarno", tandem: "Ahmad Fadkhurriza Ivakhudin", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 31, nama: "Chiva Uswahul Suci", tandem: "Deni Furitrinofi", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 32, nama: "Theresa Inganta Ginting", tandem: "Abisarwan Rafif", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 33, nama: "Anggelika Simanjuntak", tandem: "Suhariyono", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 34, nama: "Tiara Devi Cristina Sihombing", tandem: "Amirul Mu’minin Rofico Putra Kurnia", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 35, nama: "Hiras Mando Rajagukguk", tandem: "Aris Mahmud Syafi’i", shifts: { Senin: "P", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 36, nama: "Rani Novita Asmi", tandem: "Hariyadi", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 37, nama: "Ade Kurnia", tandem: "Moch. Chabib", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 38, nama: "Inung Khuzaimatul Bariyah Y.", tandem: "Nanang Arifin", shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } }
];

export const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
export type DayName = typeof DAYS_LIST[number];

export const SHIFT_LEGEND: Record<string, { label: string; desc: string; time: string; color: string; bg: string; textCol: string; border: string; icon: string }> = {
  P: { label: 'Pagi (P)', desc: 'Shift Pagi Utama', time: '07.00 - 15.00 WIB', color: 'emerald', bg: 'bg-emerald-100', textCol: 'text-emerald-800', border: 'border-emerald-300', icon: '☀️' },
  S: { label: 'Sore (S)', desc: 'Shift Sore', time: '15.00 - 23.00 WIB', color: 'amber', bg: 'bg-amber-100', textCol: 'text-amber-800', border: 'border-amber-300', icon: '🌆' },
  M: { label: 'Malam (M)', desc: 'Shift Malam', time: '23.00 - 07.00 WIB', color: 'indigo', bg: 'bg-indigo-100', textCol: 'text-indigo-800', border: 'border-indigo-300', icon: '🌙' },
  Off: { label: 'Lepas Piket / Off', desc: 'Lepas Piket Pasca Shift / Off', time: 'Bebas Tugas Piket', color: 'rose', bg: 'bg-rose-100', textCol: 'text-rose-800', border: 'border-rose-300', icon: '🛌' }
};

interface Jadwal38WaliAsuhProps {
  onBack?: () => void;
  compact?: boolean;
}

export default function Jadwal38WaliAsuh({ onBack, compact = false }: Jadwal38WaliAsuhProps) {
  const dayNameMapping: Record<number, DayName> = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu'
  };

  const today = new Date();
  const dayIndex = today.getDay();
  const currentDayName = dayNameMapping[dayIndex];

  const [selectedDay, setSelectedDay] = useState<DayName>(currentDayName);
  const [activeView, setActiveView] = useState<'matrix' | 'daily' | 'rekap'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filtered Matrix Data
  const filteredMatrixData = useMemo(() => {
    let result = [...WALI_ASUH_38_DATA];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.nama.toLowerCase().includes(q) || item.tandem.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery]);

  // Officers on duty on selectedDay
  const officersOnDuty = useMemo(() => {
    return WALI_ASUH_38_DATA.map(item => ({
      ...item,
      shiftToday: item.shifts[selectedDay]
    })).filter(item => {
      const matchesSearch = searchQuery.trim() === '' || 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.tandem.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesShift = filterShift === 'all' || item.shiftToday === filterShift;

      return matchesSearch && matchesShift;
    });
  }, [selectedDay, searchQuery, filterShift]);

  // Shift counts on selectedDay
  const shiftCounts = useMemo(() => {
    const counts = { P: 0, S: 0, M: 0, Off: 0 };
    WALI_ASUH_38_DATA.forEach(item => {
      const s = item.shifts[selectedDay];
      if (s === 'P') counts.P++;
      else if (s === 'S') counts.S++;
      else if (s === 'M') counts.M++;
      else if (s === 'Off') counts.Off++;
    });
    return counts;
  }, [selectedDay]);

  const handlePrintPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhPDF(WALI_ASUH_38_DATA);
    } catch (err) {
      console.error('Failed to generate 38 Wali Asuh PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Wali Asuh,Tandem Pengasuhan,Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu\n";
    WALI_ASUH_38_DATA.forEach(item => {
      csvContent += `"${item.no}","${item.nama}","${item.tandem}","${item.shifts.Senin}","${item.shifts.Selasa}","${item.shifts.Rabu}","${item.shifts.Kamis}","${item.shifts.Jumat}","${item.shifts.Sabtu}","${item.shifts.Minggu}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_38_Wali_Asuh_dan_Tandem.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Users className="w-3.5 h-3.5" />
                <span>Jadwal Resmi 38 Wali Asuh</span>
              </span>
              <span className="bg-indigo-700/80 text-indigo-100 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                Pola 1P–4S–1M–1Off
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jadwal 38 Wali Asuh & Tandem
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-3xl leading-relaxed">
              Sesuai SE Nomor 4749/2026. Jadwal kerja individual bersifat tetap & adil. Pasangan tandem bertugas saling melengkapi untuk keamanan & pengasuhan santri.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            )}

            <button
              onClick={handlePrintPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Cetak PDF Resmi</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'matrix'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Matriks Mingguan (38 Personel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'daily'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-300" />
            <span>Piket Harian ({selectedDay})</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau tandem..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>
      </div>

      {/* VIEW 1: MATRIX MINGGUAN 38 PERSONEL */}
      {activeView === 'matrix' && (
        <div className="space-y-4">
          {/* Shift Code Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(SHIFT_LEGEND).map(([code, config]) => (
              <div key={code} className={`p-3 rounded-2xl border ${config.border} ${config.bg} space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">{config.icon} {config.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 ${config.textCol}`}>
                    {code}
                  </span>
                </div>
                <p className={`text-[11px] font-bold ${config.textCol}`}>{config.time}</p>
              </div>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Daftar 38 Wali Asuh & Jadwal Kerja Pekanan</span>
              </h3>
              <span className="text-xs font-extrabold text-slate-500">
                Menampilkan {filteredMatrixData.length} dari 38 Personel
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                    <th className="px-3 py-3 text-center border-r border-slate-800 w-12">No</th>
                    <th className="px-4 py-3 border-r border-slate-800 min-w-[180px]">Nama Wali Asuh</th>
                    <th className="px-4 py-3 border-r border-slate-800 min-w-[180px]">Tandem Pengasuhan</th>
                    {DAYS_LIST.map(d => (
                      <th
                        key={d}
                        className={`px-3 py-3 text-center border-r border-slate-800 min-w-[70px] ${
                          d === currentDayName ? 'bg-amber-500 text-slate-900 font-black' : ''
                        }`}
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredMatrixData.map((item, idx) => (
                    <tr key={item.no} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 border-r border-slate-200">
                        {item.no}
                      </td>
                      <td className="px-4 py-2.5 font-extrabold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-[10px] flex items-center justify-center shrink-0">
                            {item.no}
                          </div>
                          <span>{item.nama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-600 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.tandem}</span>
                        </div>
                      </td>

                      {DAYS_LIST.map(day => {
                        const shift = item.shifts[day];
                        let styleClass = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (shift === 'P') styleClass = 'bg-emerald-100 text-emerald-900 font-black border-emerald-300';
                        if (shift === 'S') styleClass = 'bg-amber-100 text-amber-900 font-black border-amber-300';
                        if (shift === 'M') styleClass = 'bg-indigo-100 text-indigo-900 font-black border-indigo-300';
                        if (shift === 'Off') styleClass = 'bg-rose-100 text-rose-800 font-black border-rose-300';

                        return (
                          <td key={day} className="px-2 py-2 text-center border-r border-slate-200">
                            <span className={`inline-block w-11 py-1 rounded-lg text-xs border ${styleClass}`}>
                              {shift}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note Banner */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-800 text-xs font-semibold flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Penting:</strong> Anita Kurniawati ditetapkan Off pada hari Minggu untuk kegiatan ibadah rutin. Nama tandem menunjukkan pasangan pengasuhan siswa, jadwal kerja masing-masing tetap individual dan tidak harus berada pada shift yang sama.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PIKET HARIAN PER HARI */}
      {activeView === 'daily' && (
        <div className="space-y-4">
          {/* Day Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {DAYS_LIST.map(d => {
              const isToday = d === currentDayName;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                    selectedDay === d
                      ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Hari {d}</span>
                  {isToday && (
                    <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                      Hari Ini
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Shift Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Shift Pagi (07.00-15.00)</span>
              <p className="text-2xl font-black text-emerald-900">{shiftCounts.P} <span className="text-xs font-bold text-emerald-700">Tendik</span></p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Shift Sore (15.00-23.00)</span>
              <p className="text-2xl font-black text-amber-900">{shiftCounts.S} <span className="text-xs font-bold text-amber-700">Tendik</span></p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Shift Malam (23.00-07.00)</span>
              <p className="text-2xl font-black text-indigo-900">{shiftCounts.M} <span className="text-xs font-bold text-indigo-700">Tendik</span></p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Lepas Piket / Off</span>
              <p className="text-2xl font-black text-rose-900">{shiftCounts.Off} <span className="text-xs font-bold text-rose-700">Tendik</span></p>
            </div>
          </div>

          {/* Officers List for Selected Day */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Petugas Piket Bertugas Hari {selectedDay}</span>
              </h3>

              {/* Shift Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setFilterShift('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    filterShift === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({officersOnDuty.length})
                </button>
                {['P', 'S', 'M', 'Off'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterShift(s)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      filterShift === s ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Shift {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {officersOnDuty.map(item => {
                const shift = item.shiftToday;
                const legend = SHIFT_LEGEND[shift] || SHIFT_LEGEND.Off;

                return (
                  <div key={item.no} className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                          {item.no}
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">{item.nama}</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${legend.bg} ${legend.textCol} ${legend.border}`}>
                        {legend.icon} {shift}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Tandem Pengasuhan:</span>
                        <span className="font-bold text-slate-800">{item.tandem}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Jam Tugas:</span>
                        <span className="font-bold text-indigo-700">{legend.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
