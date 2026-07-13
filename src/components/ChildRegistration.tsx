import React from 'react';

interface ChildRegistrationProps {
  newName: string;
  setNewName: (val: string) => void;
  newUsername: string;
  setNewUsername: (val: string) => void;
  error: string;
  success: string;
  onSubmit: (e: React.FormEvent) => void;
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
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto text-left">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-sm font-extrabold text-slate-800">Daftarkan Anak Asuh Baru</h3>
        <p className="text-[10px] text-slate-400">Silakan lengkapi form berikut untuk membuat akun login bagi siswa baru</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
            Nama Lengkap Anak Asuh (Siswa)
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Contoh: Ahmad Maulana"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
            Username Akun Login
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            placeholder="Contoh: ahmadm"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-slate-800 font-mono font-bold"
            required
          />
          <span className="text-[10px] text-slate-400 mt-1 block leading-tight text-left">
            * Tanpa spasi. Password default login disamakan dengan username anak.
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-md shadow-violet-600/10 active:scale-[0.98] cursor-pointer"
        >
          Simpan Anak Asuh
        </button>
      </form>
    </div>
  );
};
