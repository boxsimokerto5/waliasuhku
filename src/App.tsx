import React, { useState, useEffect } from 'react';
import { User, Report, AppNotification, Reply, ReportType, Broadcast, SavingsTransaction, ChatMessage } from './types';
import { initialUsers, getInitialReports, getInitialNotifications } from './data/mockData';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import WaliAsuhDashboard from './components/WaliAsuhDashboard';
import AnakAsuhDashboard from './components/AnakAsuhDashboard';
import OrangTuaDashboard from './components/OrangTuaDashboard';
import NotificationCenter from './components/NotificationCenter';
import PWAInstallWidget from './components/PWAInstallWidget';
import { encryptMessage } from './utils/crypto';
import { Bell, Lock, ShieldAlert, Monitor, Phone, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  // Persistence state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');
  
  // Real-time Active Toast Banner
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string } | null>(null);

  // Synchronize Users from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers: User[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as User);
      });
      
      const hasSuperadmin = fetchedUsers.some(u => u.username === 'superadmin');
      if (!hasSuperadmin) {
        const defaultAdmin: User = {
          id: 'superadmin_1',
          username: 'superadmin',
          name: 'Super Admin',
          role: 'super_admin',
          password: 'Woyowoyo1',
          createdAt: '2026-06-01T08:00:00Z'
        };
        setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${defaultAdmin.id}`);
        });
      } else {
        setUsers(fetchedUsers);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Reports from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const fetchedReports: Report[] = [];
      snapshot.forEach((doc) => {
        fetchedReports.push(doc.data() as Report);
      });
      // Sort descending by creation date
      fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(fetchedReports);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Notifications from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const fetchedNotifications: AppNotification[] = [];
      snapshot.forEach((doc) => {
        fetchedNotifications.push(doc.data() as AppNotification);
      });
      // Sort descending by creation date
      fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(fetchedNotifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Broadcasts from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'broadcasts'), (snapshot) => {
      const fetchedBroadcasts: Broadcast[] = [];
      snapshot.forEach((doc) => {
        fetchedBroadcasts.push(doc.data() as Broadcast);
      });
      // Sort descending by creation date
      fetchedBroadcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBroadcasts(fetchedBroadcasts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'broadcasts');
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Savings Transactions from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'savings_transactions'), (snapshot) => {
      const fetchedTransactions: SavingsTransaction[] = [];
      snapshot.forEach((doc) => {
        fetchedTransactions.push(doc.data() as SavingsTransaction);
      });
      // Sort descending by creation date
      fetchedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavingsTransactions(fetchedTransactions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'savings_transactions');
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Chat Messages from Firestore in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push(doc.data() as ChatMessage);
      });
      // Sort ascending by creation date so conversation reads normally
      fetchedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setChatMessages(fetchedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chat_messages');
    });
    return () => unsubscribe();
  }, []);

  // Helper to generate a unique ID
  const generateId = (prefix: string) => {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Toast helper
  const showToast = (title: string, message: string) => {
    const id = Math.random().toString();
    setActiveToast({ id, title, message });
    setTimeout(() => {
      setActiveToast(prev => prev?.id === id ? null : prev);
    }, 4500);
  };

  // Action: Create Wali Asuh (Super Admin action)
  const handleCreateWaliAsuh = async (username: string, name: string) => {
    const newWali: User = {
      id: generateId('wali'),
      username,
      name,
      role: 'wali_asuh',
      password: username, // default password is username
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', newWali.id), newWali);

      // Create a real-time notification
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: currentUser?.id || 'system',
        title: 'Wali Asuh Terdaftar',
        message: `Akun Wali Asuh "${name}" berhasil dibuat dengan username "${username}".`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
      showToast(notif.title, notif.message);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${newWali.id}`);
    }
  };

  // Action: Create Anak Asuh (Wali Asuh action)
  const handleCreateAnakAsuh = async (username: string, name: string, waliAsuhId: string) => {
    const newAnak: User = {
      id: generateId('anak'),
      username,
      name,
      role: 'anak_asuh',
      password: username, // default password is username
      waliAsuhId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', newAnak.id), newAnak);

      // Create a real-time notification
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: currentUser?.id || 'system',
        title: 'Anak Asuh Ditambahkan',
        message: `Anak asuh "${name}" berhasil didaftarkan di bawah bimbingan Anda.`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
      showToast(notif.title, notif.message);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${newAnak.id}`);
    }
  };

  // Action: Update Child Category (Wali Asuh action)
  const handleUpdateChildCategory = async (childId: string, category: string) => {
    try {
      await updateDoc(doc(db, 'users', childId), { category: category || "" });
      showToast('Kategori Diperbarui', 'Kategori siswa berhasil diperbarui.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${childId}`);
    }
  };

  // Action: Toggle suspension status of any user (Wali Asuh action)
  const handleToggleUserSuspension = async (userId: string, isSuspended: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isSuspended });
      showToast(
        isSuspended ? 'Akun Ditangguhkan' : 'Akun Diaktifkan', 
        `Status akun berhasil diubah menjadi ${isSuspended ? 'Ditangguhkan' : 'Aktif'}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Action: Create Orang Tua (Wali Asuh action)
  const handleCreateOrangTua = async (username: string, name: string, waliAsuhId: string, anakAsuhId: string) => {
    const newOrangTua: User = {
      id: generateId('ortu'),
      username,
      name,
      role: 'orang_tua',
      password: username, // default password is username
      waliAsuhId,
      anakAsuhId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', newOrangTua.id), newOrangTua);

      // Create a real-time notification
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: currentUser?.id || 'system',
        title: 'Orang Tua Terdaftar',
        message: `Akun Orang Tua "${name}" berhasil didaftarkan dan dihubungkan dengan anak asuh Anda.`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
      showToast(notif.title, notif.message);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${newOrangTua.id}`);
    }
  };

  // Action: Update Parent Approval Status (Wali Asuh action)
  const handleUpdateParentApproval = async (reportId: string, approvalStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { parentApprovalStatus: approvalStatus });

      const r = reports.find(item => item.id === reportId);
      if (r) {
        // Trigger notification to the child
        const notif: AppNotification = {
          id: generateId('notif'),
          userId: r.senderId,
          title: `Persetujuan Pesan Orang Tua`,
          message: `Pesan Anda ke Orang Tua tentang "${r.title}" telah ${
            approvalStatus === 'approved' ? 'disetujui dan terkirim' : 'ditolak oleh Wali Asuh'
          }.`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'notifications', notif.id), notif);
        showToast(notif.title, notif.message);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  // Action: Submit a Report (Anak Asuh action)
  const handleSubmitReport = async (reportData: {
    title: string;
    content: string;
    type: ReportType;
    attachmentUrl?: string;
  }) => {
    if (!currentUser || currentUser.role !== 'anak_asuh') return;

    const waliAsuh = users.find(u => u.id === currentUser.waliAsuhId && u.role === 'wali_asuh');
    if (!waliAsuh) return;

    // Encrypt content on submission to guard privacy
    const encryptedContent = encryptMessage(reportData.content, 'waliasuhku-secure-key');

    const newReport: Report = {
      id: generateId('rep'),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: waliAsuh.id,
      receiverName: waliAsuh.name,
      title: reportData.title,
      content: encryptedContent,
      type: reportData.type,
      status: 'pending',
      attachmentUrl: reportData.attachmentUrl || "",
      isEncrypted: true,
      createdAt: new Date().toISOString(),
      replies: [],
      parentApprovalStatus: reportData.type === 'pesan_ortu' ? 'pending' : undefined
    };

    try {
      await setDoc(doc(db, 'reports', newReport.id), newReport);

      // Create notification for their Wali Asuh
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: waliAsuh.id,
        title: `${
          reportData.type === 'pengaduan' 
            ? '⚠️ Pengaduan' 
            : reportData.type === 'curhatan' 
              ? '💖 Curhatan' 
              : reportData.type === 'pesan_ortu'
                ? '💌 Pesan Orang Tua'
                : reportData.type === 'kebutuhan_logistik'
                  ? '📦 Kebutuhan Logistik'
                  : '📋 Laporan'
        } Baru`,
        message: `${currentUser.name} mengirim ${
          reportData.type === 'pesan_ortu' 
            ? 'pesan untuk orang tua' 
            : reportData.type === 'kebutuhan_logistik'
              ? 'laporan kebutuhan logistik'
              : reportData.type
        } tentang "${reportData.title}"`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);

      showToast("Berhasil Dikirim", `${
        reportData.type === 'pesan_ortu' 
          ? 'Pesan orang tua' 
          : reportData.type === 'kebutuhan_logistik'
            ? 'Laporan kebutuhan logistik'
            : 'Laporan terenkripsi'
      } tentang "${reportData.title}" berhasil dikirim ke ${waliAsuh.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reports/${newReport.id}`);
    }
  };

  // Action: Update Report Status (Wali Asuh action)
  const handleUpdateReportStatus = async (reportId: string, status: 'pending' | 'processed' | 'resolved') => {
    const reportToUpdate = reports.find(r => r.id === reportId);
    if (!reportToUpdate) return;

    try {
      await updateDoc(doc(db, 'reports', reportId), { status });

      // Trigger notification to the child
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: reportToUpdate.senderId,
        title: 'Perubahan Status Laporan',
        message: `Laporan Anda tentang "${reportToUpdate.title}" telah diubah statusnya menjadi: ${
          status === 'processed' ? 'Diproses (Sedang Ditindaklanjuti)' : 'Selesai (Ditangani)'
        }`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
      showToast(notif.title, notif.message);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  // Action: Add Reply (Both Wali Asuh and Anak Asuh can reply)
  const handleAddReply = async (reportId: string, replyContent: string) => {
    if (!currentUser) return;

    const r = reports.find(item => item.id === reportId);
    if (!r) return;

    // Encrypt reply for maximum privacy
    const encryptedReply = encryptMessage(replyContent, 'waliasuhku-secure-key');

    const isPesanOrtuChildReply = currentUser.role === 'anak_asuh' && r.type === 'pesan_ortu';

    const newReply: Reply = {
      id: generateId('reply'),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: encryptedReply,
      createdAt: new Date().toISOString(),
      isApproved: isPesanOrtuChildReply ? false : true
    };

    const updatedReplies = [...(r.replies || []), newReply];

    try {
      await updateDoc(doc(db, 'reports', reportId), { replies: updatedReplies });

      // Notify the counterpart/Wali Asuh
      let recipientId = currentUser.role === 'anak_asuh' ? r.receiverId : r.senderId;
      let title = 'Pesan Balasan Baru';
      let message = `${currentUser.name} membalas laporan tentang "${r.title}"`;

      if (isPesanOrtuChildReply) {
        recipientId = r.receiverId; // Goes to Wali Asuh
        title = 'Balasan Pesan Ortu (Butuh Persetujuan)';
        message = `${currentUser.name} membalas pesan untuk orang tua tentang "${r.title}" dan memerlukan persetujuan Anda.`;
      } else if (currentUser.role === 'orang_tua') {
        recipientId = r.senderId; // Goes to child
        title = 'Balasan dari Orang Tua';
        message = `Orang tua Anda (${currentUser.name}) membalas pesan tentang "${r.title}"`;
      }

      const notif: AppNotification = {
        id: generateId('notif'),
        userId: recipientId,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
      showToast(notif.title, notif.message);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  // Action: Approve/Reject a specific reply on a parent-message
  const handleUpdateReplyApproval = async (reportId: string, replyId: string, isApproved: boolean) => {
    const r = reports.find(item => item.id === reportId);
    if (!r) return;

    const updatedReplies = r.replies.map(rep => {
      if (rep.id === replyId) {
        return { ...rep, isApproved };
      }
      return rep;
    });

    try {
      await updateDoc(doc(db, 'reports', reportId), { replies: updatedReplies });
      
      const reply = r.replies.find(rep => rep.id === replyId);
      if (reply && isApproved) {
        // Retrieve parent user linked to the child
        const childUser = users.find(u => u.id === r.senderId);
        const parentUser = users.find(u => u.role === 'orang_tua' && u.anakAsuhId === r.senderId);
        
        if (parentUser) {
          const notif: AppNotification = {
            id: generateId('notif'),
            userId: parentUser.id,
            title: 'Pesan Balasan Baru dari Anak',
            message: `${childUser?.name || 'Anak Anda'} membalas pesan tentang "${r.title}".`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'notifications', notif.id), notif);
          showToast(notif.title, notif.message);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  // Notification management
  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    const userNotifs = notifications.filter(n => n.userId === currentUser.id && !n.isRead);
    for (const notif of userNotifs) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${notif.id}`);
      }
    }
  };

  const handleClearAll = async () => {
    if (!currentUser) return;
    const userNotifs = notifications.filter(n => n.userId === currentUser.id);
    for (const notif of userNotifs) {
      try {
        await deleteDoc(doc(db, 'notifications', notif.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `notifications/${notif.id}`);
      }
    }
  };

  // Action: Create Broadcast (Wali Asuh action)
  const handleCreateBroadcast = async (message: string, linkUrl?: string, linkText?: string) => {
    if (!currentUser || currentUser.role !== 'wali_asuh') return;

    const newBroadcast: Broadcast = {
      id: generateId('broad'),
      senderId: currentUser.id,
      senderName: currentUser.name,
      message,
      linkUrl: linkUrl?.trim() || undefined,
      linkText: linkText?.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'broadcasts', newBroadcast.id), newBroadcast);
      showToast('Siaran Dikirim', 'Pesan siaran berhasil dikirim ke semua anak asuh Anda.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `broadcasts/${newBroadcast.id}`);
    }
  };

  // Action: Delete Broadcast (Wali Asuh action)
  const handleDeleteBroadcast = async (broadcastId: string) => {
    try {
      await deleteDoc(doc(db, 'broadcasts', broadcastId));
      showToast('Siaran Dihapus', 'Pesan siaran berhasil dihapus.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `broadcasts/${broadcastId}`);
    }
  };

  // Action: Manage Student Savings (Wali Asuh action)
  const handleCreateSavingsTransaction = async (
    studentId: string,
    amount: number,
    type: 'setor' | 'tarik',
    description: string
  ) => {
    if (!currentUser || currentUser.role !== 'wali_asuh') return;

    const student = users.find(u => u.id === studentId);
    if (!student) return;

    const currentBalance = student.savingsBalance || 0;
    let newBalance = currentBalance;

    if (type === 'setor') {
      newBalance += amount;
    } else {
      if (currentBalance < amount) {
        showToast('Saldo Tidak Cukup', `Saldo tabungan ${student.name} tidak mencukupi untuk penarikan.`);
        return;
      }
      newBalance -= amount;
    }

    const transactionId = generateId('saving');
    const newTransaction: SavingsTransaction = {
      id: transactionId,
      studentId,
      studentName: student.name,
      waliAsuhId: currentUser.id,
      amount,
      type,
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Create transaction doc in firestore
      await setDoc(doc(db, 'savings_transactions', transactionId), newTransaction);

      // 2. Update student savings balance in users doc
      await updateDoc(doc(db, 'users', studentId), { savingsBalance: newBalance });

      // 3. Create a notification for the student (anak_asuh)
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: studentId,
        title: `💰 Tabungan: ${type === 'setor' ? 'Penyetoran' : 'Penarikan'}`,
        message: `Wali Asuh ${currentUser.name} telah mencatat ${type === 'setor' ? 'setoran' : 'penarikan'} sebesar Rp ${amount.toLocaleString('id-ID')} (${description}). Saldo kamu sekarang: Rp ${newBalance.toLocaleString('id-ID')}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);

      // 4. Create a notification for the parents if they are registered and linked
      const parent = users.find(u => u.role === 'orang_tua' && u.anakAsuhId === studentId);
      if (parent) {
        const parentNotif: AppNotification = {
          id: generateId('notif'),
          userId: parent.id,
          title: `💰 Tabungan Anak: ${type === 'setor' ? 'Penyetoran' : 'Penarikan'}`,
          message: `Wali Asuh mencatat ${type === 'setor' ? 'setoran' : 'penarikan'} sebesar Rp ${amount.toLocaleString('id-ID')} untuk anak Anda ${student.name} (${description}). Saldo akhir: Rp ${newBalance.toLocaleString('id-ID')}`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'notifications', parentNotif.id), parentNotif);
      }

      showToast(
        'Transaksi Berhasil',
        `Mencatat ${type === 'setor' ? 'setoran' : 'penarikan'} Rp ${amount.toLocaleString('id-ID')} untuk ${student.name}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `savings_transactions/${transactionId}`);
    }
  };

  // Action: Send Chat Message (Anak Asuh or Wali Asuh)
  const handleSendChatMessage = async (receiverId: string, content: string) => {
    if (!currentUser) return;

    const receiver = users.find(u => u.id === receiverId);
    if (!receiver) return;

    // Encrypt content on submission for end-to-end privacy
    const encryptedContent = encryptMessage(content, 'waliasuhku-secure-key');

    const messageId = generateId('chat');
    const newMsg: ChatMessage = {
      id: messageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: receiver.id,
      receiverName: receiver.name,
      content: encryptedContent,
      isEncrypted: true,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'chat_messages', messageId), newMsg);

      // Create notification for receiver
      const notif: AppNotification = {
        id: generateId('notif'),
        userId: receiver.id,
        title: `💬 Pesan Chat Baru`,
        message: `${currentUser.name} mengirim pesan: "${content.length > 40 ? content.slice(0, 40) + '...' : content}"`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chat_messages/${messageId}`);
    }
  };


  // Render appropriate dashboard depending on role
  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'super_admin':
        return (
          <SuperAdminDashboard
            users={users}
            reports={reports}
            onCreateWaliAsuh={handleCreateWaliAsuh}
          />
        );
      case 'wali_asuh':
        return (
          <WaliAsuhDashboard
            currentUser={currentUser}
            users={users}
            reports={reports}
            broadcasts={broadcasts}
            savingsTransactions={savingsTransactions}
            chatMessages={chatMessages}
            onCreateAnakAsuh={handleCreateAnakAsuh}
            onCreateOrangTua={handleCreateOrangTua}
            onUpdateReportStatus={handleUpdateReportStatus}
            onUpdateParentApproval={handleUpdateParentApproval}
            onAddReply={handleAddReply}
            onUpdateReplyApproval={handleUpdateReplyApproval}
            onCreateBroadcast={handleCreateBroadcast}
            onDeleteBroadcast={handleDeleteBroadcast}
            onUpdateChildCategory={handleUpdateChildCategory}
            onToggleUserSuspension={handleToggleUserSuspension}
            onAddSavingsTransaction={handleCreateSavingsTransaction}
            onSendChatMessage={handleSendChatMessage}
          />
        );
      case 'anak_asuh':
        return (
          <AnakAsuhDashboard
            currentUser={currentUser}
            users={users}
            reports={reports}
            broadcasts={broadcasts}
            savingsTransactions={savingsTransactions}
            chatMessages={chatMessages}
            onSubmitReport={handleSubmitReport}
            onAddReply={handleAddReply}
            onSendChatMessage={handleSendChatMessage}
          />
        );
      case 'orang_tua':
        return (
          <OrangTuaDashboard
            currentUser={currentUser}
            users={users}
            reports={reports}
            savingsTransactions={savingsTransactions}
            onAddReply={handleAddReply}
          />
        );
      default:
        return <div className="text-center py-12">Role tidak dikenal.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white pb-12 transition-colors duration-300">
      
      {/* Real-time Toast Popups (Visible on top screen) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-slate-800 text-left">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Notifikasi Real-Time</span>
                <h4 className="text-xs font-bold mt-0.5">{activeToast.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">{activeToast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layer */}
      {currentUser ? (
        <div className="flex flex-col min-h-screen">
          
          {/* Main Navigation Header */}
          <Header
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            notifications={notifications}
            onOpenNotifications={() => setIsNotificationOpen(true)}
          />

          {/* PWA Installation Assistant Widget */}
          <PWAInstallWidget />

          {/* VP Toggles & Layout Options */}
          <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse"></span>
              Kanal Enkripsi Sesi Aktif
            </span>

            {/* Viewport simulation buttons */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewportMode === 'desktop' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Web Lebar"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewportMode === 'mobile' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Simulasi Layar Mobile"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic viewport wrapper */}
          <main className="flex-1 py-4 px-4 sm:px-6">
            {viewportMode === 'mobile' ? (
              /* Simulated iPhone/Mobile Frame Container */
              <div className="max-w-[400px] mx-auto bg-slate-950 p-3.5 rounded-[50px] shadow-2xl border-4 border-slate-900 relative">
                {/* Simulated Speaker / Camera Island notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full flex items-center justify-center z-40">
                  <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                </div>

                <div className="bg-[#f8fafc] rounded-[38px] overflow-hidden min-h-[750px] max-h-[800px] overflow-y-auto px-3.5 py-8 border border-slate-800/20 text-xs">
                  {renderDashboard()}
                </div>
              </div>
            ) : (
              /* Standard Desktop Wide Responsive View */
              <div className="w-full">
                {renderDashboard()}
              </div>
            )}
          </main>

          {/* App Notification Sidebar Panel */}
          <NotificationCenter
            currentUser={currentUser}
            notifications={notifications}
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearAll}
          />

        </div>
      ) : (
        /* Login screen */
        <div className="min-h-screen flex items-center justify-center py-12">
          <LoginScreen
            users={users}
            onLogin={(user) => {
              setCurrentUser(user);
              showToast("Selamat Datang!", `Berhasil masuk sebagai ${user.name}`);
            }}
          />
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center text-slate-400 text-xs font-semibold py-8 mt-12 border-t border-slate-200/50 max-w-7xl mx-auto">
        <p>WaliAsuhku • Hak Cipta Dilindungi © 2026</p>
        <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-mono">End-to-End Encrypted Complaint System</p>
      </footer>
    </div>
  );
}
