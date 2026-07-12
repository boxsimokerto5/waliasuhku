import { AppNotification, User } from '../types';
import { Bell, Check, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../utils/crypto';

interface NotificationCenterProps {
  currentUser: User;
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  currentUser,
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: NotificationCenterProps) {
  // Filter notifications only for the logged-in user
  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
            onClick={onClose}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-pink-50/30 text-slate-800">
              <div className="flex items-center gap-2 text-left">
                <Bell className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pusat Notifikasi</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {unreadCount} Pesan Baru
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
            {myNotifications.length > 0 && (
              <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between text-[11px] font-bold">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>
                <button
                  onClick={onClearAll}
                  className="text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                >
                  Bersihkan Riwayat
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {myNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                  <span>Tidak ada notifikasi untuk Anda saat ini.</span>
                </div>
              ) : (
                myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative group ${
                      notif.isRead
                        ? 'bg-slate-50/50 border-slate-100/70 text-slate-600'
                        : 'bg-indigo-50/40 border-indigo-100/50 text-indigo-950 shadow-xs'
                    }`}
                  >
                    {/* Unread circle indicator */}
                    {!notif.isRead && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-500" />
                    )}

                    <h4 className="text-xs font-bold leading-snug">{notif.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal pr-4">{notif.message}</p>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60 text-[9px] text-slate-400 font-medium">
                      <span>{formatDate(notif.createdAt)}</span>
                      
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="text-indigo-600 hover:text-indigo-800 transition-all font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-4 border-t border-slate-50 text-center text-[10px] text-slate-400 font-semibold tracking-wide uppercase bg-slate-50/30">
              WaliAsuhku Secure Notification Stream
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
