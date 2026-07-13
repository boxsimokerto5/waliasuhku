import React, { useState } from 'react';
import { User } from '../types';
import { HeartHandshake, User as UserIcon, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function LoginScreen({ users, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan Password harus diisi');
      return;
    }

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      if (foundUser.isSuspended) {
        setError('Akun Anda ditangguhkan (suspended) oleh Wali Asuh. Silakan hubungi pengelola Anda.');
        return;
      }
      onLogin(foundUser);
    } else {
      setError('Username atau Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-center text-white relative">
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Enkripsi Aktif
          </div>
          
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <HeartHandshake className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">WaliAsuhku</h1>
          <p className="text-white/80 text-sm mt-1 max-w-[280px] mx-auto font-light leading-relaxed">
            Sistem Aman Pelaporan, Pengaduan & Curhatan Anak Asuh
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username anda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              Masuk ke Aplikasi
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
