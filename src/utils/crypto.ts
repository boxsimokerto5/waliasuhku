/**
 * Crypto and Helper Utilities for WaliAsuhku
 */

/**
 * Simple key-based encryption/obfuscation to simulate message privacy.
 * In a real-world app, this would use SubtleCrypto or a library like CryptoJS.
 * We store as `WA-CRYPT-[Base64]` to visually prove encryption in the UI database view.
 */
export function encryptMessage(text: string, secretKey: string = "waliasuhku-secure-key"): string {
  if (!text) return "";
  try {
    // A simple XOR cipher followed by base64 encoding to simulate encryption
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    const b64 = btoa(unescape(encodeURIComponent(result)));
    return `WA-CRYPT-[${b64}]`;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Fallback to raw text if fails
  }
}

export function decryptMessage(encryptedText: string, secretKey: string = "waliasuhku-secure-key"): string {
  if (!encryptedText) return "";
  if (!encryptedText.startsWith("WA-CRYPT-[")) {
    return encryptedText; // Already decrypted or not encrypted
  }
  try {
    const match = encryptedText.match(/WA-CRYPT-\[(.*)\]/);
    if (!match || !match[1]) return encryptedText;
    const b64 = match[1];
    const rawResult = decodeURIComponent(escape(atob(b64)));
    let decrypted = "";
    for (let i = 0; i < rawResult.length; i++) {
      const charCode = rawResult.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Error Decrypting Message - Invalid Key]";
  }
}

/**
 * Formats a ISO date string into beautiful Indonesian locale date-time.
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Get color scheme based on status of report
 */
export function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Menunggu',
        dot: 'bg-amber-500'
      };
    case 'processed':
      return {
        bg: 'bg-sky-100 text-sky-800 border-sky-200',
        label: 'Diproses',
        dot: 'bg-sky-500'
      };
    case 'resolved':
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        label: 'Selesai',
        dot: 'bg-emerald-500'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        label: status,
        dot: 'bg-slate-500'
      };
  }
}

/**
 * Get color scheme and label based on report type
 */
export function getTypeBadge(type: string) {
  switch (type) {
    case 'pengaduan':
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        label: 'Pengaduan',
        icon: 'ShieldAlert'
      };
    case 'pelaporan':
      return {
        bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Laporan Rutin',
        icon: 'ClipboardList'
      };
    case 'curhatan':
      return {
        bg: 'bg-violet-100 text-violet-800 border-violet-200',
        label: 'Curahan Hati',
        icon: 'HeartHandshake'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        label: type,
        icon: 'FileText'
      };
  }
}
