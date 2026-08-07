import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Search, ChevronLeft, Loader2, Users, FileSpreadsheet, Sun, Sunset, Moon, Coffee, Info, CheckCircle2, Printer, FileText, ShieldAlert } from 'lucide-react';
import {
  generateJadwal38WaliAsuhPDF,
  generateJadwal38WaliAsuhHarianPDF,
  generateJadwal38WaliAsuhSeluruhHariClassifiedPDF,
  generateRekapJamKerjaBulananPDF,
  generateJadwalWaliAsramaPDF,
  getExactMonthDayCounts
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
  { no: 42, nama: "Priselia Dian Anggraini", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "Off", Jumat: "S", Sabtu: "P", Minggu: "M" } },
  { no: 43, nama: "Nukik Riyan Aswanto (Nuki)", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "P" } },
  { no: 44, nama: "Sunarmi", isWaliAsrama: true, shifts: { Senin: "P", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "Off", Minggu: "S" } },
  { no: 45, nama: "Moh. Nursalim", isWaliAsrama: true, shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "M", Minggu: "Off" } },
  { no: 46, nama: "Rio Andriyono", isWaliAsrama: true, shifts: { Senin: "Off", Selasa: "S", Rabu: "M", Kamis: "M", Jumat: "M", Sabtu: "M", Minggu: "M" } },
  { no: 47, nama: "Sifa Nasywa", isWaliAsrama: true, shifts: { Senin: "M", Selasa: "M", Rabu: "M", Kamis: "M", Jumat: "Off", Sabtu: "S", Minggu: "M" } }
];

export const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
export type DayName = typeof DAYS_LIST[number];

export const MONTH_OPTIONS = [
  { year: 2026, month: 8, name: 'Agustus 2026', label: 'Agustus 2026' },
  { year: 2026, month: 9, name: 'September 2026', label: 'September 2026' },
  { year: 2026, month: 10, name: 'Oktober 2026', label: 'Oktober 2026' },
  { year: 2026, month: 11, name: 'November 2026', label: 'November 2026' },
  { year: 2026, month: 12, name: 'Desember 2026', label: 'Desember 2026' },
  { year: 2027, month: 1, name: 'Januari 2027', label: 'Januari 2027' },
  { year: 2027, month: 2, name: 'Februari 2027', label: 'Februari 2027' },
];

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
  const [activeView, setActiveView] = useState<'classified' | 'matrix' | 'wali_asrama' | 'rekap_jam'>('classified');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0); // 0 = Agustus 2026
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'wali_asuh' | 'wali_asrama'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const curMonthOpt = MONTH_OPTIONS[selectedMonthIdx] || MONTH_OPTIONS[0];
  const { daysInMonth, counts: monthDayCounts } = useMemo(() => {
    return getExactMonthDayCounts(curMonthOpt.year, curMonthOpt.month);
  }, [curMonthOpt]);

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

  // Rekap Jam Kerja Bulanan Data & Stats
  const rekapJamData = useMemo(() => {
    let list = [...WALI_ASUH_38_DATA];
    if (categoryFilter === 'wali_asuh') {
      list = list.filter(item => !item.isWaliAsrama);
    } else if (categoryFilter === 'wali_asrama') {
      list = list.filter(item => item.isWaliAsrama);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.nama.toLowerCase().includes(q));
    }

    return list.map((item) => {
      let pCount = 0;
      let sCount = 0;
      let mCount = 0;
      let offCount = 0;

      let pDaysMonth = 0;
      let sDaysMonth = 0;
      let mDaysMonth = 0;

      DAYS_LIST.forEach(d => {
        const shift = item.shifts[d];
        const dayOcc = monthDayCounts[d] || 0;
        if (shift === 'P') {
          pCount++;
          pDaysMonth += dayOcc;
        } else if (shift === 'S') {
          sCount++;
          sDaysMonth += dayOcc;
        } else if (shift === 'M') {
          mCount++;
          mDaysMonth += dayOcc;
        } else {
          offCount++;
        }
      });

      const totalShiftWk = pCount + sCount + mCount;
      const jamPekanan = totalShiftWk * 8;
      const hariKerjaBulanan = pDaysMonth + sDaysMonth + mDaysMonth;
      const jamBulanan = hariKerjaBulanan * 8;

      return {
        ...item,
        pCount,
        sCount,
        mCount,
        offCount,
        totalShiftWk,
        jamPekanan,
        hariKerjaBulanan,
        jamBulanan
      };
    });
  }, [categoryFilter, searchQuery, monthDayCounts]);

  const rekapStats = useMemo(() => {
    const totalStaff = rekapJamData.length;
    let totalP = 0;
    let totalS = 0;
    let totalM = 0;
    let totalJamBulananAll = 0;
    let totalHariKerjaBulananAll = 0;

    rekapJamData.forEach(item => {
      totalP += item.pCount;
      totalS += item.sCount;
      totalM += item.mCount;
      totalJamBulananAll += item.jamBulanan;
      totalHariKerjaBulananAll += item.hariKerjaBulanan;
    });

    const avgJamBulanan = totalStaff > 0 ? Math.round((totalJamBulananAll / totalStaff) * 10) / 10 : 0;
    const avgHariKerjaBulanan = totalStaff > 0 ? Math.round((totalHariKerjaBulananAll / totalStaff) * 10) / 10 : 0;

    return {
      totalStaff,
      totalP,
      totalS,
      totalM,
      totalJamBulananAll: Math.round(totalJamBulananAll),
      totalHariKerjaBulananAll: Math.round(totalHariKerjaBulananAll * 10) / 10,
      avgJamBulanan,
      avgHariKerjaBulanan
    };
  }, [rekapJamData]);

  const handlePrintPDFHarian = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhHarianPDF(selectedDay, filteredMatrixData);
    } catch (err) {
      console.error('Failed to generate daily classified PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFSeluruhHari = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhSeluruhHariClassifiedPDF(filteredMatrixData);
    } catch (err) {
      console.error('Failed to generate all days classified PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFMatriks = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwal38WaliAsuhPDF(filteredMatrixData);
    } catch (err) {
      console.error('Failed to generate matrix PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFWaliAsrama = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateJadwalWaliAsramaPDF(filteredMatrixData);
    } catch (err) {
      console.error('Failed to generate Wali Asrama PDF', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPDFRekapBulanan = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateRekapJamKerjaBulananPDF(
        rekapJamData,
        curMonthOpt.year,
        curMonthOpt.month,
        curMonthOpt.name
      );
    } catch (err) {
      console.error('Failed to generate rekap jam kerja PDF', err);
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

  const handleExportCSVJamKerja = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `No,Nama,Kategori,Shift Pagi (P),Shift Sore (S),Shift Malam (M),Off/Lepas Piket,Total Shift/Minggu,Jam Kerja/Minggu,Hari Kerja Masuk Bulanan (${curMonthOpt.name} - ${daysInMonth} Hari),Total Jam Bulanan (${curMonthOpt.name} - ${daysInMonth} Hari)\n`;
    
    rekapJamData.forEach(item => {
      csvContent += `"${item.no}","${item.nama}","${item.isWaliAsrama ? 'Wali Asrama' : 'Wali Asuh'}","${item.pCount}","${item.sCount}","${item.mCount}","${item.offCount}","${item.totalShiftWk}","${item.jamPekanan}","${item.hariKerjaBulanan} Hari","${item.jamBulanan} Jam"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Jam_Kerja_${curMonthOpt.name.replace(/\s+/g, '_')}_47_Personel.csv`);
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

          <button
            type="button"
            onClick={() => setActiveView('wali_asrama')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'wali_asrama'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-purple-800 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>Khusus 9 Wali Asrama</span>
            <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              9 Staff
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('rekap_jam')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'rekap_jam'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Rekap Jam Kerja Bulanan</span>
            <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              47 Staff
            </span>
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

      {/* KHUSUS 9 WALI ASRAMA VIEW */}
      {activeView === 'wali_asrama' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/30 text-purple-200 text-xs font-black px-3 py-1 rounded-full border border-purple-400/30">
                  Layanan 24/7 Asrama
                </span>
                <span className="bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                  9 Personel Khusus
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Jadwal Kerja Operasional Khusus 9 Wali Asrama
              </h2>
              <p className="text-xs text-purple-200 font-medium max-w-2xl">
                Rincian tugas 9 Wali Asrama (Eko Warasno, Widiastutik, Hartor, Priselia, Nukik/Nuki, Sunarmi, Nursalim, Rio, Sifa) untuk menjaga asrama selama 24 jam nonstop dari Senin hingga Minggu.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrintPDFWaliAsrama}
              disabled={isGeneratingPDF}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>Cetak PDF Jadwal Wali Asrama</span>
            </button>
          </div>

          {/* Special Focus Box for Nuki / Nukik Riyan Aswanto */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-amber-950 shadow-md space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="font-black text-sm text-amber-900 uppercase tracking-wide">
                📌 Penjelasan Detail Status Jadwal Nuki (Nukik Riyan Aswanto)
              </h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              <span className="font-black text-amber-900">Mengapa Nuki tidak hilang di hari Sabtu?</span> Nuki <span className="underline decoration-amber-500 font-extrabold">(Nukik Riyan Aswanto - No. 43)</span> mematuhi sistem rotasi 7 hari bergilir untuk 9 Wali Asrama sebagai berikut:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Senin</span>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-md inline-block">🌙 Malam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Selasa</span>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-md inline-block">🌙 Malam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Rabu</span>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-md inline-block">🌙 Malam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Kamis</span>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-md inline-block">🌙 Malam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Jumat</span>
                <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded-md inline-block">🛌 Off</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-center space-y-1 shadow-xs">
                <span className="text-[10px] font-black text-amber-900 block uppercase">Sabtu ★</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md inline-block shadow-2xs">🌆 Sore</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="text-[10px] font-black text-emerald-800 block uppercase">Minggu</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md inline-block">☀️ Pagi</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-900 font-medium italic">
              *Catatan: Hari Sabtu Nuki bertugas sore jam 15.00 - 23.00 WIB bersama Sifa Nasywa. Hari Minggu Nuki bertugas pagi jam 07.00 - 15.00 WIB.
            </p>
          </div>

          {/* 7-Day Schedule Cards specifically for Wali Asrama */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Rincian Penugasan Wali Asrama Per Hari (Senin – Minggu)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DAYS_LIST.map((dayName) => {
                const waliAsramaToday = WALI_ASUH_38_DATA.filter(i => i.isWaliAsrama);
                const pagi = waliAsramaToday.filter(i => i.shifts[dayName] === 'P');
                const sore = waliAsramaToday.filter(i => i.shifts[dayName] === 'S');
                const malam = waliAsramaToday.filter(i => i.shifts[dayName] === 'M');
                const off = waliAsramaToday.filter(i => i.shifts[dayName] === 'Off');

                const isSabtu = dayName === 'Sabtu';

                return (
                  <div
                    key={dayName}
                    className={`bg-white rounded-3xl border ${
                      isSabtu ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-purple-200'
                    } shadow-xs overflow-hidden space-y-3 p-4`}
                  >
                    <div className={`flex items-center justify-between p-2.5 rounded-2xl ${
                      isSabtu ? 'bg-amber-400 text-slate-950 font-black' : 'bg-purple-900 text-white font-black'
                    }`}>
                      <span className="text-xs">{dayName}</span>
                      {isSabtu && (
                        <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          Highlight Nuki Sore
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Pagi */}
                      <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                        <span className="font-extrabold text-[10px] text-emerald-800 uppercase block mb-1">
                          ☀️ Pagi (07.00 - 15.00):
                        </span>
                        {pagi.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        ) : (
                          pagi.map(p => (
                            <span key={p.no} className="block font-black text-emerald-950 text-[11px]">
                              • {p.nama}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Sore */}
                      <div className={`p-2 rounded-xl border ${
                        isSabtu ? 'bg-amber-100 border-amber-300 ring-1 ring-amber-400' : 'bg-amber-50/80 border-amber-100'
                      }`}>
                        <span className="font-extrabold text-[10px] text-amber-900 uppercase block mb-1">
                          🌆 Sore (15.00 - 23.00):
                        </span>
                        {sore.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        ) : (
                          sore.map(s => (
                            <span
                              key={s.no}
                              className={`block text-[11px] ${
                                s.nama.includes('Nuki')
                                  ? 'font-black text-purple-950 bg-amber-300 px-1.5 py-0.5 rounded-md my-0.5 shadow-2xs'
                                  : 'font-extrabold text-amber-950'
                              }`}
                            >
                              • {s.nama} {s.nama.includes('Nuki') && '★'}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Malam */}
                      <div className="bg-indigo-50/80 p-2 rounded-xl border border-indigo-100">
                        <span className="font-extrabold text-[10px] text-indigo-800 uppercase block mb-1">
                          🌙 Malam (23.00 - 07.00):
                        </span>
                        {malam.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        ) : (
                          malam.map(m => (
                            <span key={m.no} className="block font-bold text-indigo-950 text-[11px]">
                              • {m.nama}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Off */}
                      <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                        <span className="font-extrabold text-[10px] text-rose-800 uppercase block mb-1">
                          ☕ Off / Lepas Piket:
                        </span>
                        {off.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        ) : (
                          off.map(o => (
                            <span key={o.no} className="block font-semibold text-rose-950 text-[11px]">
                              • {o.nama}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Table Matrix for 9 Wali Asrama */}
          <div className="bg-white rounded-3xl border border-purple-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-purple-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <span>Matriks Jadwal Kerja Pekanan Khusus 9 Wali Asrama</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Siklus kerja 7 hari penuh untuk 9 Wali Asrama SRT 1 Kabupaten Kediri
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrintPDFWaliAsrama}
                disabled={isGeneratingPDF}
                className="px-3.5 py-1.5 bg-purple-100 text-purple-900 hover:bg-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-900 text-white font-black text-[11px]">
                    <th className="py-2.5 px-3 rounded-l-xl text-center">No</th>
                    <th className="py-2.5 px-3">Nama Wali Asrama</th>
                    {DAYS_LIST.map(d => (
                      <th key={d} className={`py-2.5 px-2 text-center ${d === 'Sabtu' ? 'bg-amber-500 text-slate-950 font-black' : ''}`}>
                        {d}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 rounded-r-xl text-center">Total Jam/Wk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 font-medium text-slate-800">
                  {WALI_ASUH_38_DATA.filter(i => i.isWaliAsrama).map((item, idx) => {
                    const isNuki = item.nama.includes('Nuki');
                    let totalShift = 0;

                    return (
                      <tr
                        key={item.no}
                        className={`transition-all ${
                          isNuki ? 'bg-amber-100/80 font-black ring-2 ring-amber-400' : idx % 2 === 0 ? 'bg-purple-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-purple-950">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-extrabold text-purple-950 flex items-center gap-2">
                          <span>{item.nama}</span>
                          {isNuki && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                              Dipertanyakan User
                            </span>
                          )}
                        </td>
                        {DAYS_LIST.map(d => {
                          const code = item.shifts[d];
                          if (code !== 'Off') totalShift++;

                          return (
                            <td key={d} className="py-2.5 px-2 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  code === 'P'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : code === 'S'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : code === 'M'
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {code}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-black text-purple-950">
                          {totalShift * 8} Jam ({totalShift} shift)
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

      {/* REKAP JAM KERJA BULANAN VIEW */}
      {activeView === 'rekap_jam' && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Personel</p>
                <p className="text-xl font-black text-slate-900">{rekapStats.totalStaff} <span className="text-xs font-semibold text-slate-500">Orang</span></p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">38 Wali Asuh + 9 Wali Asrama</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Hari Masuk</p>
                <p className="text-xl font-black text-indigo-900">{rekapStats.avgHariKerjaBulanan} <span className="text-xs font-semibold text-slate-500">Hari/Bln</span></p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Setara {rekapStats.avgJamBulanan} Jam/Personel</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Akumulasi Tim</p>
                <p className="text-xl font-black text-teal-700">{rekapStats.totalHariKerjaBulananAll.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Hari Masuk</span></p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Total {rekapStats.totalJamBulananAll.toLocaleString('id-ID')} Jam Operasional</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rincian Shift Pekanan</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {rekapStats.totalP} P
                  </span>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {rekapStats.totalS} S
                  </span>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {rekapStats.totalM} M
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Category Filter & Month Basis Selector & Export */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Filter Kategori */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">
                  Filter Kategori:
                </span>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Personel (47)
                </button>
                <button
                  onClick={() => setCategoryFilter('wali_asuh')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    categoryFilter === 'wali_asuh'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  38 Wali Asuh
                </button>
                <button
                  onClick={() => setCategoryFilter('wali_asrama')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    categoryFilter === 'wali_asrama'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  }`}
                >
                  9 Wali Asrama
                </button>
              </div>

              {/* Pilih Bulan / Basis Kalender Real */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">
                  Pilih Bulan Kalender:
                </span>
                {MONTH_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.name}
                    onClick={() => setSelectedMonthIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedMonthIdx === idx
                        ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Penjelasan Presisi Kalender */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-black text-slate-900">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Rincian Kalender Presisi Bulan {curMonthOpt.name} ({daysInMonth} Hari)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                Jumlah kemunculan hari: <span className="font-bold text-slate-900">{monthDayCounts.Senin}x Senin</span>, <span className="font-bold text-slate-900">{monthDayCounts.Selasa}x Selasa</span>, <span className="font-bold text-slate-900">{monthDayCounts.Rabu}x Rabu</span>, <span className="font-bold text-slate-900">{monthDayCounts.Kamis}x Kamis</span>, <span className="font-bold text-slate-900">{monthDayCounts.Jumat}x Jumat</span>, <span className="font-bold text-slate-900">{monthDayCounts.Sabtu}x Sabtu</span>, dan <span className="font-bold text-slate-900">{monthDayCounts.Minggu}x Minggu</span>.
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                📌 <strong className="text-indigo-900">Perhitungan Hari Masuk Real:</strong> Personel dengan jadwal Lepas Piket (Off) di hari yang muncul <strong className="text-slate-900">5 kali</strong> (misal Minggu/Senin/Sabtu di {curMonthOpt.name}) mendapat 5 hari libur, sehingga bertugas <strong className="text-emerald-700">{daysInMonth - 5} Hari Masuk ({ (daysInMonth - 5) * 8 } Jam)</strong>. Sedangkan personel dengan Off di hari yang muncul <strong className="text-slate-900">4 kali</strong> (misal Selasa/Rabu/Kamis/Jumat) mendapat 4 hari libur, sehingga bertugas <strong className="text-emerald-700">{daysInMonth - 4} Hari Masuk ({ (daysInMonth - 4) * 8 } Jam)</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Info className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Menampilkan <strong className="text-slate-900">{rekapJamData.length} personel</strong> untuk periode <strong className="text-teal-800">{curMonthOpt.name}</strong> ({daysInMonth} Hari)</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrintPDFRekapBulanan}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  <span>Cetak PDF Rekap Bulanan</span>
                </button>

                <button
                  onClick={handleExportCSVJamKerja}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV Rekap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rekap Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                    <th className="px-3 py-3 text-center border-r border-slate-800 w-12">No</th>
                    <th className="px-4 py-3 border-r border-slate-800 min-w-[200px]">Nama Personel</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[100px]">Kategori</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[65px] bg-emerald-950/80 text-emerald-300">Pagi (8j)</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[65px] bg-amber-950/80 text-amber-300">Sore (8j)</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[65px] bg-indigo-950/80 text-indigo-300">Malam (8j)</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[65px] bg-rose-950/80 text-rose-300">Off</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[80px] bg-slate-800">Shift/Pekan</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[90px] bg-slate-800">Jam/Pekan</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[125px] bg-indigo-950 text-indigo-200">Hari Masuk ({daysInMonth} Hari)</th>
                    <th className="px-3 py-3 text-center border-r border-slate-800 min-w-[125px] bg-teal-900 text-teal-200">Total Jam ({daysInMonth} Hari)</th>
                    <th className="px-3 py-3 text-center min-w-[100px]">Status Beban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rekapJamData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400 font-bold">
                        Tidak ada personel yang sesuai dengan kriteria pencarian/filter.
                      </td>
                    </tr>
                  ) : (
                    rekapJamData.map((item, idx) => (
                      <tr key={item.no} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-400 border-r border-slate-200">
                          {idx + 1}
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
                        <td className="px-3 py-2.5 text-center font-bold text-slate-600 border-r border-slate-200">
                          {item.isWaliAsrama ? (
                            <span className="text-purple-800 font-extrabold">Wali Asrama</span>
                          ) : (
                            <span className="text-slate-700">Wali Asuh</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-emerald-800 bg-emerald-50/40 border-r border-slate-200">
                          {item.pCount} shift
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-amber-800 bg-amber-50/40 border-r border-slate-200">
                          {item.sCount} shift
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-indigo-800 bg-indigo-50/40 border-r border-slate-200">
                          {item.mCount} shift
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-rose-800 bg-rose-50/40 border-r border-slate-200">
                          {item.offCount} hari
                        </td>
                        <td className="px-3 py-2.5 text-center font-black text-slate-900 bg-slate-50 border-r border-slate-200">
                          {item.totalShiftWk} Shift
                        </td>
                        <td className="px-3 py-2.5 text-center font-black text-slate-900 bg-slate-50 border-r border-slate-200">
                          {item.jamPekanan} Jam
                        </td>
                        <td className="px-3 py-2.5 text-center font-black text-indigo-950 bg-indigo-50/80 border-r border-slate-200 text-xs">
                          {item.hariKerjaBulanan} Hari
                        </td>
                        <td className="px-3 py-2.5 text-center font-black text-teal-800 bg-teal-50 border-r border-slate-200 text-xs">
                          {item.jamBulanan} Jam
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Ideal SE 4749
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black">
                    <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wider text-[11px] border-r border-slate-800">
                      TOTAL AKUMULASI ({rekapJamData.length} Personel)
                    </td>
                    <td className="px-3 py-3 text-center text-emerald-300 border-r border-slate-800">
                      {rekapStats.totalP} Shift
                    </td>
                    <td className="px-3 py-3 text-center text-amber-300 border-r border-slate-800">
                      {rekapStats.totalS} Shift
                    </td>
                    <td className="px-3 py-3 text-center text-indigo-300 border-r border-slate-800">
                      {rekapStats.totalM} Shift
                    </td>
                    <td className="px-3 py-3 text-center text-rose-300 border-r border-slate-800">
                      -
                    </td>
                    <td className="px-3 py-3 text-center text-white border-r border-slate-800">
                      {rekapStats.totalP + rekapStats.totalS + rekapStats.totalM} Shift
                    </td>
                    <td className="px-3 py-3 text-center text-white border-r border-slate-800">
                      {(rekapStats.totalP + rekapStats.totalS + rekapStats.totalM) * 8} Jam
                    </td>
                    <td className="px-3 py-3 text-center text-indigo-200 bg-indigo-950 text-xs font-black border-r border-slate-800">
                      {rekapStats.totalHariKerjaBulananAll.toLocaleString('id-ID')} Hari
                    </td>
                    <td className="px-3 py-3 text-center text-teal-300 bg-teal-950 text-xs font-black border-r border-slate-800">
                      {rekapStats.totalJamBulananAll.toLocaleString('id-ID')} Jam
                    </td>
                    <td className="px-3 py-3 text-center text-emerald-400 text-[10px] uppercase font-black">
                      Sesuai SE 4749/2026
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
