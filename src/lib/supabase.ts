import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

function sanitizeUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.replace(/\/rest\/v1\/$/, '');
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.replace(/\/rest\/v1$/, '');
  }
  return cleaned;
}

const DEFAULT_SUPABASE_URL = 'https://ppnbfzdhhzaoegnwjawr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_XzkuOIhiLEeFj-g6u3iFkQ_8UDo5q4A';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');

  const rawUrl = envUrl || localUrl || DEFAULT_SUPABASE_URL;
  const key = envKey || localKey || DEFAULT_SUPABASE_ANON_KEY;
  const url = sanitizeUrl(rawUrl);

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http') && !url.includes('YOUR_'));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    const { url, key } = getSupabaseCredentials();
    cachedClient = createClient(url, key);
  }
  return cachedClient;
}

export function saveSupabaseCredentials(url: string, key: string) {
  const cleanUrl = sanitizeUrl(url);
  localStorage.setItem('supabase_url', cleanUrl);
  localStorage.setItem('supabase_anon_key', key.trim());
  cachedClient = createClient(cleanUrl, key.trim());
}

/**
 * Check connection to Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi.' };
  }

  try {
    const { data, error } = await client.from('users').select('id').limit(1);
    if (error) {
      return { success: false, message: `Gagal terhubung ke tabel 'users': ${error.message}` };
    }
    return { success: true, message: `Koneksi Supabase BERHASIL! (Ditemukan ${data.length} data)` };
  } catch (err: any) {
    return { success: false, message: `Error koneksi: ${err?.message || String(err)}` };
  }
}

function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function normalizeRecordKeys(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeRecordKeys);

  const normalized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const camelKey = toCamelCaseKey(key);
    normalized[camelKey] = val;
  }
  return normalized;
}

/**
 * Universal query helper for Supabase tables
 */
export async function fetchSupabaseTable<T>(tableName: string): Promise<T[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.from(tableName).select('*');
    if (error) {
      console.warn(`[Supabase Fetch Error] ${tableName}:`, error.message);
      return null;
    }
    return (data || []).map(normalizeRecordKeys) as T[];
  } catch (err) {
    console.warn(`[Supabase Exception] ${tableName}:`, err);
    return null;
  }
}

function toSnakeCaseKey(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[toSnakeCaseKey(key)] = value;
    }
  }
  return result;
}

/**
 * Universal upsert helper for Supabase
 */
export async function upsertSupabaseRecord<T extends { id: string }>(tableName: string, record: T): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const snakePayload = objectToSnakeCase(record);
    const { error } = await client.from(tableName).upsert(snakePayload);
    if (error) {
      // Fallback attempt with raw record
      const { error: camelError } = await client.from(tableName).upsert(record);
      if (camelError) {
        console.error(`[Supabase Upsert Error] ${tableName}:`, error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(`[Supabase Upsert Exception] ${tableName}:`, err);
    return false;
  }
}

/**
 * Universal delete helper for Supabase
 */
export async function deleteSupabaseRecord(tableName: string, id: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) {
      console.error(`[Supabase Delete Error] ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase Delete Exception] ${tableName}:`, err);
    return false;
  }
}
