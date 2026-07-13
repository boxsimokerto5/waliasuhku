import React from 'react';
import { Megaphone, Link, Trash2 } from 'lucide-react';
import { User, Broadcast } from '../types';

interface BroadcastModuleProps {
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  broadcastLinkUrl: string;
  setBroadcastLinkUrl: (val: string) => void;
  broadcastLinkText: string;
  setBroadcastLinkText: (val: string) => void;
  broadcastError: string;
  broadcastSuccess: string;
  handleSubmitBroadcast: (e: React.FormEvent) => void;
  broadcasts: Broadcast[];
  onDeleteBroadcast: (id: string) => void;
  currentUser: User;
  formatDate: (dateStr: string) => string;
}

export const BroadcastModule: React.FC<BroadcastModuleProps> = ({
  broadcastMessage,
  setBroadcastMessage,
  broadcastLinkUrl,
  setBroadcastLinkUrl,
  broadcastLinkText,
  setBroadcastLinkText,
  broadcastError,
  broadcastSuccess,
  handleSubmitBroadcast,
  broadcasts,
  onDeleteBroadcast,
  currentUser,
  formatDate,
}) => {
  const myBroadcasts = broadcasts.filter(b => b.senderId === currentUser.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Column: Form Siar */}
      <div className="md:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800">Siarkan Pesan Baru</h3>
        </div>

        <form onSubmit={handleSubmitBroadcast} className="space-y-4">
          {broadcastError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium text-left">
              {broadcastError}
            </div>
          )}
          {broadcastSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium text-left">
              {broadcastSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pesan Pengumuman
            </label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Tulis pengumuman penting atau instruksi pengisian assessment untuk anak asuh..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 leading-relaxed font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Link Tautan Pendukung (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Link className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={broadcastLinkUrl}
                onChange={(e) => setBroadcastLinkUrl(e.target.value)}
                placeholder="Contoh: https://docs.google.com/forms/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Teks Tombol Tautan (Opsional)
            </label>
            <input
              type="text"
              value={broadcastLinkText}
              onChange={(e) => setBroadcastLinkText(e.target.value)}
              placeholder="Default: Buka Link Pendukung"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 font-bold"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Siarkan Sekarang
          </button>
        </form>
      </div>

      {/* Right Column: Active Broadcasts List */}
      <div className="md:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
          Daftar Siaran Aktif Anda ({myBroadcasts.length})
        </h4>

        {myBroadcasts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Belum ada pesan siaran aktif dari Anda.
          </div>
        ) : (
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {myBroadcasts.map(b => (
              <div key={b.id} className="p-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl space-y-2 relative group">
                <button
                  type="button"
                  onClick={() => onDeleteBroadcast(b.id)}
                  className="absolute top-3 right-3 p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 shadow-xs transition-all cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100"
                  title="Hapus Siaran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs font-semibold text-slate-800 pr-6 leading-relaxed whitespace-pre-wrap">{b.message}</p>
                {b.linkUrl && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold">
                    <Link className="w-3.5 h-3.5 shrink-0" />
                    <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[280px]">
                      {b.linkText || 'Buka Tautan'}
                    </a>
                  </div>
                )}
                <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100/50">{formatDate(b.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
