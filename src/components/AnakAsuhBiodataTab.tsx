import React, { useState } from 'react';
import { Mail, Phone, MapPin, CreditCard, Camera, Sparkles, Award, Edit2, Check, ExternalLink, Upload, FileText, Eye, X } from 'lucide-react';
import { User } from '../types';

interface AnakAsuhBiodataTabProps {
  currentUser: User;
  onUpdateBiodata?: (childId: string, updatedFields: Partial<User>) => Promise<void> | void;
}

export default function AnakAsuhBiodataTab({
  currentUser,
  onUpdateBiodata,
}: AnakAsuhBiodataTabProps) {
  const [subTab, setSubTab] = useState<'biodata' | 'portofolio'>('biodata');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedFotoUrl, setEditedFotoUrl] = useState(currentUser.fotoUrl || '');
  const [editedFotoKkUrl, setEditedFotoKkUrl] = useState(currentUser.fotoKkUrl || '');
  const [editedFotoBpjsUrl, setEditedFotoBpjsUrl] = useState(currentUser.fotoBpjsUrl || '');
  const [editedAlamat, setEditedAlamat] = useState(currentUser.alamat || '');
  const [editedNik, setEditedNik] = useState(currentUser.nik || '');
  const [editedKk, setEditedKk] = useState(currentUser.kk || '');
  const [editedParentPhone, setEditedParentPhone] = useState(currentUser.parentPhone || '');
  const [editedEmail, setEditedEmail] = useState(currentUser.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Image previews
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);
  const [bpjsPreview, setBpjsPreview] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

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
    setIsSaving(true);
    try {
      if (onUpdateBiodata) {
        await onUpdateBiodata(currentUser.id, {
          fotoUrl: editedFotoUrl,
          fotoKkUrl: editedFotoKkUrl,
          fotoBpjsUrl: editedFotoBpjsUrl,
          alamat: editedAlamat.trim(),
          nik: editedNik.trim(),
          kk: editedKk.trim(),
          parentPhone: editedParentPhone.trim(),
          email: editedEmail.trim(),
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui biodata");
    } finally {
      setIsSaving(false);
    }
  };

  const defaultAvatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Budi",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Siti"
  ];

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.startsWith('0')) {
      formatted = '62' + cleaned.slice(1);
    }
    return `https://wa.me/${formatted}`;
  };

  return (
    <div className="lg:col-span-12 space-y-6">
      {/* Profile Info Header */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-850 rounded-3xl p-6 text-white text-left shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-white/5 pointer-events-none">
          <Sparkles className="w-56 h-56" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
            {currentUser.fotoUrl ? (
              <img src={currentUser.fotoUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl font-extrabold uppercase text-white">{currentUser.name.charAt(0)}</span>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Profil Anak Asuh
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <h2 className="text-2xl font-black tracking-tight">{currentUser.name}</h2>
              {currentUser.category && (
                <span className="text-[9px] font-black bg-indigo-500/50 border border-indigo-400/30 uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  {currentUser.category}
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-100 font-mono">ID Akun Login: @{currentUser.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-100 bg-white rounded-t-3xl px-6 pt-2 shadow-xs">
        <button
          type="button"
          onClick={() => setSubTab('biodata')}
          className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer ${
            subTab === 'biodata' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Biodata Pribadiku
        </button>
        <button
          type="button"
          onClick={() => setSubTab('portofolio')}
          className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 ${
            subTab === 'portofolio' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Portofolio & Prestasiku</span>
        </button>
      </div>

      {/* Content Box */}
      <div className="bg-white border-x border-b border-slate-100 rounded-b-3xl p-6 shadow-sm text-left">
        {subTab === 'biodata' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Informasi Pribadi</span>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Lengkapi / Edit Biodata</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBiodata}
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setImagePreview(null);
                      setKkPreview(null);
                      setBpjsPreview(null);
                      setEditedFotoUrl(currentUser.fotoUrl || '');
                      setEditedFotoKkUrl(currentUser.fotoKkUrl || '');
                      setEditedFotoBpjsUrl(currentUser.fotoBpjsUrl || '');
                      setEditedAlamat(currentUser.alamat || '');
                      setEditedNik(currentUser.nik || '');
                      setEditedKk(currentUser.kk || '');
                      setEditedParentPhone(currentUser.parentPhone || '');
                      setEditedEmail(currentUser.email || '');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nama Lengkap</span>
                      <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor NIK</span>
                      <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {currentUser.nik || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor Kartu Keluarga (KK)</span>
                      <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {currentUser.kk || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Nomor HP Orang Tua / Wali</span>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {currentUser.parentPhone || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                        {currentUser.parentPhone && (
                          <a
                            href={getWhatsAppLink(currentUser.parentPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] rounded-lg border border-emerald-150 transition-all cursor-pointer"
                          >
                            <span>Hubungi Orang Tua</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Alamat Email Aktif</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {currentUser.email || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Alamat Rumah Lengkap</span>
                      <span className="text-xs font-medium text-slate-700 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        {currentUser.alamat || <span className="text-[10px] text-slate-400 font-normal italic">Belum diisi</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VIEW DOCUMENTS SECTION */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Berkas Dokumen Legalitas</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* KK Card */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Foto Kartu Keluarga (KK)</span>
                        <span className="text-[11px] text-slate-500">Scan/Foto dokumen KK resmi yang terekam.</span>
                      </div>
                      <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group">
                        {currentUser.fotoKkUrl ? (
                          <>
                            <img src={currentUser.fotoKkUrl} className="w-full h-full object-cover" alt="Kartu Keluarga" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setZoomImage(currentUser.fotoKkUrl || null)}
                                className="px-3 py-1.5 bg-white text-slate-800 font-bold text-[10px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-indigo-600" />
                                Perbesar
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-slate-400 italic">
                            <FileText className="w-8 h-8 text-slate-300 mb-1" />
                            <span className="text-[10px]">Belum diunggah</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BPJS Card */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Foto Kartu BPJS Kesehatan</span>
                        <span className="text-[11px] text-slate-500">Scan/Foto jaminan kartu BPJS kesehatan aktif.</span>
                      </div>
                      <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group">
                        {currentUser.fotoBpjsUrl ? (
                          <>
                            <img src={currentUser.fotoBpjsUrl} className="w-full h-full object-cover" alt="Kartu BPJS" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setZoomImage(currentUser.fotoBpjsUrl || null)}
                                className="px-3 py-1.5 bg-white text-slate-800 font-bold text-[10px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-emerald-600" />
                                Perbesar
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-slate-400 italic">
                            <FileText className="w-8 h-8 text-slate-300 mb-1" />
                            <span className="text-[10px]">Belum diunggah</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Editing Panel */
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Ganti Foto Profil</span>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-xl bg-slate-150 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nomor NIK (16 Digit)
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editedNik}
                        onChange={(e) => setEditedNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 320101XXXXXXXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-850 font-mono"
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
                        placeholder="Contoh: 320101XXXXXXXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-850 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nomor HP Orang Tua
                        </label>
                        <input
                          type="text"
                          value={editedParentPhone}
                          onChange={(e) => setEditedParentPhone(e.target.value)}
                          placeholder="Contoh: 0812345678"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-850 font-semibold"
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
                          placeholder="siswa@sekolah.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-850 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Alamat Asal Lengkap
                      </label>
                      <textarea
                        rows={2}
                        value={editedAlamat}
                        onChange={(e) => setEditedAlamat(e.target.value)}
                        placeholder="Masukkan alamat tinggal asal lengkap Anda"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white text-slate-850 font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* EDITING DOCUMENTS SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  {/* Upload KK */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Update Foto Kartu Keluarga (KK)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[120px]">
                      {kkPreview || editedFotoKkUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={kkPreview || editedFotoKkUrl} className="w-full h-full object-cover" alt="Update KK" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => { setKkPreview(null); setEditedFotoKkUrl(''); }}
                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-1 text-[9px] font-bold cursor-pointer hover:bg-rose-700"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center p-2 w-full h-full">
                          <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                          <span className="text-[10px] font-bold text-indigo-700">Unggah Foto KK Baru</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">Maks 2MB</span>
                          <input type="file" accept="image/*" onChange={handleKkChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Upload BPJS */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Update Foto Kartu BPJS Kesehatan
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[120px]">
                      {bpjsPreview || editedFotoBpjsUrl ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={bpjsPreview || editedFotoBpjsUrl} className="w-full h-full object-cover" alt="Update BPJS" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => { setBpjsPreview(null); setEditedFotoBpjsUrl(''); }}
                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-1 text-[9px] font-bold cursor-pointer hover:bg-rose-700"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center p-2 w-full h-full">
                          <Upload className="w-5 h-5 text-emerald-500 mb-1" />
                          <span className="text-[10px] font-bold text-emerald-700">Unggah Foto BPJS Baru</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">Maks 2MB</span>
                          <input type="file" accept="image/*" onChange={handleBpjsChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* Portofolio List */
          <div className="space-y-5">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2.5">Catatan Pencapaian & Portofolioku</span>
            
            {!currentUser.portfolio || currentUser.portfolio.length === 0 ? (
              <div className="py-12 text-center text-slate-450 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Award className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p>Belum ada catatan prestasi atau portofolio terekam.</p>
                <p className="text-[10px] text-slate-400 font-normal mt-1">Catatan ini diisi resmi oleh Wali Asuh Anda berdasarkan prestasi dan pencapaian Anda.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {currentUser.portfolio.map((item) => {
                  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200/50';
                  if (item.category === 'Prestasi') colorClass = 'bg-amber-50 text-amber-700 border-amber-100';
                  else if (item.category === 'Akademik') colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                  else if (item.category === 'Sikap') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  else if (item.category === 'Karya') colorClass = 'bg-pink-50 text-pink-700 border-pink-100';
                  else if (item.category === 'Olahraga') colorClass = 'bg-sky-50 text-sky-700 border-sky-100';

                  return (
                    <div key={item.id} className="relative pl-8 flex gap-3 text-left">
                      <div className="absolute left-[8px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-violet-500 z-10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      </div>

                      <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
