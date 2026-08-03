import React, { useState } from 'react';
import { 
  CounselingRecord, 
  CounselingRequest, 
  CounselingCategory, 
  CounselingConfidentiality, 
  CounselingStatus, 
  User 
} from '../types';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Filter, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Lock, 
  Eye, 
  Send, 
  Edit3, 
  Trash2, 
  X, 
  Info, 
  Calendar,
  UserCheck,
  ChevronRight,
  Sparkles,
  HelpCircle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CounselingManagementProps {
  currentUser: User;
  users: User[];
  records: CounselingRecord[];
  requests: CounselingRequest[];
  onAddRecord: (record: Omit<CounselingRecord, 'id' | 'createdAt'>) => void;
  onUpdateRecord: (id: string, updatedFields: Partial<CounselingRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onAddRequest: (request: Omit<CounselingRequest, 'id' | 'createdAt'>) => void;
  onUpdateRequestStatus: (id: string, status: 'Menunggu' | 'Disetujui' | 'Selesai' | 'Ditolak', notes?: string) => void;
  viewMode?: 'full' | 'student' | 'parent'; // Full for Wali Asuh/Admin, student for Anak Asuh, parent for Orang Tua
}

export const CounselingManagement: React.FC<CounselingManagementProps> = ({
  currentUser,
  users,
  records,
  requests,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onAddRequest,
  onUpdateRequestStatus,
  viewMode = 'full'
}) => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'records' | 'requests' | 'guidelines'>('records');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<CounselingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CounselingRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form inputs for Record
  const [formStudentId, setFormStudentId] = useState('');
  const [formCustomStudentName, setFormCustomStudentName] = useState('');
  const [formSessionDate, setFormSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<CounselingCategory>('Emosional & Diri');
  const [formConfidentiality, setFormConfidentiality] = useState<CounselingConfidentiality>('Terbatas');
  const [formSummary, setFormSummary] = useState('');
  const [formActionPlan, setFormActionPlan] = useState('');
  const [formStatus, setFormStatus] = useState<CounselingStatus>('Dalam Proses');
  const [formFollowUpDate, setFormFollowUpDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formParentNotified, setFormParentNotified] = useState(false);
  const [formError, setFormError] = useState('');

  // Form inputs for Request
  const [reqStudentId, setReqStudentId] = useState('');
  const [reqTopic, setReqTopic] = useState('');
  const [reqPreferredDate, setReqPreferredDate] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'Biasa' | 'Penting' | 'Mendesak / Darurat'>('Biasa');
  const [reqError, setReqError] = useState('');
  const [reqSuccess, setReqSuccess] = useState('');

  // Filtered children list depending on role
  const myChildren = users.filter(u => {
    if (u.role !== 'anak_asuh') return false;
    if (currentUser.role === 'wali_asuh') return u.waliAsuhId === currentUser.id;
    if (currentUser.role === 'orang_tua') return u.id === currentUser.anakAsuhId;
    return true; // superadmin or others
  });

  // Filter records based on role and filters
  const filteredRecords = records.filter(rec => {
    // Role accessibility guard
    if (currentUser.role === 'anak_asuh') {
      if (rec.studentId !== currentUser.id) return false;
    } else if (currentUser.role === 'orang_tua') {
      if (rec.studentId !== currentUser.anakAsuhId) return false;
      // Hide "Sangat Rahasia" from parents to respect child privacy agreement
      if (rec.confidentiality === 'Sangat Rahasia') return false;
    } else if (currentUser.role === 'wali_asuh') {
      if (rec.waliAsuhId !== currentUser.id) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.studentName.toLowerCase().includes(q);
      const matchSummary = rec.summary.toLowerCase().includes(q);
      const matchAction = rec.actionPlan.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchAction) return false;
    }

    // Filters
    if (selectedStudentFilter !== 'all' && rec.studentId !== selectedStudentFilter) return false;
    if (selectedCategoryFilter !== 'all' && rec.category !== selectedCategoryFilter) return false;
    if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) return false;

    return true;
  });

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (currentUser.role === 'anak_asuh') return req.requesterId === currentUser.id;
    if (currentUser.role === 'orang_tua') return req.requesterId === currentUser.id;
    if (currentUser.role === 'wali_asuh') return req.waliAsuhId === currentUser.id;
    return true;
  });

  // Open add record modal
  const handleOpenAddModal = (existing?: CounselingRecord) => {
    setFormError('');
    if (existing) {
      setEditingRecord(existing);
      const matchedChild = users.find(u => u.id === existing.studentId);
      if (!matchedChild || existing.studentId === '__custom__' || existing.studentId.startsWith('custom_')) {
        setFormStudentId('__custom__');
        setFormCustomStudentName(existing.studentName);
      } else {
        setFormStudentId(existing.studentId);
        setFormCustomStudentName('');
      }
      setFormSessionDate(existing.sessionDate);
      setFormCategory(existing.category);
      setFormConfidentiality(existing.confidentiality);
      setFormSummary(existing.summary);
      setFormActionPlan(existing.actionPlan);
      setFormStatus(existing.status);
      setFormFollowUpDate(existing.followUpDate || '');
      setFormNotes(existing.notes || '');
      setFormParentNotified(existing.parentNotified || false);
    } else {
      setEditingRecord(null);
      setFormStudentId(myChildren.length > 0 ? myChildren[0].id : '__custom__');
      setFormCustomStudentName('');
      setFormSessionDate(new Date().toISOString().split('T')[0]);
      setFormCategory('Emosional & Diri');
      setFormConfidentiality('Terbatas');
      setFormSummary('');
      setFormActionPlan('');
      setFormStatus('Dalam Proses');
      setFormFollowUpDate('');
      setFormNotes('');
      setFormParentNotified(false);
    }
    setIsAddModalOpen(true);
  };

  // Submit record form
  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formStudentId) {
      setFormError('Pilih atau ketik nama anak asuh terlebih dahulu');
      return;
    }

    let finalStudentId = formStudentId;
    let finalStudentName = '';

    if (formStudentId === '__custom__') {
      if (!formCustomStudentName.trim()) {
        setFormError('Mohon ketik nama siswa / anak asuh secara manual');
        return;
      }
      finalStudentName = formCustomStudentName.trim();
      finalStudentId = editingRecord && editingRecord.studentId.startsWith('custom_')
        ? editingRecord.studentId
        : `custom_${Date.now()}`;
    } else {
      const selectedChild = users.find(u => u.id === formStudentId);
      finalStudentName = selectedChild ? selectedChild.name : 'Anak Asuh';
    }

    if (!formSummary.trim()) {
      setFormError('Ringkasan latar belakang / permasalahan wajib diisi');
      return;
    }
    if (!formActionPlan.trim()) {
      setFormError('Rencana tindak lanjut / solusi wajib diisi');
      return;
    }

    if (editingRecord) {
      onUpdateRecord(editingRecord.id, {
        studentId: finalStudentId,
        studentName: finalStudentName,
        sessionDate: formSessionDate,
        category: formCategory,
        confidentiality: formConfidentiality,
        summary: formSummary.trim(),
        actionPlan: formActionPlan.trim(),
        status: formStatus,
        followUpDate: formFollowUpDate || undefined,
        notes: formNotes.trim() || undefined,
        parentNotified: formParentNotified,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddRecord({
        studentId: finalStudentId,
        studentName: finalStudentName,
        waliAsuhId: currentUser.id,
        waliAsuhName: currentUser.name,
        sessionDate: formSessionDate,
        category: formCategory,
        confidentiality: formConfidentiality,
        summary: formSummary.trim(),
        actionPlan: formActionPlan.trim(),
        status: formStatus,
        followUpDate: formFollowUpDate || undefined,
        notes: formNotes.trim() || undefined,
        parentNotified: formParentNotified
      });
    }

    setIsAddModalOpen(false);
  };

  // Submit request form (student or parent)
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setReqError('');
    setReqSuccess('');

    if (!reqTopic.trim()) {
      setReqError('Mohon tuliskan topik atau hal yang ingin didiskusikan');
      return;
    }

    let targetStudentId = '';
    let targetStudentName = '';
    let targetWaliId = currentUser.waliAsuhId || '';

    if (currentUser.role === 'anak_asuh') {
      targetStudentId = currentUser.id;
      targetStudentName = currentUser.name;
    } else if (currentUser.role === 'orang_tua') {
      targetStudentId = currentUser.anakAsuhId || '';
      const childObj = users.find(u => u.id === targetStudentId);
      targetStudentName = childObj ? childObj.name : 'Ananda';
      targetWaliId = currentUser.waliAsuhId || (childObj ? childObj.waliAsuhId || '' : '');
    }

    onAddRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role as 'anak_asuh' | 'orang_tua',
      studentId: targetStudentId,
      studentName: targetStudentName,
      preferredDate: reqPreferredDate || undefined,
      topic: reqTopic.trim(),
      urgency: reqUrgency,
      status: 'Menunggu',
      waliAsuhId: targetWaliId
    });

    setReqSuccess('Permintaan sesi konseling berhasil dikirimkan ke Wali Asuh!');
    setReqTopic('');
    setReqPreferredDate('');
    setReqUrgency('Biasa');

    setTimeout(() => {
      setIsRequestModalOpen(false);
      setReqSuccess('');
    }, 2000);
  };

  // Printable handler for counseling session
  const handlePrintRecord = (record: CounselingRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Rekam Bimbingan & Konseling - ${record.studentName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
            .meta-item { font-size: 13px; }
            .meta-item strong { color: #334155; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .content-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; font-size: 13px; white-space: pre-wrap; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; text-align: center; }
            .sig-box { width: 200px; }
            .sig-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Sesi Bimbingan & Konseling Anak Asuh</h1>
            <p>Sistem Pengasuhan Terpadu WaliAsuhku &bull; Dokumen Kerahasiaan ${record.confidentiality}</p>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><strong>Nama Anak Asuh:</strong> ${record.studentName}</div>
            <div class="meta-item"><strong>Tanggal Sesi:</strong> ${record.sessionDate}</div>
            <div class="meta-item"><strong>Wali Asuh / Konselor:</strong> ${record.waliAsuhName}</div>
            <div class="meta-item"><strong>Kategori Bimbingan:</strong> ${record.category}</div>
            <div class="meta-item"><strong>Tingkat Kerahasiaan:</strong> ${record.confidentiality}</div>
            <div class="meta-item"><strong>Status Penanganan:</strong> ${record.status}</div>
          </div>

          <div class="section">
            <div class="section-title">1. Ringkasan Latar Belakang & Permasalahan</div>
            <div class="content-box">${record.summary}</div>
          </div>

          <div class="section">
            <div class="section-title">2. Rencana Solusi & Tindak Lanjut</div>
            <div class="content-box">${record.actionPlan}</div>
          </div>

          ${record.notes ? `
          <div class="section">
            <div class="section-title">3. Catatan Evaluasi Tambahan</div>
            <div class="content-box">${record.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            <div class="sig-box">
              <p>Mengetahui,</p>
              <p><strong>Koordinator Pengasuhan</strong></p>
              <div class="sig-space"></div>
              <p>( _______________________ )</p>
            </div>
            <div class="sig-box">
              <p>Pemberi Bimbingan,</p>
              <p><strong>Wali Asuh / Konselor</strong></p>
              <div class="sig-space"></div>
              <p>( ${record.waliAsuhName} )</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper badges
  const getConfidentialityBadge = (conf: CounselingConfidentiality) => {
    switch (conf) {
      case 'Publik':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><Eye className="w-3 h-3" /> Terbuka</span>;
      case 'Terbatas':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><ShieldCheck className="w-3 h-3" /> Wali & Ortua</span>;
      case 'Sangat Rahasia':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><Lock className="w-3 h-3" /> Khusus Wali</span>;
    }
  };

  const getStatusBadge = (st: CounselingStatus) => {
    switch (st) {
      case 'Selesai':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai</span>;
      case 'Dalam Proses':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Clock className="w-3 h-3 text-amber-600" /> Dalam Proses</span>;
      case 'Perlu Pemantauan':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800"><AlertCircle className="w-3 h-3 text-indigo-600" /> Pemantauan</span>;
      case 'Dirujuk (Referral)':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800"><ShieldAlert className="w-3 h-3 text-purple-600" /> Dirujuk</span>;
    }
  };

  // Stats calculation
  const totalSessions = filteredRecords.length;
  const pendingRequestsCount = requests.filter(r => r.status === 'Menunggu' && (currentUser.role === 'super_admin' || r.waliAsuhId === currentUser.id)).length;
  const inProgressCount = filteredRecords.filter(r => r.status === 'Dalam Proses' || r.status === 'Perlu Pemantauan').length;
  const resolvedCount = filteredRecords.filter(r => r.status === 'Selesai').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-violet-200 border border-white/10">
              <HeartHandshake className="w-3.5 h-3.5 text-violet-300" />
              <span>Modul Layanan Bimbingan & Konseling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Layanan Konseling & Pendampingan Anak Asuh
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pusat pencatatan bimbingan psikososial, penanganan kendala emosi, pengembangan karakter, serta pendampingan pribadi anak asuh secara empati dan terenkripsi.
            </p>
          </div>

          {/* Quick Action Button */}
          {currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin' ? (
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-900/40 hover:shadow-violet-600/50 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Sesi Konseling</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setReqError('');
                setReqSuccess('');
                setIsRequestModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-900/40 hover:shadow-rose-600/50 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ajukan Sesi Konseling</span>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sesi</p>
            <p className="text-xl font-black mt-1 text-white">{totalSessions}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Proses & Pemantauan</p>
            <p className="text-xl font-black mt-1 text-amber-300">{inProgressCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tuntas / Selesai</p>
            <p className="text-xl font-black mt-1 text-emerald-300">{resolvedCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 relative">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pengajuan Menunggu</p>
            <p className="text-xl font-black mt-1 text-rose-300">{pendingRequestsCount}</p>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'records'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rekap Sesi Konseling</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20">
              {filteredRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Pengajuan Sesi Mandiri</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {pendingRequestsCount} baru
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guidelines'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Panduan & Etika Konseling</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REKAP SESI KONSELING */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search query */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama anak, topik, solusi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              {/* Filter Anak Asuh (Wali view) */}
              {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && (
                <div>
                  <select
                    value={selectedStudentFilter}
                    onChange={e => setSelectedStudentFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="all">Semua Anak Asuh / Siswa</option>
                    {myChildren.length > 0 && (
                      <optgroup label="Binaan Kelompok Saya">
                        {myChildren.map(child => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </optgroup>
                    )}
                    {records.some(r => !myChildren.some(c => c.id === r.studentId)) && (
                      <optgroup label="Siswa Lain / Lintas Kelompok">
                        {Array.from(new Set(records.filter(r => !myChildren.some(c => c.id === r.studentId)).map(r => r.studentId))).map(stId => {
                          const rObj = records.find(r => r.studentId === stId);
                          return (
                            <option key={stId} value={stId}>
                              {rObj?.studentName || stId}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              {/* Filter Category */}
              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Perilaku & Kedisiplinan">Perilaku & Kedisiplinan</option>
                  <option value="Emosional & Diri">Emosional & Diri</option>
                  <option value="Hubungan Sosial & Teman">Hubungan Sosial & Teman</option>
                  <option value="Penyesuaian Asrama">Penyesuaian Asrama</option>
                  <option value="Motivasi & Cita-cita">Motivasi & Cita-cita</option>
                  <option value="Keluarga & Pribadi">Keluarga & Pribadi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Filter Status */}
              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Perlu Pemantauan">Perlu Pemantauan</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dirujuk (Referral)">Dirujuk (Referral)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records List */}
          {filteredRecords.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Rekam Catatan Konseling</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin'
                  ? 'Catatan bimbingan dan konseling yang Anda buat untuk anak asuh akan tersimpan rapi dan terenkripsi di sini.'
                  : 'Belum ada catatan bimbingan atau konseling yang dibagikan untuk Anda.'}
              </p>
              {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && (
                <button
                  onClick={() => handleOpenAddModal()}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-2xl text-xs font-bold hover:bg-violet-700 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Catatan Konseling Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map(rec => (
                <div
                  key={rec.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{rec.studentName}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg font-medium">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Tanggal Sesi: {rec.sessionDate}</span>
                          <span>&bull; Oleh: {rec.waliAsuhName}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(rec.status)}
                        {getConfidentialityBadge(rec.confidentiality)}
                      </div>
                    </div>

                    {/* Summary Excerpt */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permasalahan / Topik:</span>
                        <p className="text-xs text-slate-700 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                          {rec.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rencana Solusi / Action Plan:</span>
                        <p className="text-xs text-violet-900 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                          {rec.actionPlan}
                        </p>
                      </div>
                    </div>

                    {/* Follow up date if exists */}
                    {rec.followUpDate && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-xl text-[11px] font-medium border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Jadwal Pemantauan Ulang: <strong>{rec.followUpDate}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedRecordForDetail(rec)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePrintRecord(rec)}
                        title="Cetak Laporan Konseling"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && (
                        <>
                          <button
                            onClick={() => handleOpenAddModal(rec)}
                            title="Edit Sesi"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(rec.id)}
                            title="Hapus Sesi"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENGAJUAN SESI MANDIRI */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Permohonan Sesi Bimbingan & Konseling Mandiri</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin'
                  ? 'Daftar pengajuan ruang curhat / diskusi pribadi dari anak asuh atau orang tua.'
                  : 'Ajukan ruang bimbingan pribadi dengan Wali Asuh jika ada hal yang ingin didiskusikan secara khusus.'}
              </p>
            </div>

            {(currentUser.role === 'anak_asuh' || currentUser.role === 'orang_tua') && (
              <button
                onClick={() => {
                  setReqError('');
                  setReqSuccess('');
                  setIsRequestModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Pengajuan Baru</span>
              </button>
            )}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Belum ada pengajuan sesi konseling mandiri.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-800">{req.requesterName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase font-bold">
                        {req.requesterRole === 'anak_asuh' ? 'Siswa' : 'Orang Tua'}
                      </span>
                      {req.urgency === 'Mendesak / Darurat' && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md">
                          Mendesak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{req.topic}</p>
                    <p className="text-[10px] text-slate-400">
                      Diajukan pada: {new Date(req.createdAt).toLocaleDateString('id-ID')}
                      {req.preferredDate && ` • Usulan Tanggal: ${req.preferredDate}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      req.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Selesai' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status}
                    </span>

                    {/* Wali Asuh Actions */}
                    {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && req.status === 'Menunggu' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateRequestStatus(req.id, 'Disetujui')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => onUpdateRequestStatus(req.id, 'Ditolak')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PANDUAN & ETIKA KONSELING */}
      {activeTab === 'guidelines' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
              <span>Etika & Prinsip Utama Konseling Anak Asuh</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Panduan praktis untuk Wali Asuh dan Konselor dalam mendampingi tumbuh kembang emosional dan mental anak asuh secara bijak, empati, dan profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>1. Kerahasiaan & Keamanan Informasi (Confidentiality)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Segala curahan hati dan masalah pribadi anak asuh dijaga kerahasiaannya. Informasi hanya dibagikan kepada pihak berwenang jika menyangkut potensi bahaya atau keselamatan fisik/jiwa anak.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs">
                <HeartHandshake className="w-4 h-4" />
                <span>2. Pendekatan Empati Tanpa Menghakimi (Non-judgmental)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dengarkan aktif cerita anak tanpa langsung menyalahkan. Buat ruang yang hangat agar anak merasa aman bercerita tanpa rasa cemas akan dihukum.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>3. Solusi Kolaboratif & Kemandirian (Action Plan)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Libatkan anak dalam merumuskan solusi atas masalahnya. Buat langkah konkret yang kecil dan realistis untuk melatih tanggung jawab dan kemandirian emosional.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>4. Pemantauan Berkelanjutan & Kolaborasi Orang Tua</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tetapkan tanggal evaluasi berkala untuk melihat perkembangan. Libatkan orang tua pada topik-topik positif atau pendampingan bersama yang disepakati.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT RECORD */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-violet-100 text-violet-700 rounded-xl">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {editingRecord ? 'Edit Catatan Konseling' : 'Tambah Catatan Bimbingan & Konseling Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Isi data bimbingan secara objektif dan terstruktur</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
                {/* Select Child */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pilih Anak Asuh <span className="text-rose-500">*</span></label>
                    <select
                      value={formStudentId}
                      onChange={e => setFormStudentId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500 text-xs"
                    >
                      <option value="" disabled>-- Pilih Anak Asuh --</option>
                      {myChildren.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                      <option value="__custom__">➕ Ketik Nama Siswa Manual / Anak Asuh Luar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tanggal Sesi <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={formSessionDate}
                      onChange={e => setFormSessionDate(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500 text-xs"
                    />
                  </div>

                  <AnimatePresence>
                    {formStudentId === '__custom__' && (
                      <motion.div
                        key="custom-student-input"
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden sm:col-span-2"
                      >
                        <div className="bg-gradient-to-r from-violet-50/90 to-purple-50/90 p-3.5 rounded-2xl border border-violet-200/80 space-y-2 mt-1 shadow-xs">
                          <label className="block text-violet-900 font-extrabold text-xs flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-violet-600 shrink-0" />
                            <span>Nama Lengkap Siswa / Anak Asuh Lintas Kelompok</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Muhammad Farhan (Anak Asuh Binaan Bpk. Ahmad)"
                            value={formCustomStudentName}
                            onChange={e => setFormCustomStudentName(e.target.value)}
                            required={formStudentId === '__custom__'}
                            className="w-full p-2.5 bg-white border border-violet-300 rounded-xl font-medium focus:ring-2 focus:ring-violet-500 text-xs shadow-xs transition-all"
                          />
                          <p className="text-[10px] text-violet-600/90 font-medium leading-relaxed">
                            💡 Fitur ini memudahkan Anda memberikan layanan bimbingan bagi anak asuh wali asuh lain, santri tamu, atau siswa luar kelompok.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category & Confidentiality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Kategori Bimbingan</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as CounselingCategory)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Akademik">Akademik</option>
                      <option value="Perilaku & Kedisiplinan">Perilaku & Kedisiplinan</option>
                      <option value="Emosional & Diri">Emosional & Diri</option>
                      <option value="Hubungan Sosial & Teman">Hubungan Sosial & Teman</option>
                      <option value="Penyesuaian Asrama">Penyesuaian Asrama</option>
                      <option value="Motivasi & Cita-cita">Motivasi & Cita-cita</option>
                      <option value="Keluarga & Pribadi">Keluarga & Pribadi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tingkat Kerahasiaan</label>
                    <select
                      value={formConfidentiality}
                      onChange={e => setFormConfidentiality(e.target.value as CounselingConfidentiality)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Terbatas">Terbatas (Wali & Ortua)</option>
                      <option value="Sangat Rahasia">Sangat Rahasia (Khusus Wali/Konselor)</option>
                      <option value="Publik">Terbuka / Publik</option>
                    </select>
                  </div>
                </div>

                {/* Summary / Permasalahan */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ringkasan Latar Belakang / Permasalahan <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="Uraikan kendala, cerita, atau poin emosi yang disampaikan anak..."
                    value={formSummary}
                    onChange={e => setFormSummary(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Action Plan */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rencana Solusi & Tindak Lanjut (Action Plan) <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="Langkah-langkah perbaikan, kesepakatan komitmen anak, atau saran pendampingan..."
                    value={formActionPlan}
                    onChange={e => setFormActionPlan(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Status & Follow Up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Status Sesi</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as CounselingStatus)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Perlu Pemantauan">Perlu Pemantauan</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dirujuk (Referral)">Dirujuk (Referral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Jadwal Pemantauan Ulang (Opsional)</label>
                    <input
                      type="date"
                      value={formFollowUpDate}
                      onChange={e => setFormFollowUpDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all cursor-pointer shadow-sm"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REQUEST COUNSELING (STUDENT/PARENT) */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Ajukan Sesi Bimbingan / Curhat
                  </h3>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reqError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
                  {reqError}
                </div>
              )}
              {reqSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold">
                  {reqSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Topik / Hal yang Ingin Didiskusikan <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan secara singkat topik atau hal yang ingin Anda diskusikan secara pribadi dengan Wali Asuh..."
                    value={reqTopic}
                    onChange={e => setReqTopic(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Usulan Tanggal</label>
                    <input
                      type="date"
                      value={reqPreferredDate}
                      onChange={e => setReqPreferredDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tingkat Urgensi</label>
                    <select
                      value={reqUrgency}
                      onChange={e => setReqUrgency(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium"
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Penting">Penting</option>
                      <option value="Mendesak / Darurat">Mendesak</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-sm"
                  >
                    Kirim Pengajuan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DETAIL SESI */}
      <AnimatePresence>
        {selectedRecordForDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Detail Bimbingan Konseling - {selectedRecordForDetail.studentName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sesi tanggal: {selectedRecordForDetail.sessionDate} &bull; Wali Asuh: {selectedRecordForDetail.waliAsuhName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Kategori:</span>
                  <span className="font-extrabold text-slate-800">{selectedRecordForDetail.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Status & Privasi:</span>
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(selectedRecordForDetail.status)}
                    {getConfidentialityBadge(selectedRecordForDetail.confidentiality)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ringkasan Latar Belakang & Permasalahan:</span>
                  <p className="text-slate-800 leading-relaxed font-medium">{selectedRecordForDetail.summary}</p>
                </div>

                <div className="bg-violet-50 p-3.5 rounded-2xl border border-violet-150 space-y-2">
                  <span className="text-[10px] font-bold text-violet-600 uppercase">Rencana Solusi & Action Plan:</span>
                  <p className="text-violet-950 leading-relaxed font-medium">{selectedRecordForDetail.actionPlan}</p>
                </div>

                {selectedRecordForDetail.notes && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan Tambahan:</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5">{selectedRecordForDetail.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => handlePrintRecord(selectedRecordForDetail)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>

                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-2xl text-xs font-bold hover:bg-violet-700"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Hapus Catatan Konseling?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus catatan bimbingan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    onDeleteRecord(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CounselingManagement;
