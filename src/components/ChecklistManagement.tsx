import React, { useState, useEffect } from 'react';
import { User, ActivityChecklist, ChecklistStudentStatus } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Download, Check, X, Calendar, Clipboard, CheckCircle, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { generateChecklistPDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'motion/react';

interface ChecklistManagementProps {
  currentUser: User;
  users: User[];
}

export function ChecklistManagement({ currentUser, users }: ChecklistManagementProps) {
  const [checklists, setChecklists] = useState<ActivityChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState<ActivityChecklist | null>(null);

  // Local Toast notification state
  const [localToast, setLocalToast] = useState<{ title: string; message: string } | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Synchronize checklists from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'activity_checklists'),
      (snapshot) => {
        const fetched: ActivityChecklist[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as ActivityChecklist;
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
        setChecklists(fetched);
        
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
          handleFirestoreError(error, OperationType.GET, 'activity_checklists');
        } catch (e) {
          console.warn('ChecklistManagement Firestore error handled:', e);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser.id, selectedChecklist?.id]);

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Judul kegiatan tidak boleh kosong');
      return;
    }

    if (myChildren.length === 0) {
      setFormError('Anda tidak memiliki anak asuh terdaftar untuk dimasukkan dalam ceklist');
      return;
    }

    const checklistId = `checklist_${Math.random().toString(36).substring(2, 11)}`;
    const studentStatuses: ChecklistStudentStatus[] = myChildren.map(child => ({
      studentId: child.id,
      studentName: child.name,
      status: 'belum' as const
    }));

    const newChecklist: ActivityChecklist = {
      id: checklistId,
      title: newTitle.trim(),
      date: newDate,
      waliAsuhId: currentUser.id,
      students: studentStatuses,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'activity_checklists', checklistId), newChecklist);
      setNewTitle('');
      setSelectedChecklist(newChecklist);
      showLocalToast('Ceklist Dibuat', `Ceklist "${newChecklist.title}" berhasil diinisialisasi.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `activity_checklists/${checklistId}`);
    }
  };

  const handleToggleStatus = async (studentId: string, currentStatus: 'sudah' | 'belum') => {
    if (!selectedChecklist) return;

    const newStatus: 'sudah' | 'belum' = currentStatus === 'sudah' ? 'belum' : 'sudah';
    const updatedStudents = selectedChecklist.students.map(s => {
      if (s.studentId === studentId) {
        return { ...s, status: newStatus };
      }
      return s;
    });

    try {
      await updateDoc(doc(db, 'activity_checklists', selectedChecklist.id), {
        students: updatedStudents
      });
      // SelectedChecklist state is updated automatically via onSnapshot useEffect
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `activity_checklists/${selectedChecklist.id}`);
    }
  };

  const handleMarkAll = async (status: 'sudah' | 'belum') => {
    if (!selectedChecklist) return;

    const updatedStudents = selectedChecklist.students.map(s => ({
      ...s,
      status
    }));

    try {
      await updateDoc(doc(db, 'activity_checklists', selectedChecklist.id), {
        students: updatedStudents
      });
      showLocalToast('Status Diperbarui', `Semua siswa ditandai sebagai "${status.toUpperCase()}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `activity_checklists/${selectedChecklist.id}`);
    }
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ceklist kegiatan "${title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'activity_checklists', id));
      if (selectedChecklist?.id === id) {
        setSelectedChecklist(null);
      }
      showLocalToast('Ceklist Dihapus', `Ceklist "${title}" telah dihapus.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `activity_checklists/${id}`);
    }
  };

  const handlePrintPDF = async (checklist: ActivityChecklist) => {
    try {
      await generateChecklistPDF(checklist, users);
      showLocalToast('PDF Berhasil Diunduh', `Laporan PDF untuk "${checklist.title}" telah diunduh.`);
    } catch (error) {
      console.error(error);
      showLocalToast('Gagal Cetak PDF', 'Terjadi kesalahan saat memproses laporan PDF.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* KIRI: Pembuat & Riwayat Ceklist */}
      <div className="lg:col-span-5 space-y-6">
        {/* 1. Pembuat Ceklist Baru */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Buat Daftar Ceklist Baru</h3>
              <p className="text-[10px] text-slate-400">Inisialisasi ceklist kegiatan untuk semua anak asuh</p>
            </div>
          </div>

          <form onSubmit={handleCreateChecklist} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Nama / Judul Kegiatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Shalat Subuh Berjamaah, Piket Kamar"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-violet-500 rounded-2xl text-xs outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Kegiatan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-violet-500 rounded-2xl text-xs outline-hidden transition-all"
                />
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-violet-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inisialisasi Ceklist Kegiatan</span>
            </button>
          </form>
        </div>

        {/* 2. Daftar Riwayat Kegiatan */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Riwayat Ceklist Kegiatan</h3>
              <p className="text-[10px] text-slate-400">Semua agenda ceklist yang pernah dibuat</p>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {checklists.length} Agenda
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] font-medium">Memuat data dari server...</p>
            </div>
          ) : checklists.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-150 rounded-2xl bg-slate-50">
              <Clipboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] text-slate-500 font-bold">Belum Ada Agenda Ceklist</p>
              <p className="text-[9px] text-slate-400 mt-1">Buat ceklist di atas untuk memulai pencatatan harian</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {checklists.map((c) => {
                const total = c.students.length;
                const done = c.students.filter(s => s.status === 'sudah').length;
                const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
                const isSelected = selectedChecklist?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChecklist(c)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                      isSelected
                        ? 'bg-violet-50/60 border-violet-200 shadow-xs'
                        : 'bg-slate-50/40 hover:bg-slate-50 border-slate-150'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-800 truncate">{c.title}</p>
                      <div className="flex items-center gap-2 text-[8.5px] text-slate-400 font-mono">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-slate-400" />
                          {new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className={`font-bold ${percentage === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {done}/{total} Siswa ({percentage}%)
                        </span>
                      </div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage === 100 ? 'bg-emerald-500' : 'bg-violet-500'
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
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
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

      {/* KANAN: Editor Detail Ceklist Terpilih */}
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
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md">
                      Agenda Aktif
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
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Cetak PDF
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

              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-150 rounded-2xl p-3 text-center">
                <div className="space-y-0.5">
                  <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">Sudah</p>
                  <p className="text-sm font-extrabold text-emerald-600">
                    {selectedChecklist.students.filter(s => s.status === 'sudah').length} Siswa
                  </p>
                </div>
                <div className="space-y-0.5 border-x border-slate-200">
                  <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">Belum</p>
                  <p className="text-sm font-extrabold text-rose-500">
                    {selectedChecklist.students.filter(s => s.status === 'belum').length} Siswa
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">Kelengkapan</p>
                  <p className="text-sm font-extrabold text-violet-600">
                    {selectedChecklist.students.length > 0
                      ? Math.round((selectedChecklist.students.filter(s => s.status === 'sudah').length / selectedChecklist.students.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {/* Bulk Action Controls */}
              <div className="flex items-center justify-between gap-2 p-2 bg-violet-50/50 border border-dashed border-violet-150 rounded-xl">
                <span className="text-[10px] text-violet-700 font-bold flex items-center gap-1 pl-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Tindakan Cepat:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMarkAll('sudah')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  >
                    ✔ Sudah Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('belum')}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-150 rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  >
                    ✘ Belum Semua
                  </button>
                </div>
              </div>

              {/* Tabel Checklist Siswa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Daftar Kehadiran Siswa
                  </h4>
                  <span className="text-[9px] text-slate-400 font-medium italic">
                    *Klik baris atau tombol status untuk merubah
                  </span>
                </div>

                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-2 px-3 text-center w-10">No</th>
                        <th className="py-2 px-3">Nama Siswa (Anak Asuh)</th>
                        <th className="py-2 px-3 text-center w-32">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChecklist.students.map((item, index) => {
                        const isSudah = item.status === 'sudah';
                        return (
                          <tr
                            key={item.studentId}
                            onClick={() => handleToggleStatus(item.studentId, item.status)}
                            className="border-b border-slate-100 hover:bg-slate-50/50 text-xs transition-all cursor-pointer last:border-0"
                          >
                            <td className="py-2.5 px-3 text-center text-[10px] font-mono text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-700">
                              {item.studentName}
                            </td>
                            <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.studentId, item.status)}
                                className={`w-full py-1.5 px-3 rounded-xl text-[10px] font-black tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  isSudah
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                                }`}
                              >
                                {isSudah ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>SUDAH</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-3.5 h-3.5 rounded-full border border-slate-400 bg-white"></div>
                                    <span>BELUM</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-150 rounded-3xl bg-slate-50/50 p-12 text-center text-slate-450 min-h-[400px]">
              <Clipboard className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-extrabold text-slate-700">Detail Ceklist Kegiatan</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                Pilih salah satu agenda ceklist di sebelah kiri untuk melihat detail kehadiran siswa, memperbarui status, dan mencetak laporan PDF yang rapi.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Local Toast Toast Notification */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-4 flex items-start gap-3"
          >
            <div className="p-1.5 bg-violet-600/20 text-violet-400 rounded-lg">
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
