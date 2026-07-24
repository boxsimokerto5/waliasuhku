import React, { useState } from 'react';
import { User, Report } from '../types';
import { User as UserIcon, Tag, MoreVertical, Check, Plus, ShieldAlert, Eye, Trash2, FileText, Printer, Loader2 } from 'lucide-react';
import { generateStudentMonthlyReportPDF } from '../utils/pdfGenerator';

interface AnakAsuhListProps {
  myChildren: User[];
  reports: Report[];
  existingCategories: string[];
  allAvailableCategories: string[];
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (val: string) => void;
  activeMenuChildId: string | null;
  setActiveMenuChildId: (val: string | null) => void;
  isCustomCategoryInputOpen: string | null;
  setIsCustomCategoryInputOpen: (val: string | null) => void;
  customCategoryInput: string;
  setCustomCategoryInput: (val: string) => void;
  onUpdateChildCategory: (childId: string, category: string) => Promise<void>;
  onToggleUserSuspension?: (userId: string, isSuspended: boolean) => Promise<void> | void;
  onSelectChildForDetail?: (child: User) => void;
  onDeleteAnakAsuh?: (childId: string) => Promise<void> | void;
  allUsers?: User[];
}

export const AnakAsuhList: React.FC<AnakAsuhListProps> = ({
  myChildren,
  reports,
  existingCategories,
  allAvailableCategories,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  activeMenuChildId,
  setActiveMenuChildId,
  isCustomCategoryInputOpen,
  setIsCustomCategoryInputOpen,
  customCategoryInput,
  setCustomCategoryInput,
  onUpdateChildCategory,
  onToggleUserSuspension,
  onSelectChildForDetail,
  onDeleteAnakAsuh,
  allUsers = [],
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [printingChildId, setPrintingChildId] = useState<string | null>(null);

  const filteredChildren = myChildren.filter(c => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'uncategorized') return !c.category;
    return c.category === selectedCategoryFilter;
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-4">
        <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Anak Asuh Saya ({myChildren.length})</h3>
          <p className="text-[10px] text-slate-400">Daftar anak asuh terhubung & kategori</p>
        </div>
      </div>

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
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
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
                  className={`relative flex flex-col p-3 border rounded-2xl hover:bg-slate-100/60 transition-all text-left ${
                    c.isSuspended ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        c.isSuspended ? 'bg-slate-200 text-slate-500' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-xs font-bold truncate ${c.isSuspended ? 'text-slate-400 line-through font-medium' : 'text-slate-800'}`}>{c.name}</p>
                          {c.isSuspended && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 shrink-0">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              <span>Ditangguhkan</span>
                            </span>
                          )}
                          {c.category && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{c.category}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">Asrama: {c.category || 'Umum'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setPrintingChildId(c.id);
                          try {
                            await generateStudentMonthlyReportPDF(c, allUsers.length > 0 ? allUsers : myChildren);
                          } catch (err) {
                            console.error(err);
                            alert("Gagal mencetak laporan PDF");
                          } finally {
                            setPrintingChildId(null);
                          }
                        }}
                        disabled={printingChildId === c.id}
                        className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                        title="Cetak Laporan Bulanan (PDF)"
                      >
                        {printingChildId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        ) : (
                          <Printer className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Cetak PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectChildForDetail) onSelectChildForDetail(c);
                        }}
                        className="p-1 bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-900 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title="Lihat Biodata & Portofolio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold hidden sm:inline">Biodata</span>
                      </button>

                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        {childReportCount} Lap
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuChildId(isMenuOpen ? null : c.id);
                          setIsCustomCategoryInputOpen(null);
                        }}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                        title="Kelola Siswa"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div 
                          className="absolute right-0 top-7 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl z-30 p-2 space-y-0.5 text-slate-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-[9px] font-extrabold text-slate-400 px-2.5 py-1.5 border-b border-slate-50 uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>Pilih Kategori</span>
                          </div>

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

                          {/* Custom Category Input */}
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

                          {/* Suspension Toggle Section */}
                          <div className="border-t border-slate-50 pt-1 mt-1">
                            <div className="text-[9px] font-extrabold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                              Status Akun
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (onToggleUserSuspension) {
                                  await onToggleUserSuspension(c.id, !c.isSuspended);
                                }
                                setActiveMenuChildId(null);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                c.isSuspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{c.isSuspended ? 'Aktifkan Akun' : 'Suspend Akun'}</span>
                            </button>
                          </div>

                          {/* Delete Section */}
                          {onDeleteAnakAsuh && (
                            <div className="border-t border-slate-50 pt-1 mt-1">
                              <div className="text-[9px] font-extrabold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                                Tindakan Berbahaya
                              </div>
                              {confirmDeleteId === c.id ? (
                                <div className="p-1 space-y-1">
                                  <div className="text-[9px] text-rose-600 font-extrabold px-1 text-center leading-normal">
                                    Hapus permanen data anak asuh?
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteAnakAsuh(c.id);
                                        setConfirmDeleteId(null);
                                        setActiveMenuChildId(null);
                                      }}
                                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-1 text-[9px] font-extrabold text-center cursor-pointer"
                                    >
                                      Yakin
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg py-1 text-[9px] font-bold text-center cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(c.id)}
                                  className="w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Hapus Anak Asuh</span>
                                </button>
                              )}
                            </div>
                          )}
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
    </div>
  );
};
