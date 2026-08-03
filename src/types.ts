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
  
  // Biodata & Portofolio Fields
  fotoUrl?: string; // Foto profil / siswa
  fotoKkUrl?: string; // Foto / Scan Kartu Keluarga
  fotoBpjsUrl?: string; // Foto / Scan Kartu BPJS Kesehatan
  alamat?: string; // Alamat asal
  nik?: string; // Nomor Induk Kependudukan
  kk?: string; // Nomor Kartu Keluarga
  parentPhone?: string; // Nomor HP Orang Tua
  email?: string; // Alamat Email
  initialAssessment?: InitialAssessment;
  portfolio?: {
    id: string;
    title: string;
    description: string;
    date: string;
    category?: 'Akademik' | 'Prestasi' | 'Sikap' | 'Karya' | 'Olahraga' | 'Lainnya';
  }[];
  
  // Laporan Bulanan Fields
  healthStatus?: string;
  healthNotes?: string;
  monthlyActivities?: string;
  characterNotes?: string;
  monthlyReports?: MonthlyReportRecord[];

  // Galeri Foto Kegiatan Siswa
  activityPhotos?: {
    id: string;
    url: string; // Base64 image
    caption: string;
    date: string;
  }[];
}

export interface MonthlyReportRecord {
  id: string; // Unique ID, e.g. "2026-04" or uuid
  month: string; // "01".."12" or "April"
  year: number; // 2026
  monthYearLabel: string; // "April 2026"
  healthStatus?: string;
  healthNotes?: string;
  monthlyActivities?: string;
  characterNotes?: string;
  updatedAt?: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string; // stored as ciphertext or text
  isEncrypted: boolean;
  createdAt: string;
}

export interface ChecklistStudentStatus {
  studentId: string;
  studentName: string;
  status: 'sudah' | 'belum';
}

export interface ActivityChecklist {
  id: string;
  title: string;
  date: string;
  waliAsuhId: string;
  students: ChecklistStudentStatus[];
  createdAt: string;
}

export interface EventChecklistOption {
  id: string;
  label: string;
  icon?: string;
  color?: string; // 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo' | 'slate'
  isNegative?: boolean;
}

export interface EventChecklistStudentStatus {
  studentId: string;
  studentName: string;
  selectedOptionId?: string; // Legacy single option ID
  selectedOptionIds?: string[]; // Array of selected option IDs for multi-selection
  status?: 'sudah' | 'belum'; // Fallback / legacy status
}

export interface EventChecklist {
  id: string;
  title: string;
  date: string;
  waliAsuhId: string;
  options?: EventChecklistOption[];
  sudahLabel?: string;
  belumLabel?: string;
  sudahIcon?: string;
  belumIcon?: string;
  students: EventChecklistStudentStatus[];
  createdAt: string;
}

export interface InitialAssessment {
  // KATEGORI A: IDENTITAS & PROFIL KELUARGA
  namaLengkap: string;
  namaPanggilan: string;
  anakKe: string;
  dariBersaudara: string;
  saudaraDetail: string;
  statusOrangTua: string;
  pengasuhanSebelumnya: string;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
  bantuanPemerintah: string[];

  // KATEGORI B: RIWAYAT KESEHATAN & KEBUTUHAN FISIK
  alergiMakanan: string;
  alergiObat: string;
  alergiLainnya: string;
  riwayatPenyakit: string[];
  riwayatPenyakitLainnya: string;
  pengobatanRutin: string;
  polaTidur: string[];
  polaTidurKhusus: string;
  makananDisukai: string;
  makananTidakDisukai: string;
  kebiasaanMakan: string;

  // KATEGORI C: KEMANDIRIAN & KEBIASAAN SEHARI-HARI
  kemandirianMandi: string;
  kemandirianTempatTidur: string;
  kemandirianCuciBaju: string;
  kemampuanMengaji: string;
  kemampuanMengajiDetail: string;
  hafalanMilik: string;
  kedisiplinanShalat: string;

  // KATEGORI D: KARAKTER, EMOSI & SOSIALISASI
  sifatUtama: string[];
  pemicuEmosi: string;
  reaksiMarah: string;
  caraMenangani: string;
  riwayatTrauma: string;

  // KATEGORI E: AKADEMIK, MINAT & HOBI
  mapelDisukai: string;
  mapelDitakuti: string;
  hobiKegemaran: string;
  bakatMenonjol: string;

  // KATEGORI F: HARAPAN ORANG TUA & KONTAK DARURAT
  harapan1: string;
  harapan2: string;
  harapan3: string;
  namaKontakAlternatif: string;
  hubunganKontakAlternatif: string;
  noHpKontakAlternatif: string;
  
  updatedAt?: string;
  filledBy?: string;
}

export type CounselingCategory = 
  | 'Akademik' 
  | 'Perilaku & Kedisiplinan' 
  | 'Emosional & Diri' 
  | 'Hubungan Sosial & Teman' 
  | 'Penyesuaian Asrama' 
  | 'Motivasi & Cita-cita' 
  | 'Keluarga & Pribadi' 
  | 'Lainnya';

export type CounselingConfidentiality = 'Publik' | 'Terbatas' | 'Sangat Rahasia';

export type CounselingStatus = 'Selesai' | 'Dalam Proses' | 'Perlu Pemantauan' | 'Dirujuk (Referral)';

export interface CounselingRecord {
  id: string;
  studentId: string;
  studentName: string;
  waliAsuhId: string;
  waliAsuhName: string;
  sessionDate: string; // YYYY-MM-DD or datetime
  category: CounselingCategory;
  confidentiality: CounselingConfidentiality;
  summary: string; // Permasalahan / Latar belakang
  actionPlan: string; // Solusi / Rencana Tindak Lanjut
  status: CounselingStatus;
  followUpDate?: string;
  notes?: string;
  parentNotified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CounselingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'anak_asuh' | 'orang_tua';
  studentId: string;
  studentName: string;
  preferredDate?: string;
  topic: string;
  urgency: 'Biasa' | 'Penting' | 'Mendesak / Darurat';
  status: 'Menunggu' | 'Disetujui' | 'Selesai' | 'Ditolak';
  notes?: string;
  waliAsuhId: string;
  createdAt: string;
}



