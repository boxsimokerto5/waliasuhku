import { User, Report, AppNotification } from '../types';
import { encryptMessage } from '../utils/crypto';

// Default mock users
export const initialUsers: User[] = [
  {
    id: 'superadmin_1',
    username: 'superadmin',
    name: 'Super Admin',
    role: 'super_admin',
    password: 'Woyowoyo1',
    createdAt: '2026-06-01T08:00:00Z'
  }
];

// Default mock reports, initialized as empty for clean production use
export const getInitialReports = (): Report[] => [];

export const getInitialNotifications = (): AppNotification[] => [];
