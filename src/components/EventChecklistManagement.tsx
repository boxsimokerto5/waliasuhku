import React, { useState, useEffect } from 'react';
import { User, EventChecklist, EventChecklistOption, EventChecklistStudentStatus } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
  Plus, Trash2, Download, Check, X, Calendar, Trophy, AlertCircle, Sparkles,
  CheckCircle2, XCircle, MinusCircle, Clock, Ban, Award, Medal, Star, Flame,
  Flag, Zap, Target, Heart, Activity, Palette, Tag, Music, Layers, Edit2, RotateCcw
} from 'lucide-react';
import { generateEventChecklistPDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'motion/react';

interface EventChecklistManagementProps {
  currentUser: User;
  users: User[];
}

// Icon helper function
const renderOptionIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'trophy': return <Trophy className={className} />;
    case 'award': return <Award className={className} />;
    case 'medal': return <Medal className={className} />;
    case 'star': return <Star className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'flag': return <Flag className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'target': return <Target className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'music': return <Music className={className} />;
    case 'palette': return <Palette className={className} />;
    case 'x': return <XCircle className={className} />;
    case 'minus': return <MinusCircle className={className} />;
    case 'alert': return <AlertCircle className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'ban': return <Ban className={className} />;
    case 'check':
    default: return <CheckCircle2 className={className} />;
  }
};

const AVAILABLE_ICONS = [
  { id: 'trophy', label: 'Trophy / Piala', icon: Trophy },
  { id: 'flag', label: 'Flag / Estafet', icon: Flag },
  { id: 'music', label: 'Musik / Menyanyi', icon: Music },
  { id: 'activity', label: 'Olahraga / Voli', icon: Activity },
  { id: 'star', label: 'Bintang / Pentas', icon: Star },
  { id: 'award', label: 'Penghargaan', icon: Award },
  { id: 'medal', label: 'Medali', icon: Medal },
  { id: 'palette', label: 'Seni / Lukis', icon: Palette },
  { id: 'zap', label: 'Kilat / Semangat', icon: Zap },
  { id: 'target', label: 'Target / Lomba', icon: Target },
  { id: 'check', label: 'Centang', icon: CheckCircle2 },
  { id: 'x', label: 'Silang (Tidak Ikut)', icon: XCircle },
  { id: 'ban', label: 'Dilarang / Absen', icon: Ban },
  { id: 'clock', label: 'Menunggu', icon: Clock },
];

const COLOR_THEMES: { id: string; label: string; bg: string; border: string; text: string; badge: string }[] = [
  { id: 'emerald', label: 'Hijau (Emerald)', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', badge: 'bg-emerald-600' },
  { id: 'blue', label: 'Biru (Blue)', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-600' },
  { id: 'purple', label: 'Ungu (Purple)', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', badge: 'bg-purple-600' },
  { id: 'amber', label: 'Kuning (Amber)', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', badge: 'bg-amber-600' },
  { id: 'indigo', label: 'Nila (Indigo)', bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800', badge: 'bg-indigo-600' },
  { id: 'rose', label: 'Merah (Rose)', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', badge: 'bg-rose-600' },
  { id: 'slate', label: 'Abu (Slate)', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800', badge: 'bg-slate-600' },
];

export function EventChecklistManagement({ currentUser, users }: EventChecklistManagementProps) {
  const [eventChecklists, setEventChecklists] = useState<EventChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState<EventChecklist | null>(null);

  // Local Toast notification state
  const [localToast, setLocalToast] = useState<{ title: string; message: string } | null>(null);

  // Form states for NEW checklist
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [options, setOptions] = useState<EventChecklistOption[]>([
    { id: 'opt_1', label: 'Ikut Lomba Voli', icon: 'trophy', color: 'emerald', isNegative: false },
    { id: 'opt_2', label: 'Ikut Lomba Estafet', icon: 'flag', color: 'blue', isNegative: false },
    { id: 'opt_3', label: 'Ikut Lomba Menyanyi', icon: 'music', color: 'purple', isNegative: false },
    { id: 'opt_4', label: 'Tidak Ikut Lomba', icon: 'x', color: 'rose', isNegative: true },
  ]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionIcon, setNewOptionIcon] = useState('star');
  const [newOptionColor, setNewOptionColor] = useState('amber');
  const [newOptionIsNegative, setNewOptionIsNegative] = useState(false);

  const [formError, setFormError] = useState('');

  // Toast helper
  const showLocalToast = (title: string, message: string) => {
    setLocalToast({ title, message });
    setTimeout(() => {
      setLocalToast(null);
    }, 4500);
  };

  // Filter students under this Wali Asuh
  const myChildren = users.filter(u => u.role === 'anak_asuh' && u.waliAsuhId === currentUser.id);

  // Synchronize event checklists from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'event_checklists'),
      (snapshot) => {
        const fetched: EventChecklist[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as EventChecklist;
          if (data.waliAsuhId === currentUser.id) {
            fetched.push(data);
          }
        });
        // Sort descending by date, then by createdAt
        fetched.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setEventChecklists(fetched);

        // Keep active selection in sync if it got updated
        if (selectedChecklist) {
          const updated = fetched.find(c => c.id === selectedChecklist.id);
          if (updated) {
            setSelectedChecklist(updated);
          } else {
            setSelectedChecklist(null);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'event_checklists');
        } catch (e) {
          console.warn('EventChecklistManagement Firestore error handled:', e);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser.id, selectedChecklist?.id]);

  // Helper to ensure an EventChecklist has options array
  const getResolvedOptions = (checklist: EventChecklist): EventChecklistOption[] => {
    if (checklist.options && checklist.options.length > 0) {
      return checklist.options;
    }
    return [
      { id: 'opt_sudah', label: checklist.sudahLabel || 'SUDAH / IKUT', icon: checklist.sudahIcon || 'trophy', color: 'emerald', isNegative: false },
      { id: 'opt_belum', label: checklist.belumLabel || 'BELUM / TIDAK IKUT', icon: checklist.belumIcon || 'x', color: 'rose', isNegative: true }
    ];
  };

  // Preset generator
  const applyPreset = (preset: 'lomba_3' | 'olahraga' | 'seni' | 'biner') => {
    switch (preset) {
      case 'lomba_3':
        setNewTitle('Pekan Lomba Voli, Estafet & Menyanyi');
        setOptions([
          { id: `opt_${Date.now()}_1`, label: 'Ikut Lomba Voli', icon: 'trophy', color: 'emerald', isNegative: false },
          { id: `opt_${Date.now()}_2`, label: 'Ikut Lomba Estafet', icon: 'flag', color: 'blue', isNegative: false },
          { id: `opt_${Date.now()}_3`, label: 'Ikut Lomba Menyanyi', icon: 'music', color: 'purple', isNegative: false },
          { id: `opt_${Date.now()}_4`, label: 'Tidak Ikut Lomba', icon: 'x', color: 'rose', isNegative: true },
        ]);
        break;
      case 'olahraga':
        setNewTitle('Turnamen Olahraga Asrama');
        setOptions([
          { id: `opt_${Date.now()}_1`, label: 'Lomba Voli', icon: 'trophy', color: 'emerald', isNegative: false },
          { id: `opt_${Date.now()}_2`, label: 'Lomba Futsal', icon: 'activity', color: 'blue', isNegative: false },
          { id: `opt_${Date.now()}_3`, label: 'Lomba Catur', icon: 'target', color: 'amber', isNegative: false },
          { id: `opt_${Date.now()}_4`, label: 'Absen / Tidak Hadir', icon: 'x', color: 'rose', isNegative: true },
        ]);
        break;
      case 'seni':
        setNewTitle('Festival Seni & Agama');
        setOptions([
          { id: `opt_${Date.now()}_1`, label: 'Lomba Menyanyi / Nasyid', icon: 'music', color: 'purple', isNegative: false },
          { id: `opt_${Date.now()}_2`, label: 'Lomba Kaligrafi / Melukis', icon: 'palette', color: 'indigo', isNegative: false },
          { id: `opt_${Date.now()}_3`, label: 'Lomba Azan / MTI', icon: 'zap', color: 'amber', isNegative: false },
          { id: `opt_${Date.now()}_4`, label: 'Tidak Ikut', icon: 'x', color: 'rose', isNegative: true },
        ]);
        break;
      case 'biner':
        setNewTitle('Ceklist Acara Sederhana');
        setOptions([
          { id: `opt_${Date.now()}_1`, label: 'Ikut Acara', icon: 'check', color: 'emerald', isNegative: false },
          { id: `opt_${Date.now()}_2`, label: 'Tidak Ikut', icon: 'x', color: 'rose', isNegative: true },
        ]);
        break;
    }
  };

  const handleAddOptionToForm = () => {
    if (!newOptionLabel.trim()) return;
    const newOpt: EventChecklistOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: newOptionLabel.trim(),
      icon: newOptionIcon,
      color: newOptionColor,
      isNegative: newOptionIsNegative
    };
    setOptions(prev => [...prev, newOpt]);
    setNewOptionLabel('');
  };

  const handleRemoveOptionFromForm = (id: string) => {
    if (options.length <= 2) {
      alert('Ceklist acara minimal harus memiliki 2 pilihan status.');
      return;
    }
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleUpdateOptionLabel = (id: string, label: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, label } : o));
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Judul acara/lomba tidak boleh kosong');
      return;
    }

    if (options.length < 2) {
      setFormError('Sediakan minimal 2 pilihan custom (misal: Voli, Estafet, Menyanyi, Tidak Ikut)');
      return;
    }

    if (options.some(o => !o.label.trim())) {
      setFormError('Semua pilihan custom harus memiliki label teks.');
      return;
    }

    if (myChildren.length === 0) {
      setFormError('Anda tidak memiliki anak asuh terdaftar untuk dimasukkan dalam ceklist');
      return;
    }

    const checklistId = `event_checklist_${Math.random().toString(36).substring(2, 11)}`;
    const defaultOptionId = options[options.length - 1]?.id || options[0]?.id; // Default to non-participant / last option

    const studentStatuses: EventChecklistStudentStatus[] = myChildren.map(child => ({
      studentId: child.id,
      studentName: child.name,
      selectedOptionId: defaultOptionId,
      status: options[0].isNegative ? 'belum' : 'sudah'
    }));

    const newEventChecklist: EventChecklist = {
      id: checklistId,
      title: newTitle.trim(),
      date: newDate,
      waliAsuhId: currentUser.id,
      options: options,
      sudahLabel: options[0].label,
      belumLabel: options[options.length - 1].label,
      sudahIcon: options[0].icon || 'trophy',
      belumIcon: options[options.length - 1].icon || 'x',
      students: studentStatuses,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'event_checklists', checklistId), newEventChecklist);
      setNewTitle('');
      setSelectedChecklist(newEventChecklist);
      showLocalToast('Ceklist Acara Dibuat', `Ceklist "${newEventChecklist.title}" berhasil diinisialisasi.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `event_checklists/${checklistId}`);
    }
  };

  const handleSelectStudentOption = async (studentId: string, optionId: string) => {
    if (!selectedChecklist) return;

    const currentOpts = getResolvedOptions(selectedChecklist);
    const chosenOpt = currentOpts.find(o => o.id === optionId);

    const updatedStudents = selectedChecklist.students.map(s => {
      if (s.studentId === studentId) {
        return {
          ...s,
          selectedOptionId: optionId,
          status: chosenOpt?.isNegative ? ('belum' as const) : ('sudah' as const)
        };
      }
      return s;
    });

    try {
      await updateDoc(doc(db, 'event_checklists', selectedChecklist.id), {
        students: updatedStudents
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `event_checklists/${selectedChecklist.id}`);
    }
  };

  const handleMarkAllWithOption = async (optionId: string, optionLabel: string) => {
    if (!selectedChecklist) return;

    const currentOpts = getResolvedOptions(selectedChecklist);
    const chosenOpt = currentOpts.find(o => o.id === optionId);

    const updatedStudents = selectedChecklist.students.map(s => ({
      ...s,
      selectedOptionId: optionId,
      status: chosenOpt?.isNegative ? ('belum' as const) : ('sudah' as const)
    }));

    try {
      await updateDoc(doc(db, 'event_checklists', selectedChecklist.id), {
        students: updatedStudents
      });
      showLocalToast('Status Diperbarui', `Semua siswa ditandai sebagai "${optionLabel}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `event_checklists/${selectedChecklist.id}`);
    }
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ceklist acara "${title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'event_checklists', id));
      if (selectedChecklist?.id === id) {
        setSelectedChecklist(null);
      }
      showLocalToast('Ceklist Dihapus', `Ceklist acara "${title}" telah dihapus.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `event_checklists/${id}`);
    }
  };

  const handlePrintPDF = async (checklist: EventChecklist) => {
    try {
      await generateEventChecklistPDF(checklist, users);
      showLocalToast('PDF Berhasil Diunduh', `Laporan PDF acara "${checklist.title}" telah diunduh.`);
    } catch (error) {
      console.error(error);
      showLocalToast('Gagal Cetak PDF', 'Terjadi kesalahan saat memproses laporan PDF acara.');
    }
  };

  const getColorThemeDetails = (themeId?: string) => {
    return COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* KIRI: Form Pembuat & Riwayat Ceklist Acara */}
      <div className="lg:col-span-5 space-y-6">
        {/* 1. Pembuat Ceklist Acara Baru dengan Multi-Option */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Buat Ceklist Acara & Lomba</h3>
              <p className="text-[10px] text-slate-400">Tambah custom pilihan (misal: Voli, Estafet, Menyanyi)</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Templat Pintas Pilihan Custom:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('lomba_3')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                🏆 Voli, Estafet & Menyanyi
              </button>
              <button
                type="button"
                onClick={() => applyPreset('olahraga')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                ⚽ Pekan Olahraga
              </button>
              <button
                type="button"
                onClick={() => applyPreset('seni')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                🎨 Festival Seni & Agama
              </button>
              <button
                type="button"
                onClick={() => applyPreset('biner')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                ✔ Sederhana (2 Status)
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateChecklist} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Nama / Judul Acara Lomba
              </label>
              <input
                type="text"
                placeholder="Contoh: Lomba 17-an Asrama, Pekan Olahraga & Seni"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-xs outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-xs outline-hidden transition-all"
              />
            </div>

            {/* List Pilihan Custom yang Aktif */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Daftar Pilihan Custom ({options.length})
                </label>
                <span className="text-[9px] text-slate-400 font-medium">Bisa diedit/ditambah</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {options.map((opt, index) => {
                  const theme = getColorThemeDetails(opt.color);
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-2xl border ${theme.bg} ${theme.border} space-y-2 transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-4 text-center">
                          {index + 1}.
                        </span>
                        
                        <div className="p-1.5 bg-white rounded-xl shadow-2xs border border-slate-200 text-slate-700 shrink-0">
                          {renderOptionIcon(opt.icon || 'trophy', 'w-4 h-4')}
                        </div>

                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleUpdateOptionLabel(opt.id, e.target.value)}
                          placeholder="Nama Pilihan (Misal: Ikut Lomba Voli)"
                          className={`flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold outline-hidden ${theme.text}`}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromForm(opt.id)}
                          title="Hapus pilihan"
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pl-6 pt-0.5 border-t border-slate-200/50 text-[9px]">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-500">Warna:</span>
                          <div className="flex gap-1">
                            {COLOR_THEMES.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setOptions(prev => prev.map(o => o.id === opt.id ? { ...o, color: t.id } : o))}
                                className={`w-3.5 h-3.5 rounded-full ${t.badge} cursor-pointer transition-transform ${opt.color === t.id ? 'ring-2 ring-slate-800 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                title={t.label}
                              />
                            ))}
                          </div>
                        </div>

                        <label className="flex items-center gap-1 cursor-pointer select-none text-slate-600 font-bold">
                          <input
                            type="checkbox"
                            checked={opt.isNegative || false}
                            onChange={(e) => setOptions(prev => prev.map(o => o.id === opt.id ? { ...o, isNegative: e.target.checked } : o))}
                            className="rounded-md border-slate-300 text-rose-600 focus:ring-rose-500 w-3 h-3"
                          />
                          <span>Absen / Tidak Ikut</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Tambah Pilihan Baru */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Tambah Pilihan Custom Baru:
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Misal: Ikut Lomba Menyanyi / Lomba Catur"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-hidden focus:border-amber-500"
                />

                <select
                  value={newOptionIcon}
                  onChange={(e) => setNewOptionIcon(e.target.value)}
                  className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
                >
                  {AVAILABLE_ICONS.map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddOptionToForm}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shrink-0"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-[10px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-amber-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Buat Ceklist Acara</span>
            </button>
          </form>
        </div>

        {/* 2. Daftar Riwayat Ceklist Acara */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Riwayat Ceklist Acara</h3>
              <p className="text-[10px] text-slate-400">Daftar agenda acara/lomba khusus</p>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {eventChecklists.length} Agenda
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] font-medium">Memuat data dari server...</p>
            </div>
          ) : eventChecklists.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-150 rounded-2xl bg-slate-50">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] text-slate-500 font-bold">Belum Ada Ceklist Acara</p>
              <p className="text-[9px] text-slate-400 mt-1">Buat ceklist di atas untuk memulai pencatatan perlombaan</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {eventChecklists.map((c) => {
                const total = c.students.length;
                const opts = getResolvedOptions(c);
                const isSelected = selectedChecklist?.id === c.id;

                // Count active participants (non-negative options)
                const participantCount = c.students.filter(s => {
                  const sOpt = s.selectedOptionId ? opts.find(o => o.id === s.selectedOptionId) : null;
                  if (sOpt) return !sOpt.isNegative;
                  return s.status === 'sudah';
                }).length;

                const percentage = total > 0 ? Math.round((participantCount / total) * 100) : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChecklist(c)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : 'bg-slate-50/40 hover:bg-slate-50 border-slate-150'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-extrabold text-slate-800 truncate">{c.title}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[8.5px] text-slate-400 font-mono">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-slate-400" />
                          {new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className={`font-bold ${percentage === 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {participantCount}/{total} Partisipan ({percentage}%)
                        </span>
                      </div>

                      {/* Options preview badges */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {opts.map(o => {
                          const theme = getColorThemeDetails(o.color);
                          const count = c.students.filter(s => {
                            if (s.selectedOptionId) return s.selectedOptionId === o.id;
                            return o.isNegative ? s.status === 'belum' : s.status === 'sudah';
                          }).length;

                          return (
                            <span
                              key={o.id}
                              className={`px-1.5 py-0.5 ${theme.bg} ${theme.text} font-black text-[8px] rounded-md flex items-center gap-1 border ${theme.border}`}
                            >
                              {renderOptionIcon(o.icon || 'trophy', 'w-2.5 h-2.5')}
                              <span>{o.label}: {count}</span>
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handlePrintPDF(c)}
                        title="Unduh Laporan PDF"
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-amber-600 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklist(c.id, c.title)}
                        title="Hapus Agenda"
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* KANAN: Editor Detail & Penataan Ceklist Acara Terpilih */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedChecklist ? (
            <motion.div
              key={selectedChecklist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4"
            >
              {/* Header Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      Ceklist Acara Aktif
                    </span>
                    <span className="text-[8.5px] text-slate-400 font-mono">
                      Dibuat {new Date(selectedChecklist.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">{selectedChecklist.title}</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Tanggal Pelaksanaan: {new Date(selectedChecklist.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handlePrintPDF(selectedChecklist)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Cetak PDF Acara
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChecklist(null)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-450 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    title="Tutup Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Summary Cards by Option */}
              {(() => {
                const currentOpts = getResolvedOptions(selectedChecklist);
                return (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Ringkasan Partisipasi Pilihan Custom
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {currentOpts.map(o => {
                        const theme = getColorThemeDetails(o.color);
                        const count = selectedChecklist.students.filter(s => {
                          if (s.selectedOptionId) return s.selectedOptionId === o.id;
                          return o.isNegative ? s.status === 'belum' : s.status === 'sudah';
                        }).length;

                        return (
                          <div
                            key={o.id}
                            className={`p-2.5 rounded-2xl border ${theme.bg} ${theme.border} space-y-0.5 text-center`}
                          >
                            <p className={`text-[8.5px] font-black ${theme.text} uppercase tracking-wider truncate`} title={o.label}>
                              {o.label}
                            </p>
                            <p className={`text-sm font-extrabold ${theme.text} flex items-center justify-center gap-1`}>
                              {renderOptionIcon(o.icon || 'trophy', 'w-3.5 h-3.5')}
                              <span>{count} Siswa</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Bulk Action Controls */}
              {(() => {
                const currentOpts = getResolvedOptions(selectedChecklist);
                return (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-50/60 border border-dashed border-amber-200 rounded-2xl">
                    <span className="text-[10px] text-amber-900 font-bold flex items-center gap-1 pl-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Set Semua Siswa Ke:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentOpts.map(o => {
                        const theme = getColorThemeDetails(o.color);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => handleMarkAllWithOption(o.id, o.label)}
                            className={`px-2.5 py-1 bg-white hover:${theme.bg} ${theme.text} border ${theme.border} rounded-xl text-[9px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs`}
                          >
                            {renderOptionIcon(o.icon || 'trophy', 'w-3 h-3')}
                            <span>{o.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Tabel Checklist Siswa dengan Tombol Pilihan Custom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Pilih Status Lomba Untuk Setiap Siswa
                  </h4>
                  <span className="text-[9px] text-slate-400 font-medium italic">
                    *Klik tombol pilihan pada baris siswa untuk memilih
                  </span>
                </div>

                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">Nama Siswa (Anak Asuh)</th>
                        <th className="py-2.5 px-3 text-center">Pilihan Status Acara / Lomba</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const currentOpts = getResolvedOptions(selectedChecklist);
                        return selectedChecklist.students.map((item, index) => {
                          // Determine currently active option ID
                          let activeOptId = item.selectedOptionId;
                          if (!activeOptId) {
                            activeOptId = item.status === 'sudah' ? currentOpts[0]?.id : currentOpts[currentOpts.length - 1]?.id;
                          }

                          return (
                            <tr
                              key={item.studentId}
                              className="border-b border-slate-100 hover:bg-slate-50/50 text-xs transition-all last:border-0"
                            >
                              <td className="py-3 px-3 text-center text-[10px] font-mono text-slate-400">
                                {index + 1}
                              </td>
                              <td className="py-3 px-3 font-extrabold text-slate-700">
                                {item.studentName}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                  {currentOpts.map(opt => {
                                    const isSelected = activeOptId === opt.id;
                                    const theme = getColorThemeDetails(opt.color);

                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelectStudentOption(item.studentId, opt.id)}
                                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                                          isSelected
                                            ? `${theme.badge} text-white shadow-xs scale-105 ring-2 ring-slate-800/20`
                                            : `bg-slate-100 hover:${theme.bg} text-slate-600 hover:${theme.text} border border-slate-200`
                                        }`}
                                      >
                                        {renderOptionIcon(opt.icon || 'trophy', 'w-3 h-3')}
                                        <span className="truncate max-w-[120px]">{opt.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-150 rounded-3xl bg-slate-50/50 p-12 text-center text-slate-450 min-h-[400px]">
              <Trophy className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-extrabold text-slate-700">Detail Ceklist Acara & Lomba</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                Pilih salah satu agenda acara di sebelah kiri untuk menentukan pilihan lomba siswa (misal: Voli, Estafet, Menyanyi), dan mencetak laporan PDF.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Local Toast Notification */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-4 flex items-start gap-3"
          >
            <div className="p-1.5 bg-amber-600/20 text-amber-400 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-extrabold text-white">{localToast.title}</h4>
              <p className="text-[10px] text-slate-300 leading-snug">{localToast.message}</p>
            </div>
            <button
              onClick={() => setLocalToast(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
