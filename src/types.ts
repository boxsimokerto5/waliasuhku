/**
 * Types for WaliAsuhku App
 */

export type UserRole = 'super_admin' | 'wali_asuh' | 'anak_asuh' | 'orang_tua';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string; // Standard simulation
  waliAsuhId?: string; // Links anak_asuh to their wali_asuh, or orang_tua to their wali_asuh
  anakAsuhId?: string; // Links orang_tua to their anak_asuh
  createdAt: string;
  category?: string; // For grouping students/anak_asuh into categories (e.g. Kelas 10, Asrama A)
  isSuspended?: boolean; // Track suspended status for account control
  savingsBalance?: number; // Current savings balance (primarily for anak_asuh)
}

export interface SavingsTransaction {
  id: string;
  studentId: string;
  studentName: string;
  waliAsuhId: string;
  amount: number; // nominal transaksi
  type: 'setor' | 'tarik'; // deposit (setor) or withdrawal (tarik)
  description: string;
  createdAt: string;
}

export type ReportType = 'pengaduan' | 'pelaporan' | 'curhatan' | 'pesan_ortu' | 'kebutuhan_logistik';

export type ReportStatus = 'pending' | 'processed' | 'resolved';

export interface Reply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string; // cipher text
  createdAt: string;
  isApproved?: boolean;
}

export interface Report {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // wali_asuh's ID
  receiverName: string;
  title: string;
  content: string; // stored as ciphertext
  type: ReportType;
  status: ReportStatus;
  attachmentUrl?: string; // Base64 data URL for uploaded proof
  isEncrypted: boolean;
  createdAt: string;
  replies: Reply[];
  parentApprovalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Broadcast {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  linkUrl?: string;
  linkText?: string;
  createdAt: string;
}

