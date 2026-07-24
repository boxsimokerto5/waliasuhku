/**
 * Quotes Utility for WaliAsuhku
 * Switches quotes automatically at 06:00 (Pagi) and 16:00 (Sore)
 */

export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
}

export const ANAK_ASUH_QUOTES: Quote[] = [
  {
    id: "a1",
    text: "Pendidikan adalah senjata paling ampuh untuk mengubah dunia. Tetap semangat menuntut ilmu!",
    author: "B.J. Habibie",
  },
  {
    id: "a2",
    text: "Barangsiapa belum merasakan pahitnya belajar walau sekejap, ia akan menelan hinanya kebodohan sepanjang hidupnya.",
    author: "Imam Syafi'i",
  },
  {
    id: "a3",
    text: "Adab dan akhlak yang baik adalah cermin dari keindahan hati seorang penuntut ilmu.",
    author: "Mutiara Hikmah",
  },
  {
    id: "a4",
    text: "Mimpi besar tidak akan tercapai tanpa langkah-langkah kecil yang dilakukan dengan konsisten setiap hari.",
    author: "Nasihat Bijak",
  },
  {
    id: "a5",
    text: "Hormati pengasuhmu, sayangi teman-temanmu, dan doakan orang tuamu. Di situlah keberkahan hidupmu.",
    author: "Pesan Pengasuh",
  },
  {
    id: "a6",
    text: "Jangan takut gagal dalam mencoba hal baru, karena kegagalan terbesar adalah berhenti belajar.",
    author: "Motivasi Belajar",
  },
  {
    id: "a7",
    text: "Lisan yang selalu menjaga kebaikan dan tangan yang suka menolong akan selalu dicintai banyak orang.",
    author: "Nasihat Karakter",
  },
  {
    id: "a8",
    text: "Waktu yang kamu pergunakan untuk belajar hari ini adalah modal kesuksesanmu di masa depan.",
    author: "Pesan Prestasi",
  },
];

export const WALI_ASUH_QUOTES: Quote[] = [
  {
    id: "w1",
    text: "Mendidik anak asuh bukan hanya tentang mengajar, tetapi menanam benih kebaikan dan cinta di dalam jiwa mereka.",
    author: "Pesan Pengasuhan",
  },
  {
    id: "w2",
    text: "Kesabaran dan ketulusan wali asuh adalah kunci utama yang membuka potensi terbaik dalam diri anak.",
    author: "Mutiara Hikmah",
  },
  {
    id: "w3",
    text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain, terutama bagi anak-anak yang mendambakan bimbingan.",
    author: "Hadits Riwayat Thabrani",
  },
  {
    id: "w4",
    text: "Setiap teladan baik yang Anda tunjukkan hari ini akan menjadi pelita hidup bagi anak asuh di masa depan.",
    author: "Inspirasi Edukasi",
  },
  {
    id: "w5",
    text: "Jadikan tempat pengasuhan sebagai rumah hangat tempat anak-anak merasa aman, dihargai, dan dicintai.",
    author: "Prinsip Pengasuhan",
  },
  {
    id: "w6",
    text: "Ketelitian dalam mencatat dan memantau perkembangan anak adalah wujud kepedulian yang tak ternilai harganya.",
    author: "Integritas Pembimbing",
  },
  {
    id: "w7",
    text: "Saat Anda lelah membimbing, ingatlah bahwa setiap kebaikan kecil yang disemai akan berbuah amal jariyah.",
    author: "Penguat Jiwa",
  },
];

export const ORANG_TUA_QUOTES: Quote[] = [
  {
    id: "o1",
    text: "Doa tulus orang tua adalah benteng terkuat dan jalan keberkahan paling utama bagi anak-anak.",
    author: "Nasihat Keluarga",
  },
  {
    id: "o2",
    text: "Jarak mungkin memisahkan raga, namun doa dan kasih sayang orang tua selalu memeluk anak di setiap waktu.",
    author: "Mutiara Kasih",
  },
  {
    id: "o3",
    text: "Anak adalah amanah sekaligus tabungan akhirat. Mendukung pendidikan dan akhlaknya adalah investasi terbaik.",
    author: "Pesan Keuarga",
  },
  {
    id: "o4",
    text: "Mempercayakan bimbingan anak kepada wali asuh yang amanah adalah ikhtiar mulia demi masa depan sang buah hati.",
    author: "Amanah Pengasuhan",
  },
  {
    id: "o5",
    text: "Kebanggaan tertinggi orang tua adalah melihat anaknya tumbuh menjadi pribadi yang berakhlak mulia dan taat.",
    author: "Harapan Orang Tua",
  },
  {
    id: "o6",
    text: "Setiap senyuman dan kata semangat yang Anda berikan saat berkomunikasi akan menjadi energi luar biasa bagi anak.",
    author: "Kasih Sayang",
  },
];

export interface TimeSessionInfo {
  session: "pagi" | "sore";
  label: string;
  timeRange: string;
  slotIndex: number;
}

/**
 * Calculates current time slot based on 06:00 and 16:00 rules
 */
export function getCurrentTimeSession(now: Date = new Date()): TimeSessionInfo {
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 16) {
    // Morning slot (06:00 - 15:59)
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return {
      session: "pagi",
      label: "Quote Pagi - Siang",
      timeRange: "06:00 - 16:00",
      slotIndex: dayOfYear * 2,
    };
  } else {
    // Evening slot (16:00 - 05:59)
    let refDate = now;
    if (hour < 6) {
      // Before 6 AM, belongs to yesterday's evening slot
      refDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    const dayOfYear = Math.floor((refDate.getTime() - new Date(refDate.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return {
      session: "sore",
      label: "Quote Sore - Malam",
      timeRange: "16:00 - 06:00",
      slotIndex: dayOfYear * 2 + 1,
    };
  }
}

/**
 * Returns active quote for a given role based on time of day
 */
export function getQuoteForRole(role: "anak_asuh" | "wali_asuh" | "orang_tua" | string): { quote: Quote; sessionInfo: TimeSessionInfo } {
  const sessionInfo = getCurrentTimeSession();
  
  let quotesList = ANAK_ASUH_QUOTES;
  if (role === "wali_asuh") quotesList = WALI_ASUH_QUOTES;
  if (role === "orang_tua") quotesList = ORANG_TUA_QUOTES;

  if (!quotesList || quotesList.length === 0) {
    quotesList = ANAK_ASUH_QUOTES;
  }

  const safeIndex = Math.abs(sessionInfo.slotIndex || 0) % quotesList.length;
  const quote = quotesList[safeIndex] || quotesList[0] || {
    id: "default",
    text: "Pendidikan dan adab adalah lentera penerang masa depan.",
    author: "WaliAsuhku"
  };

  return {
    quote,
    sessionInfo,
  };
}
