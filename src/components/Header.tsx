import { Calendar } from 'lucide-react';
import { User, AppNotification } from '../types';
import { HeartHandshake, LogOut, Bell, Shield, UserCheck, Baby, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenJadwalPiket?: () => void;
  onOpenJadwalTendikBaru?: () => void;
}

export default function Header({ 
  currentUser, 
  onLogout, 
  notifications, 
  onOpenNotifications,
  onOpenJadwalPiket,
  onOpenJadwalTendikBaru
}: HeaderProps) {
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          bg: 'bg-indigo-500 text-white',
          label: 'Super Admin',
          icon: <Shield className="w-3 h-3" />
        };
      case 'wali_asuh':
        return {
          bg: 'bg-violet-500 text-white',
          label: 'Wali Asuh',
          icon: <UserCheck className="w-3 h-3" />
        };
      case 'anak_asuh':
        return {
          bg: 'bg-pink-500 text-white',
          label: 'Anak Asuh',
          icon: <Baby className="w-3 h-3" />
        };
      case 'orang_tua':
        return {
          bg: 'bg-amber-500 text-white',
          label: 'Orang Tua',
          icon: <Heart className="w-3 h-3" />
        };
      default:
        return {
          bg: 'bg-slate-500 text-white',
          label: role,
          icon: null
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & User profile */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <HeartHandshake className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                WaliAsuhku
              </span>
              <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Sekolah Rakyat</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Current User Info */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100/80 rounded-2xl px-3 py-1.5 max-w-[200px] sm:max-w-none">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${badge.bg}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Utilities & Action buttons */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && onOpenJadwalPiket && (
              <button
                onClick={onOpenJadwalPiket}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl transition-all cursor-pointer text-xs font-extrabold shadow-2xs group"
                title="Lihat Jadwal Piket Wali Asuh Lama"
              >
                <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Jadwal Piket</span>
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  Agt
                </span>
              </button>
            )}

            {(currentUser.role === 'wali_asuh' || currentUser.role === 'super_admin') && onOpenJadwalTendikBaru && (
              <button
                onClick={onOpenJadwalTendikBaru}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-xl transition-all cursor-pointer text-xs font-extrabold shadow-2xs group"
                title="Lihat Jadwal Kerja 18 Tendik Wali Asuh Baru (SE No. 4749/2026)"
              >
                <Calendar className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Tendik Baru</span>
                <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  SE 4749
                </span>
              </button>
            )}

            {/* Notification trigger button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-600 group"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2.5 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-rose-600 group"
              title="Keluar"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
