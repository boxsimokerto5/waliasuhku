import React, { useState, useEffect } from 'react';
import { User, MonthlyReportRecord } from '../types';
import { generateStudentMonthlyReportPDF } from '../utils/pdfGenerator';
import { 
  Calendar, 
  FileText, 
  Printer, 
  Save, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  HeartPulse, 
  BookOpen, 
  Award, 
  ArrowLeft,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonthlyReportManagementProps {
  currentUser: User;
  users: User[];
  onUpdateChildBiodata: (childId: string, updatedFields: Partial<User>) => void;
  onBackToDashboard?: () => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const YEARS = [2024, 2025, 2026, 2027];

export default function MonthlyReportManagement({
  currentUser,
  users,
  onUpdateChildBiodata,
  onBackToDashboard
}: MonthlyReportManagementProps) {
  // Get children associated with current wali_asuh
  const myChildren = users.filter(
    u => u.role === 'anak_asuh' && u.waliAsuhId === currentUser.id
  );

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0]?.id || '');

  // Form states for currently selected child + month/year
  const [healthStatus, setHealthStatus] = useState<string>('Sangat Sehat');
  const [healthNotes, setHealthNotes] = useState<string>('');
  const [monthlyActivities, setMonthlyActivities] = useState<string>('');
  const [characterNotes, setCharacterNotes] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedMonthName = MONTH_NAMES[selectedMonth];
  const selectedMonthYearLabel = `${selectedMonthName} ${selectedYear}`;
  const reportKeyId = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  const activeChild = myChildren.find(c => c.id === selectedChildId);

  // Sync form state whenever selectedChildId, selectedMonth, or selectedYear changes
  useEffect(() => {
    if (!activeChild) return;

    // Check if the student has a saved report for this specific month/year
    const existingRecord = activeChild.monthlyReports?.find(r => r.id === reportKeyId || r.monthYearLabel === selectedMonthYearLabel);

    if (existingRecord) {
      setHealthStatus(existingRecord.healthStatus || 'Sangat Sehat');
      setHealthNotes(existingRecord.healthNotes || '');
      setMonthlyActivities(existingRecord.monthlyActivities || '');
      setCharacterNotes(existingRecord.characterNotes || '');
    } else {
      // Fallback to default / standard fields or sample defaults
      setHealthStatus(activeChild.healthStatus || 'Sangat Sehat');
      setHealthNotes(activeChild.healthNotes || 'Siswa dalam kondisi sangat baik dan fit. Selalu menjaga kebersihan diri serta lingkungan asrama.');
      setMonthlyActivities(activeChild.monthlyActivities || 'Siswa aktif mengikuti rangkaian ibadah wajib berjamaah, program kebersihan berkala di asrama, kajian keislaman malam hari, serta bimbingan belajar rutin mingguan.');
      setCharacterNotes(activeChild.characterNotes || 'Menunjukkan sikap yang sopan santun kepada pengurus, rukun dengan sesama teman satu kamar, dan selalu tanggap dalam melaksanakan arahan dari Wali Asuh.');
    }
  }, [selectedChildId, selectedMonth, selectedYear, activeChild]);

  // Filter children by search query
  const filteredChildren = myChildren.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveReport = () => {
    if (!activeChild) return;
    setIsSaving(true);

    const updatedRecord: MonthlyReportRecord = {
      id: reportKeyId,
      month: String(selectedMonth + 1).padStart(2, '0'),
      year: selectedYear,
      monthYearLabel: selectedMonthYearLabel,
      healthStatus,
      healthNotes,
      monthlyActivities,
      characterNotes,
      updatedAt: new Date().toISOString()
    };

    const existingReports = activeChild.monthlyReports || [];
    const otherReports = existingReports.filter(r => r.id !== reportKeyId && r.monthYearLabel !== selectedMonthYearLabel);
    const newMonthlyReports = [...otherReports, updatedRecord];

    // Save to user object
    onUpdateChildBiodata(activeChild.id, {
      monthlyReports: newMonthlyReports,
      // Also update latest current fields
      healthStatus,
      healthNotes,
      monthlyActivities,
      characterNotes
    });

    setTimeout(() => {
      setIsSaving(false);
      showToast(`Laporan bulanan ${activeChild.name} periode ${selectedMonthYearLabel} berhasil disimpan!`);
    }, 600);
  };

  const handlePrintSinglePdf = async () => {
    if (!activeChild) return;
    setIsGeneratingPdf(true);

    try {
      await generateStudentMonthlyReportPDF(activeChild, users, {
        paperSize: 'f4',
        selectedMonthYear: selectedMonthYearLabel,
        customHealthStatus: healthStatus,
        customHealthNotes: healthNotes,
        customMonthlyActivities: monthlyActivities,
        customCharacterNotes: characterNotes
      });
      showToast(`PDF Laporan ${activeChild.name} (${selectedMonthYearLabel}) berhasil diunduh!`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintBatchPdf = async () => {
    if (myChildren.length === 0) return;
    setIsGeneratingPdf(true);

    try {
      for (const child of myChildren) {
        const record = child.monthlyReports?.find(r => r.id === reportKeyId || r.monthYearLabel === selectedMonthYearLabel);
        await generateStudentMonthlyReportPDF(child, users, {
          paperSize: 'f4',
          selectedMonthYear: selectedMonthYearLabel,
          customHealthStatus: record?.healthStatus || child.healthStatus,
          customHealthNotes: record?.healthNotes || child.healthNotes,
          customMonthlyActivities: record?.monthlyActivities || child.monthlyActivities,
          customCharacterNotes: record?.characterNotes || child.characterNotes
        });
      }
      showToast(`Semua PDF Laporan (${myChildren.length} Siswa) periode ${selectedMonthYearLabel} berhasil diunduh!`);
    } catch (err) {
      console.error('Batch PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Helper template fillers
  const applyTemplate = (type: 'kesehatan' | 'kegiatan' | 'karakter') => {
    if (type === 'kesehatan') {
      setHealthNotes(`Siswa ${activeChild?.name || 'Siswa'} berada dalam kondisi fisik yang prima pada bulan ${selectedMonthName}. Menjalankan pola istirahat teratur, tidak ada keluhan sakit berkepanjangan, dan rutin mengikuti olahraga pagi asrama.`);
    } else if (type === 'kegiatan') {
      setMonthlyActivities(`Selama bulan ${selectedMonthYearLabel}, siswa aktif mengikuti seluruh agenda asrama: Shalat berjamaah 5 waktu, Kajian Kitab/Hadits rutin, Bimbingan Belajar malam, serta Program Kerja Bakti Bersama.`);
    } else if (type === 'karakter') {
      setCharacterNotes(`Menunjukkan peningkatan kedisiplinan dan tanggung jawab pada bulan ${selectedMonthName}. Memiliki tutur kata yang santun kepada Wali Asuh serta saling tolong-menolong sesama penghuni asrama.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast Floating */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 animate-bounce" />
            <span className="text-xs font-semibold">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white bg-white/10 px-3 py-1.5 rounded-full mb-3 backdrop-blur-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Dashboard Utama
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-500/30 backdrop-blur-md rounded-2xl text-indigo-200 border border-indigo-400/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Laporan Bulanan Pembinaan Siswa</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Kelola, perbarui, dan cetak laporan perkembangan siswa berdasarkan periode bulan (April, Mei, Juni, dst.)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrintBatchPdf}
            disabled={isGeneratingPdf || myChildren.length === 0}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan Semua Siswa ({selectedMonthYearLabel})</span>
          </button>
        </div>
      </div>

      {/* Periode Selector & Quick Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Month and Year Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-900 px-3 py-2 rounded-xl border border-indigo-100 font-semibold text-xs">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Pilih Periode Laporan:</span>
          </div>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                Bulan {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Period Badge */}
        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border border-slate-200">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            Periode Aktif: <strong className="text-indigo-700">{selectedMonthYearLabel}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Student List Sidebar + Report Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Student List Selection (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Pilih Anak Asuh ({myChildren.length})
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Student Cards List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredChildren.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Siswa tidak ditemukan.
              </div>
            ) : (
              filteredChildren.map((child) => {
                const isSelected = child.id === selectedChildId;
                const hasCustomReport = child.monthlyReports?.some(r => r.id === reportKeyId || r.monthYearLabel === selectedMonthYearLabel);

                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-200 overflow-hidden">
                      {child.fotoUrl ? (
                        <img src={child.fotoUrl} alt={child.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{child.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {child.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {child.category || 'Asrama / Umum'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {hasCustomReport ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Ada Laporan
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Monthly Report Editor Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeChild ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-6">
              
              {/* Selected Student Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 border-2 border-indigo-200 shadow-xs overflow-hidden">
                    {activeChild.fotoUrl ? (
                      <img src={activeChild.fotoUrl} alt={activeChild.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{activeChild.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeChild.name}</h3>
                    <p className="text-xs text-slate-500">
                      Kelompok: <span className="font-semibold text-indigo-600">{activeChild.category || 'Umum'}</span> • Periode Laporan: <strong className="text-slate-800">{selectedMonthYearLabel}</strong>
                    </p>
                  </div>
                </div>

                {/* Print PDF Button for active student */}
                <button
                  onClick={handlePrintSinglePdf}
                  disabled={isGeneratingPdf}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF Laporan Ini</span>
                </button>
              </div>

              {/* Form Section 1: Health Status */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    1. Status & Catatan Kesehatan Siswa ({selectedMonthYearLabel})
                  </label>
                  <button
                    type="button"
                    onClick={() => applyTemplate('kesehatan')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Gunakan Contoh Teks
                  </button>
                </div>

                {/* Health Status Pills */}
                <div className="flex flex-wrap gap-2">
                  {['Sangat Sehat', 'Sehat dengan Catatan', 'Pemulihan', 'Kurang Sehat / Sakit'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setHealthStatus(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        healthStatus === status
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  placeholder={`Tuliskan rincian catatan kesehatan siswa pada bulan ${selectedMonthYearLabel}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Form Section 2: Activities & Guidance */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    2. Kegiatan & Pembinaan Asrama ({selectedMonthYearLabel})
                  </label>
                  <button
                    type="button"
                    onClick={() => applyTemplate('kegiatan')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Gunakan Contoh Teks
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={monthlyActivities}
                  onChange={(e) => setMonthlyActivities(e.target.value)}
                  placeholder={`Tuliskan rangkaian kegiatan ibadah, kajian, kebersihan, dan belajar yang diikuti siswa pada bulan ${selectedMonthYearLabel}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Form Section 3: Character & Behaviour Notes */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    3. Perkembangan Karakter & Akhlak ({selectedMonthYearLabel})
                  </label>
                  <button
                    type="button"
                    onClick={() => applyTemplate('karakter')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Gunakan Contoh Teks
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={characterNotes}
                  onChange={(e) => setCharacterNotes(e.target.value)}
                  placeholder={`Tuliskan perkembangan sikap, adab, interaksi dengan sesama kawan, serta respon bimbingan siswa pada bulan ${selectedMonthYearLabel}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : `Simpan Catatan Laporan (${selectedMonthYearLabel})`}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Pilih siswa di sebelah kiri untuk mengedit laporan bulanan.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
