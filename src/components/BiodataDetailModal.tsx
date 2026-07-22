import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, CreditCard, Camera, Sparkles, Award, Trash2, Plus, Edit2, Check, ExternalLink, Upload, FileText, Eye, Heart, ImageIcon, ClipboardList, Shield, Smile, BookOpen, PhoneCall } from 'lucide-react';
import { User } from '../types';
import { generateStudentPortfolioPDF, generateStudentMonthlyReportPDF } from '../utils/pdfGenerator';

interface BiodataDetailModalProps {
  child: User;
  onClose: () => void;
  onSaveBiodata: (childId: string, updatedFields: Partial<User>) => Promise<void> | void;
  onAddPortfolio: (childId: string, title: string, description: string, date: string, category: any) => Promise<void> | void;
  onDeletePortfolio: (childId: string, portfolioId: string) => Promise<void> | void;
  users?: User[];
}

export default function BiodataDetailModal({
  child,
  onClose,
  onSaveBiodata,
  onAddPortfolio,
  onDeletePortfolio,
  users = [],
}: BiodataDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'biodata' | 'portofolio' | 'laporan' | 'galeri' | 'asesmen'>('biodata');
  
  // Laporan Bulanan States
  const [healthStatus, setHealthStatus] = useState<string>(child.healthStatus || 'Sangat Sehat');
  const [healthNotes, setHealthNotes] = useState<string>(child.healthNotes || '');
  const [monthlyActivities, setMonthlyActivities] = useState<string>(child.monthlyActivities || '');
  const [characterNotes, setCharacterNotes] = useState<string>(child.characterNotes || '');
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Gallery States
  const [galleryPhotoUrl, setGalleryPhotoUrl] = useState<string>('');
  const [galleryCaption, setGalleryCaption] = useState<string>('');
  const [galleryDate, setGalleryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddingGalleryPhoto, setIsAddingGalleryPhoto] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  
  // Edit Biodata State
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(child.name);
  const [editedFotoUrl, setEditedFotoUrl] = useState(child.fotoUrl || '');
  const [editedFotoKkUrl, setEditedFotoKkUrl] = useState(child.fotoKkUrl || '');
  const [editedFotoBpjsUrl, setEditedFotoBpjsUrl] = useState(child.fotoBpjsUrl || '');
  const [editedAlamat, setEditedAlamat] = useState(child.alamat || '');
  const [editedNik, setEditedNik] = useState(child.nik || '');
  const [editedKk, setEditedKk] = useState(child.kk || '');
  const [editedParentPhone, setEditedParentPhone] = useState(child.parentPhone || '');
  const [editedEmail, setEditedEmail] = useState(child.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Document previews
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);
  const [bpjsPreview, setBpjsPreview] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Add Portfolio State
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portDate, setPortDate] = useState(new Date().toISOString().split('T')[0]);
  const [portCategory, setPortCategory] = useState<'Akademik' | 'Prestasi' | 'Sikap' | 'Karya' | 'Olahraga' | 'Lainnya'>('Prestasi');
  const [isAddingPort, setIsAddingPort] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // PDF download options
  const [pdfPaperSize, setPdfPaperSize] = useState<'a4' | 'f4'>('f4');
  const [pdfIncludePhoto, setPdfIncludePhoto] = useState(true);
  const [pdfIncludeAddress, setPdfIncludeAddress] = useState(true);
  const [pdfIncludeKkNik, setPdfIncludeKkNik] = useState(true);
  const [pdfIncludeDocPhotos, setPdfIncludeDocPhotos] = useState(false);
  const [pdfIncludeAssessment, setPdfIncludeAssessment] = useState(true);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file foto maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setEditedFotoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file foto KK maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setKkPreview(base64String);
        setEditedFotoKkUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBpjsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file foto BPJS maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBpjsPreview(base64String);
        setEditedFotoBpjsUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBiodata = async () => {
    if (!editedName.trim()) {
      alert("Nama lengkap tidak boleh kosong");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveBiodata(child.id, {
        name: editedName.trim(),
        fotoUrl: editedFotoUrl,
        fotoKkUrl: editedFotoKkUrl,
        fotoBpjsUrl: editedFotoBpjsUrl,
        alamat: editedAlamat.trim(),
        nik: editedNik.trim(),
        kk: editedKk.trim(),
        parentPhone: editedParentPhone.trim(),
        email: editedEmail.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan biodata");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portDesc.trim()) {
      alert("Mohon isi judul dan deskripsi portofolio");
      return;
    }
    setIsAddingPort(true);
    try {
      await onAddPortfolio(child.id, portTitle.trim(), portDesc.trim(), portDate, portCategory);
      setPortTitle('');
      setPortDesc('');
      setPortDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan item portofolio");
    } finally {
      setIsAddingPort(false);
    }
  };

  const defaultAvatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Budi",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Siti"
  ];

  // Helper to format WhatsApp API link
  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.startsWith('0')) {
      formatted = '62' + cleaned.slice(1);
    }
    return `https://wa.me/${formatted}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col text-left"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-all cursor-pointer"
            title="Tutup"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
              {child.fotoUrl ? (
                <img src={child.fotoUrl} alt={child.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold uppercase text-white">{child.name.charAt(0)}</span>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-black tracking-tight">{child.name}</h3>
                {child.category && (
                  <span className="text-[9px] font-black bg-white/25 text-white border border-white/15 uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {child.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-violet-100 font-mono">ID Akun: @{child.username}</p>
              <p className="text-[10px] text-violet-200 font-medium">Terdaftar sejak: {new Date(child.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-slate-50/50 pr-4 pl-2 sm:pl-0">
          <div className="flex overflow-x-auto scrollbar-none whitespace-nowrap -mb-[2px] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('biodata')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer shrink-0 ${
                activeTab === 'biodata' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Biodata Lengkap
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('portofolio')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'portofolio' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Portofolio & Prestasi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('laporan')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'laporan' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Laporan Bulanan (Ortu)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('galeri')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'galeri' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Galeri Kegiatan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('asesmen')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'asesmen' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Asesmen Awal {child.initialAssessment ? '(Ada)' : '(Kosong)'}</span>
            </button>
          </div>

          {activeTab !== 'galeri' && (
            <div className="flex items-center gap-1.5 py-2 sm:py-0">
              <button
                type="button"
                onClick={() => setShowPdfOptions(!showPdfOptions)}
                className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                  showPdfOptions
                    ? 'bg-violet-100 text-violet-700 border-violet-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-violet-600 hover:bg-violet-50/50'
                }`}
                title="Atur Format, Lampiran, dan Ukuran Kertas PDF"
              >
                <span>⚙️ Opsi PDF</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsPrinting(true);
                  try {
                    const pdfOptions = {
                      paperSize: pdfPaperSize,
                      includePhoto: pdfIncludePhoto,
                      includeAddress: pdfIncludeAddress,
                      includeKkNik: pdfIncludeKkNik,
                      includeDocPhotos: pdfIncludeDocPhotos,
                      includeInitialAssessment: pdfIncludeAssessment
                    };
                    if (activeTab === 'laporan') {
                      await generateStudentMonthlyReportPDF(child, users, pdfOptions);
                    } else {
                      await generateStudentPortfolioPDF(child, users, pdfOptions);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Gagal mengunduh berkas PDF");
                  } finally {
                    setIsPrinting(false);
                  }
                }}
                disabled={isPrinting}
                className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>
                  {isPrinting
                    ? 'Mencetak...'
                    : activeTab === 'laporan'
                    ? `Laporan (${pdfPaperSize.toUpperCase()})`
                    : `Portofolio (${pdfPaperSize.toUpperCase()})`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* PDF Export Options Collapse Panel */}
        <AnimatePresence>
          {showPdfOptions && activeTab !== 'galeri' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-violet-50/70 border-b border-violet-100/80 text-left"
            >
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paper Size Option */}
                <div>
                  <span className="block text-[10px] font-black text-violet-800 uppercase tracking-wider mb-2">Ukuran Kertas Dokumen</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfPaperSize('f4')}
                      className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        pdfPaperSize === 'f4'
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>F4 (Folio 215x330mm)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfPaperSize('a4')}
                      className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        pdfPaperSize === 'a4'
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>A4 (Standar 210x297mm)</span>
                    </button>
                  </div>
                </div>

                {/* Attachments / Data Selection Checklist */}
                <div>
                  <span className="block text-[10px] font-black text-violet-800 uppercase tracking-wider mb-2">Checklist Lampiran / Isi PDF</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfIncludePhoto}
                        onChange={(e) => setPdfIncludePhoto(e.target.checked)}
                        className="w-3.5 h-3.5 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                      />
                      <span>Foto Profil Siswa</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfIncludeAddress}
                        onChange={(e) => setPdfIncludeAddress(e.target.checked)}
                        className="w-3.5 h-3.5 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                      />
                      <span>Alamat Lengkap</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfIncludeKkNik}
                        onChange={(e) => setPdfIncludeKkNik(e.target.checked)}
                        className="w-3.5 h-3.5 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                      />
                      <span>Nomor NIK & KK</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none" title="Lampirkan foto fisik berkas KK & BPJS jika ada">
                      <input
                        type="checkbox"
                        checked={pdfIncludeDocPhotos}
                        onChange={(e) => setPdfIncludeDocPhotos(e.target.checked)}
                        className="w-3.5 h-3.5 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                      />
                      <span className="font-semibold text-violet-700">Foto Berkas Fisik</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none" title="Lampirkan Data Hasil Asesmen Awal dari Orang Tua">
                      <input
                        type="checkbox"
                        checked={pdfIncludeAssessment}
                        onChange={(e) => setPdfIncludeAssessment(e.target.checked)}
                        className="w-3.5 h-3.5 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="font-semibold text-amber-800">Asesmen Awal Ortu</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {activeTab === 'biodata' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Informasi Pribadi</span>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Biodata</span>
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveBiodata}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setImagePreview(null);
                        setKkPreview(null);
                        setBpjsPreview(null);
                        setEditedName(child.name);
                        setEditedFotoUrl(child.fotoUrl || '');
                        setEditedFotoKkUrl(child.fotoKkUrl || '');
                        setEditedFotoBpjsUrl(child.fotoBpjsUrl || '');
                        setEditedAlamat(child.alamat || '');
                        setEditedNik(child.nik || '');
                        setEditedKk(child.kk || '');
                        setEditedParentPhone(child.parentPhone || '');
                        setEditedEmail(child.email || '');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {/* View / Edit Mode Form */}
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nama Lengkap</span>
                        <span className="text-xs font-bold text-slate-800">{child.name}</span>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor NIK</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {child.nik || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor Kartu Keluarga (KK)</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {child.kk || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor HP Orang Tua / Wali</span>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {child.parentPhone || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                          </span>
                          {child.parentPhone && (
                            <a
                              href={getWhatsAppLink(child.parentPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] rounded-lg border border-emerald-150 transition-all cursor-pointer"
                            >
                              <span>WhatsApp</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Alamat Email</span>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {child.email || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Alamat Lengkap</span>
                        <span className="text-xs font-medium text-slate-700 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          {child.alamat || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT VIEW SECTION */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dokumen Legalitas Terunggah</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* KK Card */}
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Foto Kartu Keluarga (KK)</span>
                          <span className="text-[10px] text-slate-400">Arsip foto KK resmi siswa.</span>
                        </div>
                        <div className="w-full h-28 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group">
                          {child.fotoKkUrl ? (
                            <>
                              <img src={child.fotoKkUrl} className="w-full h-full object-cover" alt="Kartu Keluarga" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setZoomImage(child.fotoKkUrl || null)}
                                  className="px-2.5 py-1 bg-white text-slate-800 font-bold text-[9px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-indigo-600" />
                                  Perbesar
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-400 italic">
                              <FileText className="w-6 h-6 text-slate-300 mb-1" />
                              <span className="text-[9px]">Belum diunggah</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BPJS Card */}
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Foto Kartu BPJS Kesehatan</span>
                          <span className="text-[10px] text-slate-400">Arsip kartu kesehatan asrama.</span>
                        </div>
                        <div className="w-full h-28 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group">
                          {child.fotoBpjsUrl ? (
                            <>
                              <img src={child.fotoBpjsUrl} className="w-full h-full object-cover" alt="Kartu BPJS" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setZoomImage(child.fotoBpjsUrl || null)}
                                  className="px-2.5 py-1 bg-white text-slate-800 font-bold text-[9px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  Perbesar
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-400 italic">
                              <FileText className="w-6 h-6 text-slate-300 mb-1" />
                              <span className="text-[9px]">Belum diunggah</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo Edit Option */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Ganti Foto Profil</span>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {imagePreview || editedFotoUrl ? (
                          <img src={imagePreview || editedFotoUrl} alt="Pratinjau" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                        <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                          {defaultAvatars.map((avUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setEditedFotoUrl(avUrl);
                                setImagePreview(null);
                              }}
                              className={`w-8 h-8 rounded-lg border p-0.5 overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                                editedFotoUrl === avUrl ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <img src={avUrl} className="w-full h-full rounded-md" alt={`Avatar ${idx}`} referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                          <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[9px] rounded-md cursor-pointer border border-slate-200 transition-all">
                            <span>Pilih File...</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nomor NIK (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={editedNik}
                          onChange={(e) => setEditedNik(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nomor Kartu Keluarga (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={editedKk}
                          onChange={(e) => setEditedKk(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nomor HP Orang Tua
                        </label>
                        <input
                          type="text"
                          value={editedParentPhone}
                          onChange={(e) => setEditedParentPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Alamat Email
                        </label>
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Alamat Asal Lengkap
                        </label>
                        <textarea
                          rows={2}
                          value={editedAlamat}
                          onChange={(e) => setEditedAlamat(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT EDIT SECTION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    {/* Upload KK */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Update Foto Kartu Keluarga (KK)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[100px]">
                        {kkPreview || editedFotoKkUrl ? (
                          <div className="absolute inset-0 w-full h-full">
                            <img src={kkPreview || editedFotoKkUrl} className="w-full h-full object-cover" alt="Update KK" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => { setKkPreview(null); setEditedFotoKkUrl(''); }}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 text-[8px] font-bold cursor-pointer hover:bg-rose-700"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-1 w-full h-full">
                            <Upload className="w-4 h-4 text-indigo-500 mb-1" />
                            <span className="text-[9px] font-bold text-indigo-700">Unggah Foto KK</span>
                            <span className="text-[7px] text-slate-400">Maks 2MB</span>
                            <input type="file" accept="image/*" onChange={handleKkChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Upload BPJS */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Update Foto Kartu BPJS Kesehatan
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[100px]">
                        {bpjsPreview || editedFotoBpjsUrl ? (
                          <div className="absolute inset-0 w-full h-full">
                            <img src={bpjsPreview || editedFotoBpjsUrl} className="w-full h-full object-cover" alt="Update BPJS" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => { setBpjsPreview(null); setEditedFotoBpjsUrl(''); }}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 text-[8px] font-bold cursor-pointer hover:bg-rose-700"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-1 w-full h-full">
                            <Upload className="w-4 h-4 text-emerald-500 mb-1" />
                            <span className="text-[9px] font-bold text-emerald-700">Unggah Foto BPJS</span>
                            <span className="text-[7px] text-slate-400">Maks 2MB</span>
                            <input type="file" accept="image/*" onChange={handleBpjsChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'asesmen' && (
            <div className="space-y-6 text-left">
              {child.initialAssessment ? (
                <div className="space-y-6">
                  {/* Banner Info */}
                  <div className="bg-amber-50 border border-amber-100/50 rounded-2xl p-4 flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Asesmen Awal diisi oleh Orang Tua / Wali</h4>
                      <p className="text-[10.5px] text-amber-800/90 leading-relaxed mt-0.5">
                        Disimpan dengan aman demi keselamatan, kecocokan menu makan, penanganan emosi, serta keselarasan program ibadah/akademik ananda selama di asrama.
                      </p>
                      {child.initialAssessment.updatedAt && (
                        <span className="inline-block mt-2 text-[9px] font-mono font-bold text-amber-700 bg-amber-100/40 px-2 py-0.5 rounded-md">
                          Terakhir Diperbarui: {new Date(child.initialAssessment.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* KATEGORI A */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-amber-50 text-amber-600 rounded-lg">
                          <Shield className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">A. Profil & Struktur Keluarga</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Nama Panggilan</span>
                          <span className="font-semibold text-slate-700">{child.initialAssessment.namaPanggilan || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Anak Ke-</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.anakKe || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Dari Bersaudara</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.dariBersaudara || '-'}</span>
                          </div>
                        </div>
                        {child.initialAssessment.saudaraDetail && (
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Daftar Saudara Kandung / Tiri</span>
                            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 rounded-xl mt-0.5 whitespace-pre-line">{child.initialAssessment.saudaraDetail}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Status Orang Tua</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.statusOrangTua || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Asuhan Sebelumnya</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.pengasuhanSebelumnya || '-'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Pekerjaan Ayah</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.pekerjaanAyah || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Pekerjaan Ibu</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.pekerjaanIbu || '-'}</span>
                          </div>
                        </div>
                        {child.initialAssessment.bantuanPemerintah && child.initialAssessment.bantuanPemerintah.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Kepemilikan Bantuan Pemerintah</span>
                            <div className="flex flex-wrap gap-1">
                              {child.initialAssessment.bantuanPemerintah.map(b => (
                                <span key={b} className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-2 py-0.5 rounded-lg">{b}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KATEGORI B */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-rose-50 text-rose-600 rounded-lg">
                          <Heart className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">B. Kesehatan & Kebutuhan Fisik</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Alergi Makanan</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.alergiMakanan || 'Tidak ada'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Alergi Obat</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.alergiObat || 'Tidak ada'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Alergi Lainnya</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.alergiLainnya || 'Tidak ada'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Riwayat Penyakit</span>
                          <span className="font-semibold text-slate-700">
                            {child.initialAssessment.riwayatPenyakit && child.initialAssessment.riwayatPenyakit.length > 0
                              ? child.initialAssessment.riwayatPenyakit.join(', ')
                              : 'Tidak ada'}
                          </span>
                          {child.initialAssessment.riwayatPenyakitLainnya && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">Lainnya: {child.initialAssessment.riwayatPenyakitLainnya}</p>
                          )}
                        </div>
                        {child.initialAssessment.pengobatanRutin && (
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Pengobatan Rutin</span>
                            <p className="text-slate-600 font-medium">{child.initialAssessment.pengobatanRutin}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Pola Tidur Malam</span>
                          <span className="font-semibold text-slate-700">
                            {child.initialAssessment.polaTidur && child.initialAssessment.polaTidur.length > 0
                              ? child.initialAssessment.polaTidur.join(', ')
                              : 'Sangat Baik'}
                          </span>
                          {child.initialAssessment.polaTidurKhusus && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">Catatan tidur: {child.initialAssessment.polaTidurKhusus}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 bg-rose-50/25 p-2 rounded-xl border border-rose-100/20">
                          <div>
                            <span className="text-[9px] font-black text-rose-500 uppercase block">Sangat Disukai</span>
                            <span className="font-bold text-slate-700 text-[11px]">{child.initialAssessment.makananDisukai || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-rose-500 uppercase block">Pantangan / Tidak Disukai</span>
                            <span className="font-bold text-slate-700 text-[11px]">{child.initialAssessment.makananTidakDisukai || '-'}</span>
                          </div>
                        </div>
                        {child.initialAssessment.kebiasaanMakan && (
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Kebiasaan Makan</span>
                            <span className="font-semibold text-slate-600">{child.initialAssessment.kebiasaanMakan}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KATEGORI C */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">C. Kemandirian & Ibadah</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-50 p-2 rounded-xl text-center">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Mandi</span>
                            <span className="font-bold text-emerald-700 text-[10.5px]">{child.initialAssessment.kemandirianMandi || '-'}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl text-center">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Tempat Tidur</span>
                            <span className="font-bold text-emerald-700 text-[10.5px]">{child.initialAssessment.kemandirianTempatTidur || '-'}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl text-center">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Cuci Baju</span>
                            <span className="font-bold text-emerald-700 text-[10.5px]">{child.initialAssessment.kemandirianCuciBaju || '-'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Kemampuan Mengaji</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.kemampuanMengaji || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Keterangan Jilid / Juz</span>
                            <span className="font-semibold text-slate-700">{child.initialAssessment.kemampuanMengajiDetail || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Hafalan yang Dimiliki</span>
                          <span className="font-semibold text-slate-700">{child.initialAssessment.hafalanMilik || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Kedisiplinan Shalat</span>
                          <span className="font-bold text-slate-800">{child.initialAssessment.kedisiplinanShalat || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* KATEGORI D */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-sky-50 text-sky-600 rounded-lg">
                          <Smile className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">D. Karakter & Emosi Dominan</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Karakter Utama Dominan</span>
                          <div className="flex flex-wrap gap-1">
                            {child.initialAssessment.sifatUtama && child.initialAssessment.sifatUtama.length > 0 ? (
                              child.initialAssessment.sifatUtama.map(s => (
                                <span key={s} className="text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200/50 px-2 py-0.5 rounded-lg">{s}</span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Belum dipilih</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Pemicu Amarah / Kesedihan (Trigger)</span>
                          <p className="text-slate-600 leading-normal font-medium bg-slate-50 p-2 rounded-xl mt-0.5 whitespace-pre-line">{child.initialAssessment.pemicuEmosi || '-'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Reaksi Saat Marah / Sedih</span>
                          <p className="text-slate-600 leading-normal font-medium bg-slate-50 p-2 rounded-xl mt-0.5 whitespace-pre-line">{child.initialAssessment.reaksiMarah || '-'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Cara Efektif Menenangkan</span>
                          <p className="text-slate-600 leading-normal font-medium bg-slate-50 p-2 rounded-xl mt-0.5 whitespace-pre-line">{child.initialAssessment.caraMenangani || '-'}</p>
                        </div>
                        {child.initialAssessment.riwayatTrauma && (
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Riwayat Trauma / Pengalaman Khusus</span>
                            <p className="text-rose-700 bg-rose-50/55 p-2 rounded-xl mt-0.5 whitespace-pre-line leading-normal font-medium border border-rose-100/30">{child.initialAssessment.riwayatTrauma}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KATEGORI E */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-violet-50 text-violet-600 rounded-lg">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">E. Akademik, Minat & Hobi</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase block">Mapel Disukai</span>
                            <span className="font-bold text-slate-700">{child.initialAssessment.mapelDisukai || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-rose-500 uppercase block">Mapel Ditakuti</span>
                            <span className="font-bold text-slate-700">{child.initialAssessment.mapelDitakuti || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Hobi / Kegiatan Kegemaran</span>
                          <span className="font-semibold text-slate-700 block bg-slate-50 p-2 rounded-xl mt-0.5">{child.initialAssessment.hobiKegemaran || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Bakat Khusus Menonjol</span>
                          <span className="font-semibold text-slate-700 block bg-slate-50 p-2 rounded-xl mt-0.5">{child.initialAssessment.bakatMenonjol || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* KATEGORI F */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">F. Harapan & Kontak Darurat</h5>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">3 Harapan Utama Orang Tua</span>
                          <ol className="list-decimal pl-4 space-y-1.5 font-semibold text-slate-700 leading-normal">
                            <li>{child.initialAssessment.harapan1}</li>
                            <li>{child.initialAssessment.harapan2}</li>
                            <li>{child.initialAssessment.harapan3}</li>
                          </ol>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 space-y-2">
                          <span className="text-[9px] font-black text-indigo-700 uppercase block">Kontak Cadangan Darurat</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Nama</span>
                              <span className="font-bold text-slate-700">{child.initialAssessment.namaKontakAlternatif || '-'}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Hubungan</span>
                              <span className="font-bold text-slate-700">{child.initialAssessment.hubunganKontakAlternatif || '-'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">No. HP / WA</span>
                              <span className="font-bold font-mono text-slate-800">{child.initialAssessment.noHpKontakAlternatif || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-50 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Data Asesmen Kosong</h4>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal">
                      Orang tua belum mengisi Formulir Asesmen Awal untuk ananda {child.name}. Silakan infokan ke orang tua siswa untuk melengkapinya lewat Akun Orang Tua.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'portofolio' && (
            /* Portofolio & Achievements Tab */
            <div className="space-y-6">
              {/* Add portfolio form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-800 block mb-2">Tambah Catatan Portofolio & Milestone Baru</span>
                <form onSubmit={handleAddPortfolioItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Judul Prestasi (cth: Juara 1 Lomba Pidato)"
                      value={portTitle}
                      onChange={(e) => setPortTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 text-slate-800 font-semibold"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={portCategory}
                        onChange={(e: any) => setPortCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none text-slate-750"
                      >
                        <option value="Prestasi">🏆 Prestasi</option>
                        <option value="Akademik">📝 Akademik</option>
                        <option value="Sikap">🌟 Sikap & Adab</option>
                        <option value="Karya">🎨 Karya Seni/IPTEK</option>
                        <option value="Olahraga">⚽ Olahraga</option>
                        <option value="Lainnya">💡 Lainnya</option>
                      </select>

                      <input
                        type="date"
                        value={portDate}
                        onChange={(e) => setPortDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-mono font-semibold focus:outline-none text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-between">
                    <textarea
                      rows={2}
                      placeholder="Deskripsi pencapaian atau detail portfolio..."
                      value={portDesc}
                      onChange={(e) => setPortDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500 text-slate-800 font-medium resize-none flex-1"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isAddingPort}
                      className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingPort ? "Menambahkan..." : "Tambahkan Portofolio"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Portfolio Timeline List */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">Catatan Portofolio Siswa</span>
                
                {!child.portfolio || child.portfolio.length === 0 ? (
                  <div className="py-12 text-center text-slate-450 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Award className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p>Belum ada catatan portofolio yang terekam.</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-1">Tambahkan prestasi, karya, atau adab luar biasa siswa di atas!</p>
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {child.portfolio.map((item) => {
                      let colorClass = 'bg-slate-100 text-slate-700 border-slate-200/50';
                      if (item.category === 'Prestasi') colorClass = 'bg-amber-50 text-amber-700 border-amber-100';
                      else if (item.category === 'Akademik') colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                      else if (item.category === 'Sikap') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      else if (item.category === 'Karya') colorClass = 'bg-pink-50 text-pink-700 border-pink-100';
                      else if (item.category === 'Olahraga') colorClass = 'bg-sky-50 text-sky-700 border-sky-100';

                      return (
                        <div key={item.id} className="relative pl-8 flex gap-3 text-left group">
                          {/* Circle on timeline */}
                          <div className="absolute left-[8px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-violet-500 z-10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          </div>

                          <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border tracking-wider ${colorClass}`}>
                                    {item.category || "Umum"}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                                <h4 className="text-xs font-extrabold text-slate-800 mt-1.5">{item.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{item.description}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Apakah Anda yakin ingin menghapus portofolio ini?")) {
                                    onDeletePortfolio(child.id, item.id);
                                  }
                                }}
                                className="p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                title="Hapus Portofolio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="space-y-6">
              <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 text-left animate-fade-in">
                <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-violet-600" />
                  <span>Penyusunan Laporan Bulanan Orang Tua</span>
                </h4>
                <p className="text-[11px] text-violet-600/90 mt-1 leading-relaxed font-medium">
                  Gunakan menu ini untuk mendokumentasikan perkembangan bulanan siswa. Informasi ini dapat langsung diunduh dalam format PDF resmi oleh Anda maupun orang tua siswa yang bersangkutan.
                </p>
                <div className="mt-3 p-2.5 bg-white/80 border border-violet-100 rounded-xl text-[10px] text-slate-500 space-y-1 font-medium">
                  <p className="text-slate-600 font-bold">⚠️ Kebijakan Tampilan Laporan:</p>
                  <p>• <strong>Saldo Tabungan:</strong> Tidak diikutsertakan dalam laporan untuk menjaga privasi finansial keluarga.</p>
                  <p>• <strong>Data Tahfidz / Setoran:</strong> Tidak diikutsertakan dalam modul pertanggungjawaban bulanan ini.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status Kesehatan */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Kondisi Kesehatan Umum Bulan Ini
                  </label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="Sangat Sehat">Sangat Sehat (Aktif & bugar penuh)</option>
                    <option value="Sehat">Sehat (Kondisi stabil & normal)</option>
                    <option value="Sehat dengan Catatan">Sehat dengan Catatan (Alergi ringan / lelah)</option>
                    <option value="Pemulihan">Pemulihan (Dalam masa pemulihan pasca sakit)</option>
                    <option value="Kurang Sehat">Kurang Sehat / Sakit (Membutuhkan perawatan)</option>
                  </select>
                </div>

                {/* Catatan Kesehatan */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Catatan Detail Riwayat Kesehatan
                  </label>
                  <textarea
                    rows={2}
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                    placeholder="Contoh: Siswa dalam kondisi sangat baik dan fit. Selalu menjaga kebersihan diri serta asrama."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-700 leading-relaxed font-medium"
                  />
                </div>

                {/* Kegiatan Bulan Ini */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Daftar Kegiatan & Pembinaan yang Diikuti
                  </label>
                  <textarea
                    rows={3}
                    value={monthlyActivities}
                    onChange={(e) => setMonthlyActivities(e.target.value)}
                    placeholder="Contoh: Aktif mengikuti kajian rutin asrama, olahraga memanah setiap akhir pekan, dan kerja bakti kebersihan lingkungan."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-700 leading-relaxed font-medium"
                  />
                </div>

                {/* Catatan Karakter */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Catatan Perkembangan Karakter & Akhlak
                  </label>
                  <textarea
                    rows={3}
                    value={characterNotes}
                    onChange={(e) => setCharacterNotes(e.target.value)}
                    placeholder="Contoh: Sangat disiplin ibadah berjamaah, menunjukkan sikap sopan santun kepada pengasuh, dan rukun dengan sesama teman."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-700 leading-relaxed font-medium"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isSavingReport}
                    onClick={async () => {
                      setIsSavingReport(true);
                      try {
                        await onSaveBiodata(child.id, {
                          healthStatus,
                          healthNotes: healthNotes.trim(),
                          monthlyActivities: monthlyActivities.trim(),
                          characterNotes: characterNotes.trim(),
                        });
                        alert("Laporan perkembangan bulanan berhasil diperbarui!");
                      } catch (err) {
                        console.error(err);
                        alert("Gagal memperbarui laporan bulanan");
                      } finally {
                        setIsSavingReport(false);
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>{isSavingReport ? "Menyimpan..." : "Simpan Laporan Bulanan"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'galeri' && (
            <div className="space-y-6">
              {/* Info Header */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-left">
                <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Galeri Dokumentasi Kegiatan Siswa</span>
                </h4>
                <p className="text-[11px] text-blue-600/90 mt-1 leading-relaxed font-medium">
                  Dokumentasikan berbagai kegiatan siswa di asrama secara visual. Foto-foto ini akan tampil di profil pribadi siswa dan dapat dipantau langsung oleh orang tua mereka.
                </p>
              </div>

              {/* Form Tambah Foto Baru */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-left space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unggah Dokumentasi Baru</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pilih Foto Kegiatan (Max 2MB)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-violet-500 rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-[140px] bg-white cursor-pointer group">
                      {galleryPreview ? (
                        <div className="relative w-full h-[120px]">
                          <img src={galleryPreview} className="w-full h-full object-cover rounded-xl" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryPreview(null);
                              setGalleryPhotoUrl('');
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all cursor-pointer shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <div className="p-3 bg-slate-50 rounded-full group-hover:bg-violet-50 transition-all text-slate-400 group-hover:text-violet-600">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Pilih berkas foto</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Mendukung JPEG, PNG, WEBP</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Ukuran file foto maksimal 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              setGalleryPreview(base64String);
                              setGalleryPhotoUrl(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Caption & Date Input */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Keterangan Foto (Caption)
                      </label>
                      <textarea
                        rows={3}
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                        placeholder="Contoh: Mengikuti kelas pembekalan asrama mengenai adab menuntut ilmu."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 text-slate-700 leading-relaxed font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tanggal Kegiatan
                      </label>
                      <input
                        type="date"
                        value={galleryDate}
                        onChange={(e) => setGalleryDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isAddingGalleryPhoto || !galleryPhotoUrl || !galleryCaption.trim()}
                    onClick={async () => {
                      setIsAddingGalleryPhoto(true);
                      try {
                        const newPhoto = {
                          id: Math.random().toString(36).substring(2, 9),
                          url: galleryPhotoUrl,
                          caption: galleryCaption.trim(),
                          date: galleryDate,
                        };
                        const currentPhotos = child.activityPhotos || [];
                        const updatedPhotos = [newPhoto, ...currentPhotos];

                        await onSaveBiodata(child.id, {
                          activityPhotos: updatedPhotos
                        });

                        // Reset form
                        setGalleryPreview(null);
                        setGalleryPhotoUrl('');
                        setGalleryCaption('');
                        setGalleryDate(new Date().toISOString().split('T')[0]);
                        alert("Foto kegiatan berhasil ditambahkan ke galeri!");
                      } catch (err) {
                        console.error(err);
                        alert("Gagal menambahkan foto kegiatan");
                      } finally {
                        setIsAddingGalleryPhoto(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingGalleryPhoto ? "Mengunggah..." : "Tambah ke Galeri"}</span>
                  </button>
                </div>
              </div>

              {/* Grid Album Foto Terunggah */}
              <div className="space-y-4 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Daftar Dokumentasi Foto ({child.activityPhotos?.length || 0})</span>
                
                {(!child.activityPhotos || child.activityPhotos.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 flex flex-col items-center justify-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">Belum ada foto kegiatan</p>
                    <p className="text-[10px] text-slate-400">Silakan unggah dokumentasi kegiatan pertama siswa di atas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {child.activityPhotos.map((photo) => (
                      <div key={photo.id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-zoom-in" onClick={() => setZoomImage(photo.url)}>
                          <img src={photo.url} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-350" alt={photo.caption} referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/60 px-2 py-1 rounded-md">Zoom</span>
                          </div>
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">{photo.caption}</p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                            <span className="text-[9px] text-slate-400 font-mono">{photo.date}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm("Apakah Anda yakin ingin menghapus foto kegiatan ini?")) {
                                  try {
                                    const updatedPhotos = (child.activityPhotos || []).filter(p => p.id !== photo.id);
                                    await onSaveBiodata(child.id, {
                                      activityPhotos: updatedPhotos
                                    });
                                    alert("Foto kegiatan berhasil dihapus!");
                                  } catch (err) {
                                    console.error(err);
                                    alert("Gagal menghapus foto");
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Hapus foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </motion.div>

      {/* DOCUMENT ZOOM MODAL */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full overflow-hidden bg-slate-900 rounded-2xl p-2 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2.5 transition-all z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
              <img src={zoomImage} className="max-w-full max-h-full object-contain rounded-lg" alt="Zoom Dokumen" referrerPolicy="no-referrer" />
            </div>
            <div className="p-3 text-center text-xs text-slate-400 font-medium font-mono">
              Pratinjau Berkas Dokumen Resmi WaliAsuhku
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
