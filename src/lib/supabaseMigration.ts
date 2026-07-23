import { getSupabase } from './supabase';
import { User, Report, AppNotification, Broadcast, SavingsTransaction, ChatMessage } from '../types';

export interface MigrationSummary {
  users: number;
  reports: number;
  notifications: number;
  broadcasts: number;
  savingsTransactions: number;
  chatMessages: number;
  errors: string[];
}

function toSnakeCaseKey(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCaseKey(key)] = value;
  }
  return result;
}

function cleanUserCamel(u: any) {
  return {
    id: String(u.id || `user_${Math.random().toString(36).substring(2, 9)}`),
    username: String(u.username || 'user'),
    name: String(u.name || 'User'),
    role: String(u.role || 'anak_asuh'),
    password: u.password ? String(u.password) : null,
    waliAsuhId: u.waliAsuhId ? String(u.waliAsuhId) : null,
    anakAsuhId: u.anakAsuhId ? String(u.anakAsuhId) : null,
    category: u.category ? String(u.category) : null,
    isSuspended: Boolean(u.isSuspended),
    savingsBalance: Number(u.savingsBalance || 0),
    fotoUrl: u.fotoUrl ? String(u.fotoUrl) : null,
    fotoKkUrl: u.fotoKkUrl ? String(u.fotoKkUrl) : null,
    fotoBpjsUrl: u.fotoBpjsUrl ? String(u.fotoBpjsUrl) : null,
    alamat: u.alamat ? String(u.alamat) : null,
    nik: u.nik ? String(u.nik) : null,
    kk: u.kk ? String(u.kk) : null,
    parentPhone: u.parentPhone ? String(u.parentPhone) : null,
    email: u.email ? String(u.email) : null,
    healthStatus: u.healthStatus ? String(u.healthStatus) : null,
    healthNotes: u.healthNotes ? String(u.healthNotes) : null,
    monthlyActivities: u.monthlyActivities ? String(u.monthlyActivities) : null,
    characterNotes: u.characterNotes ? String(u.characterNotes) : null,
    createdAt: u.createdAt ? String(u.createdAt) : new Date().toISOString()
  };
}

function cleanReportCamel(r: any) {
  return {
    id: String(r.id || `rep_${Math.random().toString(36).substring(2, 9)}`),
    senderId: String(r.senderId || ''),
    senderName: String(r.senderName || ''),
    receiverId: String(r.receiverId || ''),
    receiverName: String(r.receiverName || ''),
    title: String(r.title || 'Laporan'),
    content: String(r.content || ''),
    type: String(r.type || 'pelaporan'),
    status: String(r.status || 'pending'),
    attachmentUrl: r.attachmentUrl ? String(r.attachmentUrl) : null,
    isEncrypted: Boolean(r.isEncrypted),
    parentApprovalStatus: r.parentApprovalStatus ? String(r.parentApprovalStatus) : null,
    createdAt: r.createdAt ? String(r.createdAt) : new Date().toISOString()
  };
}

function cleanNotificationCamel(n: any) {
  return {
    id: String(n.id || `notif_${Math.random().toString(36).substring(2, 9)}`),
    userId: String(n.userId || ''),
    title: String(n.title || 'Notifikasi'),
    message: String(n.message || ''),
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt ? String(n.createdAt) : new Date().toISOString()
  };
}

function cleanBroadcastCamel(b: any) {
  return {
    id: String(b.id || `bc_${Math.random().toString(36).substring(2, 9)}`),
    senderId: String(b.senderId || ''),
    senderName: String(b.senderName || ''),
    message: String(b.message || ''),
    linkUrl: b.linkUrl ? String(b.linkUrl) : null,
    linkText: b.linkText ? String(b.linkText) : null,
    createdAt: b.createdAt ? String(b.createdAt) : new Date().toISOString()
  };
}

function cleanSavingsCamel(s: any) {
  return {
    id: String(s.id || `sav_${Math.random().toString(36).substring(2, 9)}`),
    studentId: String(s.studentId || ''),
    studentName: String(s.studentName || ''),
    waliAsuhId: String(s.waliAsuhId || ''),
    amount: Number(s.amount || 0),
    type: String(s.type || 'setor'),
    description: s.description ? String(s.description) : null,
    createdAt: s.createdAt ? String(s.createdAt) : new Date().toISOString()
  };
}

function cleanChatCamel(c: any) {
  return {
    id: String(c.id || `chat_${Math.random().toString(36).substring(2, 9)}`),
    senderId: String(c.senderId || ''),
    senderName: String(c.senderName || ''),
    senderRole: String(c.senderRole || 'wali_asuh'),
    receiverId: String(c.receiverId || ''),
    receiverName: String(c.receiverName || ''),
    content: String(c.content || ''),
    isEncrypted: Boolean(c.isEncrypted),
    createdAt: c.createdAt ? String(c.createdAt) : new Date().toISOString()
  };
}

/**
 * Smart upsert that automatically handles camelCase vs snake_case schema differences
 * and automatically strips missing columns if the Supabase table doesn't have them yet.
 */
async function smartUpsert(tableName: string, recordsCamel: any[], client: any): Promise<{ success: boolean; count: number; error?: string }> {
  if (!recordsCamel || recordsCamel.length === 0) return { success: true, count: 0 };

  let currentPayload = recordsCamel.map(objectToSnakeCase);

  for (let attempt = 0; attempt < 12; attempt++) {
    const { error } = await client.from(tableName).upsert(currentPayload);
    if (!error) {
      return { success: true, count: currentPayload.length };
    }

    const errMsg = error.message || '';
    console.warn(`[Supabase Migration] Attempt ${attempt + 1} for ${tableName}:`, errMsg);

    const match = errMsg.match(/column '([^']+)'|column "([^"]+)"|'([^']+)' column/i);
    const missingCol = match ? (match[1] || match[2] || match[3]) : null;

    if (missingCol) {
      currentPayload = currentPayload.map(item => {
        const copy = { ...item };
        delete copy[missingCol];
        delete copy[toSnakeCaseKey(missingCol)];
        return copy;
      });
      continue;
    }

    if (attempt === 0) {
      currentPayload = recordsCamel;
      continue;
    }

    return { success: false, count: 0, error: errMsg };
  }

  return { success: false, count: 0, error: 'Gagal menyimpan ke Supabase setelah beberapa percobaan.' };
}

export async function migrateDataToSupabase(data: {
  users: User[];
  reports: Report[];
  notifications: AppNotification[];
  broadcasts: Broadcast[];
  savingsTransactions: SavingsTransaction[];
  chatMessages: ChatMessage[];
}): Promise<MigrationSummary> {
  const client = getSupabase();
  const summary: MigrationSummary = {
    users: 0,
    reports: 0,
    notifications: 0,
    broadcasts: 0,
    savingsTransactions: 0,
    chatMessages: 0,
    errors: []
  };

  if (!client) {
    summary.errors.push("Koneksi Supabase belum siap atau belum terkonfigurasi.");
    return summary;
  }

  // 1. Users
  if (data.users && data.users.length > 0) {
    const cleaned = data.users.map(cleanUserCamel);
    const res = await smartUpsert('users', cleaned, client);
    if (res.success) {
      summary.users = res.count;
    } else {
      summary.errors.push(`Users: ${res.error}`);
    }
  }

  // 2. Reports
  if (data.reports && data.reports.length > 0) {
    const cleaned = data.reports.map(cleanReportCamel);
    const res = await smartUpsert('reports', cleaned, client);
    if (res.success) {
      summary.reports = res.count;
    } else {
      summary.errors.push(`Reports: ${res.error}`);
    }
  }

  // 3. Notifications
  if (data.notifications && data.notifications.length > 0) {
    const cleaned = data.notifications.map(cleanNotificationCamel);
    const res = await smartUpsert('notifications', cleaned, client);
    if (res.success) {
      summary.notifications = res.count;
    } else {
      summary.errors.push(`Notifications: ${res.error}`);
    }
  }

  // 4. Broadcasts
  if (data.broadcasts && data.broadcasts.length > 0) {
    const cleaned = data.broadcasts.map(cleanBroadcastCamel);
    const res = await smartUpsert('broadcasts', cleaned, client);
    if (res.success) {
      summary.broadcasts = res.count;
    } else {
      summary.errors.push(`Broadcasts: ${res.error}`);
    }
  }

  // 5. Savings
  if (data.savingsTransactions && data.savingsTransactions.length > 0) {
    const cleaned = data.savingsTransactions.map(cleanSavingsCamel);
    const res = await smartUpsert('savings_transactions', cleaned, client);
    if (res.success) {
      summary.savingsTransactions = res.count;
    } else {
      summary.errors.push(`Savings: ${res.error}`);
    }
  }

  // 6. Chat
  if (data.chatMessages && data.chatMessages.length > 0) {
    const cleaned = data.chatMessages.map(cleanChatCamel);
    const res = await smartUpsert('chat_messages', cleaned, client);
    if (res.success) {
      summary.chatMessages = res.count;
    } else {
      summary.errors.push(`Chat: ${res.error}`);
    }
  }

  return summary;
}
