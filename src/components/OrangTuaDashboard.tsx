import React, { useState } from 'react';
import { User, Report, Reply } from '../types';
import { Heart, Lock, Calendar, MessageSquare, Send, CheckCircle2, User as UserIcon, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { decryptMessage, formatDate } from '../utils/crypto';

interface OrangTuaDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  onAddReply: (reportId: string, replyContent: string) => void;
}

export default function OrangTuaDashboard({
  currentUser,
  users,
  reports,
  onAddReply
}: OrangTuaDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Find the child linked to this Parent account
  const myChild = users.find(u => u.id === currentUser.anakAsuhId && u.role === 'anak_asuh');

  // Filter messages intended for parents (pesan_ortu) from their specific child, which have been approved by Wali Asuh
  const parentMessages = reports.filter(r => 
    r.type === 'pesan_ortu' && 
    r.senderId === currentUser.anakAsuhId && 
    r.parentApprovalStatus === 'approved'
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReport) return;

    onAddReply(selectedReport.id, replyText.trim());
    setReplyText('');
    setSuccessMsg('Tanggapan Anda berhasil terkirim!');

    // Update local state instance
    const updatedReport = reports.find(r => r.id === selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 text-slate-800">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl text-left">
          <span className="text-xs font-bold bg-amber-400/40 text-amber-50 px-3 py-1 rounded-full border border-amber-300/20 flex items-center gap-1.5 w-fit">
            <Heart className="w-3.5 h-3.5 fill-white" />
            Halaman Orang Tua Siswa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Selamat Datang, Ayah / Bunda {currentUser.name}
          </h2>
          <p className="text-amber-50/90 text-xs sm:text-sm mt-2 leading-relaxed font-light">
            {myChild ? (
              <span>
                Menghubungkan Anda secara aman dengan buah hati Anda, <strong>{myChild.name}</strong>. Anda dapat melihat pesan-pesan yang telah dikirimkan oleh {myChild.name} dan disetujui oleh Wali Asuh demi keamanan bersama.
              </span>
            ) : (
              <span>
                Akun Orang Tua terhubung dengan sistem. Mohon hubungi Wali Asuh untuk memastikan tautan siswa sudah benar.
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Children Info & Message Feed (Spans 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Linked Student Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-left">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Informasi Anak</h3>
            {myChild ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50/40 border border-amber-100/50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm uppercase">
                  {myChild.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{myChild.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Siswa Terdaftar</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500 font-medium p-3 bg-rose-50 rounded-xl">
                Belum ada siswa yang dihubungkan ke akun Anda.
              </div>
            )}
          </div>

          {/* Messages Feed */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4 text-left">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Pesan Masuk ({parentMessages.length})</h3>
                <p className="text-[10px] text-slate-400">Pesan dari anak yang telah disetujui Wali Asuh</p>
              </div>
              <Mail className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {parentMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada pesan masuk dari anak Anda yang disetujui.
                </div>
              ) : (
                parentMessages.map(r => {
                  const isSelected = selectedReport?.id === r.id;
                  return (
                    <motion.div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`p-4 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left ${
                        isSelected ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100'
                      }`}
                      whileHover={{ y: -1 }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Diverifikasi Wali</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(r.createdAt).split(',')[0]}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 truncate">{r.title}</h4>
                      
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {decryptMessage(r.content)}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-extrabold">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{r.replies.length} Tanggapan</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Message Detail & Replies Thread (Spans 7) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedReport ? (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-full flex flex-col text-left"
              >
                {/* Detail Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest block">Detail Pesan Masuk</span>
                    <h3 className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{selectedReport.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[380px] pb-3">
                  
                  {/* Security Badge */}
                  <div className="bg-emerald-50 border border-emerald-100/60 p-3 rounded-2xl flex items-start gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-950 uppercase tracking-wide">Pesan Terenkripsi Aman</h4>
                      <p className="text-[10px] text-emerald-800 leading-tight mt-0.5">
                        Pesan ini didekripsi langsung di peramban Anda. Privasi antara anak, wali asuh, dan orang tua terlindungi penuh.
                      </p>
                    </div>
                  </div>

                  {/* Original Message Box */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100/50 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-[10px] font-bold text-slate-700">{selectedReport.senderName} (Anak)</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {formatDate(selectedReport.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {decryptMessage(selectedReport.content)}
                    </p>
                  </div>

                   {/* Replies (Thread) */}
                   <div className="space-y-2.5">
                     {(() => {
                       const visibleReplies = (selectedReport.replies || []).filter(
                         rep => rep.senderRole !== 'anak_asuh' || rep.isApproved
                       );
                       return (
                         <>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Percakapan ({visibleReplies.length}):</span>
                           {visibleReplies.map(rep => {
                             const isMe = rep.senderId === currentUser.id;
                             const isWali = rep.senderRole === 'wali_asuh';
                             return (
                               <div 
                                 key={rep.id} 
                                 className={`p-3 rounded-2xl text-xs flex flex-col max-w-[90%] leading-relaxed ${
                                   isMe 
                                     ? 'bg-amber-50 text-amber-950 border border-amber-100 ml-auto items-end text-right' 
                                     : isWali
                                       ? 'bg-violet-50 text-violet-950 border border-violet-100 mr-auto items-start text-left'
                                       : 'bg-slate-50 text-slate-800 border border-slate-100 mr-auto items-start text-left'
                                 }`}
                               >
                                 <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-slate-400">
                                   <span>
                                     {rep.senderName} {isWali ? '(Wali Asuh)' : isMe ? '(Anda)' : '(Anak)'}
                                   </span>
                                   <span>•</span>
                                   <span>{formatDate(rep.createdAt).split(',')[0]}</span>
                                 </div>
                                 <p className="text-[11px] font-medium leading-relaxed break-words text-left">
                                   {decryptMessage(rep.content)}
                                 </p>
                               </div>
                             );
                           })}
                         </>
                       );
                     })()}
                   </div>

                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="border-t border-slate-100 pt-3.5 flex flex-col gap-2">
                  {successMsg && (
                    <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-lg font-medium">
                      {successMsg}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Balas pesan anak Anda..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md shadow-amber-500/10 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim</span>
                    </button>
                  </div>
                </form>

              </motion.div>
            ) : (
              <div className="bg-white border border-slate-50 rounded-3xl p-12 text-center text-slate-400 h-full flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Detail Pesan Masuk</h4>
                  <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto mt-1 leading-normal">
                    Pilih pesan masuk di sebelah kiri untuk melihat isi percakapan dan membalas pesan.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
