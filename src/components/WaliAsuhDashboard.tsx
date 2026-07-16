import React, { useState, useEffect } from 'react';
import { User, Report, Reply, Broadcast, SavingsTransaction } from '../types';
import { Plus, UserPlus, FileText, Send, Lock, ShieldAlert, Heart, Clipboard, HelpCircle, Eye, CheckCircle2, MessageSquare, Image as ImageIcon, MessageCircle, ZoomIn, ZoomOut, RotateCw, X, Download, Maximize2, Megaphone, Trash2, Link, ChevronDown, ChevronUp, Calendar, MoreVertical, Tag, Filter, Check, FolderOpen, Mail, ArrowLeft, Home, Coins } from 'lucide-react';
import { generateSingleCardPDF, generateAllCardsPDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { decryptMessage, encryptMessage, formatDate, getStatusBadge, getTypeBadge } from '../utils/crypto';
import { ChildRegistration } from './ChildRegistration';
import { ParentRegistration } from './ParentRegistration';
import { BroadcastModule } from './BroadcastModule';
import { AnakAsuhList } from './AnakAsuhList';
import { SavingsManagement } from './SavingsManagement';

interface WaliAsuhDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  broadcasts: Broadcast[];
  savingsTransactions: SavingsTransaction[];
  onCreateAnakAsuh: (username: string, name: string, waliAsuhId: string) => void;
  onCreateOrangTua: (username: string, name: string, waliAsuhId: string, anakAsuhId: string) => void;
  onUpdateReportStatus: (reportId: string, status: 'pending' | 'processed' | 'resolved') => void;
  onUpdateParentApproval: (reportId: string, approvalStatus: 'approved' | 'rejected') => void;
  onAddReply: (reportId: string, replyContent: string) => void;
  onUpdateReplyApproval: (reportId: string, replyId: string, isApproved: boolean) => void;
  onCreateBroadcast: (message: string, linkUrl?: string, linkText?: string) => void;
  onDeleteBroadcast: (broadcastId: string) => void;
  onUpdateChildCategory: (childId: string, category: string) => void;
  onToggleUserSuspension?: (userId: string, isSuspended: boolean) => void;
  onAddSavingsTransaction: (studentId: string, amount: number, type: 'setor' | 'tarik', description: string) => void;
}

export default function WaliAsuhDashboard({
  currentUser,
  users,
  reports,
  broadcasts,
  savingsTransactions,
  onCreateAnakAsuh,
  onCreateOrangTua,
  onUpdateReportStatus,
  onUpdateParentApproval,
  onAddReply,
  onUpdateReplyApproval,
  onCreateBroadcast,
  onDeleteBroadcast,
  onUpdateChildCategory,
  onToggleUserSuspension,
  onAddSavingsTransaction
}: WaliAsuhDashboardProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State variables for registering Parent (Orang Tua) accounts
  const [isParentRegisterOpen, setIsParentRegisterOpen] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [parentError, setParentError] = useState('');
  const [parentSuccess, setParentSuccess] = useState('');

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processed' | 'resolved' | 'butuh_persetujuan'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'all'>('today');
  const [accountManagementTab, setAccountManagementTab] = useState<'anak_asuh' | 'orang_tua'>('anak_asuh');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLinkUrl, setBroadcastLinkUrl] = useState('');
  const [broadcastLinkText, setBroadcastLinkText] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  
  // Category management and filtering states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeMenuChildId, setActiveMenuChildId] = useState<string | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [isCustomCategoryInputOpen, setIsCustomCategoryInputOpen] = useState<string | null>(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMyChildrenOpen, setIsMyChildrenOpen] = useState(true);
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

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

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuChildId(null);
    };
    if (activeMenuChildId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeMenuChildId]);

  const [filterType, setFilterType] = useState<'all' | 'reports_only' | 'pesan_ortu' | 'kebutuhan_logistik' | 'curhatan' | 'laporan'>('all');
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

  // Filter parent accounts linked to my children
  const myParents = users.filter(u => u.role === 'orang_tua' && myChildren.some(child => child.id === u.anakAsuhId));

  // Filter accounts for account management
  const filteredAccounts = (accountManagementTab === 'anak_asuh' ? myChildren : myParents).filter(acc => {
    if (!accountSearchQuery.trim()) return true;
    const query = accountSearchQuery.toLowerCase();
    return acc.name.toLowerCase().includes(query) || acc.username.toLowerCase().includes(query);
  });

  // Get unique categories from children
  const existingCategories = Array.from(
    new Set(myChildren.map(c => c.category).filter(Boolean))
  ) as string[];

  const defaultPresetCategories = ['Kelas 10', 'Kelas 11', 'Kelas 12', 'Asrama A', 'Asrama B'];
  
  // All combined available categories
  const allAvailableCategories = Array.from(
    new Set([...defaultPresetCategories, ...existingCategories])
  );

  const filteredChildren = myChildren.filter(c => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'uncategorized') return !c.category;
    return c.category === selectedCategoryFilter;
  });

  // Filter reports sent to this Wali Asuh
  const myReports = reports.filter(r => r.receiverId === currentUser.id);

  const reportsNeedingApprovalCount = myReports.filter(r => {
    const hasUnapprovedReply = r.replies && r.replies.some(rep => rep.senderRole === 'anak_asuh' && rep.isApproved === false);
    const needsParentApproval = r.type === 'pesan_ortu' && r.parentApprovalStatus === 'pending';
    const isPendingReport = r.status === 'pending';
    return hasUnapprovedReply || needsParentApproval || isPendingReport;
  }).length;

  const filteredReports = myReports.filter(r => {
    // Filter by type
    if (filterType === 'reports_only' && (r.type === 'pesan_ortu' || r.type === 'kebutuhan_logistik')) return false;
    if (filterType === 'pesan_ortu' && r.type !== 'pesan_ortu') return false;
    if (filterType === 'kebutuhan_logistik' && r.type !== 'kebutuhan_logistik') return false;
    if (filterType === 'curhatan' && r.type !== 'curhatan') return false;
    if (filterType === 'laporan' && r.type !== 'pengaduan' && r.type !== 'pelaporan') return false;

    // Filter by status tab
    if (activeTab !== 'all') {
      if (activeTab === 'butuh_persetujuan') {
        const hasUnapprovedReply = r.replies && r.replies.some(rep => rep.senderRole === 'anak_asuh' && rep.isApproved === false);
        const needsParentApproval = r.type === 'pesan_ortu' && r.parentApprovalStatus === 'pending';
        const isPendingReport = r.status === 'pending';
        if (!hasUnapprovedReply && !needsParentApproval && !isPendingReport) return false;
      } else if (r.status !== activeTab) {
        return false;
      }
    }

    // Filter by date category
    const reportDate = new Date(r.createdAt);
    const now = new Date();

    // 1. Today boundaries
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // 2. Yesterday boundaries
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(now.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(now);
    yesterdayEnd.setDate(now.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // 3. This week boundaries (Monday to Sunday)
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + distanceToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 4. This month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    if (dateFilter === 'today') {
      if (reportDate < todayStart || reportDate > todayEnd) return false;
    } else if (dateFilter === 'yesterday') {
      if (reportDate < yesterdayStart || reportDate > yesterdayEnd) return false;
    } else if (dateFilter === 'this_week') {
      if (reportDate < weekStart || reportDate > weekEnd) return false;
    } else if (dateFilter === 'this_month') {
      if (reportDate < monthStart || reportDate > monthEnd) return false;
    }

    return true;
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

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    setParentError('');
    setParentSuccess('');

    if (!parentName || !parentUsername || !selectedChildId) {
      setParentError('Mohon lengkapi semua bidang form dan pilih anak asuh');
      return;
    }

    if (parentUsername.length < 3) {
      setParentError('Username orang tua minimal 3 karakter');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === parentUsername.toLowerCase())) {
      setParentError('Username tersebut sudah digunakan oleh akun lain');
      return;
    }

    onCreateOrangTua(parentUsername.trim(), parentName.trim(), currentUser.id, selectedChildId);
    setParentSuccess(`Akun Orang Tua "${parentName}" berhasil didaftarkan! Password default adalah "${parentUsername.trim()}"`);
    setParentUsername('');
    setParentName('');
    setSelectedChildId('');
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

  const renderSubPageHeader = (title: string, subtitle: string, icon: React.ReactNode) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-4 rounded-3xl text-left mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-700 rounded-2xl border border-violet-100">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
            <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveSubPage(null);
            setSelectedReport(null);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-2xl text-[11px] font-extrabold transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Menu Utama</span>
        </button>
      </div>
    );
  };

  let subPageTitle = "";
  let subPageSubtitle = "";
  let subPageIcon: React.ReactNode = null;

  if (activeSubPage === 'register_anak_asuh') {
    subPageTitle = "Daftarkan Anak Asuh Baru";
    subPageSubtitle = "Buat akun login baru untuk siswa/siswi yang menjadi anak asuh Anda";
    subPageIcon = <UserPlus className="w-5 h-5 text-violet-600" />;
  } else if (activeSubPage === 'register_orang_tua') {
    subPageTitle = "Daftarkan Orang Tua";
    subPageSubtitle = "Buat akun login untuk wali murid atau orang tua agar dapat terhubung dengan anaknya";
    subPageIcon = <UserPlus className="w-5 h-5 text-amber-600" />;
  } else if (activeSubPage === 'broadcast') {
    subPageTitle = "Broadcast Pengumuman";
    subPageSubtitle = "Siarkan instruksi atau pengumuman penting secara massal ke semua anak asuh Anda";
    subPageIcon = <Megaphone className="w-5 h-5 text-sky-600" />;
  } else if (activeSubPage === 'pesan_ortu') {
    subPageTitle = "Pesan ke Orang Tua";
    subPageSubtitle = "Laporan khusus siswa yang disiapkan untuk diteruskan ke Orang Tua";
    subPageIcon = <Mail className="w-5 h-5 text-emerald-600" />;
  } else if (activeSubPage === 'curhatan') {
    subPageTitle = "Curahan Hati Anak";
    subPageSubtitle = "Sesi cerita pribadi yang dienkripsi aman antara Anda dan siswa";
    subPageIcon = <Heart className="w-5 h-5 text-rose-600" />;
  } else if (activeSubPage === 'kebutuhan_logistik') {
    subPageTitle = "Kebutuhan Logistik Habis";
    subPageSubtitle = "Pendataan perlengkapan asrama/sekolah siswa yang telah habis";
    subPageIcon = <FolderOpen className="w-5 h-5 text-yellow-600" />;
  } else if (activeSubPage === 'laporan') {
    subPageTitle = "Laporan & Kendala Siswa";
    subPageSubtitle = "Daftar pelaporan penting mengenai aktivitas atau kendala siswa";
    subPageIcon = <FileText className="w-5 h-5 text-red-600" />;
  } else if (activeSubPage === 'tabungan') {
    subPageTitle = "Tabungan Anak Asuh";
    subPageSubtitle = "Kelola saldo tabungan, catat setoran dan penarikan uang saku anak asuh Anda";
    subPageIcon = <Coins className="w-5 h-5 text-emerald-600" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 text-slate-800">
      {activeSubPage !== null && renderSubPageHeader(subPageTitle, subPageSubtitle, subPageIcon)}

      {/* Guardian Welcome Banner */}
      {activeSubPage === null && (
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
      )}

      {/* Kategori Pintasan & Fitur (Quick Action Categories) */}
      {activeSubPage === null && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Kategori Tindakan & Pintasan Fitur</h3>
              <p className="text-[10px] text-slate-400">Pilih kategori tindakan atau tipe laporan di bawah untuk membuka fiturnya</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 pt-1">
            {/* 1. Akun Anak Asuh */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('register_anak_asuh');
                setIsRegisterOpen(true);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-violet-50 border border-violet-100 text-violet-700 hover:bg-violet-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <UserPlus className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Daftar Anak Asuh</span>
            </button>

            {/* 2. Akun Orang Tua */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('register_orang_tua');
                setIsParentRegisterOpen(true);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <UserPlus className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Daftar Orang Tua</span>
            </button>

            {/* 3. Broadcast */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('broadcast');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 hover:bg-sky-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <Megaphone className="w-5 h-5 text-sky-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Broadcast</span>
            </button>

            {/* 4. Pesan ke Orang Tua */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('pesan_ortu');
                setFilterType('pesan_ortu');
                setActiveTab('all');
                setSelectedReport(null);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Pesan ke Ortu</span>
            </button>

            {/* 5. Curhatan Anak Asuh */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('curhatan');
                setFilterType('curhatan');
                setActiveTab('all');
                setSelectedReport(null);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Curhat Anak</span>
            </button>

            {/* 6. Pendataan Logistik */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('kebutuhan_logistik');
                setFilterType('kebutuhan_logistik');
                setActiveTab('all');
                setSelectedReport(null);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-700 hover:bg-yellow-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <FolderOpen className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Logistik Habis</span>
            </button>

            {/* 7. Laporan */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('laporan');
                setFilterType('laporan');
                setActiveTab('all');
                setSelectedReport(null);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Laporan Siswa</span>
            </button>

            {/* 8. Tabungan Anak Asuh */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('tabungan');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Tabungan Anak</span>
            </button>

            {/* 9. Kelola Akun */}
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('kelola_akun');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100/70 transition-all text-center cursor-pointer gap-1.5"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight">Kelola Status Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Register Anak Asuh Sub-Page */}
      {activeSubPage === 'register_anak_asuh' && (
        <ChildRegistration
          newName={newName}
          setNewName={setNewName}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          error={error}
          success={success}
          onSubmit={handleCreateChild}
        />
      )}

      {/* 2. Register Orang Tua Sub-Page */}
      {activeSubPage === 'register_orang_tua' && (
        <ParentRegistration
          parentName={parentName}
          setParentName={setParentName}
          parentUsername={parentUsername}
          setParentUsername={setParentUsername}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
          myChildren={myChildren}
          parentError={parentError}
          parentSuccess={parentSuccess}
          onSubmit={handleCreateParent}
        />
      )}

      {/* 3. Broadcast Module Sub-Page */}
      {activeSubPage === 'broadcast' && (
        <BroadcastModule
          broadcastMessage={broadcastMessage}
          setBroadcastMessage={setBroadcastMessage}
          broadcastLinkUrl={broadcastLinkUrl}
          setBroadcastLinkUrl={setBroadcastLinkUrl}
          broadcastLinkText={broadcastLinkText}
          setBroadcastLinkText={setBroadcastLinkText}
          broadcastError={broadcastError}
          broadcastSuccess={broadcastSuccess}
          handleSubmitBroadcast={handleSubmitBroadcast}
          broadcasts={broadcasts}
          onDeleteBroadcast={onDeleteBroadcast}
          currentUser={currentUser}
          formatDate={formatDate}
        />
      )}

      {/* Tabungan Management Sub-Page */}
      {activeSubPage === 'tabungan' && (
        <SavingsManagement
          currentUser={currentUser}
          myChildren={myChildren}
          savingsTransactions={savingsTransactions}
          onAddSavingsTransaction={onAddSavingsTransaction}
          onBack={() => setActiveSubPage(null)}
        />
      )}

      {/* 4. Account Management Sub-Page */}
      {activeSubPage === 'kelola_akun' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Manajemen Status & Penangguhan Akun</h3>
                <p className="text-xs text-slate-500 font-medium">Tangguhkan (suspend) sementara atau aktifkan kembali akun siswa dan orang tua asuh Anda.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubPage(null)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dasbor</span>
            </button>
          </div>

          {/* Tab Management & Print All Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-md">
              <button
                type="button"
                onClick={() => setAccountManagementTab('anak_asuh')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all text-center ${
                  accountManagementTab === 'anak_asuh' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Anak Asuh ({myChildren.length})
              </button>
              <button
                type="button"
                onClick={() => setAccountManagementTab('orang_tua')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all text-center ${
                  accountManagementTab === 'orang_tua' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Orang Tua ({myParents.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const tabLabel = accountManagementTab === 'anak_asuh' ? 'Anak Asuh' : 'Orang Tua';
                generateAllCardsPDF(filteredAccounts, users, tabLabel);
              }}
              disabled={filteredAccounts.length === 0}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Cetak Semua Kartu ({filteredAccounts.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Cari nama atau username ${accountManagementTab === 'anak_asuh' ? 'anak asuh' : 'orang tua'}...`}
              value={accountSearchQuery}
              onChange={(e) => setAccountSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
            />
            {accountSearchQuery && (
              <button
                type="button"
                onClick={() => setAccountSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Account List Grid */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredAccounts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                {accountSearchQuery ? 'Tidak ada akun yang cocok dengan pencarian Anda.' : 'Belum ada akun terdaftar.'}
              </div>
            ) : (
              filteredAccounts.map((acc) => {
                // Find connection (Linked Parent / Linked Child)
                let connectionText = "";
                if (acc.role === 'anak_asuh') {
                  const p = users.find(u => u.role === 'orang_tua' && u.anakAsuhId === acc.id);
                  connectionText = p ? `Orang Tua: ${p.name}` : "Orang Tua: Belum dihubungkan";
                } else if (acc.role === 'orang_tua') {
                  const c = users.find(u => u.role === 'anak_asuh' && u.id === acc.anakAsuhId);
                  connectionText = c ? `Anak Asuh: ${c.name}` : "Anak Asuh: Tidak ditemukan";
                }

                return (
                  <div
                    key={acc.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-100/40 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0 ${
                        acc.isSuspended ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {acc.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold truncate ${acc.isSuspended ? 'text-slate-400 line-through font-medium' : 'text-slate-800'}`}>
                            {acc.name}
                          </h4>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            acc.isSuspended 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {acc.isSuspended ? 'Ditangguhkan' : 'Aktif'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {acc.username}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {connectionText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => generateSingleCardPDF(acc, users)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4 shrink-0 text-slate-500" />
                        <span>Cetak Kartu</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (onToggleUserSuspension) {
                            await onToggleUserSuspension(acc.id, !acc.isSuspended);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          acc.isSuspended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{acc.isSuspended ? 'Aktifkan Akun' : 'Suspend Akun'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Home Page Grid (when activeSubPage is null) */}
      {activeSubPage === null && (
        <div className="space-y-6">
          {/* Summary statistics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs shrink-0">
                {myChildren.length}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Total Siswa</p>
                <p className="text-xs font-extrabold text-slate-800 leading-none">Anak Asuh</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                {myReports.filter(r => r.type === 'curhatan').length}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Curhatan</p>
                <p className="text-xs font-extrabold text-slate-800 leading-none">Siswa Cerita</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSubPage('laporan');
                setFilterType('all');
                setActiveTab('butuh_persetujuan');
                setSelectedReport(null);
              }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-slate-50 hover:border-amber-200 hover:shadow-xs transition-all text-left cursor-pointer w-full group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 transition-all">
                {reportsNeedingApprovalCount}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Pending</p>
                <p className="text-xs font-extrabold text-slate-800 leading-none font-sans group-hover:text-amber-700 transition-all">Butuh Respon</p>
              </div>
            </button>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                {myReports.filter(r => r.status === 'resolved').length}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Selesai</p>
                <p className="text-xs font-extrabold text-slate-800 leading-none">Ditangani</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Left Column (Left Side of Home Page Grid) */}
            <div className="lg:col-span-5">
              <AnakAsuhList
                myChildren={myChildren}
                reports={reports}
                existingCategories={existingCategories}
                allAvailableCategories={allAvailableCategories}
                selectedCategoryFilter={selectedCategoryFilter}
                setSelectedCategoryFilter={setSelectedCategoryFilter}
                activeMenuChildId={activeMenuChildId}
                setActiveMenuChildId={setActiveMenuChildId}
                isCustomCategoryInputOpen={isCustomCategoryInputOpen}
                setIsCustomCategoryInputOpen={setIsCustomCategoryInputOpen}
                customCategoryInput={customCategoryInput}
                setCustomCategoryInput={setCustomCategoryInput}
                onUpdateChildCategory={onUpdateChildCategory}
                onToggleUserSuspension={onToggleUserSuspension}
              />
              <div className="hidden">
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
                    <div className="space-y-3">
                      {/* Category Filter Pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-left select-none">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shrink-0 transition-all cursor-pointer border ${
                            selectedCategoryFilter === 'all'
                              ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          Semua ({myChildren.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter('uncategorized')}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shrink-0 transition-all cursor-pointer border ${
                            selectedCategoryFilter === 'uncategorized'
                              ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          Tanpa Kategori ({myChildren.filter(c => !c.category).length})
                        </button>
                        {existingCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shrink-0 transition-all cursor-pointer border ${
                              selectedCategoryFilter === cat
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {cat} ({myChildren.filter(c => c.category === cat).length})
                          </button>
                        ))}
                      </div>

                      {/* Filtered Children List */}
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {filteredChildren.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            Tidak ada siswa di kategori ini.
                          </div>
                        ) : (
                          filteredChildren.map(c => {
                            const childReportCount = reports.filter(r => r.senderId === c.id).length;
                            const isMenuOpen = activeMenuChildId === c.id;
                            const isCustomOpen = isCustomCategoryInputOpen === c.id;

                            return (
                              <div
                                key={c.id}
                                className="relative flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/60 transition-all text-left"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                      {c.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                                        {c.category && (
                                          <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                                            <Tag className="w-2.5 h-2.5" />
                                            <span>{c.category}</span>
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-mono">ID: {c.username}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 relative">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100/40">
                                      {childReportCount} Lap
                                    </span>

                                    {/* 3-dot Menu Trigger */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuChildId(isMenuOpen ? null : c.id);
                                        setIsCustomCategoryInputOpen(null);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                                      title="Kelola Kategori"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && (
                                      <div 
                                        className="absolute right-0 top-7 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl z-30 p-2 space-y-0.5 text-slate-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="text-[9px] font-extrabold text-slate-400 px-2.5 py-1.5 border-b border-slate-50 uppercase tracking-wider flex items-center gap-1">
                                          <Tag className="w-3 h-3" />
                                          <span>Pilih Kategori</span>
                                        </div>

                                        {/* Reset Category */}
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await onUpdateChildCategory(c.id, '');
                                            setActiveMenuChildId(null);
                                          }}
                                          className="w-full text-left px-2 py-1.5 rounded-xl text-[10px] text-rose-600 hover:bg-rose-50 font-bold transition-all cursor-pointer flex items-center justify-between"
                                        >
                                          <span>Hapus Kategori</span>
                                          {!c.category && <Check className="w-3 h-3 text-rose-600" />}
                                        </button>

                                        {/* Presets */}
                                        {allAvailableCategories.map(cat => (
                                          <button
                                            key={cat}
                                            type="button"
                                            onClick={async () => {
                                              await onUpdateChildCategory(c.id, cat);
                                              setActiveMenuChildId(null);
                                            }}
                                            className="w-full text-left px-2 py-1.5 rounded-xl text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-between font-semibold"
                                          >
                                            <span className="truncate">{cat}</span>
                                            {c.category === cat && <Check className="w-3 h-3 text-violet-600" />}
                                          </button>
                                        ))}

                                        {/* Custom Input */}
                                        <div className="border-t border-slate-50 pt-1 mt-1">
                                          {!isCustomOpen ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIsCustomCategoryInputOpen(c.id);
                                                setCustomCategoryInput('');
                                              }}
                                              className="w-full text-left px-2 py-1.5 rounded-xl text-[10px] text-violet-600 hover:bg-violet-50 font-bold transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Plus className="w-3 h-3" />
                                              <span>Buat Kategori Baru...</span>
                                            </button>
                                          ) : (
                                            <div className="p-1 space-y-1">
                                              <input
                                                type="text"
                                                placeholder="Nama kategori..."
                                                value={customCategoryInput}
                                                onChange={(e) => setCustomCategoryInput(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-violet-500 text-slate-800 font-semibold"
                                                autoFocus
                                              />
                                              <div className="flex gap-1">
                                                <button
                                                  type="button"
                                                  onClick={async () => {
                                                    if (customCategoryInput.trim()) {
                                                      await onUpdateChildCategory(c.id, customCategoryInput.trim());
                                                    }
                                                    setIsCustomCategoryInputOpen(null);
                                                    setActiveMenuChildId(null);
                                                  }}
                                                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-1 text-[9px] font-bold text-center cursor-pointer"
                                                >
                                                  Simpan
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setIsCustomCategoryInputOpen(null)}
                                                  className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg py-1 text-[9px] font-bold text-center cursor-pointer"
                                                >
                                                  Batal
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Column (Right Side of Home Page Grid): Broadcasts & Trust Cards */}
      <div className="lg:col-span-7 space-y-6">
        {/* Active Broadcasts List */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Siaran Aktif Anda</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubPage('broadcast')}
              className="text-[11px] font-extrabold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-sans"
            >
              Kelola Siaran
            </button>
          </div>

          {broadcasts.filter(b => b.senderId === currentUser.id).length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada pengumuman siaran aktif dari Anda.</p>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {broadcasts
                .filter(b => b.senderId === currentUser.id)
                .map(b => (
                  <div key={b.id} className="p-3 bg-amber-50/20 border border-amber-100/30 rounded-2xl space-y-1">
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{b.message}</p>
                    {b.linkUrl && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                        <Link className="w-3 h-3 shrink-0" />
                        <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[150px]">
                          {b.linkText || 'Buka Tautan'}
                        </a>
                      </div>
                    )}
                    <span className="text-[8px] text-slate-400 block">{formatDate(b.createdAt)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Encryption Notice */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 border border-emerald-100 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500 text-white rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide font-sans">Privasi & Enkripsi WaliAsuhku</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Semua pesan pengaduan, laporan, dan curhatan dari anak asuh Anda dienkripsi secara penuh di sisi klien. Hanya Anda, sebagai Wali Asuh yang sah, yang memiliki kunci pribadi untuk membaca dan menanggapi pesan-pesan tersebut.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hubungan komunikasi dengan Orang Tua murid juga dilindungi, di mana Anda dapat meninjau dan memberikan persetujuan (approval) sebelum pesan penting diteruskan ke akun Orang Tua.
          </p>
        </div>
      </div>
    </div>
  </div>
)}

  {/* 4. Reports Sub-Page Container */}
  {['pesan_ortu', 'curhatan', 'kebutuhan_logistik', 'laporan'].includes(activeSubPage || '') && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      <div className="hidden">
        {/* Broadcast & Announcement Widget */}
          <div id="broadcast-pengumuman" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 scroll-mt-6">
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

        {/* Right Column: Reports & Details Panel (Spans 12) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Report Feed (Spans 6 or 12 depending on if detail is open) */}
          <div className={`space-y-4 ${selectedReport ? 'md:col-span-6' : 'md:col-span-12'}`}>
            
            {/* Feed Filter Header */}
            <div id="reports-feed-section" className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left scroll-mt-6">
              <h3 className="text-sm font-extrabold text-slate-800 shrink-0">Laporan Masuk ({myReports.length})</h3>
              
              <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none gap-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('butuh_persetujuan')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'butuh_persetujuan' 
                      ? 'bg-rose-600 text-white shadow-sm' 
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Butuh Respon</span>
                  {reportsNeedingApprovalCount > 0 && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'butuh_persetujuan' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
                    }`}>
                      {reportsNeedingApprovalCount}
                    </span>
                  )}
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

            {/* Date Filters Sub-Bar */}
            <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1 mr-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-violet-500" /> Waktu:
                </span>
                <button
                  type="button"
                  onClick={() => setDateFilter('today')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg cursor-pointer whitespace-nowrap transition-all ${dateFilter === 'today' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100/60'}`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('yesterday')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg cursor-pointer whitespace-nowrap transition-all ${dateFilter === 'yesterday' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100/60'}`}
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('this_week')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg cursor-pointer whitespace-nowrap transition-all ${dateFilter === 'this_week' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100/60'}`}
                >
                  Minggu Ini
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('this_month')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg cursor-pointer whitespace-nowrap transition-all ${dateFilter === 'this_month' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100/60'}`}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg cursor-pointer whitespace-nowrap transition-all ${dateFilter === 'all' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100/60'}`}
                >
                  Semua Waktu
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
                  Laporan & Curhat
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('curhatan')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'curhatan' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  💖 Curhatan Anak
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('laporan')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'laporan' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  ⚠️ Laporan Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('pesan_ortu')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${filterType === 'pesan_ortu' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  💌 Pesan Ortu
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

                  {/* Copy Action and Approval for Message to Parents */}
                  {selectedReport.type === 'pesan_ortu' && (
                    <div className="space-y-3">
                      {/* Approval Status and Actions */}
                      <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-3xl flex flex-col gap-2.5 text-left">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">Persetujuan Pesan ke Orang Tua</h4>
                            <p className="text-[10px] text-amber-800 leading-tight">
                              Tinjau pesan ini sebelum dikirimkan ke halaman akun Orang Tua murid.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-500">Status Persetujuan:</span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            selectedReport.parentApprovalStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : selectedReport.parentApprovalStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {selectedReport.parentApprovalStatus === 'approved'
                              ? '✅ Disetujui (Terkirim ke Ortu)'
                              : selectedReport.parentApprovalStatus === 'rejected'
                                ? '❌ Ditolak (Tidak Terkirim)'
                                : '⏳ Menunggu Persetujuan Wali'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              await onUpdateParentApproval(selectedReport.id, 'approved');
                              // Refresh local instance state
                              setSelectedReport({
                                ...selectedReport,
                                parentApprovalStatus: 'approved'
                              });
                            }}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center shadow-xs flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui & Kirim</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onUpdateParentApproval(selectedReport.id, 'rejected');
                              // Refresh local instance state
                              setSelectedReport({
                                ...selectedReport,
                                parentApprovalStatus: 'rejected'
                              });
                            }}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak Pesan</span>
                          </button>
                        </div>
                      </div>

                      {/* Copy Action */}
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-3xl flex flex-col gap-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-950">Salin Pesan Orang Tua</span>
                          <button
                            type="button"
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
                          Gunakan tombol di atas untuk menyalin isi pesan dari {selectedReport.senderName} ini sehingga Anda dapat menempelkannya (paste) ke saluran luar jika diperlukan.
                        </p>
                      </div>
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
                      const isChildReply = rep.senderRole === 'anak_asuh';
                      const isPesanOrtu = selectedReport.type === 'pesan_ortu';
                      const needsApproval = isPesanOrtu && isChildReply && !rep.isApproved;
                      const isApproved = isPesanOrtu && isChildReply && rep.isApproved;

                      return (
                        <div 
                          key={rep.id} 
                          className={`p-3 rounded-2xl text-xs flex flex-col max-w-[90%] leading-relaxed ${
                            isMe 
                              ? 'bg-violet-50 text-violet-950 border border-violet-100 ml-auto items-end text-right' 
                              : 'bg-slate-50 text-slate-800 border border-slate-100 mr-auto items-start text-left'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[9px] font-bold text-slate-400">
                            <span>{rep.senderName} {rep.senderRole === 'orang_tua' ? '(Orang Tua)' : rep.senderRole === 'anak_asuh' ? '(Anak Asuh)' : rep.senderRole === 'wali_asuh' ? '(Wali Asuh)' : ''}</span>
                            <span>•</span>
                            <span>{formatDate(rep.createdAt).split(',')[0]}</span>
                            
                            {isPesanOrtu && isChildReply && (
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${
                                isApproved 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {isApproved ? '✅ Terkirim ke Ortu' : '⏳ Menunggu Persetujuan'}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] font-medium leading-relaxed break-words text-left">
                            {decryptMessage(rep.content)}
                          </p>

                          {needsApproval && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/50 w-full flex justify-end">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateReplyApproval(selectedReport.id, rep.id, true);
                                  // Instantly update the local state so the view responds reactively
                                  const updatedReplies = selectedReport.replies.map(r => 
                                    r.id === rep.id ? { ...r, isApproved: true } : r
                                  );
                                  setSelectedReport({
                                    ...selectedReport,
                                    replies: updatedReplies
                                  });
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Setujui & Teruskan</span>
                              </button>
                            </div>
                          )}
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
  )}

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
