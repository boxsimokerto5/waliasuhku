import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Search, ChevronLeft, Loader2, Users, FileSpreadsheet, Sun, Sunset, Moon, Coffee, Info, CheckCircle2, Printer, FileText, ShieldAlert } from 'lucide-react';
import {
  generateJadwal38WaliAsuhPDF,
  generateJadwal38WaliAsuhHarianPDF,
  generateJadwal38WaliAsuhSeluruhHariClassifiedPDF
} from '../utils/pdfGenerator';

export interface PersonelJadwalItem {
  no: number;
  nama: string;
  isWaliAsrama?: boolean;
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

export const WALI_ASUH_38_DATA: PersonelJadwalItem[] = [
  // 38 Wali Asuh
  { no: 1, nama: "A. Zainudin Sholeh", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 2, nama: "Abisarwan Rafif", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 3, nama: "Aris Mahmud Syafi’i", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 4, nama: "Chusfia Hanik Wihayati", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 5, nama: "Ahmad Fadkhurriza Ivakhudin", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 6, nama: "Amirul Mu’minin Rofico Putra Kurnia", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 7, nama: "Dwi Chusnul Mufid", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 8, nama: "Eko Wahyudi", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 9, nama: "Deni Furitrinofi", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "M" } },
  { no: 10, nama: "Muji Santoso", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 11, nama: "Nanang Arifin", shifts: { Senin: "Off", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 12, nama: "Teguh Cahyono", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "M" } },
  { no: 13, nama: "Afida Saidatul Fuadia", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 14, nama: "Eky Venty Pricillia", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 15, nama: "Moch. Chabib", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 16, nama: "Rindani", shifts: { Senin: "Off", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "M" } },
  { no: 17, nama: "Erna Rizkiani", shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 18, nama: "Hariyadi", shifts: { Senin: "Off", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "M" } },
  { no: 19, nama: "Suhariyono", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 20, nama: "Dewi Askinu", shifts: { Senin: "P", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 21, nama: "Moh. Asrofi", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
  { no: 22, nama: "Ambikha Widya Asmara", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 23, nama: "Prisilia Dwi Isnawati", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 24, nama: "Yusak Wasis Pratonggo", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 25, nama: "Anita Kurniawati", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "M", Minggu: "Off" } },
  { no: 26, nama: "Siti Maslukah", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 27, nama: "Retnowati", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },
  { no: 28, nama: "Herlina Ratu Belia", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 29, nama: "Latifa Dyah Ratna Dewi", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 30, nama: "Adityo Rizky Winarno", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 31, nama: "Chiva Uswahul Suci", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 32, nama: "Theresa Inganta Ginting", shifts: { Senin: "S", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 33, nama: "Anggelika Simanjuntak", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "S" } },
  { no: 34, nama: "Tiara Devi Cristina Sihombing", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 35, nama: "Hiras Mando Rajagukguk", shifts: { Senin: "P", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 36, nama: "Rani Novita Asmi", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "S", Minggu: "S" } },
  { no: 37, nama: "Ade Kurnia", shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
  { no: 38, nama: "Inung Khuzaimatul Bariyah Y.", shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "S" } },

  // 9 Wali Asrama (Highlighted with isWaliAsrama: true)
  { no: 39, nama: "Eko Warasno", isWaliAsrama: true, shifts: { Senin: "Off", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "M", Sabtu: "M", Minggu: "M" } },
  { no: 40, nama: "Widiastutik", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "Off", Rabu: "S", Kamis: "P", Jumat: "M", Sabtu: "M", Minggu: "M" } },
  { no: 41, nama: "Hartor Prasetyo Utomo", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "Off", Kamis: "S", Jumat: "P", Sabtu: "M", Minggu: "M" } },
  { no: 42, nama: "Nukik Riyan Aswanto (Nuki)", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "M" } },
  { no: 43, nama: "Priselia Dian Anggraini", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 44, nama: "Sunarmi", isWaliAsrama: true, shifts: { Senin: "P", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 45, nama: "Moh. Nursalim", isWaliAsrama: true, shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "M", Minggu: "Off" } },
  { no: 46, nama: "Rio Andriyono", isWaliAsrama: true, shifts: { Senin: "Off", Selasa: "S", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "M", Minggu: "M" } },
  { no: 47, nama: "Sifa Nasywa", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "M" } }
];

export const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
export type DayName = typeof DAYS_LIST[number];

interface Jadwal38WaliAsuhProps {
  onBack?: () => void;
}

export default function Jadwal38WaliAsuh({ onBack }: Jadwal38WaliAsuhProps) {
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
  const [activeView, setActiveView] = useState<'classified' | 'matrix'>('classified');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filtered Matrix Data
  const filteredMatrixData = useMemo(() => {
    let result = [...WALI_ASUH_38_DATA];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.nama.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery]);

  // Classified Personnel by Shift on selectedDay
  const groupedShifts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = {
      P: [] as PersonelJadwalItem[],
      S: [] as PersonelJadwalItem[],
      M: [] as PersonelJadwalItem[],
      Off: [] as PersonelJadwalItem[],
    };

    WALI_ASUH_38_DATA.forEach(item => {
      if (q && !item.nama.toLowerCase().includes(q)) return;
      const shift = item.shifts[selectedDay] as 'P' | 'S' | 'M' | 'Off';
      if (result[shift]) {
        result[shift].push(item);
      } else {
        result.Off.push(item);
      }
    });

    return result;
  }, [selectedDay, searchQuery]);

  const handlePrintPDFHarian = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhHarianPDF(selectedDay, WALI_ASUH_38_DATA);
    } catch (err) {
      console.error('Failed to generate daily classified PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFSeluruhHari = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhSeluruhHariClassifiedPDF(WALI_ASUH_38_DATA);
    } catch (err) {
      console.error('Failed to generate all days classified PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFMatriks = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhPDF(WALI_ASUH_38_DATA);
    } catch (err) {
      console.error('Failed to generate matrix PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama,Kategori,Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu\n";
    WALI_ASUH_38_DATA.forEach(item => {
      csvContent += `"${item.no}","${item.nama}","${item.isWaliAsrama ? 'Wali Asrama' : 'Wali Asuh'}","${item.shifts.Senin}","${item.shifts.Selasa}","${item.shifts.Rabu}","${item.shifts.Kamis}","${item.shifts.Jumat}","${item.shifts.Sabtu}","${item.shifts.Minggu}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_Gabungan_47_Personel.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Users className="w-3.5 h-3.5" />
                <span>47 Personel (38 Wali Asuh + 9 Wali Asrama)</span>
              </span>
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-purple-400/40">
                Wali Asrama Diblok Warna Ungu
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jadwal Kerja Wali Asuh & Wali Asrama
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-3xl leading-relaxed">
              Sesuai SE Nomor 4749/2026. Diklasifikasikan secara rapi per shift (Pagi, Sore, Malam, dan Lepas Piket/Off). Nama Wali Asrama selalu ditandai dengan blok warna ungu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            )}

            <button
              onClick={handlePrintPDFHarian}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>Cetak PDF Hari {selectedDay}</span>
            </button>

            <button
              onClick={handlePrintPDFSeluruhHari}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Cetak 7 Hari Klasifikasi</span>
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

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveView('classified')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'classified'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Klasifikasi Shift Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'matrix'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Matriks Pekanan (47 Personel)</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama personel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>
      </div>

      {/* MAIN CLASSIFIED VIEW */}
      {activeView === 'classified' && (
        <div className="space-y-5">
          {/* Day Selector Buttons & Quick Actions */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap px-1">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Pilih Hari Tugas:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPDFHarian}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black transition-all cursor-pointer border border-rose-200 shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF Hari {selectedDay}</span>
                </button>
                <button
                  onClick={handlePrintPDFSeluruhHari}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer border border-indigo-200 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cetak 7 Hari Klasifikasi</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {DAYS_LIST.map(d => {
                const isToday = d === currentDayName;
                const isSelected = selectedDay === d;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
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
          </div>

          {/* Legend Banner for Wali Asrama */}
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 font-bold">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-600 inline-block shrink-0"></span>
            <span>Wali Asrama selalu disorot dengan warna ungu di seluruh tampilan dan hasil cetak PDF.</span>
          </div>

          {/* 4 Shift Group Columns (Pagi, Sore, Malam, Off) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {/* 1. SHIFT PAGI */}
            <div className="bg-white rounded-3xl border border-emerald-200/90 shadow-xs overflow-hidden">
              <div className="bg-emerald-600 p-4 text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>Shift Pagi (P)</span>
                  </div>
                  <span className="bg-emerald-950/40 text-emerald-100 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    {groupedShifts.P.length} Personel
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>07.00 – 15.00 WIB</span>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto no-scrollbar bg-emerald-50/20">
                {groupedShifts.P.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium italic">
                    Tidak ada petugas pada Shift Pagi
                  </div>
                ) : (
                  groupedShifts.P.map(item => (
                    <div
                      key={item.no}
                      className={`p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 ${
                        item.isWaliAsrama
                          ? 'bg-purple-100/90 border-2 border-purple-400 shadow-xs'
                          : 'bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          item.isWaliAsrama ? 'bg-purple-700 text-white' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {item.no}
                        </div>
                        <span className={`font-extrabold text-xs leading-tight truncate ${
                          item.isWaliAsrama ? 'text-purple-950 font-black' : 'text-slate-900'
                        }`}>
                          {item.nama}
                        </span>
                      </div>
                      {item.isWaliAsrama && (
                        <span className="bg-purple-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                          Wali Asrama
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. SHIFT SORE */}
            <div className="bg-white rounded-3xl border border-amber-200/90 shadow-xs overflow-hidden">
              <div className="bg-amber-500 p-4 text-slate-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Sunset className="w-4 h-4 text-slate-950" />
                    <span>Shift Sore (S)</span>
                  </div>
                  <span className="bg-slate-950/20 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-950/20">
                    {groupedShifts.S.length} Personel
                  </span>
                </div>
                <div className="text-[11px] text-slate-900 font-extrabold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>15.00 – 23.00 WIB</span>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto no-scrollbar bg-amber-50/20">
                {groupedShifts.S.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium italic">
                    Tidak ada petugas pada Shift Sore
                  </div>
                ) : (
                  groupedShifts.S.map(item => (
                    <div
                      key={item.no}
                      className={`p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 ${
                        item.isWaliAsrama
                          ? 'bg-purple-100/90 border-2 border-purple-400 shadow-xs'
                          : 'bg-white border border-amber-100 hover:border-amber-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          item.isWaliAsrama ? 'bg-purple-700 text-white' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {item.no}
                        </div>
                        <span className={`font-extrabold text-xs leading-tight truncate ${
                          item.isWaliAsrama ? 'text-purple-950 font-black' : 'text-slate-900'
                        }`}>
                          {item.nama}
                        </span>
                      </div>
                      {item.isWaliAsrama && (
                        <span className="bg-purple-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                          Wali Asrama
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. SHIFT MALAM */}
            <div className="bg-white rounded-3xl border border-indigo-200/90 shadow-xs overflow-hidden">
              <div className="bg-indigo-800 p-4 text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Moon className="w-4 h-4 text-amber-300" />
                    <span>Shift Malam (M)</span>
                  </div>
                  <span className="bg-indigo-950/50 text-indigo-100 text-xs font-black px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    {groupedShifts.M.length} Personel
                  </span>
                </div>
                <div className="text-[11px] text-indigo-100 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>23.00 – 07.00 WIB</span>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto no-scrollbar bg-indigo-50/20">
                {groupedShifts.M.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium italic">
                    Tidak ada petugas pada Shift Malam
                  </div>
                ) : (
                  groupedShifts.M.map(item => (
                    <div
                      key={item.no}
                      className={`p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 ${
                        item.isWaliAsrama
                          ? 'bg-purple-100/90 border-2 border-purple-400 shadow-xs'
                          : 'bg-white border border-indigo-100 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          item.isWaliAsrama ? 'bg-purple-700 text-white' : 'bg-indigo-100 text-indigo-900'
                        }`}>
                          {item.no}
                        </div>
                        <span className={`font-extrabold text-xs leading-tight truncate ${
                          item.isWaliAsrama ? 'text-purple-950 font-black' : 'text-slate-900'
                        }`}>
                          {item.nama}
                        </span>
                      </div>
                      {item.isWaliAsrama && (
                        <span className="bg-purple-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                          Wali Asrama
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. LEPAS PIKET / OFF */}
            <div className="bg-white rounded-3xl border border-rose-200/90 shadow-xs overflow-hidden">
              <div className="bg-rose-600 p-4 text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Coffee className="w-4 h-4 text-rose-200" />
                    <span>Lepas Piket / Off</span>
                  </div>
                  <span className="bg-rose-950/40 text-rose-100 text-xs font-black px-2.5 py-0.5 rounded-full border border-rose-400/30">
                    {groupedShifts.Off.length} Personel
                  </span>
                </div>
                <div className="text-[11px] text-rose-100 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bebas Tugas Piket</span>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto no-scrollbar bg-rose-50/20">
                {groupedShifts.Off.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium italic">
                    Tidak ada yang Off pada hari ini
                  </div>
                ) : (
                  groupedShifts.Off.map(item => (
                    <div
                      key={item.no}
                      className={`p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 ${
                        item.isWaliAsrama
                          ? 'bg-purple-100/90 border-2 border-purple-400 shadow-xs'
                          : 'bg-white border border-rose-100 hover:border-rose-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          item.isWaliAsrama ? 'bg-purple-700 text-white' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {item.no}
                        </div>
                        <span className={`font-extrabold text-xs leading-tight truncate ${
                          item.isWaliAsrama ? 'text-purple-950 font-black' : 'text-slate-900'
                        }`}>
                          {item.nama}
                        </span>
                      </div>
                      {item.isWaliAsrama && (
                        <span className="bg-purple-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                          Wali Asrama
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Ketentuan Pola Shift:</span>
              <p className="text-slate-700 leading-relaxed">
                Anita Kurniawati ditetapkan Off pada hari Minggu untuk ibadah rutin. Seluruh 38 Wali Asuh dan 9 Wali Asrama mematuhi siklus giliran kerja SE Nomor 4749/2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MATRIX VIEW TABLE */}
      {activeView === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap px-1">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Matriks Pekanan Gabungan (47 Personel)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintPDFMatriks}
                disabled={isGeneratingPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-300 shrink-0"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cetak PDF Matriks Pekanan</span>
              </button>
              <span className="text-xs font-bold text-slate-500">
                {filteredMatrixData.length} Personel
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                  <th className="px-3 py-3 text-center border-r border-slate-800 w-12">No</th>
                  <th className="px-4 py-3 border-r border-slate-800 min-w-[240px]">Nama Personel</th>
                  {DAYS_LIST.map(d => (
                    <th
                      key={d}
                      className={`px-3 py-3 text-center border-r border-slate-800 min-w-[75px] ${
                        d === currentDayName ? 'bg-amber-400 text-slate-950 font-black' : ''
                      }`}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredMatrixData.map((item) => (
                  <tr key={item.no} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-3 py-2.5 text-center font-bold text-slate-400 border-r border-slate-200">
                      {item.no}
                    </td>
                    <td className={`px-4 py-2.5 font-extrabold border-r border-slate-200 ${
                      item.isWaliAsrama ? 'bg-purple-100/90 text-purple-950 font-black' : 'text-slate-900'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 ${
                            item.isWaliAsrama ? 'bg-purple-700 text-white' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {item.no}
                          </div>
                          <span className="truncate">{item.nama}</span>
                        </div>
                        {item.isWaliAsrama && (
                          <span className="bg-purple-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase shrink-0">
                            Wali Asrama
                          </span>
                        )}
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
        </div>
      )}
    </div>
  );
}
