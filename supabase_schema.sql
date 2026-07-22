-- ========================================================
-- SKEMA TABEL SUPABASE UNTUK APLIKASI WALI ASUKU
-- Jalankan SQL ini di SQL Editor pada Dashboard Supabase Anda
-- ========================================================

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT,
  "waliAsuhId" TEXT,
  "anakAsuhId" TEXT,
  category TEXT,
  "isSuspended" BOOLEAN DEFAULT FALSE,
  "savingsBalance" NUMERIC DEFAULT 0,
  "fotoUrl" TEXT,
  "fotoKkUrl" TEXT,
  "fotoBpjsUrl" TEXT,
  alamat TEXT,
  nik TEXT,
  kk TEXT,
  "parentPhone" TEXT,
  email TEXT,
  "healthStatus" TEXT,
  "healthNotes" TEXT,
  "monthlyActivities" TEXT,
  "characterNotes" TEXT,
  "initialAssessment" JSONB,
  portfolio JSONB DEFAULT '[]'::jsonb,
  "activityPhotos" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "receiverName" TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "attachmentUrl" TEXT,
  "isEncrypted" BOOLEAN DEFAULT FALSE,
  "parentApprovalStatus" TEXT,
  replies JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL BROADCASTS
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  message TEXT NOT NULL,
  "linkUrl" TEXT,
  "linkText" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SAVINGS TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "waliAsuhId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "receiverName" TEXT NOT NULL,
  content TEXT NOT NULL,
  "isEncrypted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL ACTIVITY CHECKLISTS
CREATE TABLE IF NOT EXISTS public.activity_checklists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  "waliAsuhId" TEXT NOT NULL,
  students JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE ROW LEVEL SECURITY (RLS) UNTUK MEMUDAHKAN AKSES CLIENT KLIEN/ANON
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_checklists DISABLE ROW LEVEL SECURITY;
