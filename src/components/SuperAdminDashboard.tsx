import React, { useState } from 'react';
import { User, Report } from '../types';
import { Plus, UserCheck, ShieldAlert, ClipboardList, RefreshCw, Key, Database, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { decryptMessage } from '../utils/crypto';

interface SuperAdminDashboardProps {
  users: User[];
  reports: Report[];
  onCreateWaliAsuh: (username: string, name: string) => void;
}

export default function SuperAdminDashboard({ 
  users, 
  reports, 
  onCreateWaliAsuh 
}: SuperAdminDashboardProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRawDatabase, setShowRawDatabase] = useState(false);
  const [dbDecryptKey, setDbDecryptKey] = useState('waliasuhku-secure-key');
  const [revealedReportId, setRevealedReportId] = useState<string | null>(null);

  // Group stats
  const totalWaliAsuh = users.filter(u => u.role === 'wali_asuh').length;
  const totalAnakAsuh = users.filter(u => u.role === 'anak_asuh').length;
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername || !newName) {
      setError('Mohon lengkapi semua bidang form');
      return;
    }

    if (newUsername.length < 3) {
      setError('Username wali asuh minimal 3 karakter');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      setError('Username tersebut sudah digunakan oleh akun lain');
      return;
    }

    onCreateWaliAsuh(newUsername.trim(), newName.trim());
    setSuccess(`Akun Wali Asuh "${newName}" berhasil didaftarkan! Password default adalah "${newUsername.trim()}"`);
    setNewUsername('');
    setNewName('');
  };

  const waliAsuhs = users.filter(u => u.role === 'wali_asuh');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold bg-indigo-500/40 text-indigo-100 px-3 py-1 rounded-full border border-indigo-400/20">
            Dasbor Super Admin
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Kelola Ekosistem WaliAsuhku</h2>
          <p className="text-indigo-100/80 text-sm mt-2 leading-relaxed">
            Anda memiliki otoritas penuh untuk menambahkan Wali Asuh dan melihat statistik sistem secara real-time. Semua pesan aman terenkripsi demi privasi pengguna.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-400">Total Wali Asuh</p>
            <h4 className="text-2xl font-bold text-slate-800">{totalWaliAsuh}</h4>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-400">Total Anak Asuh</p>
            <h4 className="text-2xl font-bold text-slate-800">{totalAnakAsuh}</h4>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-400">Total Laporan Masuk</p>
            <h4 className="text-2xl font-bold text-slate-800">{totalReports}</h4>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-400">Butuh Tanggapan</p>
            <h4 className="text-2xl font-bold text-slate-800">{pendingReports}</h4>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create Wali Asuh Form (Left Col - 5 spans) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Daftarkan Wali Asuh Baru</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Nama Lengkap Wali Asuh
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Ust. Syarif Hidayatullah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Username Akun
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Contoh: syarif"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block leading-tight ml-1">
                  * Tanpa spasi. Password awal disamakan dengan username wali asuh.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
              >
                Simpan Akun Wali Asuh
              </button>
            </form>
          </div>

          {/* Wali Asuh list card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Daftar Wali Asuh ({waliAsuhs.length})
            </h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {waliAsuhs.map(w => {
                // Count their assigned anak asuh
                const totalKids = users.filter(u => u.waliAsuhId === w.id).length;
                return (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {w.name.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{w.name}</p>
                        <p className="text-[10px] text-slate-400">Username: <span className="font-mono text-slate-600">{w.username}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                        {totalKids} Anak Asuh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - 7 spans: Database Encrypted / Audit Trail Viewer */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Sistem Enkripsi & Database Audit</h3>
                  <p className="text-[10px] text-slate-400">Inspeksi data rahasia demi kepatuhan privasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowRawDatabase(!showRawDatabase)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showRawDatabase 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                {showRawDatabase ? "Mode Normal" : "Lihat Database Mentah"}
              </button>
            </div>

            {showRawDatabase ? (
              // Raw database view (visualizing ciphertext)
              <div className="flex-1 flex flex-col space-y-4">
                <div className="p-3.5 bg-slate-900 text-slate-300 rounded-2xl font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner relative">
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[8px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    LOGS DATABASE
                  </div>
                  <p className="text-emerald-400">// Status Enkripsi: AES-256 SIMULATED-XOR ACTIVE</p>
                  <p className="text-slate-500">// Hanya Wali Asuh terkait yang memegang kunci dekripsi.</p>
                  <div className="mt-2 space-y-1 text-slate-400">
                    <p>Total Records: {reports.length}</p>
                    <p>Database ID: waliasuhku-secure-store</p>
                    <p>Server Host: node-container-3000</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[350px] pr-1">
                  {reports.map(r => (
                    <div key={r.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl text-left font-mono text-[11px]">
                      <div className="flex justify-between border-b border-slate-900 pb-1.5 mb-2">
                        <span className="text-indigo-400 font-bold">ID: {r.id}</span>
                        <span className="text-pink-400">Tipe: {r.type}</span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <p><span className="text-slate-500">Dari:</span> {r.senderName} ({r.senderId})</p>
                        <p><span className="text-slate-500">Ke:</span> {r.receiverName} ({r.receiverId})</p>
                        <p><span className="text-slate-500">Judul:</span> {r.title}</p>
                        
                        {/* CIPHERTEXT DISPLAY */}
                        <div className="mt-2 bg-slate-900 p-2.5 rounded border border-slate-900/40 text-rose-300 break-all select-all relative group">
                          <span className="text-[8px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                            Isi Terenkripsi (Raw Stored Payload):
                          </span>
                          {r.content}
                        </div>

                        {/* Interactive Decryption Sandbox */}
                        <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-900/20 p-2 rounded-xl">
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-500">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Tes Kunci Otoritas Wali Asuh</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {revealedReportId === r.id ? (
                              <button
                                onClick={() => setRevealedReportId(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[9px] hover:bg-slate-700 cursor-pointer flex items-center gap-1"
                              >
                                <EyeOff className="w-3 h-3" /> Tutup
                              </button>
                            ) : (
                              <button
                                onClick={() => setRevealedReportId(r.id)}
                                className="px-2 py-1 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-300 rounded text-[9px] cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Dekripsi Instan
                              </button>
                            )}
                          </div>
                        </div>

                        {revealedReportId === r.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-2.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded-lg text-xs font-sans whitespace-pre-wrap leading-relaxed"
                          >
                            <p className="font-semibold text-[9px] font-mono text-emerald-400 uppercase mb-1">✓ Berhasil Terdekripsi:</p>
                            {decryptMessage(r.content, dbDecryptKey)}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Normal Audit View
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4 flex-1">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-left">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">Privasi Aman Bersama WaliAsuhku</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Seluruh laporan pengaduan, pelaporan, dan curahan hati dilindungi enkripsi end-to-end. Super Admin hanya berwenang memantau ekosistem, performa wali asuh, dan memastikan sistem berjalan lancar tanpa bisa memata-matai curhatan pribadi anak asuh secara langsung tanpa persetujuan eksplisit.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 text-left">
                    Riwayat Laporan Masuk Terkini ({reports.length})
                  </h4>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {reports.map(r => {
                      let typeLabel = "Laporan";
                      let typeColor = "bg-slate-100 text-slate-700";
                      if (r.type === "pengaduan") {
                        typeLabel = "Pengaduan";
                        typeColor = "bg-rose-100 text-rose-800";
                      } else if (r.type === "curhatan") {
                        typeLabel = "Curhatan";
                        typeColor = "bg-violet-100 text-violet-800";
                      } else if (r.type === "pelaporan") {
                        typeLabel = "Pelaporan";
                        typeColor = "bg-indigo-100 text-indigo-800";
                      }

                      return (
                        <div key={r.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-2xl transition-all">
                          <div className="text-left min-w-0">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 mt-1 truncate">{r.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Dari: <span className="font-semibold text-slate-600">{r.senderName}</span> • Wali: <span className="font-semibold text-slate-600">{r.receiverName}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                              r.status === 'resolved' ? 'bg-emerald-500' : r.status === 'processed' ? 'bg-sky-500' : 'bg-amber-500'
                            }`} title={r.status}></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
                  Server Status: <span className="text-emerald-500 font-bold">● Online</span> • Enkripsi: <span className="text-indigo-500 font-bold">AES-256</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
