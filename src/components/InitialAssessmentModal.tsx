import React, { useState, useEffect } from 'react';
import { User, InitialAssessment } from '../types';
import { X, ChevronLeft, ChevronRight, Save, ClipboardList, Shield, Heart, Sparkles, Smile, BookOpen, PhoneCall, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InitialAssessmentModalProps {
  child: User;
  onClose: () => void;
  onSave: (childId: string, assessment: InitialAssessment) => Promise<void> | void;
}

const CATEGORIES = [
  { id: 'A', name: 'Profil & Keluarga', icon: Shield, color: 'text-amber-600 bg-amber-50' },
  { id: 'B', name: 'Kesehatan & Fisik', icon: Heart, color: 'text-rose-600 bg-rose-50' },
  { id: 'C', name: 'Kemandirian & Ibadah', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'D', name: 'Karakter & Emosi', icon: Smile, color: 'text-sky-600 bg-sky-50' },
  { id: 'E', name: 'Akademik & Minat', icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
  { id: 'F', name: 'Harapan & Kontak', icon: PhoneCall, color: 'text-indigo-600 bg-indigo-50' }
];

export default function InitialAssessmentModal({ child, onClose, onSave }: InitialAssessmentModalProps) {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initial Form State
  const [formData, setFormData] = useState<InitialAssessment>({
    namaLengkap: child.name || '',
    namaPanggilan: '',
    anakKe: '',
    dariBersaudara: '',
    saudaraDetail: '',
    statusOrangTua: '',
    pengasuhanSebelumnya: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    bantuanPemerintah: [],

    alergiMakanan: '',
    alergiObat: '',
    alergiLainnya: '',
    riwayatPenyakit: [],
    riwayatPenyakitLainnya: '',
    pengobatanRutin: '',
    polaTidur: [],
    polaTidurKhusus: '',
    makananDisukai: '',
    makananTidakDisukai: '',
    kebiasaanMakan: '',

    kemandirianMandi: '',
    kemandirianTempatTidur: '',
    kemandirianCuciBaju: '',
    kemampuanMengaji: '',
    kemampuanMengajiDetail: '',
    hafalanMilik: '',
    kedisiplinanShalat: '',

    sifatUtama: [],
    pemicuEmosi: '',
    reaksiMarah: '',
    caraMenangani: '',
    riwayatTrauma: '',

    mapelDisukai: '',
    mapelDitakuti: '',
    hobiKegemaran: '',
    bakatMenonjol: '',

    harapan1: '',
    harapan2: '',
    harapan3: '',
    namaKontakAlternatif: '',
    hubunganKontakAlternatif: '',
    noHpKontakAlternatif: '',
  });

  // Load existing assessment if available
  useEffect(() => {
    if (child.initialAssessment) {
      setFormData({
        ...formData,
        ...child.initialAssessment,
        namaLengkap: child.initialAssessment.namaLengkap || child.name || '',
      });
    }
  }, [child]);

  const handleChange = (field: keyof InitialAssessment, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxToggle = (field: 'bantuanPemerintah' | 'riwayatPenyakit' | 'polaTidur' | 'sifatUtama', option: string) => {
    const currentList = (formData[field] as string[]) || [];
    const updatedList = currentList.includes(option)
      ? currentList.filter(item => item !== option)
      : [...currentList, option];
    
    handleChange(field, updatedList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: InitialAssessment = {
        ...formData,
        updatedAt: new Date().toISOString(),
        filledBy: 'orang_tua'
      };
      await onSave(child.id, payload);
      setSuccessMessage('Asesmen awal buah hati Anda berhasil disimpan!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan asesmen awal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = () => {
    const currentIndex = CATEGORIES.findIndex(c => c.id === activeTab);
    if (currentIndex < CATEGORIES.length - 1) {
      setActiveTab(CATEGORIES[currentIndex + 1].id as any);
    }
  };

  const prevTab = () => {
    const currentIndex = CATEGORIES.findIndex(c => c.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(CATEGORIES[currentIndex - 1].id as any);
    }
  };

  // Helper lists for multiple choices
  const statusOrangTuaOptions = ['Utuh', 'Yatim', 'Piatu', 'Yatim Piatu', 'Orang Tua Berpisah / Cerai'];
  const pengasuhanOptions = ['Ayah & Ibu', 'Ibu saja', 'Ayah saja', 'Nenek-Kakek', 'Paman-Bibi', 'Lainnya'];
  const bantuanOptions = ['PKH', 'KIP', 'KKS', 'BPNT', 'Tidak Ada'];
  const penyakitOptions = ['Asma / Sesak', 'Kejang / Step', 'Maag / Asam Lambung', 'Patah Tulang / Cidera Berat', 'Lainnya'];
  const polaTidurOptions = [
    'Suka ngompol saat tidur',
    'Mengorok / Ngorok',
    'Sering berjalan atau mengindigo saat tidur',
    'Takut gelap / Harus menyalakan lampu',
    'Tidak bisa tidur jika terbiasa memakai guling khusus/selimut tertentu'
  ];
  const mandiriOptions = ['Sangat Mandiri', 'Masih Perlu Diingatkan', 'Perlu Dibantu'];
  const bisaOptions = ['Sudah Bisa', 'Belum Pernah'];
  const terbiasaOptions = ['Terbiasa', 'Belum Pernah'];
  const mengajiOptions = ['Belum Bisa', 'Iqra / Jilid', 'Al-Qur\'an'];
  const shalatOptions = ['Rutin Tanpa Disuruh', 'Harus Selalu Diingatkan', 'Masih Jarang'];
  const sifatOptions = [
    'Pendiam / Pemalu',
    'Sangat Aktif / Tidak Bisa Diam',
    'Mudah Bergaul / Ceria',
    'Sensitif / Peka / Mudah Menangis',
    'Tegas / Suka Memimpin',
    'Penurut / Kooperatif'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 box-border">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-[calc(100vw-1rem)] max-w-4xl max-h-[92dvh] sm:max-h-[92vh] my-auto flex flex-col overflow-hidden text-slate-800 border border-slate-100 min-w-0 box-border"
      >
        {/* Header Block */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-5.5 h-5.5 text-amber-100 animate-pulse" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Formulir Asesmen Awal Peserta Didik</h3>
                <p className="text-[10px] text-amber-100/95 font-medium mt-0.5">Wajib Diisi oleh Orang Tua / Wali Ananda {child.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note / Disclaimer Banner */}
        <div className="bg-amber-50/70 border-b border-amber-100/50 p-4 text-left">
          <p className="text-[10.5px] leading-relaxed text-amber-900 font-medium flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Catatan Pengasuh:</strong> Seluruh informasi dalam formulir ini bersifat kerahasiaan terbatas dan hanya dipergunakan oleh Tim Pengasuh & Guru Sekolah Rakyat demi mengoptimalkan tumbuh kembang, kenyamanan, serta keselamatan ananda selama di asrama.
            </span>
          </p>
        </div>

        {/* Tab Indicator Navigation Bar */}
        <div className="flex items-center justify-start overflow-x-auto border-b border-slate-100 p-2 gap-1 bg-slate-50 scrollbar-none">
          {CATEGORIES.map(category => {
            const IconComponent = category.icon;
            const isActive = activeTab === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id as any)}
                className={`px-3.5 py-2 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100/50 hover:text-slate-700'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : category.color}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold leading-none uppercase opacity-85">Kategori {category.id}</span>
                  <span className="block text-[10.5px] font-black leading-tight mt-0.5">{category.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Body - Scrollable content area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* CATEGORY A: IDENTITAS & PROFIL KELUARGA */}
              {activeTab === 'A' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-amber-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI A: IDENTITAS & PROFIL KELUARGA</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Berisi data diri lengkap ananda serta kondisi umum keluarga.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        value={formData.namaLengkap}
                        onChange={(e) => handleChange('namaLengkap', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Nama Lengkap Ananda"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Nama Panggilan</label>
                      <input
                        type="text"
                        value={formData.namaPanggilan}
                        onChange={(e) => handleChange('namaPanggilan', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Nama Panggilan Ananda"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Anak Ke-</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.anakKe}
                        onChange={(e) => handleChange('anakKe', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Contoh: 1"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Dari Bersaudara</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.dariBersaudara}
                        onChange={(e) => handleChange('dariBersaudara', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Contoh: 3"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Status Hubungan Orang Tua</label>
                      <select
                        value={formData.statusOrangTua}
                        onChange={(e) => handleChange('statusOrangTua', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Status</option>
                        {statusOrangTuaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Daftar Nama & Usia Saudara Kandung / Tiri</label>
                    <textarea
                      value={formData.saudaraDetail}
                      onChange={(e) => handleChange('saudaraDetail', e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                      placeholder="Tuliskan nama dan umur saudara kandung/tiri jika ada (contoh: 1. Kak Budi - 15 tahun, 2. Adek Susi - 6 tahun)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Sebelumnya Tinggal Bersama</label>
                      <select
                        value={formData.pengasuhanSebelumnya}
                        onChange={(e) => handleChange('pengasuhanSebelumnya', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Pengasuhan</option>
                        {pengasuhanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    {formData.pengasuhanSebelumnya === 'Lainnya' && (
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Sebutkan Pengasuhan Lainnya</label>
                        <input
                          type="text"
                          onChange={(e) => handleChange('pengasuhanSebelumnya', `Lainnya: ${e.target.value}`)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                          placeholder="Sebutkan tinggal bersama siapa"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Pekerjaan / Kegiatan Ayah</label>
                      <input
                        type="text"
                        value={formData.pekerjaanAyah}
                        onChange={(e) => handleChange('pekerjaanAyah', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Pekerjaan Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Pekerjaan / Kegiatan Ibu</label>
                      <input
                        type="text"
                        value={formData.pekerjaanIbu}
                        onChange={(e) => handleChange('pekerjaanIbu', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                        required
                        placeholder="Pekerjaan Ibu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Kepemilikan Kartu Bantuan Pemerintah</label>
                    <div className="flex flex-wrap gap-3">
                      {bantuanOptions.map(option => {
                        const isChecked = formData.bantuanPemerintah?.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleCheckboxToggle('bantuanPemerintah', option)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-amber-100 border-amber-400 text-amber-800 font-extrabold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[8px] ${isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY B: RIWAYAT KESEHATAN & KEBUTUHAN FISIK */}
              {activeTab === 'B' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-rose-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI B: RIWAYAT KESEHATAN & KEBUTUHAN FISIK</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sangat penting untuk mengantisipasi keamanan serta kesehatan buah hati selama berasrama.</p>
                  </div>

                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 space-y-3">
                    <h5 className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">1. Riwayat Alergi Ananda</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Alergi Makanan</label>
                        <input
                          type="text"
                          value={formData.alergiMakanan}
                          onChange={(e) => handleChange('alergiMakanan', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                          placeholder="Udang, telur, susu, dll (kosongkan jika tidak ada)"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Alergi Obat</label>
                        <input
                          type="text"
                          value={formData.alergiObat}
                          onChange={(e) => handleChange('alergiObat', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                          placeholder="Penisilin, ibuprofen, dll"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Alergi Lainnya</label>
                        <input
                          type="text"
                          value={formData.alergiLainnya}
                          onChange={(e) => handleChange('alergiLainnya', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                          placeholder="Debu, dingin, bulu kucing, serangga"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Riwayat Penyakit Khusus / Kronis</label>
                    <div className="flex flex-wrap gap-2.5">
                      {penyakitOptions.map(option => {
                        const isChecked = formData.riwayatPenyakit?.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleCheckboxToggle('riwayatPenyakit', option)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-rose-100 border-rose-400 text-rose-800 font-extrabold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[8px] ${isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                    {formData.riwayatPenyakit?.includes('Lainnya') && (
                      <input
                        type="text"
                        value={formData.riwayatPenyakitLainnya}
                        onChange={(e) => handleChange('riwayatPenyakitLainnya', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800 mt-2"
                        placeholder="Sebutkan riwayat penyakit khusus lainnya secara lengkap"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Pengobatan Rutin</label>
                    <input
                      type="text"
                      value={formData.pengobatanRutin}
                      onChange={(e) => handleChange('pengobatanRutin', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                      placeholder="Apakah ada obat wajib dari dokter secara berkala? Sebutkan nama obat dan dosis jika ada."
                    />
                  </div>

                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 space-y-3">
                    <h5 className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">2. Kebiasaan & Pola Tidur Malam</h5>
                    <div className="space-y-2">
                      {polaTidurOptions.map(option => {
                        const isChecked = formData.polaTidur?.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleCheckboxToggle('polaTidur', option)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-rose-50 border-rose-300 text-rose-800 font-extrabold shadow-2xs'
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[8px] shrink-0 ${isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Catatan Pola Tidur Khusus</label>
                      <input
                        type="text"
                        value={formData.polaTidurKhusus}
                        onChange={(e) => handleChange('polaTidurKhusus', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Misal: terbiasa meluk guling tertentu, tidak bisa tidur jika berisik, dll"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Makanan yang Sangat Disukai</label>
                      <input
                        type="text"
                        value={formData.makananDisukai}
                        onChange={(e) => handleChange('makananDisukai', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Menu makanan favorit"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Makanan Tidak Disukai / Pantangan</label>
                      <input
                        type="text"
                        value={formData.makananTidakDisukai}
                        onChange={(e) => handleChange('makananTidakDisukai', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Makanan yang ditolak atau dilarang"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Kebiasaan Makan</label>
                    <input
                      type="text"
                      value={formData.kebiasaanMakan}
                      onChange={(e) => handleChange('kebiasaanMakan', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                      placeholder="Susah makan sayur, harus disuapi, makan lambat/cepat, porsi sedikit, dll"
                    />
                  </div>
                </div>
              )}

              {/* CATEGORY C: KEMANDIRIAN & KEBIASAAN SEHARI-HARI */}
              {activeTab === 'C' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-emerald-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI C: KEMANDIRIAN & KEBIASAAN SEHARI-HARI</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Informasi tingkat kemandirian serta pembiasaan ibadah harian di rumah.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Mandi & Kebersihan Diri</label>
                      <select
                        value={formData.kemandirianMandi}
                        onChange={(e) => handleChange('kemandirianMandi', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Kemandirian</option>
                        {mandiriOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Merapikan Tempat Tidur</label>
                      <select
                        value={formData.kemandirianTempatTidur}
                        onChange={(e) => handleChange('kemandirianTempatTidur', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Kemampuan</option>
                        {bisaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Mencuci Pakaian Sendiri</label>
                      <select
                        value={formData.kemandirianCuciBaju}
                        onChange={(e) => handleChange('kemandirianCuciBaju', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Kemampuan</option>
                        {terbiasaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Kemampuan Mengaji / Keagamaan</label>
                      <select
                        value={formData.kemampuanMengaji}
                        onChange={(e) => handleChange('kemampuanMengaji', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Kemampuan</option>
                        {mengajiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Keterangan Jilid / Juz Mengaji</label>
                      <input
                        type="text"
                        value={formData.kemampuanMengajiDetail}
                        onChange={(e) => handleChange('kemampuanMengajiDetail', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: Iqra Jilid 4, Al-Qur'an Juz 10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Hafalan Surat Pendek / Juz Amma</label>
                      <input
                        type="text"
                        value={formData.hafalanMilik}
                        onChange={(e) => handleChange('hafalanMilik', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: An-Nas s.d Ad-Dhuha"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Kedisiplinan Shalat di Rumah</label>
                      <select
                        value={formData.kedisiplinanShalat}
                        onChange={(e) => handleChange('kedisiplinanShalat', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                        required
                      >
                        <option value="">Pilih Kedisiplinan</option>
                        {shalatOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY D: KARAKTER, EMOSI & SOSIALISASI */}
              {activeTab === 'D' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-sky-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI D: KARAKTER, EMOSI & SOSIALISASI</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Potret perilaku ananda demi penanganan sosio-emosional yang tepat dari guru pengasuh.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Sifat & Kepribadian Utama Dominan (Bisa pilih lebih dari satu)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {sifatOptions.map(option => {
                        const isChecked = formData.sifatUtama?.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleCheckboxToggle('sifatUtama', option)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-sky-100 border-sky-400 text-sky-800 font-extrabold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[8px] shrink-0 ${isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'}`}>
                              {isChecked && '✓'}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Hal-hal yang Memicu Amarah / Kesedihan (Trigger)</label>
                      <textarea
                        value={formData.pemicuEmosi}
                        onChange={(e) => handleChange('pemicuEmosi', e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Sebutkan hal yang biasanya memicu stres, tangisan, atau kemarahan ananda"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Reaksi saat Marah / Sedih / Stres (Coping)</label>
                      <textarea
                        value={formData.reaksiMarah}
                        onChange={(e) => handleChange('reaksiMarah', e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: mengurung diri, menangis keras, diam seribu bahasa, berteriak, merusak barang, dll"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Cara Paling Efektif Menenangkan Ananda</label>
                      <textarea
                        value={formData.caraMenangani}
                        onChange={(e) => handleChange('caraMenangani', e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: dipeluk erat, diberi waktu sendiri dulu, diajak bicara pelan-pelan, diberi minum, dll"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Riwayat Pengalaman Khusus / Trauma (jika ada)</label>
                      <textarea
                        value={formData.riwayatTrauma}
                        onChange={(e) => handleChange('riwayatTrauma', e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Ceritakan singkat apabila ananda memiliki trauma masa lalu, perundungan (bullying), atau berita duka mendalam."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY E: AKADEMIK, MINAT & HOBI */}
              {activeTab === 'E' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-violet-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI E: AKADEMIK, MINAT & HOBI</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Membantu asrama mengarahkan potensi bakat, kecenderungan belajar, serta kegiatan ekstrakurikuler yang pas.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Mata Pelajaran yang Disukai</label>
                      <input
                        type="text"
                        value={formData.mapelDisukai}
                        onChange={(e) => handleChange('mapelDisukai', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: Matematika, IPA, Seni Rupa"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Mata Pelajaran Kurang Disukai / Ditakuti</label>
                      <input
                        type="text"
                        value={formData.mapelDitakuti}
                        onChange={(e) => handleChange('mapelDitakuti', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Contoh: Bahasa Inggris, Fisika"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Hobi & Kegemaran Sehari-hari</label>
                      <input
                        type="text"
                        value={formData.hobiKegemaran}
                        onChange={(e) => handleChange('hobiKegemaran', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Olahraga, melukis, membaca, menyanyi, merakit lego, dll"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Bakat Khusus yang Paling Menonjol</label>
                      <input
                        type="text"
                        value={formData.bakatMenonjol}
                        onChange={(e) => handleChange('bakatMenonjol', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800"
                        placeholder="Sebutkan minat/bakat khusus ananda"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY F: HARAPAN ORANG TUA & KONTAK DARURAT */}
              {activeTab === 'F' && (
                <div className="space-y-5">
                  <div className="border-l-4 border-indigo-500 pl-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">KATEGORI F: HARAPAN ORANG TUA & KONTAK DARURAT</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kontrak sosial pendampingan asrama dan nomor kontak cadangan saat darurat.</p>
                  </div>

                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/30 space-y-3.5">
                    <h5 className="text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider">Sebutkan 3 Harapan Utama Setelah Ananda Dididik di Sekolah Rakyat:</h5>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 shrink-0">1.</span>
                        <input
                          type="text"
                          value={formData.harapan1}
                          onChange={(e) => handleChange('harapan1', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="Harapan pertama"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 shrink-0">2.</span>
                        <input
                          type="text"
                          value={formData.harapan2}
                          onChange={(e) => handleChange('harapan2', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="Harapan kedua"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 shrink-0">3.</span>
                        <input
                          type="text"
                          value={formData.harapan3}
                          onChange={(e) => handleChange('harapan3', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="Harapan ketiga"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
                    <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Kontak Darurat Alternatif (Wajib Diisi)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Nama Kontak Alternatif</label>
                        <input
                          type="text"
                          value={formData.namaKontakAlternatif}
                          onChange={(e) => handleChange('namaKontakAlternatif', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="Nama Paman/Bibi/Kakek/Nenek"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Hubungan dengan Anak</label>
                        <input
                          type="text"
                          value={formData.hubunganKontakAlternatif}
                          onChange={(e) => handleChange('hubunganKontakAlternatif', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="Misal: Paman kandung"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">No. HP / WhatsApp</label>
                        <input
                          type="text"
                          value={formData.noHpKontakAlternatif}
                          onChange={(e) => handleChange('noHpKontakAlternatif', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                          required
                          placeholder="0812xxxxxx"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Footer Area - Navigation Buttons & Save Action */}
        <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {CATEGORIES.map(category => (
              <div
                key={category.id}
                onClick={() => setActiveTab(category.id as any)}
                className={`w-5.5 h-1.5 rounded-full cursor-pointer transition-all ${
                  activeTab === category.id
                    ? 'bg-amber-600 w-8'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
                title={category.name}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={prevTab}
              disabled={activeTab === 'A'}
              className="px-3 py-2 bg-white text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {activeTab !== 'F' ? (
              <button
                type="button"
                onClick={nextTab}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-slate-200 disabled:to-slate-300 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-600/15"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Simpan & Kirim Asesmen</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Submit Success Message Popover Toast */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 z-55"
            >
              <Check className="w-5 h-5 text-emerald-100 shrink-0" />
              <span className="text-xs font-bold">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
