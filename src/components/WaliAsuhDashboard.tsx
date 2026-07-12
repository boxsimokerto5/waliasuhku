import React, { useState, useEffect } from 'react';
import { User, Report, Reply, Broadcast } from '../types';
import { Plus, UserPlus, FileText, Send, Lock, ShieldAlert, Heart, Clipboard, HelpCircle, Eye, CheckCircle2, MessageSquare, Image as ImageIcon, MessageCircle, ZoomIn, ZoomOut, RotateCw, X, Download, Maximize2, Megaphone, Trash2, Link, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { decryptMessage, encryptMessage, formatDate, getStatusBadge, getTypeBadge } from '../utils/crypto';

interface WaliAsuhDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  broadcasts: Broadcast[];
  onCreateAnakAsuh: (username: string, name: string, waliAsuhId: string) => void;
  onUpdateReportStatus: (reportId: string, status: 'pending' | 'processed' | 'resolved') => void;
  onAddReply: (reportId: string, replyContent: string) => void;
  onCreateBroadcast: (message: string, linkUrl?: string, linkText?: string) => void;
  onDeleteBroadcast: (broadcastId: string) => void;
}

export default function WaliAsuhDashboard({
  currentUser,
  users,
  reports,
  broadcasts,
  onCreateAnakAsuh,
  onUpdateReportStatus,
  onAddReply,
  onCreateBroadcast,
  onDeleteBroadcast
}: WaliAsuhDashboardProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processed' | 'resolved'>('all');
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLinkUrl, setBroadcastLinkUrl] = useState('');
  const [broadcastLinkText, setBroadcastLinkText] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMyChildrenOpen, setIsMyChildrenOpen] = useState(true);

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

  const [filterType, setFilterType] = useState<'all' | 'reports_only' | 'pesan_ortu' | 'kebutuhan_logistik'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter children under this Wali Asuh
  const myChildren = users.filter(u => u.role === 'anak_asuh' && u.waliAsuhId === currentUser.id);

  // Filter reports sent to this Wali Asuh
  const myReports = reports.filter(r => r.receiverId === currentUser.id);

  const filteredReports = myReports.filter(r => {
    // Filter by type
    if (filterType === 'reports_only' && (r.type === 'pesan_ortu' || r.type === 'kebutuhan_logistik')) return false;
    if (filterType === 'pesan_ortu' && r.type !== 'pesan_ortu') return false;
    if (filterType === 'kebutuhan_logistik' && r.type !== 'kebutuhan_logistik') return false;

    // Filter by status tab
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername || !newName) {
      setError('Mohon lengkapi semua bidang form');
      return;
    }

    if (newUsername.length < 3) {
      setError('Username anak asuh minimal 3 karakter');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      setError('Username tersebut sudah digunakan oleh akun lain');
      return;
    }

    onCreateAnakAsuh(newUsername.trim(), newName.trim(), currentUser.id);
    setSuccess(`Akun Anak Asuh "${newName}" berhasil didaftarkan! Password default adalah "${newUsername.trim()}"`);
    setNewUsername('');
    setNewName('');
  };

  const handleSubmitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError('');
    setBroadcastSuccess('');

    if (!broadcastMessage.trim()) {
      setBroadcastError('Isi pesan siaran tidak boleh kosong');
      return;
    }

    if (broadcastLinkUrl.trim() && !broadcastLinkUrl.trim().startsWith('http://') && !broadcastLinkUrl.trim().startsWith('https://')) {
      setBroadcastError('Link tautan harus diawali dengan http:// atau https://');
      return;
    }

    onCreateBroadcast(
      broadcastMessage.trim(),
      broadcastLinkUrl.trim() || undefined,
      broadcastLinkText.trim() || undefined
    );

    setBroadcastSuccess('Pesan siaran/pengumuman berhasil dikirim!');
    setBroadcastMessage('');
    setBroadcastLinkUrl('');
    setBroadcastLinkText('');

    setTimeout(() => {
      setBroadcastSuccess('');
    }, 4000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReport) return;

    onAddReply(selectedReport.id, replyText.trim());
    setReplyText('');
    
    // Refresh the selected report context with the new reply
    const updatedReport = reports.find(r => r.id === selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 text-slate-800">
      {/* Guardian Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl text-left">
          <span className="text-xs font-bold bg-violet-500/40 text-violet-100 px-3 py-1 rounded-full border border-violet-400/20">
            Dasbor Wali Asuh
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Selamat Datang, {currentUser.name}</h2>
          <p className="text-violet-100/80 text-sm mt-2 leading-relaxed">
            Pantau dan tanggapi setiap laporan, pengaduan, dan curhatan dari anak asuh Anda secara bijaksana. WaliAsuhku menjamin pesan yang masuk dienkripsi dan hanya dapat diakses oleh Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Anak Asuh Management (Spans 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Create Anak Asuh Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(!isRegisterOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Daftarkan Anak Asuh Baru</h3>
                  <p className="text-[10px] text-slate-400">Buat akun untuk anak asuh baru</p>
                </div>
              </div>
              <span className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition-all shrink-0">
                {isRegisterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isRegisterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-slate-50 pt-4"
                >
                  <form onSubmit={handleCreateChild} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium text-left">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium text-left">
                        {success}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                        Nama Anak Asuh
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Contoh: Fajar Pratama"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                        Username Akun
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="Contoh: fajar"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block leading-tight text-left">
                        * Tanpa spasi. Password default disamakan dengan username anak.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-md shadow-violet-600/10 active:scale-[0.98] cursor-pointer"
                    >
                      Simpan Anak Asuh
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List of My Children */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setIsMyChildrenOpen(!isMyChildrenOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Anak Asuh Saya ({myChildren.length})</h3>
                  <p className="text-[10px] text-slate-400">Daftar anak asuh terhubung</p>
                </div>
              </div>
              <span className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition-all shrink-0">
                {isMyChildrenOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isMyChildrenOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-slate-50 pt-4"
                >
                  {myChildren.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Belum ada anak asuh terdaftar. Gunakan formulir di atas untuk mendaftarkannya.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {myChildren.map(c => {
                        const childReportCount = reports.filter(r => r.senderId === c.id).length;
                        return (
                          <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100/60 rounded-2xl hover:bg-slate-100/50 transition-all text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {c.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono">ID: {c.username}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full shrink-0 border border-violet-100/40">
                              {childReportCount} Laporan
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Broadcast & Announcement Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Broadcast Pengumuman</h3>
            </div>

            <form onSubmit={handleSubmitBroadcast} className="space-y-3">
              {broadcastError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium text-left">
                  {broadcastError}
                </div>
              )}
              {broadcastSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium text-left">
                  {broadcastSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Pesan Pengumuman
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Tulis pengumuman penting atau instruksi pengisian assessment untuk anak asuh..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Link Tautan Pendukung (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Link className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={broadcastLinkUrl}
                    onChange={(e) => setBroadcastLinkUrl(e.target.value)}
                    placeholder="Contoh: https://docs.google.com/forms/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Teks Tombol Tautan (Opsional)
                </label>
                <input
                  type="text"
                  value={broadcastLinkText}
                  onChange={(e) => setBroadcastLinkText(e.target.value)}
                  placeholder="Default: Buka Link Pendukung"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                Siarkan Sekarang
              </button>
            </form>

            {/* List of Active Broadcasts */}
            <div className="pt-3 border-t border-slate-50 text-left">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Siaran Anda Saat Ini
              </h4>

              {broadcasts.filter(b => b.senderId === currentUser.id).length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">Belum ada pesan siaran aktif dari Anda.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {broadcasts
                    .filter(b => b.senderId === currentUser.id)
                    .map(b => (
                      <div key={b.id} className="p-3 bg-amber-50/30 border border-amber-100/50 rounded-2xl space-y-1.5 text-left relative group">
                        <button
                          type="button"
                          onClick={() => onDeleteBroadcast(b.id)}
                          className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 shadow-xs transition-all cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100"
                          title="Hapus Siaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-xs font-semibold text-slate-800 pr-5 whitespace-pre-wrap">{b.message}</p>
                        {b.linkUrl && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                            <Link className="w-3 h-3 shrink-0" />
                            <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[150px]">
                              {b.linkText || 'Buka Tautan'}
                            </a>
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 block pt-0.5">{formatDate(b.createdAt)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reports & Details Panel (Spans 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Report Feed (Spans 6 or 12 depending on if detail is open) */}
          <div className={`space-y-4 ${selectedReport ? 'md:col-span-6' : 'md:col-span-12'}`}>
            
            {/* Feed Filter Header */}
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <h3 className="text-sm font-extrabold text-slate-800 shrink-0">Laporan Masuk ({myReports.length})</h3>
              
              <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all ${activeTab === 'pending' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Menunggu
                </button>
                <button
                  onClick={() => setActiveTab('processed')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all ${activeTab === 'processed' ? 'bg-sky-100 text-sky-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Diproses
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all ${activeTab === 'resolved' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Type Filters Sub-Bar */}
            <div className="bg-white border border-slate-100/75 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kategori:</span>
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'all' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Semua Tipe
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('reports_only')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'reports_only' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Hanya Laporan/Curhat
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('pesan_ortu')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'pesan_ortu' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  💌 Hanya Pesan Ortu
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('kebutuhan_logistik')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'kebutuhan_logistik' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  📦 Logistik Habis
                </button>
              </div>
            </div>

            {/* Feed Cards Container */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredReports.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 text-xs">
                  Tidak ada laporan dalam kategori ini.
                </div>
              ) : (
                filteredReports.map(r => {
                  const statusInfo = getStatusBadge(r.status);
                  const typeInfo = getTypeBadge(r.type);
                  const isSelected = selectedReport?.id === r.id;

                  return (
                    <motion.div
                      key={r.id}
                      onClick={() => {
                        setSelectedReport(r);
                        // Mark any local notifications related to this report as read
                      }}
                      className={`p-4 bg-white border rounded-3xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left ${
                        isSelected ? 'border-violet-500 ring-2 ring-violet-500/10' : 'border-slate-100'
                      }`}
                      whileHover={{ y: -1 }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${typeInfo.bg}`}>
                            {typeInfo.label}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(r.createdAt).split(',')[0]}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-2 truncate">{r.title}</h4>
                      
                      <div className="flex items-center gap-1.5 mt-2 bg-emerald-50/50 border border-emerald-100/50 p-1.5 px-2 rounded-xl w-fit">
                        <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="text-[9px] text-emerald-700 font-bold tracking-tight">Privasi Terenkripsi End-to-End</span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {decryptMessage(r.content)}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 uppercase">
                            {r.senderName.charAt(0)}
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 truncate">{r.senderName}</p>
                        </div>
                        
                        {r.type === 'pesan_ortu' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(r.id, decryptMessage(r.content));
                            }}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              copiedId === r.id
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'
                            }`}
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                            <span>{copiedId === r.id ? 'Tersalin!' : 'Salin Pesan'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-violet-600 font-extrabold">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{r.replies.length} Tanggapan</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Report Detail & Conversation Panel (Spans 6) */}
          <AnimatePresence>
            {selectedReport && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="md:col-span-6 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm h-full flex flex-col"
              >
                {/* Detail Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Detail Percakapan</span>
                    <h3 className="text-xs font-bold text-slate-800 truncate mt-0.5">{selectedReport.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                {/* Scroller Details Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-left max-h-[380px] pb-3">
                  
                  {/* Encryption Notice */}
                  <div className="bg-emerald-50 border border-emerald-100/80 p-3 rounded-2xl flex items-start gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-950 uppercase tracking-wide">Dekripsi Sukses (Aman)</h4>
                      <p className="text-[10px] text-emerald-800 leading-tight mt-0.5">
                        Pesan di bawah telah didekripsi menggunakan kunci unik Wali Asuh Anda. Keamanan percakapan terjamin.
                      </p>
                    </div>
                  </div>

                  {/* Copy Action for Message to Parents */}
                  {selectedReport.type === 'pesan_ortu' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col gap-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950">Salin Pesan Orang Tua</span>
                        <button
                          onClick={() => handleCopyText(selectedReport.id, decryptMessage(selectedReport.content))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                            copiedId === selectedReport.id
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Clipboard className="w-4 h-4" />
                          <span>{copiedId === selectedReport.id ? 'Tersalin!' : 'Salin Pesan'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-normal">
                        Gunakan tombol di atas untuk menyalin isi pesan dari {selectedReport.senderName} ini sehingga Anda dapat menempelkannya (paste) ke SMS, WhatsApp, atau saluran orang tuanya dengan mudah.
                      </p>
                    </div>
                  )}

                  {/* Original Report Box */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100/50 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        <span className="text-[10px] font-bold text-slate-700">{selectedReport.senderName}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {formatDate(selectedReport.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {decryptMessage(selectedReport.content)}
                    </p>

                    {/* Proof Attachment Image if exists */}
                    {selectedReport.attachmentUrl && (
                      <div className="mt-4 pt-3 border-t border-slate-200/50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Lampiran Bukti Foto:
                        </span>
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-40 group cursor-zoom-in">
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

                  {/* Status Timeline / Process Tools */}
                  <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status Laporan Saat Ini:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(selectedReport.status).bg}`}>
                        {getStatusBadge(selectedReport.status).label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedReport.status !== 'processed' && (
                        <button
                          onClick={() => {
                            onUpdateReportStatus(selectedReport.id, 'processed');
                            // Refresh current view
                            selectedReport.status = 'processed';
                          }}
                          className="px-2.5 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-[10px] font-bold hover:bg-sky-100 transition-all cursor-pointer text-center"
                        >
                          {selectedReport.type === 'kebutuhan_logistik' ? '📦 Siapkan Logistik' : 'Tindaklanjuti (Proses)'}
                        </button>
                      )}
                      {selectedReport.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            onUpdateReportStatus(selectedReport.id, 'resolved');
                            // Refresh current view
                            selectedReport.status = 'resolved';
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-all cursor-pointer text-center"
                        >
                          {selectedReport.type === 'kebutuhan_logistik' ? '✅ Serahkan Properti' : 'Selesaikan Laporan'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies (Thread) */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Diskusi & Tindakan ({selectedReport.replies.length}):</span>
                    {selectedReport.replies.map(rep => {
                      const isMe = rep.senderId === currentUser.id;
                      return (
                        <div 
                          key={rep.id} 
                          className={`p-3 rounded-2xl text-xs flex flex-col max-w-[90%] leading-relaxed ${
                            isMe 
                              ? 'bg-violet-50 text-violet-950 border border-violet-100 ml-auto items-end text-right' 
                              : 'bg-slate-50 text-slate-800 border border-slate-100 mr-auto items-start text-left'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-slate-400">
                            <span>{rep.senderName}</span>
                            <span>•</span>
                            <span>{formatDate(rep.createdAt).split(',')[0]}</span>
                          </div>
                          <p className="text-[11px] font-medium leading-relaxed break-words">
                            {decryptMessage(rep.content)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="border-t border-slate-100 pt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis pesan/tindakan balasan..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LAMPIRAN BUKTI</span>
                <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {selectedReport?.title || "Foto Bukti"}
                </h4>
                {selectedReport && (
                  <p className="text-xs text-slate-400">
                    Oleh: <span className="font-semibold text-pink-400">{selectedReport.senderName}</span> • {formatDate(selectedReport.createdAt)}
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

    </div>
  );
}
