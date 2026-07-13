import React, { useState, useRef, useEffect } from 'react';
import { User, Report, ReportType, Broadcast } from '../types';
import { Send, Upload, Lock, ShieldCheck, Heart, Clipboard, HelpCircle, FileText, AlertCircle, Trash2, CheckCircle, Clock, ShieldAlert, ImageIcon, MessageCircle, ZoomIn, ZoomOut, RotateCw, X, Download, Maximize2, Package, Megaphone, ExternalLink, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { decryptMessage, encryptMessage, formatDate, getStatusBadge, getTypeBadge } from '../utils/crypto';

interface AnakAsuhDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  broadcasts: Broadcast[];
  onSubmitReport: (reportData: {
    title: string;
    content: string;
    type: ReportType;
    attachmentUrl?: string;
  }) => void;
  onAddReply: (reportId: string, replyContent: string) => void;
}

// Preset evidence photos to make browser-based demo super high fidelity and instant to play with!
const PRESET_PHOTOS = [
  {
    id: 'math_book',
    name: 'Buku Hilang / Rusak',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    description: 'Catatan pelajaran matematika yang koyak/hilang.'
  },
  {
    id: 'broken_faucet',
    name: 'Fasilitas Rusak',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
    description: 'Gagang keran air kamar mandi asrama patah.'
  },
  {
    id: 'medicine',
    name: 'Obat & Kesehatan',
    url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400',
    description: 'Foto resep obat dari puskesmas asrama.'
  },
  {
    id: 'permit_letter',
    name: 'Surat Izin',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
    description: 'Format surat izin keluar asrama bermeterai.'
  }
];

export const LOGISTIC_ITEMS = [
  { id: 'sabun', label: '🧼 Sabun Mandi', category: 'Mandi' },
  { id: 'shampoo', label: '🧴 Shampo', category: 'Mandi' },
  { id: 'pasta_gigi', label: '🪥 Pasta Gigi', category: 'Mandi' },
  { id: 'sikat_gigi', label: '🪥 Sikat Gigi', category: 'Mandi' },
  { id: 'detergen', label: '🧺 Detergen Cuci', category: 'Mandi' },
  { id: 'buku_tulis', label: '📖 Buku Tulis', category: 'Tulis / Sekolah' },
  { id: 'pulpen', label: '✍️ Pulpen / Pena', category: 'Tulis / Sekolah' },
  { id: 'pensil', label: '✏️ Pensil & Penghapus', category: 'Tulis / Sekolah' },
  { id: 'obat_pribadi', label: '💊 Obat / Vitamin', category: 'Lain-lain' },
  { id: 'pembalut', label: '🚺 Pembalut', category: 'Lain-lain' }
];

export default function AnakAsuhDashboard({
  currentUser,
  users,
  reports,
  broadcasts,
  onSubmitReport,
  onAddReply
}: AnakAsuhDashboardProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reportType, setReportType] = useState<ReportType>('pengaduan');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [customPhotoName, setCustomPhotoName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: 'habis' | 'hampir_habis' | '' }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`dismissed_broadcasts_${currentUser.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleDismissBroadcast = (id: string) => {
    const updated = [...dismissedBroadcasts, id];
    setDismissedBroadcasts(updated);
    try {
      localStorage.setItem(`dismissed_broadcasts_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenPhoto = (url: string) => {
    setShowPhotoModal(url);
    setZoomScale(1);
    setRotation(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPhotoModal(null);
      }
    };
    if (showPhotoModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPhotoModal]);

  const isPesanOrtu = reportType === 'pesan_ortu';

  // Get current child's assigned Wali Asuh
  const myGuardian = users.find(u => u.id === currentUser.waliAsuhId && u.role === 'wali_asuh');

  // Get active broadcasts from this child's Wali Asuh
  const guardianBroadcasts = broadcasts.filter(b => b.senderId === currentUser.waliAsuhId);
  const activePopups = guardianBroadcasts.filter(b => !dismissedBroadcasts.includes(b.id));

  // Get current child's own reports
  const myReports = reports.filter(r => r.senderId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTitle = title.trim();
    let finalContent = content.trim();

    if (reportType === 'kebutuhan_logistik') {
      const activeItems = Object.entries(selectedItems)
        .filter(([_, status]) => status !== '')
        .map(([id, status]) => {
          const item = LOGISTIC_ITEMS.find(li => li.id === id);
          return `- ${item?.label || id} (${status === 'habis' ? '❌ Habis Total' : '⚠️ Hampir Habis'})`;
        });

      if (activeItems.length === 0 && !finalContent) {
        alert('Silakan pilih minimal satu barang yang habis atau tulis catatan kebutuhan!');
        return;
      }

      if (!finalTitle) {
        finalTitle = 'Laporan Kebutuhan Logistik/Properti';
      }

      const itemsSummary = activeItems.length > 0 
        ? `### DAFTAR BARANG YANG HABIS:\n${activeItems.join('\n')}` 
        : '';
      
      const notesSummary = finalContent 
        ? `### CATATAN TAMBAHAN:\n${finalContent}` 
        : '';

      finalContent = [itemsSummary, notesSummary].filter(Boolean).join('\n\n');
    } else {
      if (!finalTitle || !finalContent) return;
    }

    onSubmitReport({
      title: finalTitle,
      content: finalContent,
      type: reportType,
      attachmentUrl: photoUrl || undefined
    });

    const msg = reportType === 'pesan_ortu'
      ? 'Yey! Pesan untuk Orang Tua berhasil dikirim ke Wali Asuh kamu.'
      : reportType === 'kebutuhan_logistik'
        ? 'Yey! Laporan Kebutuhan Logistik berhasil dikirim ke Wali Asuh kamu.'
        : 'Yey! Laporan kamu berhasil dikirim dengan Enkripsi Aman.';
    setSuccessMsg(msg);
    setTitle('');
    setContent('');
    setPhotoUrl('');
    setCustomPhotoName('');
    setSelectedItems({});

    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('history'); // Swaps to history tab to view progress
    }, 2000);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
        setCustomPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setCustomPhotoName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReport) return;

    onAddReply(selectedReport.id, replyText.trim());
    setReplyText('');

    // Refresh context for selected report
    const updatedReport = reports.find(r => r.id === selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 text-slate-800">
      
      {/* Welcome Child Header */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg text-left">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold bg-pink-400/40 text-pink-50 px-3 py-1 rounded-full border border-pink-300/20">
            Halo, Sahabat Anak Asuh!
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Halo, {currentUser.name}!</h2>
          <p className="text-pink-100/90 text-sm mt-2 leading-relaxed">
            Butuh bantuan, punya laporan rutin, atau ingin menceritakan rahasia pribadi yang mengganjal hatimu? 
            {myGuardian ? (
              <span> Kirimkan langsung ke Wali Asuh kamu: <strong className="text-white underline">{myGuardian.name}</strong>.</span>
            ) : (
              ' Hubungi wali asuh kamu.'
            )} Semua laporanmu dienkripsi rapat dan aman!
          </p>
        </div>
      </div>

      {/* Main Mode Toggles */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'form' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ✍️ Kirim Laporan / Curhat Baru
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📂 Riwayat Laporanku ({myReports.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {activeTab === 'form' ? (
          /* FORM SUBMISSION VIEW */
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Fields (Left - Spans 7) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-1.5 bg-pink-50 text-pink-600 rounded-lg">
                  <Heart className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Tulis Pengaduan / Cerita Kamu</h3>
                  <p className="text-[10px] text-slate-400">Pesan langsung dikunci oleh kunci enkripsi WaliAsuhku</p>
                </div>
              </div>

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {successMsg}
                </motion.div>
              )}

              {/* Report Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tipe Laporan / Suasana Hati
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportType('pengaduan')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                      reportType === 'pengaduan'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-950 ring-2 ring-rose-500/15'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 ${reportType === 'pengaduan' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">⚠️ Pengaduan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('curhatan')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                      reportType === 'curhatan'
                        ? 'border-violet-500 bg-violet-50/50 text-violet-950 ring-2 ring-violet-500/15'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${reportType === 'curhatan' ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">💖 Curhat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('pelaporan')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                      reportType === 'pelaporan'
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/15'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clipboard className={`w-5 h-5 ${reportType === 'pelaporan' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">📋 Lap. Rutin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('pesan_ortu')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                      reportType === 'pesan_ortu'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/15'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageCircle className={`w-5 h-5 ${reportType === 'pesan_ortu' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">💌 Pesan Ortu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReportType('kebutuhan_logistik');
                      if (!title) {
                        setTitle('Pendataan Properti Siswa Habis');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                      reportType === 'kebutuhan_logistik'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500/15'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package className={`w-5 h-5 ${reportType === 'kebutuhan_logistik' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">📦 Logistik Habis</span>
                  </button>
                </div>
              </div>

              {/* Interactive Logistics Checklist */}
              {reportType === 'kebutuhan_logistik' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950 block">📋 Pilih Properti Siswa yang Habis / Sedikit</span>
                  </div>
                  <p className="text-[10px] text-amber-700/80">Silakan pilih status ketersediaan properti kamu di bawah ini sebelum mengirim laporan.</p>
                  
                  {/* Categorized grid */}
                  <div className="space-y-3">
                    {['Mandi', 'Tulis / Sekolah', 'Lain-lain'].map(cat => {
                      const catItems = LOGISTIC_ITEMS.filter(item => item.category === cat);
                      return (
                        <div key={cat} className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold text-amber-900/60 uppercase tracking-wider">{cat}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {catItems.map(item => {
                              const currentStatus = selectedItems[item.id] || '';
                              return (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedItems(prev => ({
                                        ...prev,
                                        [item.id]: currentStatus === 'habis' ? '' : 'habis'
                                      }))}
                                      className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer border ${
                                        currentStatus === 'habis'
                                          ? 'bg-rose-500 border-rose-500 text-white'
                                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                      }`}
                                    >
                                      ❌ Habis
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedItems(prev => ({
                                        ...prev,
                                        [item.id]: currentStatus === 'hampir_habis' ? '' : 'hampir_habis'
                                      }))}
                                      className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer border ${
                                        currentStatus === 'hampir_habis'
                                          ? 'bg-amber-500 border-amber-500 text-white'
                                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                      }`}
                                    >
                                      ⚠️ Sedikit
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  {isPesanOrtu 
                    ? "Topik / Nama Penerima Pesan" 
                    : reportType === 'kebutuhan_logistik'
                      ? "Judul Laporan Ketersediaan (Opsional)"
                      : "Judul Ringkas"
                  }
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isPesanOrtu 
                      ? "Contoh: Kabar Fajar Untuk Ibu / Salam Untuk Ayah" 
                      : reportType === 'kebutuhan_logistik'
                        ? "Contoh: Pendataan Properti Fajar Habis / Kebutuhan Sabun Mandi"
                        : "Contoh: Lampu Kamar Mandi Redup / Curhat Kangen Ibu"
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500 focus:bg-white transition-all text-slate-800"
                  required={reportType !== 'kebutuhan_logistik'}
                />
              </div>

              {/* Content Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  {isPesanOrtu 
                    ? "Pesan Lengkap untuk Orang Tua" 
                    : reportType === 'kebutuhan_logistik'
                      ? "Catatan / Keterangan Tambahan (Opsional)"
                      : "Cerita Lengkap Kamu (Erat Rahasia)"
                  }
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isPesanOrtu 
                      ? "Tuliskan pesan utuh yang ingin disampaikan. Wali asuh kamu akan membaca pesan ini lalu menyalinnya untuk diteruskan ke orang tua/keluarga kamu..." 
                      : reportType === 'kebutuhan_logistik'
                        ? "Tuliskan jika ada request khusus (misal: butuh sabun cair karena kulit sensitif)..."
                        : "Tuliskan secara lengkap di sini. Wali Asuh kamu akan membaca ini secara aman..."
                  }
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-pink-500 focus:bg-white transition-all text-slate-800 leading-relaxed"
                  required={reportType !== 'kebutuhan_logistik'}
                />
              </div>

              {/* Secure Padlock Simulation indicator */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <div className="text-left leading-none">
                    <p className="text-[11px] font-bold text-emerald-950">Keamanan Enkripsi End-to-End Aktif</p>
                    <p className="text-[9px] text-emerald-600 mt-0.5">Pesan langsung dikodekan dengan algoritme aman</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Secure</span>
              </div>

              {/* Photo Evidence Attached Preview indicator */}
              {photoUrl && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={photoUrl} 
                      alt="Uploaded preview" 
                      className="w-10 h-10 object-cover rounded-lg border border-indigo-200 shrink-0" 
                    />
                    <div className="text-left min-w-0">
                      <p className="text-[10px] font-bold text-indigo-950 truncate max-w-[200px]">
                        {customPhotoName || "Foto Terlampir"}
                      </p>
                      <p className="text-[9px] text-indigo-500">Siap dikirim sebagai bukti pengaduan</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setCustomPhotoName('');
                    }}
                    className="p-1 hover:bg-indigo-100 rounded text-indigo-600 hover:text-rose-600 cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl py-3 text-xs tracking-wider uppercase transition-all shadow-md shadow-pink-600/10 active:scale-[0.98] cursor-pointer"
              >
                {isPesanOrtu 
                  ? "Kirim Pesan untuk Orang Tua" 
                  : reportType === 'kebutuhan_logistik'
                    ? "Kirim Laporan Kebutuhan Logistik"
                    : "Kirim Pengaduan/Curhat"
                }
              </button>
            </form>

            {/* Photo Attachment Workspace (Right - Spans 5) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Drag and Drop File Uploader */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Upload className="w-4 h-4 text-pink-500" />
                  Unggah Bukti Foto (Opsional)
                </h3>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-pink-500 bg-pink-50/20' 
                      : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCustomPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Seret foto ke sini atau Klik untuk memilih</p>
                  <p className="text-[9px] text-slate-400 mt-1">Mendukung format gambar JPEG, PNG (Maks 5MB)</p>
                </div>
              </div>

              {/* DEMO EFFICIENCY PRESET IMAGES CARD */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Galeri Simulasi Bukti Instan
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Gunakan foto contoh beresolusi tinggi di bawah ini untuk menguji laporan foto langsung tanpa harus repot mencari file di laptop Anda!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {PRESET_PHOTOS.map(p => {
                    const isSelected = photoUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(p.url);
                          setCustomPhotoName(p.name);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-start gap-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-pink-500 bg-pink-50/40 text-pink-950 shadow-xs' 
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/30 text-slate-700'
                        }`}
                      >
                        <img 
                          src={p.url} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold truncate leading-snug">{p.name}</p>
                          <p className="text-[8px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">{p.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PAPAN PENGUMUMAN WALI ASUH */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-3">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Megaphone className="w-5 h-5 animate-soft-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pengumuman Wali Asuh
                    </h3>
                    <p className="text-[9px] text-slate-400">Pesan dan instruksi penting dari {myGuardian?.name || 'Wali Asuh'}</p>
                  </div>
                </div>

                {guardianBroadcasts.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-2">Belum ada pengumuman atau instruksi dari Wali Asuh saat ini.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {guardianBroadcasts.map(b => (
                      <div key={b.id} className="p-3 bg-amber-50/20 border border-amber-100/30 rounded-2xl space-y-2 relative">
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="font-bold text-amber-700">📢 Pengumuman</span>
                          <span>{formatDate(b.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{b.message}</p>
                        {b.linkUrl && (
                          <a
                            href={b.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-xl shadow-xs transition-all cursor-pointer mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {b.linkText || 'Buka Link Pendukung'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* HISTORY & PROGRESS TIMELINE VIEW */
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Reports List Left (Spans 5) */}
            <div className="md:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left px-1 mb-2">
                Daftar Laporan yang Telah Dikirim ({myReports.length})
              </h3>

              {myReports.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 text-xs">
                  Kamu belum pernah mengirim laporan. Tulis laporan barumu di tab tulis.
                </div>
              ) : (
                myReports.map(r => {
                  const statusInfo = getStatusBadge(r.status);
                  const typeInfo = getTypeBadge(r.type);
                  const isSelected = selectedReport?.id === r.id;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`p-4 bg-white border rounded-2xl shadow-xs hover:shadow-md cursor-pointer transition-all text-left ${
                        isSelected ? 'border-pink-500 ring-2 ring-pink-500/5' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase border ${typeInfo.bg}`}>
                          {typeInfo.label}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {formatDate(r.createdAt).split(',')[0]}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-800 mt-2 truncate">{r.title}</h4>
                      
                      <div className="flex items-center justify-between mt-3 border-t border-slate-50 pt-2.5">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.bg}`}>
                          <span className={`w-1 h-1 rounded-full ${statusInfo.dot}`}></span>
                          {statusInfo.label}
                        </span>
                        
                        <span className="text-[9px] text-pink-600 font-extrabold">
                          {r.replies.length} Pesan Balasan
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Conversation View Right (Spans 7) */}
            <div className="md:col-span-7">
              <AnimatePresence>
                {selectedReport ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col h-full"
                  >
                    {/* Active Conversation Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
                      <div className="min-w-0">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Ulasan Respons & Tindak Lanjut</span>
                        <h3 className="text-xs font-bold text-slate-800 truncate mt-0.5">{selectedReport.title}</h3>
                      </div>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(selectedReport.status).bg}`}>
                        {getStatusBadge(selectedReport.status).label}
                      </span>
                    </div>

                    {/* Chat and timeline content */}
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-1 pb-3 text-left">
                      
                      {/* Interactive Progress Timeline */}
                      <div className="bg-indigo-50/40 border border-indigo-100 p-3.5 rounded-2xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Status Alur Laporan:</span>
                        <div className="flex items-center justify-between relative">
                          {/* Timeline connector line */}
                          <div className="absolute top-2.5 left-5 right-5 h-0.5 bg-slate-200 -z-10"></div>
                          
                          {/* Step 1: Sent */}
                          <div className="flex flex-col items-center">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold z-10">✓</div>
                            <span className="text-[9px] font-bold text-slate-600 mt-1">Terkirim</span>
                          </div>

                          {/* Step 2: Processed */}
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${
                              selectedReport.status === 'processed' || selectedReport.status === 'resolved'
                                ? 'bg-sky-500 text-white' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {(selectedReport.status === 'processed' || selectedReport.status === 'resolved') ? '✓' : '2'}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 mt-1">Diproses</span>
                          </div>

                          {/* Step 3: Resolved */}
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${
                              selectedReport.status === 'resolved'
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {selectedReport.status === 'resolved' ? '✓' : '3'}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 mt-1">Selesai</span>
                          </div>
                        </div>
                      </div>

                      {/* Original Report Text */}
                      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="flex justify-between border-b border-slate-100/50 pb-1.5 mb-2.5">
                          <span className="text-[10px] font-bold text-slate-500">Isi Pengaduan Kamu:</span>
                          <span className="text-[9px] text-slate-400 font-medium">{formatDate(selectedReport.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                          {decryptMessage(selectedReport.content)}
                        </p>

                        {/* Image inside detailed history */}
                        {selectedReport.attachmentUrl && (
                          <div className="mt-3.5 pt-3 border-t border-slate-200/40">
                            <span className="text-[9px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 text-pink-500" /> Lampiran Bukti Foto:
                            </span>
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-44 group cursor-zoom-in">
                              <img 
                                src={selectedReport.attachmentUrl} 
                                alt="Bukti Pengaduan" 
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                                onClick={() => handleOpenPhoto(selectedReport.attachmentUrl!)}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                                Klik untuk memperbesar
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Responses list */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Percakapan dengan Wali Asuh & Orang Tua ({selectedReport.replies.length}):</span>
                        {selectedReport.replies.map(rep => {
                          const isMe = rep.senderId === currentUser.id;
                          const isPesanOrtu = selectedReport.type === 'pesan_ortu';
                          const isChildReply = rep.senderRole === 'anak_asuh';
                          const isApproved = rep.isApproved;

                          return (
                            <div 
                              key={rep.id}
                              className={`p-3 rounded-2xl text-xs flex flex-col max-w-[90%] leading-relaxed ${
                                isMe 
                                  ? 'bg-pink-50 text-pink-950 border border-pink-100 ml-auto items-end text-right' 
                                  : rep.senderRole === 'orang_tua'
                                    ? 'bg-amber-50 text-amber-950 border border-amber-100 mr-auto items-start text-left'
                                    : 'bg-violet-50 text-violet-950 border border-violet-100 mr-auto items-start text-left'
                              }`}
                            >
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[9px] font-bold text-slate-400">
                                <span className={isMe ? "text-pink-600" : rep.senderRole === 'orang_tua' ? "text-amber-600" : "text-violet-600"}>
                                  {rep.senderName} {rep.senderRole === 'orang_tua' ? '(Orang Tua)' : rep.senderRole === 'wali_asuh' ? '(Wali Asuh)' : isMe ? '(Anda)' : ''}
                                </span>
                                <span>•</span>
                                <span>{formatDate(rep.createdAt).split(',')[0]}</span>

                                {isPesanOrtu && isChildReply && (
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${
                                    isApproved 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>
                                    {isApproved ? '✅ Terkirim ke Ortu' : '⏳ Menunggu Persetujuan Wali'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold break-words leading-relaxed text-left">
                                {decryptMessage(rep.content)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Chat Reply Input */}
                    <form onSubmit={handleSendReply} className="border-t border-slate-100 pt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Balas pesan wali asuh kamu..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-pink-500 focus:bg-white transition-all text-slate-800"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 animate-bounce"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </motion.div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 text-xs h-full flex flex-col items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                    <span>Pilih salah satu laporan di sebelah kiri untuk melihat rincian tanggapan, progres, dan percakapan aman.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

      </div>

      {/* Image zoom modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4"
          >
            {/* Top Bar with metadata and close */}
            <div className="w-full max-w-5xl flex items-center justify-between z-10 pt-2 pb-4 border-b border-white/10">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LAMPIRAN BUKTI SAYA</span>
                <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {selectedReport?.title || "Foto Bukti"}
                </h4>
                {selectedReport && (
                  <p className="text-xs text-slate-400">
                    Oleh: <span className="font-semibold text-pink-400">{currentUser.name}</span> • {formatDate(selectedReport.createdAt)}
                  </p>
                )}
              </div>
              
              {/* Close Button */}
              <button 
                type="button"
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10"
                onClick={() => setShowPhotoModal(null)}
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle Container with Image */}
            <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-4">
              <motion.div
                className="relative flex items-center justify-center"
                style={{
                  scale: zoomScale,
                  rotate: `${rotation}deg`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <img 
                  src={showPhotoModal} 
                  alt="Lampiran Bukti Pengaduan Zoom" 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl select-none"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* Bottom Bar: Action Toolbar & Zoom Display */}
            <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4 pb-2 z-10">
              {/* Scale / Info display */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
                  Zoom: {Math.round(zoomScale * 100)}%
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
                  Rotasi: {rotation}°
                </span>
              </div>

              {/* Toolbar Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/5"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.min(4, prev + 0.25))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/5"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/5"
                  title="Putar Kanan"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomScale(1); setRotation(0); }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/5"
                  title="Reset Tampilan"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                
                {/* Download Button */}
                <a
                  href={showPhotoModal}
                  download={`bukti_${selectedReport?.id || "foto"}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition-all cursor-pointer border border-pink-500/10 flex items-center gap-1.5 px-4 font-bold text-xs"
                  title="Download / Simpan Foto"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Simpan Foto</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Message Popup Modal */}
      <AnimatePresence>
        {activePopups.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleDismissBroadcast(activePopups[0].id)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative z-10 border border-slate-100 text-left overflow-hidden"
            >
              {/* Decorative top strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

              <div className="flex items-start gap-4 mt-2">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <Megaphone className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Pengumuman Wali Asuh</span>
                  <h3 className="text-sm font-extrabold text-slate-800 mt-1">Pesan dari {activePopups[0].senderName}</h3>
                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{formatDate(activePopups[0].createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {activePopups[0].message}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-5 space-y-2">
                {activePopups[0].linkUrl && (
                  <a
                    href={activePopups[0].linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl py-3 text-xs tracking-wider transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {activePopups[0].linkText || 'Buka Link Pendukung'}
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDismissBroadcast(activePopups[0].id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 text-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
