export interface ActivityItem {
  id: string;
  hari: string; // SENIN - MINGGU
  kelas: string; // SD, SMP, SMA
  pukul: string;
  kegiatan: string;
  uraian: string;
  tempat: string;
  waliAsuhKode: string; // e.g. "M1, M2", "P1, P2", "S1-S4", "3 WalSuh"
  shiftType: 'PAGI' | 'SORE' | 'MALAM' | 'UMUM';
}

export const LEGEND_KODE_WALI = [
  { kode: 'M1 - M4', shift: 'Shift Malam', deskripsi: 'Petugas Shift Malam (03.30 - 07.00 WIB & Pengecekan Malam)' },
  { kode: 'P1 - P4', shift: 'Shift Pagi', deskripsi: 'Petugas Shift Pagi (07.00 - 15.00 WIB)' },
  { kode: 'S1 - S12', shift: 'Shift Sore', deskripsi: 'Petugas Shift Sore (15.00 - 23.00 WIB)' },
  { kode: '3/4/6 WalSuh', shift: 'Tim Gabungan', deskripsi: 'Penugasan Gabungan Wali Asuh Piket' },
];

export const URAIAN_KEGIATAN_HARIAN: ActivityItem[] = [
  {
    id: 'act-1',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '03.30 - 04.00',
    kegiatan: 'BANGUN TIDUR, MANDI DAN MENUJU KE MASJID',
    uraian: 'Melaksanakan pendampingan pembiasaan pagi kepada peserta didik, meliputi bangun tidur, mandi, dan persiapan menuju masjid untuk shalat berjamaah.',
    tempat: 'Gedung SMP Putri / Kamar SD Putri & Gedung SMP Putra',
    waliAsuhKode: 'M1, M2 (Putri) | M3, M4 (Putra)',
    shiftType: 'MALAM',
  },
  {
    id: 'act-2',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '04.00 - 04.30',
    kegiatan: 'SHOLAT SUBUH BERJAMAAH DI MASJID',
    uraian: 'Mendampingi seluruh siswa menuju ke masjid serta mengecek dan mendampingi jika ada siswa sakit di asrama.',
    tempat: 'Masjid & Asrama Putri/Putra',
    waliAsuhKode: 'M1, M2 (Masjid) | M3 (Putri) | M4 (Putra)',
    shiftType: 'MALAM',
  },
  {
    id: 'act-3',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '04.30 - 05.30',
    kegiatan: 'SENAM PAGI',
    uraian: 'Mendampingi dan memimpin pelaksanaan senam kebugaran pagi siswa.',
    tempat: 'Aula SRMA 24 Kediri',
    waliAsuhKode: 'M1, M2',
    shiftType: 'MALAM',
  },
  {
    id: 'act-4',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '05.30 - 06.00',
    kegiatan: 'KERJA BAKTI BERSIH KAMAR DAN LINGKUNGAN',
    uraian: 'Mendampingi siswa kerja bakti membersihkan kamar dan lingkungan asrama.',
    tempat: 'Gedung SMP Putri, SMP Putra, Kamar SD Putri & Putra',
    waliAsuhKode: 'M4 (SMP Pi) | M3 (SMP Pa) | M1 (SD Pi) | M2 (SD Pa)',
    shiftType: 'MALAM',
  },
  {
    id: 'act-5',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '06.00 - 06.35',
    kegiatan: 'MAKAN PAGI',
    uraian: 'Mendampingi siswa makan pagi dengan tertib dan teratur.',
    tempat: 'Ruang Makan SMP',
    waliAsuhKode: 'M1, M2 (Anak SD) | M3, M4 (Non SD)',
    shiftType: 'MALAM',
  },
  {
    id: 'act-6',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '06.35 - 07.00',
    kegiatan: 'BERANGKAT SEKOLAH',
    uraian: 'Menata barisan siswa per kelas dan mendampingi pelepasan berangkat sekolah.',
    tempat: 'Halaman Ruang Makan SMP',
    waliAsuhKode: 'M1, M2 (SD) | M3, M4 (SMP/SMA)',
    shiftType: 'MALAM',
  },
  {
    id: 'act-7',
    hari: 'SENIN - SABTU',
    kelas: 'SD, SMP, SMA',
    pukul: '07.00 - 11.55',
    kegiatan: 'SISWA BELAJAR DI SEKOLAH',
    uraian: 'Siswa melaksanakan Kegiatan Belajar Mengajar (KBM) formal di kelas. Wali Asuh Shift Pagi melaksanakan pemantauan asrama dan koordinasi.',
    tempat: 'Gedung Sekolah / Kelas',
    waliAsuhKode: 'P1, P2, P3, P4',
    shiftType: 'PAGI',
  },
  {
    id: 'act-8',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '11.55 - 12.15',
    kegiatan: 'SHOLAT DZUHUR BERJAMAAH DI MASJID',
    uraian: 'Mendampingi seluruh siswa melaksanakan Sholat Dzuhur berjamaah.',
    tempat: 'Masjid',
    waliAsuhKode: 'P3, P4',
    shiftType: 'PAGI',
  },
  {
    id: 'act-9',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '12.15 - 13.00',
    kegiatan: 'MAKAN SIANG',
    uraian: 'Mendampingi siswa makan siang dengan tertib di ruang makan.',
    tempat: 'Ruang Makan SMP & Ruang Makan SMA',
    waliAsuhKode: 'P1, P2 (Anak SD) | P3, P4 (Non SD)',
    shiftType: 'PAGI',
  },
  {
    id: 'act-10',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '13.00 - 16.00',
    kegiatan: 'SISWA SD ISTIRAHAT TIDUR SIANG',
    uraian: 'Mendampingi siswa-siswi SD istirahat dan tidur siang di dalam/luar asrama.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'P1, P2, S1-S4 (Putri) | P3, P4, S5-S8 (Putra)',
    shiftType: 'PAGI',
  },
  {
    id: 'act-11',
    hari: 'SENIN - SABTU',
    kelas: 'SMP, SMA',
    pukul: '13.00 - 16.00',
    kegiatan: 'SISWA SMP DAN SMA BELAJAR DI SEKOLAH',
    uraian: 'Melanjutkan kegiatan belajar mengajar sesi siang di kelas.',
    tempat: 'Ruang Kelas Sekolah',
    waliAsuhKode: 'S1 - S12 (Persiapan)',
    shiftType: 'SORE',
  },
  {
    id: 'act-12',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '15.30 - 16.00',
    kegiatan: 'SHOLAT ASAR BERJAMAAH (SMP, SMA)',
    uraian: 'Mendampingi siswa SMP & SMA sholat Asar berjamaah di masjid.',
    tempat: 'Masjid',
    waliAsuhKode: 'S9, S12',
    shiftType: 'SORE',
  },
  {
    id: 'act-13',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '16.00 - 17.00',
    kegiatan: 'MENCUCI BAJU, EKSTRAKURIKULER & PERSIAPAN KE MASJID',
    uraian: 'Mendampingi kegiatan mandiri siswa di asrama (mencuci baju, ekstrakurikuler, persiapan ibadah).',
    tempat: 'Asrama Putri, Asrama Putra & Ruang Makan',
    waliAsuhKode: 'S1-S2 (SMP Pi) | S3-S4 (SMP Pa) | S5-S6 (SMA Pi) | S7-S8 (SMA Pa) | S9-S12 (RM)',
    shiftType: 'SORE',
  },
  {
    id: 'act-14',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '16.00 - 16.30',
    kegiatan: 'SISWA SD SHOLAT ASAR BERJAMAAH DI ASRAMA',
    uraian: 'Mendampingi siswa SD melaksanakan Sholat Asar berjamaah di gedung asrama.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'S1, S2 (Putri) | S3, S4 (Putra)',
    shiftType: 'SORE',
  },
  {
    id: 'act-15',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '16.30 - 17.00',
    kegiatan: 'SISWA SD BERKEGIATAN MANDIRI',
    uraian: 'Mengajari dan mengawasi siswa SD mencuci baju kotor dan merapikan almari pakaian.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'S1, S2 (Putri) | S3, S4 (Putra)',
    shiftType: 'SORE',
  },
  {
    id: 'act-16',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '17.00 - 17.30',
    kegiatan: 'SEMUA SISWA SD MENGAKHIRI KEGIATAN MANDIRI',
    uraian: 'Memastikan seluruh siswa SD selesai mandi dan bersiap sholat Magrib.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'S1, S2 (Putri) | S3, S4 (Putra)',
    shiftType: 'SORE',
  },
  {
    id: 'act-17',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '17.30 - 19.00',
    kegiatan: 'SHOLAT MAGRIB, BELAJAR & SHOLAT ISYA (SD)',
    uraian: 'Mendampingi sholat Magrib & Isya berjamaah di asrama serta membimbing belajar.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'S1, S2 (Sholat Pi) | S3, S4 (Belajar Pa)',
    shiftType: 'SORE',
  },
  {
    id: 'act-18',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '19.00 - 19.30',
    kegiatan: 'SD MELAKSANAKAN MAKAN MALAM',
    uraian: 'Mendampingi siswa SD makan malam lebih awal dengan tertib.',
    tempat: 'Ruang Makan SMP',
    waliAsuhKode: 'S1, S2, S3, S4',
    shiftType: 'SORE',
  },
  {
    id: 'act-19',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '17.00 - 17.30',
    kegiatan: 'SISWA SMP & SMA BERANGKAT KE MASJID',
    uraian: 'Memastikan siswa berbaris rapi per kelas menuju masjid tepat pukul 17.00 WIB.',
    tempat: 'Gedung SMA Putri, Putra & Ruang Makan',
    waliAsuhKode: 'S5-S6 (SMA Pi) | S7-S8 (SMA Pa) | S9-S12 (Ruang Makan)',
    shiftType: 'SORE',
  },
  {
    id: 'act-20',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '17.30 - 18.00',
    kegiatan: 'SHOLAT MAGRIB BERJAMAAH DI MASJID',
    uraian: 'Mendampingi siswa sholat Magrib di masjid dan mengondisikan siswa non-ngaji di Aula.',
    tempat: 'Masjid & Aula',
    waliAsuhKode: '3 Wali Asuh (Masjid) | 3 Wali Asuh (Aula)',
    shiftType: 'SORE',
  },
  {
    id: 'act-21',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '18.00 - 19.00',
    kegiatan: 'MENGAJI AL-QURAN',
    uraian: 'Mendampingi dan menyimak bacaan Al-Quran siswa.',
    tempat: 'Masjid SRMA 24 Kediri',
    waliAsuhKode: '3 Wali Asuh',
    shiftType: 'SORE',
  },
  {
    id: 'act-22',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '19.00 - 19.30',
    kegiatan: 'SHOLAT ISYA BERJAMAAH DI MASJID',
    uraian: 'Mendampingi siswa sholat Isya berjamaah.',
    tempat: 'Masjid',
    waliAsuhKode: '3 Wali Asuh',
    shiftType: 'SORE',
  },
  {
    id: 'act-23',
    hari: 'SENIN - MINGGU',
    kelas: 'SD',
    pukul: '19.30 - 21.00',
    kegiatan: 'BELAJAR DAN TIDUR (SD)',
    uraian: 'Menemani siswa SD belajar malam dan memastikan tidur tepat waktu.',
    tempat: 'Gedung SMP Putri & Gedung SMP Putra',
    waliAsuhKode: 'S1, S2 (Putri) | S3, S4 (Putra)',
    shiftType: 'SORE',
  },
  {
    id: 'act-24',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '19.30 - 19.40',
    kegiatan: 'MENUJU ASRAMA UNTUK MAKAN MALAM',
    uraian: 'Mendampingi dan mengatur barisan rapi siswa dari masjid ke ruang makan.',
    tempat: 'Masjid menuju Ruang Makan',
    waliAsuhKode: '6 Wali Asuh Piket',
    shiftType: 'SORE',
  },
  {
    id: 'act-25',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '19.40 - 20.15',
    kegiatan: 'MAKAN MALAM (SMP, SMA)',
    uraian: 'Mendampingi siswa SMP dan SMA makan malam dengan tertib.',
    tempat: 'Ruang Makan SMP & Ruang Makan SMA',
    waliAsuhKode: '4 Wali Asuh (RM SMP) | 4 Wali Asuh (RM SMA)',
    shiftType: 'SORE',
  },
  {
    id: 'act-26',
    hari: 'SENIN - MINGGU',
    kelas: 'SMP, SMA',
    pukul: '20.15 - 21.15',
    kegiatan: 'BELAJAR MANDIRI (SMP, SMA)',
    uraian: 'Menemani dan memfasilitasi proses belajar mandiri siswa di asrama.',
    tempat: 'Gedung SMA Putri & Gedung SMA Putra',
    waliAsuhKode: 'S5, S6 (Putri) | S7, S8 (Putra)',
    shiftType: 'SORE',
  },
  {
    id: 'act-27',
    hari: 'SENIN - MINGGU',
    kelas: 'SD, SMP, SMA',
    pukul: '21.15 - 03.30',
    kegiatan: 'SEMUA SISWA PERSIAPAN TIDUR / ISTIRAHAT MALAM',
    uraian: 'Memastikan seluruh siswa masuk kamar dan tidur, mengunci pintu asrama serta ronda malam.',
    tempat: 'Seluruh Kompleks Asrama SRMA 24',
    waliAsuhKode: 'M1, M2, M3, M4 (Shift Malam)',
    shiftType: 'MALAM',
  },
];

/**
 * Mendapatkan Kode Slot SOP berdasarkan Jenis Shift dan Urutan Personel
 */
export function getKodeSlotSOP(shiftType: 'P' | 'S' | 'M' | string, index: number): string {
  if (shiftType === 'P') {
    const slotNum = (index % 4) + 1;
    return `P${slotNum}`;
  }
  if (shiftType === 'S') {
    const slotNum = (index % 12) + 1;
    return `S${slotNum}`;
  }
  if (shiftType === 'M') {
    const slotNum = (index % 4) + 1;
    return `M${slotNum}`;
  }
  return 'OFF';
}

/**
 * Ringkasan Unit Pendampingan / Fokus Tugas Berdasarkan Kode Slot
 */
export function getDeskripsiSlotSOP(kodeSlot: string): { label: string; unit: string; deskripsi: string } {
  switch (kodeSlot) {
    case 'P1':
    case 'P2':
      return {
        label: 'Makan & Istirahat SD (Putri)',
        unit: 'SD / SMP Putri',
        deskripsi: 'Pendampingan KBM Pagi, Makan Siang SD, Istirahat / Tidur Siang Siswa SD di Asrama Putri.'
      };
    case 'P3':
    case 'P4':
      return {
        label: 'Sholat Dzuhur & Istirahat SD (Putra)',
        unit: 'SD / SMP Putra',
        deskripsi: 'Pendampingan Sholat Dzuhur Masjid, Makan Siang Non-SD, Istirahat Siang SD di Asrama Putra.'
      };
    case 'S1':
    case 'S2':
      return {
        label: 'Pendampingan Asrama SMP Putri',
        unit: 'SMP Putri & SD',
        deskripsi: 'Pendampingan Mencuci Baju, Sholat Asar & Magrib SD, Belajar & Makan Malam SD di Asrama Putri.'
      };
    case 'S3':
    case 'S4':
      return {
        label: 'Pendampingan Asrama SMP Putra',
        unit: 'SMP Putra & SD',
        deskripsi: 'Pendampingan Mencuci Baju, Sholat Asar & Magrib SD, Belajar & Makan Malam SD di Asrama Putra.'
      };
    case 'S5':
    case 'S6':
      return {
        label: 'Pendampingan Asrama SMA Putri',
        unit: 'SMA Putri',
        deskripsi: 'Pengondisian Masjid, Sholat Magrib/Isya Jamaah, & Pendampingan Belajar Mandiri SMA Putri.'
      };
    case 'S7':
    case 'S8':
      return {
        label: 'Pendampingan Asrama SMA Putra',
        unit: 'SMA Putra',
        deskripsi: 'Pengondisian Masjid, Sholat Magrib/Isya Jamaah, & Pendampingan Belajar Mandiri SMA Putra.'
      };
    case 'S9':
    case 'S10':
      return {
        label: 'Pendampingan Ruang Makan SMP & Masjid',
        unit: 'SMP & Masjid',
        deskripsi: 'Pendampingan Sholat Asar/Magrib/Isya di Masjid, Pengawasan Aula, & Kebersihan Ruang Makan SMP.'
      };
    case 'S11':
    case 'S12':
      return {
        label: 'Pendampingan Ruang Makan SMA & Mengaji',
        unit: 'SMA & Mengaji',
        deskripsi: 'Pendampingan Mengaji Al-Quran di Masjid, Kebersihan Ruang Makan SMA, & Barisan Makan Malam.'
      };
    case 'M1':
    case 'M2':
      return {
        label: 'Bangun Pagi & Subuh (Putri)',
        unit: 'Putri & SD',
        deskripsi: 'Pendampingan Bangun Subuh (03.30), Sholat Subuh Masjid, Senam Pagi, Bersih Kamar & Makan SD.'
      };
    case 'M3':
    case 'M4':
      return {
        label: 'Bangun Pagi & Pengecekan Asrama (Putra)',
        unit: 'Putra & SMP/SMA',
        deskripsi: 'Pendampingan Pengecekan Siswa Sakit, Bersih Kamar SMP/SMA, Makan Pagi & Ronda Istirahat Malam.'
      };
    default:
      return {
        label: 'Pendampingan Gabungan / Lepas Piket',
        unit: 'Umum',
        deskripsi: 'Pendampingan Tim Gabungan / Bebas Tugas Piket Harian.'
      };
  }
}

/**
 * Ambil daftar kegiatan rinci dari SOP yang relevan untuk Kode Slot
 */
export function getDetailTugasForKode(kodeSlot: string): ActivityItem[] {
  if (kodeSlot === 'OFF') return [];

  return URAIAN_KEGIATAN_HARIAN.filter(act => {
    if (act.waliAsuhKode.includes(kodeSlot)) return true;
    if (kodeSlot.startsWith('P') && act.shiftType === 'PAGI' && act.waliAsuhKode.includes('P1')) return true;
    if (kodeSlot.startsWith('S') && act.shiftType === 'SORE') {
      const num = parseInt(kodeSlot.replace('S', ''), 10);
      if (num >= 1 && num <= 4 && (act.waliAsuhKode.includes('S1') || act.waliAsuhKode.includes('S3'))) return true;
      if (num >= 5 && num <= 8 && (act.waliAsuhKode.includes('S5') || act.waliAsuhKode.includes('S7'))) return true;
      if (num >= 9 && num <= 12 && (act.waliAsuhKode.includes('S9') || act.waliAsuhKode.includes('S11') || act.waliAsuhKode.includes('3 WalSuh') || act.waliAsuhKode.includes('6 WalSuh'))) return true;
    }
    if (kodeSlot.startsWith('M') && act.shiftType === 'MALAM') return true;
    return false;
  });
}

