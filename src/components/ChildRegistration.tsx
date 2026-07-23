import React, { useState } from 'react';
import { User, MapPin, CreditCard, Phone, Mail, Camera, Eye, EyeOff, FileText, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadToImgBB } from '../utils/imgbb';

interface ChildRegistrationProps {
  newName: string;
  setNewName: (val: string) => void;
  newUsername: string;
  setNewUsername: (val: string) => void;
  error: string;
  success: string;
  onSubmit: (e: React.FormEvent, additionalData: {
    fotoUrl?: string;
    fotoKkUrl?: string;
    fotoBpjsUrl?: string;
    alamat?: string;
    nik?: string;
    kk?: string;
    parentPhone?: string;
    email?: string;
  }) => void;
}

export const ChildRegistration: React.FC<ChildRegistrationProps> = ({
  newName,
  setNewName,
  newUsername,
  setNewUsername,
  error,
  success,
  onSubmit,
}) => {
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoKkUrl, setFotoKkUrl] = useState('');
  const [fotoBpjsUrl, setFotoBpjsUrl] = useState('');
  const [alamat, setAlamat] = useState('');
  const [nik, setNik] = useState('');
  const [kk, setKk] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);
  const [bpjsPreview, setBpjsPreview] = useState<string | null>(null);

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingKk, setUploadingKk] = useState(false);
  const [uploadingBpjs, setUploadingBpjs] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFoto(true);
      try {
        const res = await uploadToImgBB(file);
        setImagePreview(res.proxiedUrl);
        setFotoUrl(res.proxiedUrl);
      } catch (err: any) {
        console.warn('ImgBB upload fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImagePreview(base64);
          setFotoUrl(base64);
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingFoto(false);
      }
    }
  };

  const handleKkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingKk(true);
      try {
        const res = await uploadToImgBB(file);
        setKkPreview(res.proxiedUrl);
        setFotoKkUrl(res.proxiedUrl);
      } catch (err: any) {
        console.warn('ImgBB upload fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setKkPreview(base64);
          setFotoKkUrl(base64);
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingKk(false);
      }
    }
  };

  const handleBpjsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingBpjs(true);
      try {
        const res = await uploadToImgBB(file);
        setBpjsPreview(res.proxiedUrl);
        setFotoBpjsUrl(res.proxiedUrl);
      } catch (err: any) {
        console.warn('ImgBB upload fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setBpjsPreview(base64);
          setFotoBpjsUrl(base64);
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingBpjs(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, {
      fotoUrl,
      fotoKkUrl,
      fotoBpjsUrl,
      alamat,
      nik,
      kk,
      parentPhone,
      email,
    });

    // Clear local fields on success (the parent component will clear name/username)
    if (!error) {
      setFotoUrl('');
      setFotoKkUrl('');
      setFotoBpjsUrl('');
      setAlamat('');
      setNik('');
      setKk('');
      setParentPhone('');
      setEmail('');
      setImagePreview(null);
      setKkPreview(null);
      setBpjsPreview(null);
    }
  };

  // Predefined default student avatars if they don't want to upload
  const defaultAvatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Budi",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Siti"
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md max-w-4xl mx-auto text-left">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-base font-extrabold text-slate-800">Daftarkan Anak Asuh Baru (Siswa)</h3>
        <p className="text-xs text-slate-400">Lengkapi formulir biodata lengkap anak asuh di bawah ini untuk membuat akun baru.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bagian Kiri: Informasi Akun & Foto */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider border-b border-indigo-50 pb-1">1. Akun & Foto Profil</h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nama Lengkap Anak Asuh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Ahmad Maulana"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-medium"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Username Akun Login <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Contoh: ahmadm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-mono font-bold"
                  required
                />
                <span className="text-slate-400 absolute left-3.5 top-2.5 font-bold text-xs">@</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                * Tanpa spasi. Password default login disamakan dengan username anak.
              </span>
            </div>

            {/* Foto Profil */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Foto Profil Siswa
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview || fotoUrl ? (
                    <img 
                      src={imagePreview || fotoUrl} 
                      alt="Pratinjau Foto" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-350" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unggah Foto atau Pilih Avatar Default:</span>
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {defaultAvatars.map((avUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFotoUrl(avUrl);
                          setImagePreview(null);
                        }}
                        className={`w-9 h-9 rounded-xl border p-0.5 overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                          fotoUrl === avUrl ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <img src={avUrl} className="w-full h-full rounded-lg" alt={`Avatar ${idx}`} referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer border border-slate-200 transition-all">
                      <span>Pilih File Lokal...</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[9px] text-slate-400 font-medium">Maksimal 2MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Informasi Biodata Lengkap */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-violet-600 uppercase tracking-wider border-b border-violet-50 pb-1">2. Biodata Lengkap & Legalitas</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor NIK (KTP Siswa/KIA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="16 Digit NIK"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor Kartu Keluarga (KK)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={16}
                    value={kk}
                    onChange={(e) => setKk(e.target.value.replace(/\D/g, ''))}
                    placeholder="16 Digit No. KK"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor HP Orang Tua / Wali
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Alamat Email Aktif
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="siswa@domain.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Alamat Rumah Asal Lengkap
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kabupaten/kota, provinsi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-medium resize-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* FOTO DOKUMEN KK & BPJS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Upload KK */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Foto / Scan Kartu Keluarga (KK)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[110px]">
                  {kkPreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={kkPreview} className="w-full h-full object-cover" alt="Scan KK" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => { setKkPreview(null); setFotoKkUrl(''); }}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 text-[9px] font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-2 w-full h-full">
                      <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-[10px] font-bold text-indigo-700">Pilih Foto KK</span>
                      <span className="text-[8px] text-slate-400 mt-0.5">Maks 2MB</span>
                      <input type="file" accept="image/*" onChange={handleKkChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Upload BPJS */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Foto / Scan Kartu BPJS Kesehatan
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-all text-center relative overflow-hidden min-h-[110px]">
                  {bpjsPreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={bpjsPreview} className="w-full h-full object-cover" alt="Scan BPJS" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => { setBpjsPreview(null); setFotoBpjsUrl(''); }}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 text-[9px] font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-2 w-full h-full">
                      <Upload className="w-5 h-5 text-emerald-500 mb-1" />
                      <span className="text-[10px] font-bold text-emerald-700">Pilih Foto BPJS</span>
                      <span className="text-[8px] text-slate-400 mt-0.5">Maks 2MB</span>
                      <input type="file" accept="image/*" onChange={handleBpjsChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-3 text-xs transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer mt-2 text-center"
        >
          SIMPAN DATA ANAK ASUH BARU
        </button>
      </form>
    </div>
  );
};
