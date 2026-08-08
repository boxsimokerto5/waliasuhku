import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Search, ChevronLeft, Loader2, Users, FileSpreadsheet, Sun, Sunset, Moon, Coffee, Info, CheckCircle2, Printer, FileText, ShieldAlert, Sparkles, Filter, ListOrdered, MapPin } from 'lucide-react';
import { WALI_ASUH_28_DATA, SUMMARY_SHIFTS_AGUSTUS_2026, HEADER_INFO, getNamaHariAgustus2026, WaliAsuh28Item } from '../data/jadwal28Data';
import { URAIAN_KEGIATAN_HARIAN, LEGEND_KODE_WALI, ActivityItem } from '../data/jadwalHarianRinci';
import { generateRekapAbsenHarian28PDF, generateKlasifikasiShiftHarian28PDF, generateMatriksJadwal28PDF, generateSeluruhHariRekapAbsen28PDF, generateUraianTugasHarianPDF } from '../utils/pdfGenerator';

interface Jadwal28WaliAsuhProps {
  onBack?: () => void;
}

export default function Jadwal28WaliAsuh({ onBack }: Jadwal28WaliAsuhProps) {
  const [activeTab, setActiveTab] = useState<'harian' | 'uraian' | 'matriks' | 'statistik'>('harian');
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    const d = today.getDate();
    return d >= 1 && d <= 31 ? d : 1;
  }); // Automatically defaults to today's date
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnakAsuh, setSelectedAnakAsuh] = useState<string>('ALL');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ALL');
  const [searchUraianQuery, setSearchUraianQuery] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Unique Anak Asuh classes for filtering
  const anakAsuhList = useMemo(() => {
    const setClasses = new Set<string>();
    WALI_ASUH_28_DATA.forEach(item => {
      if (item.anakAsuh) setClasses.add(item.anakAsuh);
    });
    return Array.from(setClasses).sort();
  }, []);

  // Filtered dataset for matriks/rekap
  const filteredData = useMemo(() => {
    return WALI_ASUH_28_DATA.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.anakAsuh.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedAnakAsuh === 'ALL' || item.anakAsuh === selectedAnakAsuh;
      return matchSearch && matchClass;
    });
  }, [searchQuery, selectedAnakAsuh]);

  // Filtered dataset for Uraian Kegiatan Harian
  const filteredUraianData = useMemo(() => {
    return URAIAN_KEGIATAN_HARIAN.filter(item => {
      const matchShift = selectedShiftFilter === 'ALL' || item.shiftType === selectedShiftFilter;
      const matchQuery = searchUraianQuery === '' ||
        item.kegiatan.toLowerCase().includes(searchUraianQuery.toLowerCase()) ||
        item.uraian.toLowerCase().includes(searchUraianQuery.toLowerCase()) ||
        item.tempat.toLowerCase().includes(searchUraianQuery.toLowerCase()) ||
        item.waliAsuhKode.toLowerCase().includes(searchUraianQuery.toLowerCase()) ||
        item.kelas.toLowerCase().includes(searchUraianQuery.toLowerCase());
      return matchShift && matchQuery;
    });
  }, [selectedShiftFilter, searchUraianQuery]);

  // Daily classification for the selected date
  const dailyClassification = useMemo(() => {
    const pagi: WaliAsuh28Item[] = [];
    const sore: WaliAsuh28Item[] = [];
    const malam: WaliAsuh28Item[] = [];
    const offLepas: WaliAsuh28Item[] = [];
    const cutiSakit: WaliAsuh28Item[] = [];

    WALI_ASUH_28_DATA.forEach(item => {
      const shift = item.shifts[selectedDay] || '';
      if (shift === 'P') pagi.push(item);
      else if (shift === 'S') sore.push(item);
      else if (shift === 'M') malam.push(item);
      else if (shift === 'C' || shift === 'SKT') cutiSakit.push(item);
      else offLepas.push(item);
    });

    return { pagi, sore, malam, offLepas, cutiSakit };
  }, [selectedDay]);

  // Current selected day info
  const namaHariSelected = useMemo(() => {
    return getNamaHariAgustus2026(selectedDay);
  }, [selectedDay]);

  // Handlers for PDF generation
  const handlePrintKlasifikasiHarianPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateKlasifikasiShiftHarian28PDF(selectedDay, WALI_ASUH_28_DATA);
    } catch (err) {
      console.error('Gagal mencetak Klasifikasi Shift Harian PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintRekapHarianPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateRekapAbsenHarian28PDF(selectedDay, WALI_ASUH_28_DATA);
    } catch (err) {
      console.error('Gagal mencetak Rekap Absen Harian PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintSeluruhHariRekapPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateSeluruhHariRekapAbsen28PDF(WALI_ASUH_28_DATA);
    } catch (err) {
      console.error('Gagal mencetak Seluruh Rekap Absen PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintMatriksPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateMatriksJadwal28PDF(filteredData);
    } catch (err) {
      console.error('Gagal mencetak Matriks PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintUraianPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateUraianTugasHarianPDF(filteredUraianData);
    } catch (err) {
      console.error('Gagal mencetak PDF Uraian Tugas:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-4 text-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">

        {/* Navigation & Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer shrink-0"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Resmi SRMA 24 Kediri
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Agustus 2026
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Jadwal 28 Wali Asuh
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Kementerian Sosial RI — Pusat Pendidikan Pelatihan & Pengembangan Profesi
              </p>
            </div>
          </div>

          {/* Quick PDF Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintRekapHarianPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>Cetak Rekap Absen Tanggal {selectedDay}</span>
            </button>

            <button
              onClick={handlePrintMatriksPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cetak Matriks 31 Hari</span>
            </button>
          </div>
        </div>

        {/* Tab View Selector */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl max-w-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('harian')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'harian'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Klasifikasi Shift</span>
          </button>

          <button
            onClick={() => setActiveTab('uraian')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'uraian'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-600" />
            <span>Uraian Tugas SOP</span>
          </button>

          <button
            onClick={() => setActiveTab('matriks')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'matriks'
                ? 'bg-white text-indigo-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Matriks 31 Hari</span>
          </button>

          <button
            onClick={() => setActiveTab('statistik')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'statistik'
                ? 'bg-white text-purple-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Total Jam Kerja</span>
          </button>
        </div>

        {/* TAB 1: FITUR CETAK REKAP ABSEN HARIAN */}
        {activeTab === 'harian' && (
          <div className="space-y-6">

            {/* Date Selector Banner */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 shadow-lg border border-teal-600/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-teal-200 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Fitur Cetak Rekap Absen Harian Berkop Resmi</span>
                  </div>
                  <h2 className="text-2xl font-black mt-1">
                    {namaHariSelected}, {selectedDay} Agustus 2026
                  </h2>
                  <p className="text-teal-100/80 text-xs mt-1">
                    Pilih tanggal di bawah ini untuk melihat dan mencetak lembar presensi kehadiran harian 28 Wali Asuh.
                  </p>
                </div>

                {/* Print Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handlePrintKlasifikasiHarianPDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Printer className="w-4.5 h-4.5" />
                    )}
                    <span>Cetak Klasifikasi Tanggal {selectedDay} (PDF)</span>
                  </button>

                  <button
                    onClick={handlePrintSeluruhHariRekapPDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 text-teal-200" />
                    <span>Cetak Klasifikasi 31 Hari (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Day Scroll / Picker Grid */}
              <div className="mt-6 pt-5 border-t border-teal-600/40">
                <span className="text-[11px] font-bold text-teal-200 block mb-2.5 uppercase tracking-wider">
                  PILIH TANGGAL BULAN AGUSTUS 2026 (1 - 31):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    const isSelected = day === selectedDay;
                    const dayNameShort = getNamaHariAgustus2026(day).substring(0, 3);
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center justify-center min-w-[42px] h-12 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                          isSelected
                            ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md scale-105 font-black'
                            : 'bg-teal-900/40 text-teal-100 hover:bg-teal-800/60 border-teal-600/30'
                        }`}
                      >
                        <span className="text-[9px] opacity-80">{dayNameShort}</span>
                        <span className="text-sm font-extrabold leading-none">{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shift Breakdown Stats Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">Shift Pagi</span>
                  <span className="text-xl font-black text-emerald-900 mt-0.5 block">{dailyClassification.pagi.length} Wali</span>
                  <span className="text-[10px] font-semibold text-emerald-600">07:00 - 15:00 WIB</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Sun className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">Shift Sore</span>
                  <span className="text-xl font-black text-amber-900 mt-0.5 block">{dailyClassification.sore.length} Wali</span>
                  <span className="text-[10px] font-semibold text-amber-600">15:00 - 23:00 WIB</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Sunset className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">Shift Malam</span>
                  <span className="text-xl font-black text-indigo-900 mt-0.5 block">{dailyClassification.malam.length} Wali</span>
                  <span className="text-[10px] font-semibold text-indigo-600">23:00 - 08:00 WIB</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Moon className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block">Off / Cuti / Sakit</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">
                    {dailyClassification.offLepas.length + dailyClassification.cutiSakit.length} Wali
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Izin / Libur / Lepas</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-600 text-white flex items-center justify-center shadow-md">
                  <Coffee className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Classified Lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Column 1: Shift Pagi */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Shift Pagi</h3>
                      <p className="text-[10px] font-bold text-emerald-600">07:00 - 15:00 WIB</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                    {dailyClassification.pagi.length} Personel
                  </span>
                </div>

                <div className="space-y-2">
                  {dailyClassification.pagi.map(item => (
                    <div key={item.no} className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.nama}</h4>
                        <span className="text-[10px] text-emerald-700 font-extrabold block mt-0.5">
                          Bimbingan: {item.anakAsuh}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        P
                      </span>
                    </div>
                  ))}
                  {dailyClassification.pagi.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center italic">Tidak ada personel bertugas</p>
                  )}
                </div>
              </div>

              {/* Column 2: Shift Sore */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Sunset className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Shift Sore</h3>
                      <p className="text-[10px] font-bold text-amber-600">15:00 - 23:00 WIB</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full">
                    {dailyClassification.sore.length} Personel
                  </span>
                </div>

                <div className="space-y-2">
                  {dailyClassification.sore.map(item => (
                    <div key={item.no} className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.nama}</h4>
                        <span className="text-[10px] text-amber-700 font-extrabold block mt-0.5">
                          Bimbingan: {item.anakAsuh}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        S
                      </span>
                    </div>
                  ))}
                  {dailyClassification.sore.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center italic">Tidak ada personel bertugas</p>
                  )}
                </div>
              </div>

              {/* Column 3: Shift Malam & Off/Cuti */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Shift Malam & Off</h3>
                      <p className="text-[10px] font-bold text-indigo-600">23:00 - 08:00 WIB & Off</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full">
                    {dailyClassification.malam.length} Malam
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Malam:</p>
                  {dailyClassification.malam.map(item => (
                    <div key={item.no} className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.nama}</h4>
                        <span className="text-[10px] text-indigo-700 font-extrabold block mt-0.5">
                          Bimbingan: {item.anakAsuh}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        M
                      </span>
                    </div>
                  ))}

                  {dailyClassification.cutiSakit.length > 0 && (
                    <>
                      <p className="text-[11px] font-black text-rose-800 uppercase tracking-wider pt-2">Cuti / Sakit:</p>
                      {dailyClassification.cutiSakit.map(item => (
                        <div key={item.no} className="p-2.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{item.nama}</h4>
                            <span className="text-[10px] text-rose-700 font-extrabold block">
                              Status: {item.shifts[selectedDay]}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase">
                            {item.shifts[selectedDay]}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider pt-2">Off / Lepas ({dailyClassification.offLepas.length}):</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dailyClassification.offLepas.map(item => (
                      <span key={item.no} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold border border-slate-200">
                        {item.nama} ({item.shifts[selectedDay]})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: URAIAN TUGAS & SOP KEGIATAN HARIAN WALI ASUH */}
        {activeTab === 'uraian' && (
          <div className="space-y-6">

            {/* SOP Header Banner */}
            <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-amber-700/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Standar Operasional Prosedur (SOP) Keasramaan SRMA 24 Kediri</span>
                  </div>
                  <h2 className="text-2xl font-black mt-1">
                    Uraian Tugas & Pembagian Aktivitas Harian Wali Asuh
                  </h2>
                  <p className="text-amber-100/80 text-xs mt-1 max-w-3xl">
                    Rincian urutan tugas pendampingan siswa (SD, SMP, SMA) 24 jam penuh. Mengatur koordinasi lokasi, waktu, dan penugasan kode Wali Asuh Piket (M1-M4, P1-P4, S1-S12).
                  </p>
                </div>

                <button
                  onClick={handlePrintUraianPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  <span>Cetak SOP Uraian Tugas (PDF)</span>
                </button>
              </div>

              {/* Legend Badges */}
              <div className="mt-6 pt-5 border-t border-amber-700/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {LEGEND_KODE_WALI.map((leg, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-xs">
                    <div className="flex items-center justify-between font-black text-amber-300">
                      <span>{leg.kode}</span>
                      <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full text-amber-200">{leg.shift}</span>
                    </div>
                    <p className="text-[11px] text-amber-100/90 mt-1 leading-snug">{leg.deskripsi}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Shift Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
                <button
                  onClick={() => setSelectedShiftFilter('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedShiftFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Shift (27 Aktivitas)
                </button>
                <button
                  onClick={() => setSelectedShiftFilter('MALAM')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedShiftFilter === 'MALAM'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Shift Malam (M1-M4)</span>
                </button>
                <button
                  onClick={() => setSelectedShiftFilter('PAGI')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedShiftFilter === 'PAGI'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Shift Pagi (P1-P4)</span>
                </button>
                <button
                  onClick={() => setSelectedShiftFilter('SORE')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedShiftFilter === 'SORE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Sunset className="w-3.5 h-3.5" />
                  <span>Shift Sore (S1-S12)</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kegiatan, tempat, kode..."
                  value={searchUraianQuery}
                  onChange={e => setSearchUraianQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Activities Timeline / Cards List */}
            <div className="space-y-3">
              {filteredUraianData.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
                  <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600">Tidak ada uraian tugas yang sesuai dengan pencarian/filter.</p>
                </div>
              ) : (
                filteredUraianData.map((act, index) => {
                  let badgeShiftColor = 'bg-slate-100 text-slate-800 border-slate-200';
                  let borderCardColor = 'border-slate-200 hover:border-slate-300';
                  let timeBadgeColor = 'bg-slate-900 text-white';

                  if (act.shiftType === 'MALAM') {
                    badgeShiftColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                    borderCardColor = 'border-indigo-100 hover:border-indigo-300 bg-indigo-50/20';
                    timeBadgeColor = 'bg-indigo-900 text-indigo-100';
                  } else if (act.shiftType === 'PAGI') {
                    badgeShiftColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    borderCardColor = 'border-emerald-100 hover:border-emerald-300 bg-emerald-50/20';
                    timeBadgeColor = 'bg-emerald-800 text-emerald-100';
                  } else if (act.shiftType === 'SORE') {
                    badgeShiftColor = 'bg-amber-100 text-amber-900 border-amber-200';
                    borderCardColor = 'border-amber-100 hover:border-amber-300 bg-amber-50/20';
                    timeBadgeColor = 'bg-amber-800 text-amber-100';
                  }

                  return (
                    <div
                      key={act.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border ${borderCardColor} shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="shrink-0 space-y-1 text-center">
                          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-mono shadow-xs ${timeBadgeColor}`}>
                            {act.pukul} WIB
                          </span>
                          <span className="block text-[10px] font-extrabold text-slate-400">
                            Poin #{index + 1}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              Peserta: {act.kelas}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeShiftColor}`}>
                              Shift {act.shiftType}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 leading-snug">
                            {act.kegiatan}
                          </h3>

                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {act.uraian}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold pt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Lokasi: {act.tempat}</span>
                          </div>
                        </div>
                      </div>

                      {/* Code Tag */}
                      <div className="shrink-0 bg-slate-900 text-white p-3.5 rounded-2xl text-center min-w-[150px] border border-slate-800 shadow-xs">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider mb-0.5">
                          Penanggung Jawab
                        </span>
                        <span className="text-xs font-black text-white font-mono leading-tight">
                          {act.waliAsuhKode}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MATRIKS BULANAN 31 HARI */}
        {activeTab === 'matriks' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama wali / anak asuh..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedAnakAsuh}
                    onChange={e => setSelectedAnakAsuh(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Kelas Bimbingan</option>
                    {anakAsuhList.map(cls => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handlePrintMatriksPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Matriks PDF</span>
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-2.5 text-center w-8 rounded-tl-xl">No</th>
                    <th className="p-2.5 min-w-[150px]">Nama Wali Asuh</th>
                    <th className="p-2.5 w-24">Anak Asuh</th>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <th key={d} className="p-1 text-center w-6 min-w-[24px]">
                        {d}
                      </th>
                    ))}
                    <th className="p-1.5 text-center bg-emerald-700">P</th>
                    <th className="p-1.5 text-center bg-amber-700">S</th>
                    <th className="p-1.5 text-center bg-indigo-700">M</th>
                    <th className="p-1.5 text-center bg-slate-700">LP</th>
                    <th className="p-1.5 text-center bg-slate-800">O</th>
                    <th className="p-1.5 text-center bg-purple-700 rounded-tr-xl">JK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-[11px]">
                  {filteredData.map((item, idx) => (
                    <tr key={item.no} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{item.nama}</td>
                      <td className="p-2 font-extrabold text-indigo-700">{item.anakAsuh}</td>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                        const shift = item.shifts[d] || '';
                        let colorClass = 'text-slate-400';
                        if (shift === 'P') colorClass = 'text-emerald-700 font-black bg-emerald-50';
                        else if (shift === 'S') colorClass = 'text-amber-700 font-black bg-amber-50';
                        else if (shift === 'M') colorClass = 'text-indigo-700 font-black bg-indigo-50';
                        else if (shift === 'C' || shift === 'SKT') colorClass = 'text-rose-700 font-black bg-rose-50';

                        return (
                          <td key={d} className={`p-1 text-center font-mono text-[10px] ${colorClass}`}>
                            {shift}
                          </td>
                        );
                      })}
                      <td className="p-1.5 text-center font-black text-emerald-800 bg-emerald-50">{item.pFul}</td>
                      <td className="p-1.5 text-center font-black text-amber-800 bg-amber-50">{item.s}</td>
                      <td className="p-1.5 text-center font-black text-indigo-800 bg-indigo-50">{item.m}</td>
                      <td className="p-1.5 text-center font-bold text-slate-600 bg-slate-50">{item.lp}</td>
                      <td className="p-1.5 text-center font-bold text-slate-600 bg-slate-50">{item.off}</td>
                      <td className="p-1.5 text-center font-black text-purple-900 bg-purple-50">{item.jk} Jam</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: RINGKASAN JAM KERJA & STATISTIK */}
        {activeTab === 'statistik' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Rekapitulasi Jam Kerja Bulan Agustus 2026</h2>
              <p className="text-xs text-slate-500 font-medium">
                Kalkulasi total jam kerja resmi berdasarkan shift: Pagi (8 jam), Sore (8 jam), Malam (9 jam).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {WALI_ASUH_28_DATA.map(item => (
                <div key={item.no} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {item.no}
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-100">
                      Anak Asuh: {item.anakAsuh}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.nama}</h3>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Total Jam Kerja:</span>
                    <span className="text-emerald-700 font-black text-sm">{item.jk} Jam</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1">
                    <span className="bg-emerald-100 text-emerald-800 p-1 rounded-lg font-bold">Pagi: {item.pFul}</span>
                    <span className="bg-amber-100 text-amber-800 p-1 rounded-lg font-bold">Sore: {item.s}</span>
                    <span className="bg-indigo-100 text-indigo-800 p-1 rounded-lg font-bold">Malam: {item.m}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
