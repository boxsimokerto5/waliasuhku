import React from 'react';
import { User } from '../types';

interface ParentRegistrationProps {
  parentName: string;
  setParentName: (val: string) => void;
  parentUsername: string;
  setParentUsername: (val: string) => void;
  selectedChildId: string;
  setSelectedChildId: (val: string) => void;
  myChildren: User[];
  parentError: string;
  parentSuccess: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const ParentRegistration: React.FC<ParentRegistrationProps> = ({
  parentName,
  setParentName,
  parentUsername,
  setParentUsername,
  selectedChildId,
  setSelectedChildId,
  myChildren,
  parentError,
  parentSuccess,
  onSubmit,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto text-left">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-sm font-extrabold text-slate-800">Daftarkan Orang Tua</h3>
        <p className="text-[10px] text-slate-400">Hubungkan wali murid / orang tua agar dapat melihat pelaporan yang telah Anda setujui</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {parentError && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium text-left">
            {parentError}
          </div>
        )}
        {parentSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium text-left">
            {parentSuccess}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
            Nama Lengkap Orang Tua / Wali
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
            Username Akun Orang Tua
          </label>
          <input
            type="text"
            value={parentUsername}
            onChange={(e) => setParentUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            placeholder="Contoh: budis"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 font-mono font-bold"
            required
          />
          <span className="text-[10px] text-slate-400 mt-1 block leading-tight text-left">
            * Tanpa spasi. Password default login disamakan dengan username orang tua.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
            Hubungkan dengan Siswa (Anak Asuh)
          </label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 font-medium"
            required
          >
            <option value="">-- Pilih Siswa / Anak Asuh --</option>
            {myChildren.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} ({child.username})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block leading-tight text-left">
            * Menghubungkan orang tua dengan akun siswa yang benar memastikan kerahasiaan data terjaga.
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] cursor-pointer"
        >
          Simpan Akun Orang Tua
        </button>
      </form>
    </div>
  );
};
