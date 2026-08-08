export interface WaliAsuh28Item {
  no: number;
  nama: string;
  anakAsuh: string;
  shifts: { [day: number]: string }; // 1 to 31
  pFul: number;
  s: number;
  m: number;
  lp: number;
  off: number;
  p: number;
  jk: number;
}

export const HEADER_INFO = {
  kemensos: "KEMENTERIAN SOSIAL REPUBLIK INDONESIA",
  pusat: "PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI",
  sekolah: "SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI",
  gedung: "Gedung Balai Pengembangan Kompetensi Aparatur Sipil Negara",
  alamat: "Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri, Jawa Timur",
  emailPos: "Pos-el: srma24kediri@gmail.com Kode Pos: 64152",
  judul: "JADWAL PEMBAGIAN SHIFT WALI ASUH",
  subJudul: "AGUSTUS 2026"
};

export const SUMMARY_SHIFTS_AGUSTUS_2026 = {
  pagi: [4,5,5,6,5,6,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  sore: [11,11,10,10,10,12,13,14,13,14,12,13,12,13,12,13,13,14,13,14,13,14,13,14,13,14,13,14,13,14,13],
  malam: [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
  cuti: [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  offLepas: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  jumlahTotal: [26,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]
};

export const WALI_ASUH_28_DATA: WaliAsuh28Item[] = [
  {
    no: 1,
    nama: "Suhariyono",
    anakAsuh: "X PA",
    shifts: { 1: "M", 2: "LP", 3: "O", 4: "P", 5: "S", 6: "S", 7: "S", 8: "M", 9: "LP", 10: "O", 11: "P", 12: "S", 13: "S", 14: "S", 15: "S", 16: "M", 17: "LP", 18: "O", 19: "P", 20: "S", 21: "S", 22: "S", 23: "S", 24: "M", 25: "LP", 26: "O", 27: "P", 28: "S", 29: "S", 30: "S", 31: "S" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 2,
    nama: "Rindani",
    anakAsuh: "VII PI",
    shifts: { 1: "LP", 2: "O", 3: "P", 4: "P", 5: "S", 6: "S", 7: "S", 8: "S", 9: "M", 10: "LP", 11: "O", 12: "P", 13: "S", 14: "S", 15: "S", 16: "S", 17: "M", 18: "LP", 19: "O", 20: "P", 21: "P", 22: "S", 23: "S", 24: "S", 25: "M", 26: "LP", 27: "O", 28: "P", 29: "P", 30: "S", 31: "S" },
    pFul: 7, s: 13, m: 3, lp: 4, off: 4, p: 7, jk: 205
  },
  {
    no: 3,
    nama: "Hariadi",
    anakAsuh: "VII PA",
    shifts: { 1: "O", 2: "P", 3: "S", 4: "S", 5: "S", 6: "S", 7: "M", 8: "LP", 9: "O", 10: "P", 11: "S", 12: "S", 13: "S", 14: "S", 15: "M", 16: "LP", 17: "O", 18: "P", 19: "P", 20: "S", 21: "S", 22: "S", 23: "M", 24: "LP", 25: "O", 26: "P", 27: "S", 28: "S", 29: "S", 30: "S", 31: "M" },
    pFul: 5, s: 15, m: 4, lp: 3, off: 4, p: 5, jk: 218
  },
  {
    no: 4,
    nama: "Moch. Chabib",
    anakAsuh: "XII PA",
    shifts: { 1: "P", 2: "P", 3: "S", 4: "S", 5: "S", 6: "M", 7: "LP", 8: "O", 9: "P", 10: "S", 11: "S", 12: "S", 13: "S", 14: "M", 15: "LP", 16: "O", 17: "P", 18: "S", 19: "S", 20: "S", 21: "S", 22: "M", 23: "LP", 24: "O", 25: "P", 26: "S", 27: "S", 28: "S", 29: "S", 30: "M", 31: "LP" },
    pFul: 5, s: 15, m: 4, lp: 4, off: 3, p: 5, jk: 218
  },
  {
    no: 5,
    nama: "Dewi Askinu",
    anakAsuh: "X PI",
    shifts: { 1: "P", 2: "S", 3: "S", 4: "S", 5: "M", 6: "LP", 7: "O", 8: "P", 9: "S", 10: "S", 11: "S", 12: "S", 13: "M", 14: "LP", 15: "O", 16: "P", 17: "S", 18: "S", 19: "S", 20: "S", 21: "M", 22: "LP", 23: "O", 24: "P", 25: "S", 26: "S", 27: "S", 28: "S", 29: "M", 30: "LP", 31: "O" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 6,
    nama: "Aris Mahmud Syafi'i",
    anakAsuh: "X PA",
    shifts: { 1: "S", 2: "S", 3: "S", 4: "M", 5: "LP", 6: "O", 7: "P", 8: "S", 9: "S", 10: "S", 11: "S", 12: "M", 13: "LP", 14: "O", 15: "P", 16: "S", 17: "S", 18: "S", 19: "S", 20: "M", 21: "LP", 22: "O", 23: "P", 24: "S", 25: "S", 26: "S", 27: "S", 28: "M", 29: "LP", 30: "O", 31: "P" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 7,
    nama: "Erna Rizkiani",
    anakAsuh: "VII PI",
    shifts: { 1: "S", 2: "S", 3: "M", 4: "LP", 5: "O", 6: "P", 7: "S", 8: "S", 9: "S", 10: "S", 11: "M", 12: "LP", 13: "O", 14: "P", 15: "S", 16: "S", 17: "S", 18: "S", 19: "M", 20: "LP", 21: "O", 22: "P", 23: "S", 24: "S", 25: "S", 26: "S", 27: "M", 28: "LP", 29: "O", 30: "P", 31: "P" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 8,
    nama: "Chusfia Hanik Wihayati",
    anakAsuh: "SD",
    shifts: { 1: "S", 2: "M", 3: "LP", 4: "O", 5: "P", 6: "P", 7: "S", 8: "S", 9: "S", 10: "M", 11: "LP", 12: "O", 13: "P", 14: "S", 15: "S", 16: "S", 17: "S", 18: "M", 19: "LP", 20: "O", 21: "P", 22: "S", 23: "S", 24: "S", 25: "S", 26: "M", 27: "LP", 28: "O", 29: "P", 30: "S", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 9,
    nama: "A. Zainudin Sholeh",
    anakAsuh: "VII PA",
    shifts: { 1: "M", 2: "LP", 3: "O", 4: "P", 5: "P", 6: "S", 7: "S", 8: "S", 9: "M", 10: "LP", 11: "O", 12: "P", 13: "S", 14: "S", 15: "S", 16: "M", 17: "LP", 18: "O", 19: "P", 20: "S", 21: "S", 22: "S", 23: "S", 24: "M", 25: "LP", 26: "O", 27: "P", 28: "S", 29: "S", 30: "S", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 10,
    nama: "Abisarwan Rafif",
    anakAsuh: "XII PA",
    shifts: { 1: "LP", 2: "O", 3: "P", 4: "S", 5: "S", 6: "S", 7: "S", 8: "M", 9: "LP", 10: "O", 11: "C", 12: "C", 13: "C", 14: "C", 15: "C", 16: "C", 17: "M", 18: "LP", 19: "O", 20: "P", 21: "S", 22: "S", 23: "S", 24: "S", 25: "M", 26: "LP", 27: "O", 28: "P", 29: "S", 30: "S", 31: "S" },
    pFul: 3, s: 11, m: 3, lp: 4, off: 4, p: 3, jk: 155
  },
  {
    no: 11,
    nama: "Dwi Chusnul Mufid",
    anakAsuh: "XI PI",
    shifts: { 1: "O", 2: "P", 3: "P", 4: "S", 5: "S", 6: "S", 7: "M", 8: "LP", 9: "O", 10: "P", 11: "P", 12: "S", 13: "S", 14: "S", 15: "M", 16: "LP", 17: "O", 18: "P", 19: "S", 20: "S", 21: "S", 22: "S", 23: "M", 24: "LP", 25: "O", 26: "P", 27: "S", 28: "S", 29: "S", 30: "S", 31: "M" },
    pFul: 6, s: 14, m: 4, lp: 3, off: 4, p: 6, jk: 220
  },
  {
    no: 12,
    nama: "Amirul Mu'minin Rofico P.K.",
    anakAsuh: "X PA",
    shifts: { 1: "SKT", 2: "SKT", 3: "SKT", 4: "SKT", 5: "SKT", 6: "M", 7: "LP", 8: "O", 9: "P", 10: "S", 11: "S", 12: "S", 13: "S", 14: "M", 15: "LP", 16: "O", 17: "P", 18: "S", 19: "S", 20: "S", 21: "S", 22: "M", 23: "LP", 24: "O", 25: "P", 26: "S", 27: "S", 28: "S", 29: "S", 30: "M", 31: "LP" },
    pFul: 3, s: 12, m: 4, lp: 4, off: 3, p: 3, jk: 179
  },
  {
    no: 13,
    nama: "Nanang Arifin",
    anakAsuh: "VII PI",
    shifts: { 1: "P", 2: "S", 3: "S", 4: "S", 5: "M", 6: "LP", 7: "O", 8: "P", 9: "S", 10: "S", 11: "S", 12: "S", 13: "M", 14: "LP", 15: "O", 16: "P", 17: "S", 18: "S", 19: "S", 20: "S", 21: "M", 22: "LP", 23: "O", 24: "P", 25: "S", 26: "S", 27: "S", 28: "S", 29: "M", 30: "LP", 31: "O" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 14,
    nama: "Muji Santoso",
    anakAsuh: "SD",
    shifts: { 1: "S", 2: "S", 3: "S", 4: "M", 5: "LP", 6: "O", 7: "P", 8: "S", 9: "S", 10: "S", 11: "S", 12: "M", 13: "LP", 14: "O", 15: "P", 16: "S", 17: "S", 18: "S", 19: "S", 20: "M", 21: "LP", 22: "O", 23: "P", 24: "S", 25: "S", 26: "S", 27: "S", 28: "M", 29: "LP", 30: "O", 31: "P" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 15,
    nama: "Teguh Cahyono",
    anakAsuh: "X PI",
    shifts: { 1: "S", 2: "S", 3: "M", 4: "LP", 5: "O", 6: "P", 7: "S", 8: "S", 9: "S", 10: "S", 11: "M", 12: "LP", 13: "O", 14: "P", 15: "S", 16: "S", 17: "S", 18: "S", 19: "M", 20: "LP", 21: "O", 22: "P", 23: "S", 24: "S", 25: "S", 26: "S", 27: "M", 28: "LP", 29: "O", 30: "P", 31: "S" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 16,
    nama: "Eko Wahyudi",
    anakAsuh: "X PI",
    shifts: { 1: "S", 2: "M", 3: "LP", 4: "O", 5: "P", 6: "S", 7: "S", 8: "S", 9: "S", 10: "M", 11: "LP", 12: "O", 13: "P", 14: "S", 15: "S", 16: "S", 17: "S", 18: "M", 19: "LP", 20: "O", 21: "P", 22: "S", 23: "S", 24: "S", 25: "S", 26: "M", 27: "LP", 28: "O", 29: "P", 30: "S", 31: "S" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 17,
    nama: "Siti Maslukah",
    anakAsuh: "SD",
    shifts: { 1: "M", 2: "LP", 3: "O", 4: "P", 5: "S", 6: "S", 7: "S", 8: "S", 9: "M", 10: "LP", 11: "O", 12: "P", 13: "P", 14: "S", 15: "S", 16: "S", 17: "M", 18: "LP", 19: "O", 20: "P", 21: "S", 22: "S", 23: "S", 24: "S", 25: "M", 26: "LP", 27: "O", 28: "P", 29: "S", 30: "S", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 18,
    nama: "Anita Kurniawati",
    anakAsuh: "X PI",
    shifts: { 1: "LP", 2: "O", 3: "P", 4: "P", 5: "S", 6: "S", 7: "S", 8: "M", 9: "LP", 10: "O", 11: "P", 12: "S", 13: "S", 14: "S", 15: "S", 16: "M", 17: "LP", 18: "O", 19: "P", 20: "S", 21: "S", 22: "S", 23: "S", 24: "M", 25: "LP", 26: "O", 27: "P", 28: "S", 29: "S", 30: "S", 31: "S" },
    pFul: 5, s: 15, m: 3, lp: 4, off: 4, p: 5, jk: 201
  },
  {
    no: 19,
    nama: "Yusak Wasis Pratonggo",
    anakAsuh: "VII PA",
    shifts: { 1: "O", 2: "P", 3: "S", 4: "S", 5: "S", 6: "S", 7: "M", 8: "LP", 9: "O", 10: "P", 11: "S", 12: "S", 13: "S", 14: "S", 15: "M", 16: "LP", 17: "O", 18: "P", 19: "S", 20: "S", 21: "S", 22: "S", 23: "M", 24: "LP", 25: "O", 26: "P", 27: "S", 28: "S", 29: "S", 30: "S", 31: "M" },
    pFul: 4, s: 16, m: 4, lp: 3, off: 4, p: 4, jk: 216
  },
  {
    no: 20,
    nama: "Herlina Ratu Belia",
    anakAsuh: "SD",
    shifts: { 1: "O", 2: "O", 3: "O", 4: "O", 5: "O", 6: "O", 7: "M", 8: "LP", 9: "O", 10: "P", 11: "S", 12: "S", 13: "S", 14: "S", 15: "M", 16: "LP", 17: "O", 18: "P", 19: "S", 20: "S", 21: "S", 22: "S", 23: "M", 24: "LP", 25: "O", 26: "P", 27: "S", 28: "S", 29: "S", 30: "S", 31: "M" },
    pFul: 3, s: 12, m: 4, lp: 4, off: 3, p: 3, jk: 179
  },
  {
    no: 21,
    nama: "Deni Furitrinofi",
    anakAsuh: "VII PA",
    shifts: { 1: "P", 2: "S", 3: "S", 4: "S", 5: "M", 6: "LP", 7: "O", 8: "P", 9: "S", 10: "S", 11: "S", 12: "S", 13: "M", 14: "LP", 15: "O", 16: "P", 17: "S", 18: "S", 19: "S", 20: "S", 21: "M", 22: "LP", 23: "O", 24: "P", 25: "S", 26: "S", 27: "S", 28: "S", 29: "M", 30: "LP", 31: "O" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 22,
    nama: "Ambika Widya Asmara",
    anakAsuh: "VII PI",
    shifts: { 1: "S", 2: "S", 3: "S", 4: "M", 5: "LP", 6: "O", 7: "P", 8: "S", 9: "S", 10: "S", 11: "S", 12: "M", 13: "LP", 14: "O", 15: "P", 16: "S", 17: "S", 18: "S", 19: "S", 20: "M", 21: "LP", 22: "O", 23: "P", 24: "S", 25: "S", 26: "S", 27: "S", 28: "M", 29: "LP", 30: "O", 31: "P" },
    pFul: 4, s: 15, m: 4, lp: 4, off: 4, p: 4, jk: 209
  },
  {
    no: 23,
    nama: "Moh Asrofi",
    anakAsuh: "SD",
    shifts: { 1: "S", 2: "S", 3: "M", 4: "LP", 5: "O", 6: "P", 7: "P", 8: "S", 9: "S", 10: "S", 11: "M", 12: "LP", 13: "O", 14: "P", 15: "S", 16: "S", 17: "S", 18: "S", 19: "M", 20: "LP", 21: "O", 22: "P", 23: "S", 24: "S", 25: "S", 26: "S", 27: "M", 28: "LP", 29: "O", 30: "P", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 24,
    nama: "Retnowati",
    anakAsuh: "X PA",
    shifts: { 1: "S", 2: "M", 3: "LP", 4: "O", 5: "P", 6: "P", 7: "S", 8: "S", 9: "S", 10: "M", 11: "LP", 12: "O", 13: "P", 14: "S", 15: "S", 16: "S", 17: "S", 18: "M", 19: "LP", 20: "O", 21: "P", 22: "S", 23: "S", 24: "S", 25: "S", 26: "M", 27: "LP", 28: "O", 29: "P", 30: "S", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 25,
    nama: "Eky Venty Pricilia",
    anakAsuh: "XI PI",
    shifts: { 1: "M", 2: "LP", 3: "O", 4: "P", 5: "P", 6: "S", 7: "S", 8: "S", 9: "M", 10: "LP", 11: "O", 12: "P", 13: "S", 14: "S", 15: "S", 16: "S", 17: "M", 18: "LP", 19: "O", 20: "P", 21: "S", 22: "S", 23: "S", 24: "S", 25: "M", 26: "LP", 27: "O", 28: "P", 29: "S", 30: "S", 31: "S" },
    pFul: 5, s: 14, m: 4, lp: 4, off: 4, p: 5, jk: 211
  },
  {
    no: 26,
    nama: "Adityo Rizky Winarno",
    anakAsuh: "VII PI",
    shifts: { 1: "O", 2: "P", 3: "P", 4: "S", 5: "S", 6: "S", 7: "M", 8: "LP", 9: "O", 10: "P", 11: "P", 12: "S", 13: "S", 14: "S", 15: "M", 16: "LP", 17: "O", 18: "P", 19: "S", 20: "S", 21: "S", 22: "S", 23: "M", 24: "LP", 25: "O", 26: "P", 27: "P", 28: "S", 29: "S", 30: "S", 31: "M" },
    pFul: 7, s: 13, m: 4, lp: 3, off: 4, p: 7, jk: 222
  },
  {
    no: 27,
    nama: "Akhmad Fadkhurriza I",
    anakAsuh: "VII PI",
    shifts: { 1: "S", 2: "S", 3: "S", 4: "S", 5: "M", 6: "LP", 7: "O", 8: "P", 9: "P", 10: "S", 11: "S", 12: "S", 13: "M", 14: "LP", 15: "O", 16: "P", 17: "P", 18: "S", 19: "S", 20: "S", 21: "M", 22: "LP", 23: "O", 24: "P", 25: "P", 26: "S", 27: "S", 28: "S", 29: "M", 30: "LP", 31: "O" },
    pFul: 6, s: 13, m: 4, lp: 4, off: 4, p: 6, jk: 213
  },
  {
    no: 28,
    nama: "Afida Saidatul Fuadia",
    anakAsuh: "XI PI",
    shifts: { 1: "S", 2: "S", 3: "M", 4: "LP", 5: "O", 6: "P", 7: "S", 8: "S", 9: "S", 10: "S", 11: "M", 12: "LP", 13: "O", 14: "P", 15: "P", 16: "S", 17: "S", 18: "S", 19: "M", 20: "LP", 21: "O", 22: "P", 23: "P", 24: "S", 25: "S", 26: "S", 27: "M", 28: "LP", 29: "O", 30: "P", 31: "S" },
    pFul: 6, s: 13, m: 4, lp: 4, off: 4, p: 6, jk: 213
  }
];

// Helper to get day name of August 2026 for date 1 to 31
// Note: August 1, 2026 is Saturday (Sabtu)
export const getNamaHariAgustus2026 = (dateNum: number): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  // 1 Aug 2026 is Saturday -> day index 6
  const dateObj = new Date(2026, 7, dateNum); // Month 7 = August (0-indexed)
  return days[dateObj.getDay()];
};
