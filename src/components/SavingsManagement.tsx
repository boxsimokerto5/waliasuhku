import React, { useState } from 'react';
import { User, SavingsTransaction } from '../types';
import { Coins, Plus, Minus, Search, Calendar, User as UserIcon, ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../utils/crypto';

interface SavingsManagementProps {
  currentUser: User;
  myChildren: User[];
  savingsTransactions: SavingsTransaction[];
  onAddSavingsTransaction: (studentId: string, amount: number, type: 'setor' | 'tarik', description: string) => void;
  onBack: () => void;
}

export function SavingsManagement({
  currentUser,
  myChildren,
  savingsTransactions,
  onAddSavingsTransaction,
  onBack
}: SavingsManagementProps) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [transactionType, setTransactionType] = useState<'setor' | 'tarik'>('setor');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [searchTxQuery, setSearchTxQuery] = useState('');
  const [filterStudentTx, setFilterStudentTx] = useState('all');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected student details
  const selectedStudent = myChildren.find(c => c.id === selectedStudentId);

  // Totals calculations
  const myChildrenIds = myChildren.map(c => c.id);
  const relevantTransactions = savingsTransactions.filter(tx => myChildrenIds.includes(tx.studentId));

  const totalBalance = myChildren.reduce((sum, c) => sum + (c.savingsBalance || 0), 0);
  const totalDeposits = relevantTransactions
    .filter(tx => tx.type === 'setor')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalWithdrawals = relevantTransactions
    .filter(tx => tx.type === 'tarik')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Silakan pilih anak asuh terlebih dahulu!');
      return;
    }

    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Masukkan nominal tabungan yang valid (lebih besar dari 0)!');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Harap masukkan keterangan transaksi!');
      return;
    }

    if (transactionType === 'tarik') {
      const balance = selectedStudent?.savingsBalance || 0;
      if (balance < amount) {
        setErrorMsg(`Saldo tidak mencukupi! Saldo ${selectedStudent?.name} saat ini adalah Rp ${balance.toLocaleString('id-ID')}.`);
        return;
      }
    }

    onAddSavingsTransaction(selectedStudentId, amount, transactionType, description);
    
    setSuccessMsg(`Berhasil mencatat transaksi ${transactionType === 'setor' ? 'setoran' : 'penarikan'} sebesar Rp ${amount.toLocaleString('id-ID')} untuk ${selectedStudent?.name}!`);
    setAmountStr('');
    setDescription('');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // Format amount input as thousands separated
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmountStr('');
      return;
    }
    const num = parseInt(rawValue, 10);
    setAmountStr(num.toLocaleString('id-ID'));
  };

  // Filter child accounts for grid/list
  const filteredChildren = myChildren.filter(child => {
    if (!searchStudentQuery.trim()) return true;
    const q = searchStudentQuery.toLowerCase();
    return child.name.toLowerCase().includes(q) || child.username.toLowerCase().includes(q);
  });

  // Filter transactions
  const filteredTransactions = relevantTransactions.filter(tx => {
    // Student filter
    if (filterStudentTx !== 'all' && tx.studentId !== filterStudentTx) return false;
    
    // Search query filter
    if (searchTxQuery.trim()) {
      const q = searchTxQuery.toLowerCase();
      return tx.studentName.toLowerCase().includes(q) || tx.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-8 text-left max-w-6xl mx-auto">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Manajemen Tabungan Siswa</h3>
            <p className="text-xs text-slate-500 font-medium">Input setoran/penarikan tabungan dan pantau riwayat keuangan anak asuh Anda.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Saldo */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Total Saldo Terhimpun</span>
            <span className="text-xl font-extrabold text-emerald-950 mt-1 block">
              Rp {totalBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-xs border border-emerald-100/50">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Total Setoran */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Akumulasi Setoran</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
              + Rp {totalDeposits.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl text-emerald-500 shadow-xs">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Penarikan */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Akumulasi Penarikan</span>
            <span className="text-xl font-extrabold text-rose-600 mt-1 block">
              - Rp {totalWithdrawals.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl text-rose-500 shadow-xs">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form vs. List of Student Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Input Form & Student List Selection */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Heading */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Langkah 1: Pilih Siswa & Input Transaksi
            </h4>
            <p className="text-[11px] text-slate-500">Pilih salah satu siswa di bawah, lalu isi nominal tabungan yang ingin disetor atau ditarik.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50/40 border border-slate-150 p-5 rounded-2xl space-y-4">
            {selectedStudent ? (
              <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{selectedStudent.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedStudent.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Saldo Saat Ini</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    Rp {(selectedStudent.savingsBalance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs italic">
                ⚠️ Belum ada siswa dipilih. Klik nama siswa pada daftar di bawah untuk memilih.
              </div>
            )}

            {/* Transaction Type Choice */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipe Transaksi</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('setor')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    transactionType === 'setor'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Setor Tabungan (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('tarik')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    transactionType === 'tarik'
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Tarik Tabungan (-)</span>
                </button>
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nominal Transaksi (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  placeholder="Contoh: 50.000"
                  value={amountStr}
                  onChange={handleAmountChange}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Note/Description Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Keterangan / Deskripsi Transaksi</label>
              <input
                type="text"
                placeholder="Contoh: Uang saku pekan ini, Tarik beli buku tulis, dll."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Messages */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[11px] font-semibold flex items-start gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] font-semibold flex items-start gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Simpan Catatan Transaksi</span>
            </button>
          </form>

          {/* Student Balance Directory */}
          <div className="space-y-3 bg-white border border-slate-100 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
              <div>
                <h5 className="text-xs font-extrabold text-slate-800">Daftar Tabungan Anak Asuh</h5>
                <p className="text-[10px] text-slate-400">Pilih siswa di bawah untuk memasukkan transaksi ke formulir</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Cari anak asuh..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-1 pt-1">
              {filteredChildren.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">
                  Tidak ada anak asuh yang cocok dengan pencarian Anda.
                </div>
              ) : (
                filteredChildren.map(child => {
                  const isSelected = selectedStudentId === child.id;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(child.id);
                        setErrorMsg('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/10'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {child.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-[11px] font-bold text-slate-800 truncate">{child.name}</h6>
                          <span className="text-[9px] text-slate-400 font-mono block">ID: {child.username}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-400 block font-medium">Saldo</span>
                        <span className="text-[11px] font-extrabold text-slate-700">
                          Rp {(child.savingsBalance || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Recent Transactions List */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Riwayat Transaksi Tabungan
            </h4>
            <p className="text-[11px] text-slate-500">Histori mutasi penyetoran dan penarikan yang pernah diinput.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
            
            {/* Filter and Search Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterStudentTx}
                onChange={(e) => setFilterStudentTx(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-600 focus:outline-none w-full sm:w-auto"
              >
                <option value="all">Semua Siswa</option>
                {myChildren.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari catatan..."
                  value={searchTxQuery}
                  onChange={(e) => setSearchTxQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 pt-1">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  Belum ada catatan transaksi tabungan.
                </div>
              ) : (
                filteredTransactions.map(tx => {
                  const isSetor = tx.type === 'setor';
                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 text-left"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                          isSetor ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {isSetor ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-extrabold text-indigo-600 block uppercase tracking-wider">{tx.studentName}</span>
                          <p className="text-[11px] font-bold text-slate-700 leading-tight mt-0.5">{tx.description}</p>
                          <span className="text-[9px] text-slate-400 block mt-1 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-extrabold block ${
                          isSetor ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isSetor ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-200/50 text-slate-500 mt-1 inline-block uppercase">
                          {isSetor ? 'Setoran' : 'Penarikan'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
