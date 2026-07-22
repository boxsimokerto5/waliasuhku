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

/**
 * Migration helper to copy current memory / Firestore dataset directly into Supabase tables
 */
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

  // 1. Migrate Users
  if (data.users.length > 0) {
    try {
      const { error } = await client.from('users').upsert(data.users);
      if (error) {
        summary.errors.push(`Users: ${error.message}`);
      } else {
        summary.users = data.users.length;
      }
    } catch (err: any) {
      summary.errors.push(`Users Exception: ${err?.message || String(err)}`);
    }
  }

  // 2. Migrate Reports
  if (data.reports.length > 0) {
    try {
      const { error } = await client.from('reports').upsert(data.reports);
      if (error) {
        summary.errors.push(`Reports: ${error.message}`);
      } else {
        summary.reports = data.reports.length;
      }
    } catch (err: any) {
      summary.errors.push(`Reports Exception: ${err?.message || String(err)}`);
    }
  }

  // 3. Migrate Notifications
  if (data.notifications.length > 0) {
    try {
      const { error } = await client.from('notifications').upsert(data.notifications);
      if (error) {
        summary.errors.push(`Notifications: ${error.message}`);
      } else {
        summary.notifications = data.notifications.length;
      }
    } catch (err: any) {
      summary.errors.push(`Notifications Exception: ${err?.message || String(err)}`);
    }
  }

  // 4. Migrate Broadcasts
  if (data.broadcasts.length > 0) {
    try {
      const { error } = await client.from('broadcasts').upsert(data.broadcasts);
      if (error) {
        summary.errors.push(`Broadcasts: ${error.message}`);
      } else {
        summary.broadcasts = data.broadcasts.length;
      }
    } catch (err: any) {
      summary.errors.push(`Broadcasts Exception: ${err?.message || String(err)}`);
    }
  }

  // 5. Migrate Savings Transactions
  if (data.savingsTransactions.length > 0) {
    try {
      const { error } = await client.from('savings_transactions').upsert(data.savingsTransactions);
      if (error) {
        summary.errors.push(`Savings: ${error.message}`);
      } else {
        summary.savingsTransactions = data.savingsTransactions.length;
      }
    } catch (err: any) {
      summary.errors.push(`Savings Exception: ${err?.message || String(err)}`);
    }
  }

  // 6. Migrate Chat Messages
  if (data.chatMessages.length > 0) {
    try {
      const { error } = await client.from('chat_messages').upsert(data.chatMessages);
      if (error) {
        summary.errors.push(`Chat: ${error.message}`);
      } else {
        summary.chatMessages = data.chatMessages.length;
      }
    } catch (err: any) {
      summary.errors.push(`Chat Exception: ${err?.message || String(err)}`);
    }
  }

  return summary;
}
