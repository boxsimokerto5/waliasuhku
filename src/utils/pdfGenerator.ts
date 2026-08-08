import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { User, ActivityChecklist, EventChecklist, EventChecklistOption } from '../types';
import { getKodeSlotSOP, getDeskripsiSlotSOP } from '../data/jadwalHarianRinci';

/**
 * Preload an image URL and convert it to a canvas-compatible base64 format
 */
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve('');
      return;
    }
    // If already a base64 data URL, return it directly
    if (url.startsWith('data:image/')) {
      resolve(url);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 120;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
          return;
        }
      } catch (err) {
        console.warn('Canvas conversion failed for URL:', url, err);
      }
      resolve(url); // fallback to original URL
    };
    img.onerror = () => {
      console.warn('Image preloading failed for URL:', url);
      resolve(''); // fallback to empty, which triggers the letter placeholder
    };
    img.src = url;
  });
};

/**
 * Draw a beautiful card on the PDF document at (x, y) coordinates
 */
export const drawCard = (doc: jsPDF, x: number, y: number, user: User, users: User[], imgData?: string) => {
  const w = 90;
  const h = 60;

  // 1. Draw outer rounded box with soft slate border
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(255, 255, 255); // White background
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  // 2. Header Banner (deep indigo)
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(x, y, w, 12, 3, 3, 'F');
  // Overwrite bottom rounded corners of the header to keep them sharp
  doc.rect(x, y + 9, w, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('KARTU AKSES AKUN', x + 5, y + 7.5);

  // App Name
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('WaliAsuhku', x + w - 5, y + 7.5, { align: 'right' });

  // 3. User info content
  let textY = y + 18;
  doc.setFontSize(7);
  
  // Left Column: Avatar / Photo Frame
  const avatarX = x + 5.5;
  const avatarY = y + 15.5;
  const avatarSize = 13.5;
  
  let drawPlaceholder = true;

  if (imgData) {
    try {
      // Draw frame background and subtle border first for picture
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.35);
      doc.roundedRect(avatarX, avatarY, avatarSize, avatarSize, 1.5, 1.5, 'FD');

      // Determine the format if possible
      let format = 'JPEG';
      if (imgData.includes('image/png')) {
        format = 'PNG';
      } else if (imgData.includes('image/webp')) {
        format = 'WEBP';
      }
      
      // Draw the image slightly insetted to look beautifully framed
      doc.addImage(imgData, format, avatarX + 0.4, avatarY + 0.4, avatarSize - 0.8, avatarSize - 0.8);
      drawPlaceholder = false;
    } catch (e) {
      console.warn('jsPDF addImage failed inside drawCard:', e);
      drawPlaceholder = true;
    }
  }

  if (drawPlaceholder) {
    // Draw a beautiful background circle/rounded rect placeholder
    doc.setFillColor(124, 58, 237); // Violet 600
    doc.roundedRect(avatarX, avatarY, avatarSize, avatarSize, 1.5, 1.5, 'F');
    
    // Draw the first letter of the name
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
    // Center the text inside the avatar box (avatarSize / 2 is 6.75)
    doc.text(initialLetter, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 2.8, { align: 'center' });
  }

  // Right Column: text starts at x + 23
  const infoX = x + 23;
  
  // Name label
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Nama Lengkap', infoX, textY);
  
  // Name value
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  const displayName = user.name.length > 22 ? user.name.substring(0, 20) + '...' : user.name;
  doc.text(displayName, infoX, textY + 3.5);

  // Role/Peran (right aligned)
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('Peran / Hak Akses', x + w - 5.5, textY, { align: 'right' });
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  const roleText = user.role === 'anak_asuh' ? 'Siswa (Anak Asuh)' : 'Orang Tua Asuh';
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(roleText, x + w - 5.5, textY + 3.5, { align: 'right' });

  // Divider line
  doc.setDrawColor(241, 245, 249); // Slate 100
  doc.setLineWidth(0.25);
  doc.line(x + 5.5, y + 32, x + w - 5.5, y + 32);

  // Bottom info fields: Username & Password
  const bottomY = y + 37;
  
  // Username / ID
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('Username / ID', x + 5.5, bottomY);
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(user.username, x + 5.5, bottomY + 3.5);

  // Password
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('Kata Sandi Default', x + 35, bottomY);
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(user.password || user.username, x + 35, bottomY + 3.5);

  // Connection info (Category or Linked relative)
  let connectionLabel = 'Kelompok';
  let connectionVal = user.category || 'Umum';
  if (user.role === 'orang_tua') {
    connectionLabel = 'Siswa Terhubung';
    const child = users.find(u => u.id === user.anakAsuhId);
    connectionVal = child ? child.name : 'Tidak ditemukan';
  }
  
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text(connectionLabel, x + w - 5.5, bottomY, { align: 'right' });
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  const displayConn = connectionVal.length > 15 ? connectionVal.substring(0, 13) + '...' : connectionVal;
  doc.text(displayConn, x + w - 5.5, bottomY + 3.5, { align: 'right' });

  // 4. Important instructions
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('Helvetica', 'italic');
  doc.text('*Harap segera ubah kata sandi setelah masuk pertama kali.', x + 5.5, y + 46);

  // 5. Footer Band
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(x, y + h - 8, w, 8, 3, 3, 'F');
  // Overwrite top rounded corners of footer
  doc.rect(x, y + h - 8, w, 3, 'F');

  // Portal URL
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Akses Portal: https://www.waliasuhku.pages.dev', x + w / 2, y + h - 3, { align: 'center' });
};

/**
 * Generate a PDF for a single user's card
 */
export const generateSingleCardPDF = async (user: User, users: User[]) => {
  // Page size: 90mm x 60mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [90, 60]
  });

  // Preload image
  const imgData = user.fotoUrl ? await loadImage(user.fotoUrl) : '';

  drawCard(doc, 0, 0, user, users, imgData);
  
  const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`kartu_akses_${user.role}_${safeName}.pdf`);
};

/**
 * Generate a PDF document containing a grid of cards for multiple users (A4 Portrait)
 */
export const generateAllCardsPDF = async (usersToPrint: User[], users: User[], tabName: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardsPerPage = 8;
  const cardW = 90;
  const cardH = 60;
  const startX = 10;
  const startY = 25;
  const gapX = 10;
  const gapY = 6;

  let currentCount = 0;

  // Preload all images in parallel for blazing-fast performance!
  const preloadedImages = await Promise.all(
    usersToPrint.map(async (u) => {
      const imgUrl = u.fotoUrl ? await loadImage(u.fotoUrl) : '';
      return { id: u.id, imgData: imgUrl };
    })
  );

  const imageMap = new Map(preloadedImages.map((item) => [item.id, item.imgData]));

  usersToPrint.forEach((user, index) => {
    if (index > 0 && index % cardsPerPage === 0) {
      doc.addPage();
      currentCount = 0;
    }

    // Add a document header on each page
    if (currentCount === 0) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`Koleksi Kartu Akses Akun - ${tabName}`, 10, 12);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`WaliAsuhku Portal: https://www.waliasuhku.pages.dev`, 10, 17);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 200, 17, { align: 'right' });
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(10, 19, 200, 19);
    }

    const col = currentCount % 2;
    const row = Math.floor(currentCount / 2);

    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    const imgData = imageMap.get(user.id) || '';
    drawCard(doc, x, y, user, users, imgData);

    // Draw print helper cutting dotted line around each card
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.1);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(x - 1, y - 1, cardW + 2, cardH + 2, 'S');
    // reset dash pattern
    doc.setLineDashPattern([], 0);

    currentCount++;
  });

  const safeTabName = tabName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`kumpulan_kartu_akses_${safeTabName}.pdf`);
};

export interface PDFExportOptions {
  paperSize?: 'a4' | 'f4';
  includePhoto?: boolean;
  includeAddress?: boolean;
  includeKkNik?: boolean;
  includeDocPhotos?: boolean;
  includeInitialAssessment?: boolean;
  selectedMonthYear?: string;
  customHealthStatus?: string;
  customHealthNotes?: string;
  customMonthlyActivities?: string;
  customCharacterNotes?: string;
}

/**
 * Generate a beautiful A4/F4 Student Portfolio PDF with photo, biodata, achievements, and caregiver info
 */
export const generateStudentPortfolioPDF = async (student: User, users: User[], options?: PDFExportOptions) => {
  const {
    paperSize = 'f4',
    includePhoto = true,
    includeAddress = true,
    includeKkNik = true,
    includeDocPhotos = false,
    includeInitialAssessment = true,
  } = options || {};

  const isF4 = paperSize === 'f4';
  const width = isF4 ? 215 : 210;
  const height = isF4 ? 330 : 297;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isF4 ? [215, 330] : 'a4'
  });

  const imgData = student.fotoUrl ? await loadImage(student.fotoUrl) : '';
  const waliAsuh = users.find(u => u.id === student.waliAsuhId && u.role === 'wali_asuh');
  const waliAsuhName = waliAsuh ? waliAsuh.name : 'Belum ditentukan';

  const drawHeaderBlock = (pageNumber: number) => {
    // Top colored band
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, width, 25, 'F');
    
    // Header Accent Line
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 25, width, 2, 'F');

    // Title & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('PORTOFOLIO ANAK ASUH', 15, 11);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('Laporan Hasil Pembinaan, Prestasi, dan Perkembangan Siswa Asrama WaliAsuhku', 15, 17);

    // Page indicator
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${pageNumber}`, width - 15, 12, { align: 'right' });
  };

  // Page 1 Setup
  drawHeaderBlock(1);

  // Profile section layout
  const photoW = 40;
  const photoH = 45;
  const photoX = width - 55;
  const photoY = 35;

  // Metadata Panel Width changes dynamically depending on if photo is included
  const metaW = includePhoto ? (width - 78) : (width - 30);
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(15, 35, metaW, 45, 2, 2, 'F');

  if (includePhoto) {
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.35);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'D');

    if (imgData) {
      try {
        let format = 'JPEG';
        if (imgData.includes('image/png')) format = 'PNG';
        else if (imgData.includes('image/webp')) format = 'WEBP';
        doc.addImage(imgData, format, photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
      } catch (e) {
        console.warn('Portfolio photo render failed:', e);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 1.5, 1.5, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('FOTO', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
      }
    } else {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 1.5, 1.5, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('FOTO SISWA', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
    }
  }

  // Let's draw fields
  // Left side info
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'normal');
  doc.text('NAMA LENGKAP ANAK ASUH', 20, 43);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  const nameMaxLen = includePhoto ? 25 : 45;
  const safeStudentName = student.name.length > nameMaxLen ? student.name.substring(0, nameMaxLen - 2) + '...' : student.name;
  doc.text(safeStudentName, 20, 48.5);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('KELOMPOK / KATEGORI', 20, 59);
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.setFont('Helvetica', 'bold');
  doc.text(student.category || 'Umum', 20, 64);

  // Right side info
  const rightColX = includePhoto ? 85 : 105;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('STATUS KEANGGOTAAN', rightColX, 43);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.text('Siswa Aktif Asrama', rightColX, 48.5);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('WALI ASUH PENDAMPING', rightColX, 59);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  const maxWaliAsuhLen = includePhoto ? 20 : 35;
  const safeWaliAsuhName = waliAsuhName.length > maxWaliAsuhLen ? waliAsuhName.substring(0, maxWaliAsuhLen - 2) + '...' : waliAsuhName;
  doc.text(safeWaliAsuhName, rightColX, 64);

  // Footer of metadata card
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`*Akun terdaftar sejak: ${new Date(student.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 74);

  // Section 1: BIODATA & DATA ADMINISTRASI
  let currentY = 92;
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. BIODATA & DATA ADMINISTRASI', 15, currentY);

  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 9;

  // Let's create an elegant grid layout dynamically for details
  const gridW = (width - 36) / 2;
  const gridH = 13;
  const col1X = 15;
  const col2X = 15 + gridW + 6;

  const drawGridItem = (x: number, y: number, label: string, value: string) => {
    // Outer box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, gridW, gridH, 1.5, 1.5, 'FD');

    // Label
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('Helvetica', 'normal');
    doc.text(label.toUpperCase(), x + 4, y + 4.5);

    // Value
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setFont('Helvetica', 'bold');
    const maxValLen = isF4 ? 46 : 42;
    const safeVal = value.length > maxValLen ? value.substring(0, maxValLen - 3) + '...' : value;
    doc.text(safeVal, x + 4, y + 10);
  };

  const rupiahVal = `Rp ${(student.savingsBalance || 0).toLocaleString('id-ID')}`;

  const gridItems: { label: string; value: string }[] = [];

  if (includeKkNik) {
    gridItems.push({ label: 'Nomor Induk Kependudukan (NIK)', value: student.nik || 'Belum diisi' });
    gridItems.push({ label: 'Nomor Kartu Keluarga (KK)', value: student.kk || 'Belum diisi' });
  }

  gridItems.push({ label: 'Nomor HP Orang Tua', value: student.parentPhone || 'Belum diisi' });
  gridItems.push({ label: 'Alamat Email', value: student.email || 'Belum diisi' });

  if (includeAddress) {
    gridItems.push({ label: 'Alamat Rumah / Asal', value: student.alamat || 'Belum diisi' });
  }
  gridItems.push({ label: 'Saldo Tabungan Asrama', value: rupiahVal });

  // Draw the grids in 2 columns
  gridItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? col1X : col2X;
    const y = currentY + (row * 17);
    drawGridItem(x, y, item.label, item.value);
  });

  const numRows = Math.ceil(gridItems.length / 2);
  currentY += (numRows * 17) + 4;

  // Section 2: REKAM PRESTASI & PORTOFOLIO SISWA
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. REKAM PRESTASI & PORTOFOLIO SISWA', 15, currentY);

  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 10;

  const portfolios = student.portfolio || [];

  if (portfolios.length === 0) {
    // Print empty state notice
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(251, 191, 36); // Amber 400
    doc.setLineWidth(0.25);
    doc.roundedRect(15, currentY, width - 30, 15, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber 800
    doc.setFont('Helvetica', 'bold');
    doc.text('Belum Ada Catatan Prestasi', 20, currentY + 6);
    doc.setFont('Helvetica', 'normal');
    doc.text('Siswa ini belum memiliki catatan prestasi, karya, atau penghargaan portofolio yang terdaftar di asrama.', 20, currentY + 11);
    currentY += 22;
  } else {
    // Draw table of portfolios
    portfolios.forEach((item) => {
      const splitLimit = isF4 ? 140 : 135;
      const descLines = doc.splitTextToSize(item.description, splitLimit);
      const itemHeight = 12 + (descLines.length * 4);

      // Check for page overflow
      if (currentY + itemHeight > height - 37) {
        doc.addPage();
        drawHeaderBlock(doc.getNumberOfPages());
        
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('II. REKAM PRESTASI & PORTOFOLIO SISWA (Sambungan)', 15, 33);
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 35, width - 15, 35);
        currentY = 43;
      }

      // Draw item card wrapper background
      doc.setFillColor(252, 253, 255);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(15, currentY, width - 30, itemHeight - 2, 2, 2, 'FD');

      // Date column (Left) at x=20
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      const formattedDate = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      doc.text(formattedDate, 20, currentY + 5.5);

      // Category badge
      doc.setFillColor(239, 246, 255); // Blue 50
      doc.roundedRect(20, currentY + 8, 22, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setTextColor(37, 99, 235); // Blue 600
      doc.text(item.category || 'Prestasi', 31, currentY + 11.5, { align: 'center' });

      // Title & Description (Right) at x=48
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.text(item.title, 48, currentY + 5.5);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont('Helvetica', 'normal');
      descLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 48, currentY + 11 + (lineIndex * 4));
      });

      currentY += itemHeight;
    });
  }

  // Check overflow for signature block
  if (currentY + 35 > height - 17) {
    doc.addPage();
    drawHeaderBlock(doc.getNumberOfPages());
    currentY = 40;
  } else {
    currentY = Math.max(currentY + 10, height - 57); // Push signature block to bottom of the page
  }

  // Draw signature line and details
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, currentY - 5, width - 15, currentY - 5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Dicetak secara otomatis melalui portal asrama WaliAsuhku pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, currentY - 1);

  // Left Signee: Head of Dormitory
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text('Mengetahui,', 25, currentY + 5);
  doc.text('Kepala Asrama WaliAsuhku', 25, currentY + 9);
  doc.line(25, currentY + 28, 75, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text('Ustadz Pembina Utama, M.Pd.', 25, currentY + 32);

  // Right Signee: Wali Asuh
  doc.setFont('Helvetica', 'normal');
  doc.text('Tertanda,', width - 70, currentY + 5);
  doc.text('Wali Asuh Pendamping', width - 70, currentY + 9);
  doc.line(width - 70, currentY + 28, width - 20, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text(waliAsuhName, width - 70, currentY + 32);

  // APPEND DOCUMENT PHOTOS IF REQUESTED
  if (includeDocPhotos) {
    if (student.fotoKkUrl) {
      doc.addPage();
      drawHeaderBlock(doc.getNumberOfPages());
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN: FOTO KARTU KELUARGA (KK)', 15, 33);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 35, width - 15, 35);
      
      try {
        const kkImgData = await loadImage(student.fotoKkUrl);
        if (kkImgData) {
          let format = 'JPEG';
          if (kkImgData.includes('image/png')) format = 'PNG';
          else if (kkImgData.includes('image/webp')) format = 'WEBP';
          
          doc.roundedRect(15, 42, width - 30, height - 70, 3, 3, 'D');
          doc.addImage(kkImgData, format, 16, 43, width - 32, height - 72);
        }
      } catch (e) {
        console.warn('Failed to render KK document page:', e);
      }
    }
    
    if (student.fotoBpjsUrl) {
      doc.addPage();
      drawHeaderBlock(doc.getNumberOfPages());
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN: FOTO KARTU BPJS KESEHATAN', 15, 33);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 35, width - 15, 35);
      
      try {
        const bpjsImgData = await loadImage(student.fotoBpjsUrl);
        if (bpjsImgData) {
          let format = 'JPEG';
          if (bpjsImgData.includes('image/png')) format = 'PNG';
          else if (bpjsImgData.includes('image/webp')) format = 'WEBP';
          
          doc.roundedRect(15, 42, width - 30, height - 70, 3, 3, 'D');
          doc.addImage(bpjsImgData, format, 16, 43, width - 32, height - 72);
        }
      } catch (e) {
        console.warn('Failed to render BPJS document page:', e);
      }
    }
  }

  // APPEND INITIAL ASSESSMENT IF REQUESTED
  if (includeInitialAssessment && student.initialAssessment) {
    const assess = student.initialAssessment;
    const sections = [
      {
        title: 'KATEGORI A: IDENTITAS & PROFIL KELUARGA',
        items: [
          { label: 'Nama Lengkap', value: assess.namaLengkap },
          { label: 'Nama Panggilan', value: assess.namaPanggilan },
          { label: 'Anak Ke', value: `${assess.anakKe || '-'} dari ${assess.dariBersaudara || '-'} bersaudara` },
          { label: 'Saudara Kandung/Tiri', value: assess.saudaraDetail },
          { label: 'Status Orang Tua', value: assess.statusOrangTua },
          { label: 'Pengasuhan Sebelumnya', value: assess.pengasuhanSebelumnya },
          { label: 'Pekerjaan Ayah', value: assess.pekerjaanAyah },
          { label: 'Pekerjaan Ibu', value: assess.pekerjaanIbu },
          { label: 'Bantuan Pemerintah', value: Array.isArray(assess.bantuanPemerintah) ? assess.bantuanPemerintah.join(', ') : assess.bantuanPemerintah || '-' },
        ]
      },
      {
        title: 'KATEGORI B: RIWAYAT KESEHATAN & KEBUTUHAN FISIK',
        items: [
          { label: 'Alergi Makanan', value: assess.alergiMakanan },
          { label: 'Alergi Obat', value: assess.alergiObat },
          { label: 'Alergi Lainnya', value: assess.alergiLainnya },
          { label: 'Riwayat Penyakit', value: Array.isArray(assess.riwayatPenyakit) ? assess.riwayatPenyakit.join(', ') : assess.riwayatPenyakit || '-' },
          { label: 'Keterangan Riwayat Penyakit Lainnya', value: assess.riwayatPenyakitLainnya },
          { label: 'Pengobatan Rutin', value: assess.pengobatanRutin },
          { label: 'Pola Tidur', value: Array.isArray(assess.polaTidur) ? assess.polaTidur.join(', ') : assess.polaTidur || '-' },
          { label: 'Pola Tidur Khusus', value: assess.polaTidurKhusus },
          { label: 'Makanan Disukai', value: assess.makananDisukai },
          { label: 'Makanan Tidak Disukai', value: assess.makananTidakDisukai },
          { label: 'Kebiasaan Makan', value: assess.kebiasaanMakan },
        ]
      },
      {
        title: 'KATEGORI C: KEMANDIRIAN & KEBIASAAN SEHARI-HARI',
        items: [
          { label: 'Kemandirian Mandi', value: assess.kemandirianMandi },
          { label: 'Kemandirian Merapikan Tempat Tidur', value: assess.kemandirianTempatTidur },
          { label: 'Kemandirian Mencuci Baju', value: assess.kemandirianCuciBaju },
          { label: 'Kemampuan Mengaji', value: assess.kemampuanMengaji },
          { label: 'Detail Kemampuan Mengaji', value: assess.kemampuanMengajiDetail },
          { label: 'Hafalan yang Dimiliki', value: assess.hafalanMilik },
          { label: 'Kedisiplinan Shalat', value: assess.kedisiplinanShalat },
        ]
      },
      {
        title: 'KATEGORI D: KARAKTER, EMOSI & SOSIALISASI',
        items: [
          { label: 'Sifat Utama', value: Array.isArray(assess.sifatUtama) ? assess.sifatUtama.join(', ') : assess.sifatUtama || '-' },
          { label: 'Pemicu Emosi', value: assess.pemicuEmosi },
          { label: 'Reaksi Marah', value: assess.reaksiMarah },
          { label: 'Cara Menangani', value: assess.caraMenangani },
          { label: 'Riwayat Trauma', value: assess.riwayatTrauma },
        ]
      },
      {
        title: 'KATEGORI E: AKADEMIK, MINAT & HOBI',
        items: [
          { label: 'Mata Pelajaran Disukai', value: assess.mapelDisukai },
          { label: 'Mata Pelajaran Ditakuti', value: assess.mapelDitakuti },
          { label: 'Hobi / Kegemaran', value: assess.hobiKegemaran },
          { label: 'Bakat / Potensi Menonjol', value: assess.bakatMenonjol },
        ]
      },
      {
        title: 'KATEGORI F: HARAPAN ORANG TUA & KONTAK DARURAT',
        items: [
          { label: 'Harapan 1 (Spritual/Karakter)', value: assess.harapan1 },
          { label: 'Harapan 2 (Akademik/Bakat)', value: assess.harapan2 },
          { label: 'Harapan 3 (Kemampuan Hidup)', value: assess.harapan3 },
          { label: 'Nama Kontak Alternatif', value: assess.namaKontakAlternatif },
          { label: 'Hubungan dengan Kontak', value: assess.hubunganKontakAlternatif },
          { label: 'No HP Kontak Alternatif', value: assess.noHpKontakAlternatif },
        ]
      }
    ];

    doc.addPage();
    drawHeaderBlock(doc.getNumberOfPages());
    
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('LAMPIRAN: HASIL ASESMEN AWAL PESERTA DIDIK', 15, 33);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 35, width - 15, 35);
    
    let currentY = 41;
    
    sections.forEach((sec) => {
      const bannerHeight = 8;
      if (currentY + bannerHeight + 15 > height - 25) {
        doc.addPage();
        drawHeaderBlock(doc.getNumberOfPages());
        currentY = 33;
      }
      
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(15, currentY, width - 30, bannerHeight, 1.5, 1.5, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFont('Helvetica', 'bold');
      doc.text(sec.title, 19, currentY + bannerHeight / 2 + 1);
      
      currentY += bannerHeight + 4;
      
      sec.items.forEach((item) => {
        const valStr = item.value || 'Belum diisi / Tidak ada';
        const itemWidth = width - 30;
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        const labelLines = doc.splitTextToSize(item.label.toUpperCase(), itemWidth);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        const valLines = doc.splitTextToSize(valStr, itemWidth - 8);
        
        const labelHeight = labelLines.length * 4;
        const valHeight = valLines.length * 4;
        const itemHeight = labelHeight + valHeight + 6;
        
        if (currentY + itemHeight > height - 25) {
          doc.addPage();
          drawHeaderBlock(doc.getNumberOfPages());
          currentY = 33;
          
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(15, currentY, width - 30, bannerHeight, 1.5, 1.5, 'F');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.setFont('Helvetica', 'bold');
          doc.text(`${sec.title} (Sambungan)`, 19, currentY + bannerHeight / 2 + 1);
          currentY += bannerHeight + 4;
        }
        
        doc.setFillColor(252, 253, 255);
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(15, currentY, itemWidth, itemHeight - 2, 1.5, 1.5, 'FD');
        
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.setFont('Helvetica', 'bold');
        labelLines.forEach((line: string, idx: number) => {
          doc.text(line, 19, currentY + 3.5 + idx * 3.5);
        });
        
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85); // Slate 700
        doc.setFont('Helvetica', 'normal');
        valLines.forEach((line: string, idx: number) => {
          doc.text(line, 19, currentY + labelHeight + 3 + idx * 3.8);
        });
        
        currentY += itemHeight;
      });
      
      currentY += 4;
    });
  }

  const safeStudentNameFile = student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`portofolio_siswa_${safeStudentNameFile}.pdf`);
};

/**
 * Generate a beautiful A4/F4 Monthly Development Report PDF for Parents
 * (Excludes savings balances and tahfidz as requested)
 */
export const generateStudentMonthlyReportPDF = async (student: User, users: User[], options?: PDFExportOptions) => {
  const {
    paperSize = 'f4',
    includePhoto = true,
    includeAddress = true,
    includeKkNik = true,
    includeDocPhotos = false,
    selectedMonthYear,
    customHealthStatus,
    customHealthNotes,
    customMonthlyActivities,
    customCharacterNotes,
  } = options || {};

  const isF4 = paperSize === 'f4';
  const width = isF4 ? 215 : 210;
  const height = isF4 ? 330 : 297;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isF4 ? [215, 330] : 'a4'
  });

  const imgData = student.fotoUrl ? await loadImage(student.fotoUrl) : '';
  const waliAsuh = users.find(u => u.id === student.waliAsuhId && u.role === 'wali_asuh');
  const waliAsuhName = waliAsuh ? waliAsuh.name : 'Belum ditentukan';
  
  const currentMonthYear = selectedMonthYear || new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const drawHeaderBlock = (pageNumber: number) => {
    // Top colored band
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, width, 25, 'F');
    
    // Header Accent Line
    doc.setFillColor(124, 58, 237); // Violet 600
    doc.rect(0, 25, width, 2, 'F');

    // Title & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('LAPORAN PERKEMBANGAN BULANAN SISWA', 15, 10.5);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(224, 242, 254); // Light blue
    doc.text('Bentuk Pertanggungjawaban Pembinaan & Pengasuhan Asrama WaliAsuhku', 15, 16);

    // Prominent Period Badge on top right of header
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(width - 80, 4, 65, 17, 2, 2, 'F');
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('PERIODE LAPORAN BULANAN', width - 76, 9);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(currentMonthYear.toUpperCase(), width - 76, 16);

    // Page indicator
    doc.setFontSize(7.5);
    doc.setTextColor(224, 242, 254);
    doc.text(`Halaman ${pageNumber}`, width - 15, 12, { align: 'right' });
  };

  // Page 1 Setup
  drawHeaderBlock(1);

  // Profile photo layout
  const photoW = 40;
  const photoH = 45;
  const photoX = width - 55;
  const photoY = 35;

  const metaW = includePhoto ? (width - 78) : (width - 30);
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(15, 35, metaW, 45, 2, 2, 'F');

  if (includePhoto) {
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.35);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'D');

    if (imgData) {
      try {
        let format = 'JPEG';
        if (imgData.includes('image/png')) format = 'PNG';
        else if (imgData.includes('image/webp')) format = 'WEBP';
        doc.addImage(imgData, format, photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
      } catch (e) {
        console.warn('Monthly report photo render failed:', e);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 1.5, 1.5, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('FOTO', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
      }
    } else {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 1.5, 1.5, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('FOTO SISWA', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
    }
  }

  // Metadata Fields
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'normal');
  doc.text('NAMA LENGKAP SISWA', 20, 43);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  const nameMaxLen = includePhoto ? 25 : 45;
  const safeStudentName = student.name.length > nameMaxLen ? student.name.substring(0, nameMaxLen - 2) + '...' : student.name;
  doc.text(safeStudentName, 20, 48.5);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('KELOMPOK / ASRAMA', 20, 59);
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.setFont('Helvetica', 'bold');
  doc.text(student.category || 'Umum', 20, 64);

  // Right column of Metadata
  const rightColX = includePhoto ? 85 : 105;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('STATUS KEANGGOTAAN', rightColX, 43);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.text('Siswa Aktif Asrama', rightColX, 48.5);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('PEMBINA / WALI ASUH', rightColX, 59);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  const maxWaliAsuhLen = includePhoto ? 20 : 35;
  const safeWaliAsuhName = waliAsuhName.length > maxWaliAsuhLen ? waliAsuhName.substring(0, maxWaliAsuhLen - 2) + '...' : waliAsuhName;
  doc.text(safeWaliAsuhName, rightColX, 64);

  // Footer of metadata card
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`*Laporan resmi untuk Orang Tua dari asrama WaliAsuhku - Periode ${currentMonthYear}`, 20, 74);

  // Section 1: DATA ADMINISTRASI & IDENTITAS
  let currentY = 92;
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. IDENTITAS & BIODATA SISWA', 15, currentY);

  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 9;

  // Let's create an elegant grid layout dynamically for details
  const gridW = (width - 36) / 2;
  const gridH = 13;
  const col1X = 15;
  const col2X = 15 + gridW + 6;

  const drawGridItem = (x: number, y: number, label: string, value: string) => {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, gridW, gridH, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('Helvetica', 'normal');
    doc.text(label.toUpperCase(), x + 4, y + 4.5);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('Helvetica', 'bold');
    const maxValLen = isF4 ? 46 : 42;
    const safeVal = value.length > maxValLen ? value.substring(0, maxValLen - 3) + '...' : value;
    doc.text(safeVal, x + 4, y + 10);
  };

  const gridItems: { label: string; value: string }[] = [];

  if (includeKkNik) {
    gridItems.push({ label: 'NIK (Nomor Induk Kependudukan)', value: student.nik || 'Belum diisi' });
    gridItems.push({ label: 'No. Kartu Keluarga', value: student.kk || 'Belum diisi' });
  }

  gridItems.push({ label: 'Nomor HP Orang Tua', value: student.parentPhone || 'Belum diisi' });
  gridItems.push({ label: 'Alamat Email Wali', value: student.email || 'Belum diisi' });

  if (includeAddress) {
    gridItems.push({ label: 'Alamat Lengkap Asal', value: student.alamat || 'Belum diisi' });
  }
  gridItems.push({ label: 'Tanggal Terbit Laporan', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) });

  // Draw the grids in 2 columns
  gridItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? col1X : col2X;
    const y = currentY + (row * 17);
    drawGridItem(x, y, item.label, item.value);
  });

  const numRows = Math.ceil(gridItems.length / 2);
  currentY += (numRows * 17) + 4;

  // Section 2: PERKEMBANGAN KESEHATAN SISWA
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. PERKEMBANGAN KESEHATAN SISWA', 15, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 10;

  // Status Kesehatan Badge
  const hStatus = customHealthStatus || student.healthStatus || 'Sangat Sehat';
  const hNotes = customHealthNotes || student.healthNotes || 'Siswa dalam kondisi sangat baik dan fit. Selalu menjaga kebersihan diri serta lingkungan asrama.';

  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(74, 222, 128); // Green 400
  if (hStatus === 'Kurang Sehat' || hStatus === 'Sakit') {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(248, 113, 113); // Red 400
  } else if (hStatus === 'Pemulihan' || hStatus === 'Sehat dengan Catatan') {
    doc.setFillColor(254, 253, 236); // Yellow 50
    doc.setDrawColor(253, 224, 71); // Yellow 400
  }
  
  doc.roundedRect(15, currentY, width - 30, 24, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'bold');
  doc.text('STATUS KESEHATAN UMUM BULAN INI', 20, currentY + 6);

  doc.setFontSize(10.5);
  doc.setTextColor(22, 101, 52); // Green 800
  if (hStatus === 'Kurang Sehat' || hStatus === 'Sakit') {
    doc.setTextColor(153, 27, 27); // Red 800
  } else if (hStatus === 'Pemulihan' || hStatus === 'Sehat dengan Catatan') {
    doc.setTextColor(133, 77, 14); // Yellow 800
  }
  doc.text(hStatus.toUpperCase(), 20, 11.5 + currentY);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  const splitHNotes = doc.splitTextToSize(hNotes, width - 40);
  doc.text(splitHNotes, 20, 16.5 + currentY);

  currentY += 31;

  // Section 3: DAFTAR KEGIATAN & PEMBINAAN ASRAMA
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('III. DAFTAR KEGIATAN & PEMBINAAN ASRAMA', 15, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 10;

  const actNotes = customMonthlyActivities || student.monthlyActivities || 'Siswa aktif mengikuti rangkaian ibadah wajib berjamaah, program kebersihan berkala di asrama, kajian keislaman malam hari, serta bimbingan belajar rutin mingguan.';
  
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(241, 245, 249);
  const splitActNotes = doc.splitTextToSize(actNotes, width - 40);
  const actHeight = 10 + (splitActNotes.length * 4.2);

  doc.roundedRect(15, currentY, width - 30, actHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.text('KEGIATAN & PEMBINAAN YANG DIIKUTI:', 20, currentY + 6);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text(splitActNotes, 20, currentY + 11.5);

  currentY += actHeight + 8;

  // Section 4: PERKEMBANGAN KARAKTER & SIKAP SISWA
  if (currentY + 45 > height - 17) {
    doc.addPage();
    drawHeaderBlock(2);
    currentY = 40;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IV. PERKEMBANGAN KARAKTER & SIKAP', 15, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY + 3, width - 15, currentY + 3);

  currentY += 10;

  const charNotes = customCharacterNotes || student.characterNotes || 'Menunjukkan sikap yang sopan santun kepada pengurus, rukun dengan sesama teman satu kamar, dan selalu tanggap dalam melaksanakan arahan dari Wali Asuh.';
  
  doc.setFillColor(253, 244, 255); // Purple 50
  doc.setDrawColor(240, 215, 253);
  const splitCharNotes = doc.splitTextToSize(charNotes, width - 40);
  const charHeight = 10 + (splitCharNotes.length * 4.2);

  doc.roundedRect(15, currentY, width - 30, charHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(112, 26, 117); // Purple 900
  doc.setFont('Helvetica', 'bold');
  doc.text('CATATAN PERKEMBANGAN KARAKTER & AKHLAK:', 20, currentY + 6);

  doc.setFontSize(8);
  doc.setTextColor(112, 26, 117);
  doc.setFont('Helvetica', 'normal');
  doc.text(splitCharNotes, 20, currentY + 11.5);

  currentY += charHeight;

  // Check overflow for signatures
  if (currentY + 42 > height - 17) {
    doc.addPage();
    drawHeaderBlock(doc.getNumberOfPages());
    currentY = 40;
  } else {
    currentY = Math.max(currentY + 10, height - 52); // Align cleanly near bottom
  }

  // Draw signature line and details
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, currentY - 5, width - 15, currentY - 5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Dicetak secara otomatis melalui portal asrama WaliAsuhku pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, currentY - 1);

  // Signee: Wali Asuh ONLY
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text('Tertanda / Mengetahui,', width - 75, currentY + 5);
  doc.text('Wali Asuh Pendamping', width - 75, currentY + 9);
  doc.line(width - 75, currentY + 28, width - 20, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text(waliAsuhName, width - 75, currentY + 32);

  // APPEND DOCUMENT PHOTOS IF REQUESTED
  if (includeDocPhotos) {
    if (student.fotoKkUrl) {
      doc.addPage();
      drawHeaderBlock(doc.getNumberOfPages());
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN: FOTO KARTU KELUARGA (KK)', 15, 33);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 35, width - 15, 35);
      
      try {
        const kkImgData = await loadImage(student.fotoKkUrl);
        if (kkImgData) {
          let format = 'JPEG';
          if (kkImgData.includes('image/png')) format = 'PNG';
          else if (kkImgData.includes('image/webp')) format = 'WEBP';
          
          doc.roundedRect(15, 42, width - 30, height - 70, 3, 3, 'D');
          doc.addImage(kkImgData, format, 16, 43, width - 32, height - 72);
        }
      } catch (e) {
        console.warn('Failed to render KK document page:', e);
      }
    }
    
    if (student.fotoBpjsUrl) {
      doc.addPage();
      drawHeaderBlock(doc.getNumberOfPages());
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN: FOTO KARTU BPJS KESEHATAN', 15, 33);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 35, width - 15, 35);
      
      try {
        const bpjsImgData = await loadImage(student.fotoBpjsUrl);
        if (bpjsImgData) {
          let format = 'JPEG';
          if (bpjsImgData.includes('image/png')) format = 'PNG';
          else if (bpjsImgData.includes('image/webp')) format = 'WEBP';
          
          doc.roundedRect(15, 42, width - 30, height - 70, 3, 3, 'D');
          doc.addImage(bpjsImgData, format, 16, 43, width - 32, height - 72);
        }
      } catch (e) {
        console.warn('Failed to render BPJS document page:', e);
      }
    }
  }

  const safeStudentNameFile = student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeMonthYear = currentMonthYear.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`laporan_bulanan_${safeStudentNameFile}_${safeMonthYear}.pdf`);
};

export const generateChecklistPDF = async (checklist: ActivityChecklist, users: User[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const waliAsuh = users.find(u => u.id === checklist.waliAsuhId && u.role === 'wali_asuh');
  const waliAsuhName = waliAsuh ? waliAsuh.name : 'Wali Asuh Pendamping';

  const totalStudents = checklist.students.length;
  const sudahCount = checklist.students.filter(s => s.status === 'sudah').length;
  const belumCount = checklist.students.filter(s => s.status === 'belum').length;
  const completionPercentage = totalStudents > 0 ? Math.round((sudahCount / totalStudents) * 100) : 0;

  // 1. Header Block
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 28, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN CEKLIST KEGIATAN SISWA', 15, 12);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Laporan Pencatatan Partisipasi dan Kehadiran Siswa Asrama WaliAsuhku', 15, 18);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('ASRAMA WALIASUHKU', 195, 12, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Sistem Informasi Portofolio', 195, 18, { align: 'right' });

  // 2. Info Section
  let currentY = 42;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(15, currentY, 180, 26, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('NAMA KEGIATAN / AGENDA', 22, currentY + 7);
  doc.text('TANGGAL KEGIATAN', 110, currentY + 7);
  doc.text('WALI ASUH PENDAMPING', 110, currentY + 18);

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(checklist.title, 22, currentY + 15);
  
  doc.setFontSize(9);
  const formattedDate = new Date(checklist.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(formattedDate, 110, currentY + 12);
  doc.text(waliAsuhName, 110, currentY + 23);

  // 3. Summary Statistics Cards
  currentY += 32;
  const cardW = 42;
  const cardH = 18;
  const cardSpacing = 4;
  const startX = 15;

  // Stat 1: Total Siswa
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  doc.roundedRect(startX, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(30, 58, 138); // Blue 900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('TOTAL SISWA', startX + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${totalStudents} Orang`, startX + 4, currentY + 13);

  // Stat 2: Sudah Selesai
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.roundedRect(startX + cardW + cardSpacing, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(21, 128, 61); // Green 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('SUDAH SELESAI (SUDAH)', startX + cardW + cardSpacing + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${sudahCount} Siswa`, startX + cardW + cardSpacing + 4, currentY + 13);

  // Stat 3: Belum Selesai
  doc.setFillColor(254, 242, 242); // Red 50
  doc.setDrawColor(254, 226, 226); // Red 200
  doc.roundedRect(startX + (cardW + cardSpacing) * 2, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(185, 28, 28); // Red 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BELUM SELESAI (BELUM)', startX + (cardW + cardSpacing) * 2 + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${belumCount} Siswa`, startX + (cardW + cardSpacing) * 2 + 4, currentY + 13);

  // Stat 4: Tingkat Penyelesaian
  doc.setFillColor(250, 245, 255); // Purple 50
  doc.setDrawColor(233, 213, 255); // Purple 200
  doc.roundedRect(startX + (cardW + cardSpacing) * 3, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(109, 40, 217); // Purple 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PERSENTASE SELESAI', startX + (cardW + cardSpacing) * 3 + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(`${completionPercentage}%`, startX + (cardW + cardSpacing) * 3 + 4, currentY + 13);

  // 4. Checklist Table Headers
  currentY += 26;
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(15, currentY, 180, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NO', 20, currentY + 5);
  doc.text('NAMA LENGKAP SISWA (ANAK ASUH)', 40, currentY + 5);
  doc.text('STATUS KEIKUTSERTAAN', 145, currentY + 5, { align: 'center' });

  // 5. Checklist Table Content Row-by-Row
  currentY += 7.5;
  doc.setLineWidth(0.2);
  checklist.students.forEach((item, index) => {
    // Check page overflow
    if (currentY + 10 > 275) {
      doc.addPage();
      
      // Page Title
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`CHECKLIST: ${checklist.title}`, 15, 9);
      
      doc.setFontSize(7);
      doc.text(`Halaman ${doc.getNumberOfPages()}`, 195, 9, { align: 'right' });

      currentY = 22;
      
      // Re-draw table header on new page
      doc.setFillColor(79, 70, 229);
      doc.rect(15, currentY, 180, 7.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('NO', 20, currentY + 5);
      doc.text('NAMA LENGKAP SISWA (ANAK ASUH)', 40, currentY + 5);
      doc.text('STATUS KEIKUTSERTAAN', 145, currentY + 5, { align: 'center' });
      
      currentY += 7.5;
    }

    // Row background (alternating light slate)
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(15, currentY, 180, 7.5, 'F');

    // Row borders
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 7.5, 195, currentY + 7.5);

    // Text data
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${index + 1}`, 21, currentY + 5);
    doc.text(item.studentName.toUpperCase(), 40, currentY + 5);

    // Status tag cell
    const isSudah = item.status === 'sudah';
    if (isSudah) {
      // Small green tag background
      doc.setFillColor(220, 252, 231); // Light Green
      doc.roundedRect(130, currentY + 1.25, 30, 5, 0.8, 0.8, 'F');
      doc.setTextColor(21, 128, 61); // Green Text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('✔ SUDAH', 145, currentY + 4.75, { align: 'center' });
    } else {
      // Small red tag background
      doc.setFillColor(254, 226, 226); // Light Red
      doc.roundedRect(130, currentY + 1.25, 30, 5, 0.8, 0.8, 'F');
      doc.setTextColor(185, 28, 28); // Red Text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('✘ BELUM', 145, currentY + 4.75, { align: 'center' });
    }

    currentY += 7.5;
  });

  // 6. Signatures block
  if (currentY + 45 > 280) {
    doc.addPage();
    
    // Page Title
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`CHECKLIST: ${checklist.title}`, 15, 9);
    
    doc.setFontSize(7);
    doc.text(`Halaman ${doc.getNumberOfPages()}`, 195, 9, { align: 'right' });
    
    currentY = 25;
  } else {
    currentY = Math.max(currentY + 12, 235);
  }

  // Footer / printed timestamp
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.line(15, currentY - 4, 195, currentY - 4);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Laporan diverifikasi dan dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.`, 15, currentY - 0.5);

  // Signatures
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text('Mengetahui,', 25, currentY + 5);
  doc.text('Kepala Asrama WaliAsuhku', 25, currentY + 9);
  doc.line(25, currentY + 28, 75, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text('Ustadz Pembina Utama, M.Pd.', 25, currentY + 32);

  doc.setFont('Helvetica', 'normal');
  doc.text('Tertanda,', 140, currentY + 5);
  doc.text('Wali Asuh Pendamping', 140, currentY + 9);
  doc.line(140, currentY + 28, 190, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text(waliAsuhName, 140, currentY + 32);

  const safeTitle = checklist.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeDate = checklist.date.replace(/[^a-z0-9]/g, '_');
  doc.save(`checklist_${safeTitle}_${safeDate}.pdf`);
};

export const generateEventChecklistPDF = async (checklist: EventChecklist, users: User[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const waliAsuh = users.find(u => u.id === checklist.waliAsuhId && u.role === 'wali_asuh');
  const waliAsuhName = waliAsuh ? waliAsuh.name : 'Wali Asuh Pendamping';

  const totalStudents = checklist.students.length;

  // Build resolved options list
  const options: EventChecklistOption[] = checklist.options && checklist.options.length > 0
    ? checklist.options
    : [
        { id: 'opt_sudah', label: checklist.sudahLabel || 'SUDAH / IKUT', isNegative: false },
        { id: 'opt_belum', label: checklist.belumLabel || 'BELUM / TIDAK IKUT', isNegative: true }
      ];

  // Helper to find ALL selected options for a student (supporting multi-selection)
  const getStudentOptions = (s: any): EventChecklistOption[] => {
    if (s.selectedOptionIds && Array.isArray(s.selectedOptionIds) && s.selectedOptionIds.length > 0) {
      const matched = options.filter(o => s.selectedOptionIds.includes(o.id));
      if (matched.length > 0) return matched;
    }
    if (s.selectedOptionId) {
      const found = options.find(o => o.id === s.selectedOptionId);
      if (found) return [found];
    }
    if (s.status === 'sudah') return [options[0]];
    if (s.status === 'belum') return [options[options.length - 1]];
    return [options[0]];
  };

  // Color mapping helper for distinct event/lomba colors
  const getOptionColorTheme = (opt: EventChecklistOption, idx: number) => {
    const labelLower = opt.label.toLowerCase();

    // Negative / Tidak Ikut option -> Rose / Red
    if (opt.isNegative || labelLower.includes('tidak') || labelLower.includes('absen') || labelLower.includes('batal')) {
      return { bg: [254, 226, 226], text: [185, 28, 28], border: [254, 202, 202] };
    }

    // Estafet / Lari / Sprint / Amber / Orange -> ORANGE
    if (labelLower.includes('estafet') || labelLower.includes('lari') || labelLower.includes('sprint')) {
      return { bg: [255, 237, 213], text: [194, 65, 12], border: [254, 215, 170] };
    }

    // Voli / Volley / Futsal / Bola -> SKY BLUE
    if (labelLower.includes('voly') || labelLower.includes('voli') || labelLower.includes('futsal') || labelLower.includes('bola')) {
      return { bg: [224, 242, 254], text: [3, 105, 161], border: [186, 230, 253] };
    }

    // Menyanyi / Nyanyi / Nasyid / Musik -> EMERALD GREEN
    if (labelLower.includes('menyanyi') || labelLower.includes('nyanyi') || labelLower.includes('nasyid') || labelLower.includes('musik')) {
      return { bg: [220, 252, 231], text: [21, 128, 61], border: [187, 247, 208] };
    }

    // Seni / Lukis / Tari / Gambar -> SOFT PURPLE
    if (labelLower.includes('seni') || labelLower.includes('lukis') || labelLower.includes('tari') || labelLower.includes('gambar') || labelLower.includes('kaligrafi')) {
      return { bg: [243, 232, 255], text: [126, 34, 206], border: [233, 213, 255] };
    }

    // Explicit color matching
    if (opt.color === 'amber' || opt.color === 'orange') {
      return { bg: [255, 237, 213], text: [194, 65, 12], border: [254, 215, 170] };
    }

    if (opt.color === 'blue') {
      return { bg: [224, 242, 254], text: [3, 105, 161], border: [186, 230, 253] };
    }

    if (opt.color === 'emerald' || opt.color === 'green') {
      return { bg: [220, 252, 231], text: [21, 128, 61], border: [187, 247, 208] };
    }

    if (opt.color === 'purple') {
      return { bg: [243, 232, 255], text: [126, 34, 206], border: [233, 213, 255] };
    }

    if (opt.color === 'indigo') {
      return { bg: [224, 231, 255], text: [67, 56, 202], border: [199, 210, 254] };
    }

    // Fallback palette cycling distinct colors
    const fallbackPalette = [
      { bg: [255, 237, 213], text: [194, 65, 12], border: [254, 215, 170] }, // Orange
      { bg: [224, 242, 254], text: [3, 105, 161], border: [186, 230, 253] }, // Blue
      { bg: [220, 252, 231], text: [21, 128, 61], border: [187, 247, 208] }, // Green
      { bg: [243, 232, 255], text: [126, 34, 206], border: [233, 213, 255] }, // Purple
      { bg: [254, 243, 199], text: [180, 83, 9], border: [253, 230, 138] },  // Amber
    ];
    return fallbackPalette[idx % fallbackPalette.length];
  };

  const participantCount = checklist.students.filter(s => {
    const opts = getStudentOptions(s);
    return opts.some(o => !o.isNegative);
  }).length;

  const completionPercentage = totalStudents > 0 ? Math.round((participantCount / totalStudents) * 100) : 0;

  // 1. Header Block
  doc.setFillColor(21, 128, 61); // Green 700 / Amber
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 28, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN CEKLIST ACARA & LOMBA', 15, 12);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(236, 253, 245);
  doc.text('Laporan Partisipasi Acara Khusus dan Perlombaan Siswa WaliAsuhku', 15, 18);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('ASRAMA WALIASUHKU', 195, 12, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  doc.text('Sistem Portofolio & Kegiatan', 195, 18, { align: 'right' });

  // 2. Info Section
  let currentY = 42;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(15, currentY, 180, 26, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('NAMA ACARA / PERLOMBAAN', 22, currentY + 7);
  doc.text('TANGGAL PELAKSANAAN', 110, currentY + 7);
  doc.text('WALI ASUH PENDAMPING', 110, currentY + 18);

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(checklist.title, 22, currentY + 15);
  
  doc.setFontSize(9);
  const formattedDate = new Date(checklist.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(formattedDate, 110, currentY + 12);
  doc.text(waliAsuhName, 110, currentY + 23);

  // 3. Summary Statistics Cards
  currentY += 32;
  const cardW = 42;
  const cardH = 18;
  const cardSpacing = 4;
  const startX = 15;

  // Stat 1: Total Siswa
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(startX, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(30, 58, 138);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TOTAL SISWA', startX + 4, currentY + 5);
  doc.setFontSize(10.5);
  doc.text(`${totalStudents} Orang`, startX + 4, currentY + 13);

  // Stat 2: Total Partisipan
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(startX + cardW + cardSpacing, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(21, 128, 61);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TOTAL PARTISIPAN', startX + cardW + cardSpacing + 4, currentY + 5);
  doc.setFontSize(10.5);
  doc.text(`${participantCount} Siswa`, startX + cardW + cardSpacing + 4, currentY + 13);

  // Stat 3: Total Kategori Pilihan
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(startX + (cardW + cardSpacing) * 2, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(109, 40, 217);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('KATEGORI PILIHAN', startX + (cardW + cardSpacing) * 2 + 4, currentY + 5);
  doc.setFontSize(10.5);
  doc.text(`${options.length} Pilihan`, startX + (cardW + cardSpacing) * 2 + 4, currentY + 13);

  // Stat 4: Persentase Keikutsertaan
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(startX + (cardW + cardSpacing) * 3, currentY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('PERSENTASE PARTISIPASI', startX + (cardW + cardSpacing) * 3 + 4, currentY + 5);
  doc.setFontSize(10.5);
  doc.text(`${completionPercentage}%`, startX + (cardW + cardSpacing) * 3 + 4, currentY + 13);

  // 4. Checklist Table Headers
  currentY += 26;
  doc.setFillColor(21, 128, 61);
  doc.rect(15, currentY, 180, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NO', 20, currentY + 5);
  doc.text('NAMA LENGKAP SISWA (ANAK ASUH)', 40, currentY + 5);
  doc.text('PILIHAN STATUS ACARA / LOMBA (MULTI-PILiHAN)', 145, currentY + 5, { align: 'center' });

  // 5. Checklist Table Content Row-by-Row
  currentY += 7.5;
  doc.setLineWidth(0.2);

  checklist.students.forEach((item, index) => {
    const selectedOpts = getStudentOptions(item);
    
    // Determine row height dynamically based on number of selected options
    const rowHeight = selectedOpts.length > 2 ? 12 : 9;

    if (currentY + rowHeight > 275) {
      doc.addPage();
      
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`CEKLIST ACARA: ${checklist.title}`, 15, 9);
      
      doc.setFontSize(7);
      doc.text(`Halaman ${doc.getNumberOfPages()}`, 195, 9, { align: 'right' });

      currentY = 22;
      
      doc.setFillColor(21, 128, 61);
      doc.rect(15, currentY, 180, 7.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('NO', 20, currentY + 5);
      doc.text('NAMA LENGKAP SISWA (ANAK ASUH)', 40, currentY + 5);
      doc.text('PILIHAN STATUS ACARA / LOMBA (MULTI-PILIHAN)', 145, currentY + 5, { align: 'center' });
      
      currentY += 7.5;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(15, currentY, 180, rowHeight, 'F');

    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${index + 1}`, 21, currentY + (rowHeight / 2) + 1.2);
    doc.setFont('Helvetica', 'bold');
    doc.text(item.studentName.toUpperCase(), 40, currentY + (rowHeight / 2) + 1.2);

    // Draw badges for all selected options
    let badgeX = 105;
    selectedOpts.forEach((opt) => {
      const optionIndex = options.findIndex(o => o.id === opt.id);
      const colorTheme = getOptionColorTheme(opt, optionIndex >= 0 ? optionIndex : 0);

      const optLabel = opt.label.toUpperCase();
      const prefix = opt.isNegative ? '✘ ' : '✔ ';
      const fullText = `${prefix}${optLabel}`;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      const textWidth = doc.getTextWidth(fullText);
      const badgeW = Math.min(Math.max(textWidth + 5, 24), 85);

      if (badgeX + badgeW > 192) {
        // Move to next line if overflowing
        badgeX = 105;
      }

      doc.setFillColor(colorTheme.bg[0], colorTheme.bg[1], colorTheme.bg[2]);
      doc.setDrawColor(colorTheme.border[0], colorTheme.border[1], colorTheme.border[2]);
      doc.roundedRect(badgeX, currentY + (rowHeight / 2) - 2.5, badgeW, 5, 0.8, 0.8, 'FD');

      doc.setTextColor(colorTheme.text[0], colorTheme.text[1], colorTheme.text[2]);
      doc.text(fullText, badgeX + (badgeW / 2), currentY + (rowHeight / 2) + 1, { align: 'center' });

      badgeX += badgeW + 2;
    });

    currentY += rowHeight;
  });

  // 6. Signatures block (Wali Asuh Pendamping Only + Automated QR Code Verification)
  if (currentY + 50 > 280) {
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`CEKLIST ACARA: ${checklist.title}`, 15, 9);
    
    doc.setFontSize(7);
    doc.text(`Halaman ${doc.getNumberOfPages()}`, 195, 9, { align: 'right' });
    
    currentY = 25;
  } else {
    currentY = Math.max(currentY + 12, 230);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.line(15, currentY - 4, 195, currentY - 4);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Laporan acara diverifikasi dan dicetak secara otomatis pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`, 15, currentY - 0.5);

  // Signature Block for Wali Asuh Pendamping ONLY
  const sigX = 135;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.text('Tertanda & Diberitahukan,', sigX, currentY + 5);
  doc.setFont('Helvetica', 'bold');
  doc.text('Wali Asuh Pendamping', sigX, currentY + 9.5);

  // Generate Automatic QR Verification Barcode
  try {
    const qrDataStr = `VERIFIKASI WALIASUHKU\nAcara: ${checklist.title}\nTanggal: ${formattedDate}\nWali Asuh: ${waliAsuhName}\nTotal Siswa: ${totalStudents}\nID: ${checklist.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrDataStr, { margin: 1, width: 150 });
    
    // Draw QR Code Image beside signature line
    doc.addImage(qrDataUrl, 'PNG', sigX - 25, currentY + 10, 22, 22);

    doc.setFontSize(6);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Scan QR untuk Verifikasi', sigX - 25, currentY + 33);
  } catch (err) {
    console.warn('QR generation error:', err);
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(sigX, currentY + 30, 195, currentY + 30);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(waliAsuhName, sigX, currentY + 34);

  const safeTitle = checklist.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeDate = checklist.date.replace(/[^a-z0-9]/g, '_');
  doc.save(`ceklist_acara_${safeTitle}_${safeDate}.pdf`);
};

/**
 * Generate official PDF for Jadwal Pembagian Shift Wali Asuh (Agustus 2026)
 * Landscape A4 format matching the official institutional schedule document
 */
export const generateJadwalWaliAsuhPDF = async () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  }); // 297mm x 210mm

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Official Kop Surat Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text('KEMENTERIAN SOSIAL REPUBLIK INDONESIA', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.text('PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', pageWidth / 2, 16.5, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // emerald 600
  doc.text('SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI', pageWidth / 2, 21, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Gedung Balai Pengembangan Kompetensi Aparatur Sipil Negara', pageWidth / 2, 25, { align: 'center' });
  doc.text('Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri, Jawa Timur | Pos-el: srma24kediri@gmail.com Kode Pos: 64152', pageWidth / 2, 28.5, { align: 'center' });

  // Double Line Separator
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(12, 31, pageWidth - 12, 31);
  doc.setLineWidth(0.2);
  doc.line(12, 32, pageWidth - 12, 32);

  // 2. Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('JADWAL PEMBAGIAN SHIF WALI ASUH', pageWidth / 2, 37.5, { align: 'center' });
  doc.text('AGUSTUS 2026', pageWidth / 2, 42, { align: 'center' });

  // 3. Matrix Table
  const startX = 12;
  let currentY = 46;

  const colWidthNo = 7;
  const colWidthName = 38;
  const colWidthDay = 5.6; // 31 days * 5.6 = 173.6mm
  const colWidthStat = 5.2; // 10 stats * 5.2 = 52mm
  // Total width = 7 + 38 + 173.6 + 52 = 270.6mm (Leaves ~13mm margins left & right)

  const rowHeight = 4.8;

  // Table Header
  doc.setFillColor(30, 41, 59); // Dark Slate 800
  doc.rect(startX, currentY, 270.6, rowHeight, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);

  doc.text('No', startX + (colWidthNo / 2), currentY + 3.2, { align: 'center' });
  doc.text('Nama Wali Asuh', startX + colWidthNo + 2, currentY + 3.2);

  // Day Headers 1..31
  let xPos = startX + colWidthNo + colWidthName;
  for (let d = 1; d <= 31; d++) {
    doc.text(String(d), xPos + (colWidthDay / 2), currentY + 3.2, { align: 'center' });
    xPos += colWidthDay;
  }

  // Stat Headers
  const statHeaders = ['P', 'FUL', 'S', 'M', 'LP', 'OFF', 'P1', 'P2', 'P3', 'JK'];
  statHeaders.forEach(sh => {
    doc.text(sh, xPos + (colWidthStat / 2), currentY + 3.2, { align: 'center' });
    xPos += colWidthStat;
  });

  currentY += rowHeight;

  // Schedule Data
  const schedules = [
    { id: 1, name: "Suhariyono", shifts: ["M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 } },
    { id: 2, name: "Rindani", shifts: ["LP", "O", "P2", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"], totals: { P: 8, FUL: 12, S: 3, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 199 } },
    { id: 3, name: "Hariadi", shifts: ["O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M"], totals: { P: 6, FUL: 14, S: 4, M: 3, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 214 } },
    { id: 4, name: "Moch. Chabib", shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP"], totals: { P: 7, FUL: 13, S: 4, M: 4, LP: 3, OFF: 0, P1: 7, P2: 0, P3: 0, JK: 215 } },
    { id: 5, name: "Dewi Askinu", shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 } },
    { id: 6, name: "Aris Mahmud Syafi'i", shifts: ["S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 } },
    { id: 7, name: "Erna Rizkiani", shifts: ["S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2"], totals: { P: 8, FUL: 11, S: 4, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 209 } },
    { id: 8, name: "Chusfia Hanik Wihayati", shifts: ["S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"], totals: { P: 7, FUL: 12, S: 4, M: 4, LP: 4, OFF: 0, P1: 7, P2: 0, P3: 0, JK: 208 } },
    { id: 9, name: "A. Zainudin Sholeh", shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 3, P2: 2, P3: 0, JK: 208 } },
    { id: 10, name: "Abisarwan Rafif", shifts: ["LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "C", "C", "C", "C", "C", "C", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S"], totals: { P: 3, FUL: 11, S: 3, M: 4, LP: 4, OFF: 2, P1: 0, P2: 1, P3: 6, JK: 154 } },
    { id: 11, name: "Dwi Chusnul Mufid", shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"], totals: { P: 8, FUL: 12, S: 4, M: 3, LP: 4, OFF: 2, P1: 1, P2: 5, P3: 0, JK: 218 } },
    { id: 12, name: "Amirul Mu'minin Rofico P.K.", shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP"], totals: { P: 6, FUL: 14, S: 4, M: 4, LP: 3, OFF: 2, P1: 4, P2: 0, P3: 0, JK: 216 } },
    { id: 13, name: "Nanang Arifin", shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 5, P2: 0, P3: 0, JK: 208 } },
    { id: 14, name: "Muji Santoso", shifts: ["S", "S", "S", "M", "LP", "O", "P3", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 4, P2: 1, P3: 0, JK: 208 } },
    { id: 15, name: "Deni Furitrinofi", shifts: ["S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P"], totals: { P: 7, FUL: 12, S: 4, M: 4, LP: 4, OFF: 1, P1: 3, P2: 3, P3: 0, JK: 209 } },
    { id: 16, name: "Eko Wahyudi", shifts: ["S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 2, P2: 4, P3: 0, JK: 207 } },
    { id: 17, name: "Eky Venty Pricilia", shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"], totals: { P: 8, FUL: 11, S: 4, M: 4, LP: 4, OFF: 0, P1: 8, P2: 0, P3: 0, JK: 209 } },
    { id: 18, name: "Teguh Cahyono", shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"], totals: { P: 7, FUL: 13, S: 4, M: 3, LP: 4, OFF: 2, P1: 1, P2: 4, P3: 0, JK: 217 } },
    { id: 19, name: "Akhmad Fadkhurriza I", shifts: ["S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 1, P1: 5, P2: 0, P3: 0, JK: 208 } },
    { id: 20, name: "Afida Saidatul Fuadia", shifts: ["S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S"], totals: { P: 6, FUL: 13, S: 4, M: 4, LP: 4, OFF: 0, P1: 6, P2: 0, P3: 0, JK: 207 } }
  ];

  const getShiftFillColor = (code: string): [number, number, number] => {
    switch (code) {
      case 'P': return [16, 185, 129]; // Emerald
      case 'P2': return [20, 184, 166]; // Teal
      case 'P3': return [22, 163, 74]; // Green
      case 'S': return [245, 158, 11]; // Amber
      case 'M': return [79, 70, 229]; // Indigo
      case 'LP': return [224, 242, 254]; // Light Sky
      case 'O': return [239, 68, 68]; // Red (Off)
      case 'C': return [168, 85, 247]; // Purple (Cuti)
      default: return [241, 245, 249];
    }
  };

  const getShiftTextColor = (code: string): [number, number, number] => {
    if (['P', 'P2', 'P3', 'S', 'M', 'O'].includes(code)) {
      return [255, 255, 255]; // white for dark pills
    }
    return [30, 41, 59]; // dark text for light pills
  };

  doc.setFontSize(5.5);
  doc.setLineWidth(0.15);
  doc.setDrawColor(203, 213, 225); // slate 300

  schedules.forEach((staff, idx) => {
    const isEven = idx % 2 === 0;
    
    // Row background
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(startX, currentY, 270.6, rowHeight, 'F');

    // Grid lines
    doc.rect(startX, currentY, 270.6, rowHeight, 'S');

    // No & Name
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(idx + 1), startX + (colWidthNo / 2), currentY + 3.2, { align: 'center' });
    
    doc.setFont('Helvetica', 'bold');
    doc.text(staff.name, startX + colWidthNo + 1.5, currentY + 3.2);

    // Shifts
    let cellX = startX + colWidthNo + colWidthName;
    staff.shifts.forEach((sh) => {
      const [r, g, b] = getShiftFillColor(sh);
      doc.setFillColor(r, g, b);
      // draw pill rectangle
      doc.roundedRect(cellX + 0.4, currentY + 0.6, colWidthDay - 0.8, rowHeight - 1.2, 0.5, 0.5, 'F');

      const [tr, tg, tb] = getShiftTextColor(sh);
      doc.setTextColor(tr, tg, tb);
      doc.setFont('Helvetica', 'bold');
      doc.text(sh, cellX + (colWidthDay / 2), currentY + 3.2, { align: 'center' });

      cellX += colWidthDay;
    });

    // Stat totals
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);

    const stats = [
      staff.totals.P,
      staff.totals.FUL,
      staff.totals.S,
      staff.totals.M,
      staff.totals.LP,
      staff.totals.OFF,
      staff.totals.P1,
      staff.totals.P2,
      staff.totals.P3,
      staff.totals.JK
    ];

    stats.forEach((st) => {
      doc.text(String(st), cellX + (colWidthStat / 2), currentY + 3.2, { align: 'center' });
      cellX += colWidthStat;
    });

    currentY += rowHeight;
  });

  // 4. Legend & Signatures Section at the bottom
  currentY += 4;

  // PETUNJUK Legend Box (Left)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('PETUNJUK SHIFT:', startX, currentY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);

  const legends = [
    'P  : Jaga Pagi (07:00 - 16:00)',
    'S  : Jaga Sore (15:00 - 22:00)',
    'M  : Jaga Malam (15:00 - 08:00)',
    'LP : Lepas Piket Pasca Malam',
    'O  : Off / Libur Piket'
  ];

  let legendY = currentY + 3.5;
  legends.forEach(leg => {
    doc.text(leg, startX, legendY);
    legendY += 3.2;
  });

  // Signature Block (Right)
  const sigX = 220;
  let sigY = currentY;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, 31 Juli 2026', sigX, sigY);

  doc.setFont('Helvetica', 'bold');
  doc.text('KEPALA', sigX, sigY + 4);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1', sigX, sigY + 7.5);
  doc.text('KABUPATEN KEDIRI', sigX, sigY + 11);

  // Generate Automatic Verification QR Code for document authenticity
  try {
    const qrDataStr = `DOKUMEN RESMI RESMI WALIASUHKU\nJadwal Pembagian Shift Wali Asuh - Agustus 2026\nSekolah Rakyat Menengah Atas 24 Kediri\nKepala Sekolah: FADELI, S.Pd., M.Pd.`;
    const qrDataUrl = await QRCode.toDataURL(qrDataStr, { margin: 1, width: 120 });
    doc.addImage(qrDataUrl, 'PNG', sigX - 22, sigY + 2, 18, 18);
  } catch (err) {
    console.warn('QR Code generation failed for schedule:', err);
  }

  // Signature Line
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FADELI, S.Pd., M.Pd.', sigX, sigY + 26);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('NIP. 19690521 199203 1 008', sigX, sigY + 29.5);

  // Save Document
  doc.save('Jadwal_Pembagian_Shift_Wali_Asuh_Agustus_2026.pdf');
};

/**
 * Generate official PDF for Daily Duty Schedule (Piket Harian Wali Asuh)
 * Portrait A4 format with clean tables, officer names, shift details, and signature
 */
export const generateJadwalPiketHarianPDF = async (selectedDay: number = 1) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  }); // 210mm x 297mm

  const pageWidth = 210;

  // 1. Official Kop Surat Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text('KEMENTERIAN SOSIAL REPUBLIK INDONESIA', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9.5);
  doc.text('PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // emerald 600
  doc.text('SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI', pageWidth / 2, 24, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Gedung Balai Pengembangan Kompetensi Aparatur Sipil Negara', pageWidth / 2, 28.5, { align: 'center' });
  doc.text('Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri, Jawa Timur | Kode Pos: 64152', pageWidth / 2, 32.5, { align: 'center' });

  // Double Line Separator
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(14, 35.5, pageWidth - 14, 35.5);
  doc.setLineWidth(0.2);
  doc.line(14, 36.5, pageWidth - 14, 36.5);

  // 2. Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('DAFTAR PETUGAS PIKET WALI ASUH HARIAN', pageWidth / 2, 43, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text(`TANGGAL: ${selectedDay} AGUSTUS 2026`, pageWidth / 2, 48, { align: 'center' });

  // Schedule Data Source
  const schedules = [
    { id: 1, name: "Suhariyono", shifts: ["M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S"] },
    { id: 2, name: "Rindani", shifts: ["LP", "O", "P2", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"] },
    { id: 3, name: "Hariadi", shifts: ["O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M"] },
    { id: 4, name: "Moch. Chabib", shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP"] },
    { id: 5, name: "Dewi Askinu", shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O"] },
    { id: 6, name: "Aris Mahmud Syafi'i", shifts: ["S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2"] },
    { id: 7, name: "Erna Rizkiani", shifts: ["S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2"] },
    { id: 8, name: "Chusfia Hanik Wihayati", shifts: ["S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"] },
    { id: 9, name: "A. Zainudin Sholeh", shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S"] },
    { id: 10, name: "Abisarwan Rafif", shifts: ["LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "C", "C", "C", "C", "C", "C", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S"] },
    { id: 11, name: "Dwi Chusnul Mufid", shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"] },
    { id: 12, name: "Amirul Mu'minin Rofico P.K.", shifts: ["P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "S", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP"] },
    { id: 13, name: "Nanang Arifin", shifts: ["P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"] },
    { id: 14, name: "Muji Santoso", shifts: ["S", "S", "S", "M", "LP", "O", "P3", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P"] },
    { id: 15, name: "Deni Furitrinofi", shifts: ["S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P"] },
    { id: 16, name: "Eko Wahyudi", shifts: ["S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S"] },
    { id: 17, name: "Eky Venty Pricilia", shifts: ["M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S"] },
    { id: 18, name: "Teguh Cahyono", shifts: ["O", "P2", "P", "S", "S", "S", "M", "LP", "O", "P", "P3", "S", "S", "S", "M", "LP", "O", "P3", "S", "S", "S", "S", "M", "LP", "O", "P3", "P3", "S", "S", "S", "M"] },
    { id: 19, name: "Akhmad Fadkhurriza I", shifts: ["S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P", "P2", "S", "S", "S", "M", "LP", "O"] },
    { id: 20, name: "Afida Saidatul Fuadia", shifts: ["S", "S", "M", "LP", "O", "P2", "S", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "P2", "S", "S", "S", "M", "LP", "O", "P2", "S"] }
  ];

  const shiftDetailsMap: Record<string, { label: string; time: string; desc: string }> = {
    P: { label: 'Jaga Pagi (P1)', time: '07:00 - 15:00 WIB', desc: 'Piket Pendampingan Pagi' },
    P1: { label: 'Jaga Pagi (P1)', time: '07:00 - 15:00 WIB', desc: 'Piket Pendampingan Pagi' },
    P2: { label: 'Jaga Pagi (P2)', time: '07:00 - 16:00 WIB', desc: 'Piket Pendampingan Pagi' },
    P3: { label: 'Jaga Pagi (P3)', time: '07:00 - 16:00 WIB', desc: 'Piket Pendampingan Pagi' },
    S: { label: 'Jaga Sore', time: '15:00 - 22:00 WIB', desc: 'Piket Pendampingan Sore / Malam' },
    M: { label: 'Jaga Malam', time: '15:00 - 08:00 WIB', desc: 'Piket Pengawasan Malam Utama' },
    LP: { label: 'Lepas Piket', time: 'Pasca Malam', desc: 'Bebas Tugas Pasca Piket Malam' },
    O: { label: 'Off / Libur', time: 'Bebas Tugas', desc: 'Hari Libur / Off' },
    C: { label: 'Cuti Resmi', time: 'Izin Cuti', desc: 'Cuti Alasan Penting' }
  };

  const dayIndex = selectedDay - 1;

  const pagiOfficers: { name: string; shiftCode: string }[] = [];
  const soreOfficers: { name: string; shiftCode: string }[] = [];
  const malamOfficers: { name: string; shiftCode: string }[] = [];
  const offOfficers: { name: string; shiftCode: string }[] = [];

  schedules.forEach(s => {
    const code = s.shifts[dayIndex] || 'O';
    if (['P', 'P1', 'P2', 'P3'].includes(code)) {
      pagiOfficers.push({ name: s.name, shiftCode: code });
    } else if (code === 'S') {
      soreOfficers.push({ name: s.name, shiftCode: code });
    } else if (code === 'M') {
      malamOfficers.push({ name: s.name, shiftCode: code });
    } else {
      offOfficers.push({ name: s.name, shiftCode: code });
    }
  });

  const totalBertugas = pagiOfficers.length + soreOfficers.length + malamOfficers.length;

  // 3. Summary Stat Box
  const startX = 14;
  let currentY = 53;

  doc.setFillColor(240, 253, 244); // light emerald background
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(startX, currentY, 182, 14, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // emerald 800
  doc.text(`RINGKASAN PETUGAS BERTUGAS: ${totalBertugas} PERSONEL WALI ASUH`, startX + 4, currentY + 5.5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`☀️ Shift Pagi: ${pagiOfficers.length} Personel   |   🌆 Shift Sore: ${soreOfficers.length} Personel   |   🌙 Shift Malam: ${malamOfficers.length} Personel   |   🏖️ Lepas/Off: ${offOfficers.length} Personel`, startX + 4, currentY + 10.5);

  currentY += 19;

  // Helper function to render a neat section table
  const renderShiftTable = (
    title: string,
    badgeText: string,
    officers: { name: string; shiftCode: string }[],
    headerBgColor: [number, number, number],
    accentColor: [number, number, number]
  ) => {
    doc.setFillColor(...headerBgColor);
    doc.rect(startX, currentY, 182, 6.5, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, startX + 4, currentY + 4.5);
    doc.text(badgeText, startX + 178, currentY + 4.5, { align: 'right' });

    currentY += 6.5;

    // Table Column Headers
    doc.setFillColor(248, 250, 252);
    doc.rect(startX, currentY, 182, 5.5, 'F');

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.15);
    doc.rect(startX, currentY, 182, 5.5, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text('No', startX + 4, currentY + 3.8);
    doc.text('Nama Wali Asuh', startX + 16, currentY + 3.8);
    doc.text('Kode Shift', startX + 90, currentY + 3.8);
    doc.text('Jam Operasional', startX + 120, currentY + 3.8);
    doc.text('Keterangan Tugas', startX + 152, currentY + 3.8);

    currentY += 5.5;

    if (officers.length === 0) {
      doc.setFillColor(255, 255, 255);
      doc.rect(startX, currentY, 182, 6, 'F');
      doc.rect(startX, currentY, 182, 6, 'S');

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Tidak ada petugas bertugas pada shift ini', startX + 91, currentY + 4, { align: 'center' });

      currentY += 6;
    } else {
      officers.forEach((off, idx) => {
        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(startX, currentY, 182, 5.5, 'F');
        doc.rect(startX, currentY, 182, 5.5, 'S');

        const shiftInfo = shiftDetailsMap[off.shiftCode] || { label: off.shiftCode, time: '-', desc: '-' };

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);

        // No
        doc.text(String(idx + 1), startX + 4, currentY + 3.8);

        // Name
        doc.setFont('Helvetica', 'bold');
        doc.text(off.name, startX + 16, currentY + 3.8);

        // Shift Code
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text(off.shiftCode, startX + 90, currentY + 3.8);

        // Time
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(shiftInfo.time, startX + 120, currentY + 3.8);

        // Description
        doc.text(shiftInfo.desc, startX + 152, currentY + 3.8);

        currentY += 5.5;
      });
    }

    currentY += 3.5; // spacing between sections
  };

  // Render 1. Shift Pagi
  renderShiftTable(
    `1. SHIFT JAGA PAGI (${pagiOfficers.length} Personel)`,
    'Jam Kerja: 07:00 - 16:00 WIB',
    pagiOfficers,
    [16, 185, 129], // Emerald 600
    [5, 150, 105]
  );

  // Render 2. Shift Sore
  renderShiftTable(
    `2. SHIFT JAGA SORE (${soreOfficers.length} Personel)`,
    'Jam Kerja: 15:00 - 22:00 WIB',
    soreOfficers,
    [217, 119, 6], // Amber 600
    [180, 83, 9]
  );

  // Render 3. Shift Malam
  renderShiftTable(
    `3. SHIFT JAGA MALAM (${malamOfficers.length} Personel)`,
    'Jam Kerja: 15:00 - 08:00 WIB (Besok)',
    malamOfficers,
    [79, 70, 229], // Indigo 600
    [67, 56, 202]
  );

  // Render 4. Off / Lepas Piket
  renderShiftTable(
    `4. LEPAS PIKET / LIBUR / CUTI (${offOfficers.length} Personel)`,
    'Bebas Tugas Piket',
    offOfficers,
    [100, 116, 139], // Slate 500
    [71, 85, 105]
  );

  // Signatures Section at the bottom
  currentY = Math.max(currentY + 2, 235);

  const sigX = 140;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Kediri, ${selectedDay} Agustus 2026`, sigX, currentY);

  doc.setFont('Helvetica', 'bold');
  doc.text('KEPALA', sigX, currentY + 4.5);
  doc.text('SEKOLAH RAKYAT TERINTEGRASI 1', sigX, currentY + 8.5);
  doc.text('KABUPATEN KEDIRI', sigX, currentY + 12.5);

  // Verification QR Code
  try {
    const qrDataStr = `DOKUMEN RESMI PIKET HARIAN WALIASUHKU\nTanggal: ${selectedDay} Agustus 2026\nPetugas Bertugas: ${totalBertugas} Personel\nKepala Sekolah: FADELI, S.Pd., M.Pd.`;
    const qrDataUrl = await QRCode.toDataURL(qrDataStr, { margin: 1, width: 120 });
    doc.addImage(qrDataUrl, 'PNG', sigX - 22, currentY + 3, 18, 18);
  } catch (err) {
    console.warn('QR Code generation failed:', err);
  }

  // Signature Line
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FADELI, S.Pd., M.Pd.', sigX, currentY + 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 19690521 199203 1 008', sigX, currentY + 32);

  // Save PDF Document
  doc.save(`Daftar_Piket_Harian_WaliAsuh_${selectedDay}_Agustus_2026.pdf`);
};

/**
 * Generate PDF for Jadwal Kerja 18 Wali Asuh Baru (SE No. 4749/2026)
 */
export const generateJadwalTendikWaliAsuhBaruPDF = async (selectedDay: string = 'Senin') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const data = [
    { no: 1, nama: "Moh. Asrofi", tandem: "Muji Santoso", shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "P" } },
    { no: 2, nama: "Ambikha Widya Asmara", tandem: "Dewi Askinu", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "P" } },
    { no: 3, nama: "Prisilia Dwi Isnawati", tandem: "Eky Venty Pricillia", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" } },
    { no: 4, nama: "Yusak Wasis Pratonggo", tandem: "A. Zainudin Sholeh", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "P" } },
    { no: 5, nama: "Anita Kurniawati", tandem: "Eko Wahyudi", shifts: { Senin: "S", Selasa: "S", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "M", Minggu: "LP" } },
    { no: 6, nama: "Siti Maslukah", tandem: "Chusfia Hanik Wihayati", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "S", Minggu: "S" } },
    { no: 7, nama: "Retnowati", tandem: "Teguh Cahyono", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "S" } },
    { no: 8, nama: "Herlina Ratu Belia", tandem: "Dwi Chusnul Mufid", shifts: { Senin: "P", Selasa: "S", Rabu: "S", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" } },
    { no: 9, nama: "Latifa Dyah Ratna Dewi", tandem: "Afida Saidatul Fuadia", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "P", Minggu: "S" } },
    { no: 10, nama: "Adityo Rizky Winarno", tandem: "Ahmad Fadkhurriza Ivakhudin", shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "P", Jumat: "S", Sabtu: "S", Minggu: "S" } },
    { no: 11, nama: "Chiva Uswahul Suci", tandem: "Deni Furitrinofi", shifts: { Senin: "S", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "S", Sabtu: "P", Minggu: "S" } },
    { no: 12, nama: "Theresa Inganta Ginting", tandem: "Abisarwan Rafif", shifts: { Senin: "S", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
    { no: 13, nama: "Anggelika Simanjuntak", tandem: "Suhariyono", shifts: { Senin: "S", Selasa: "S", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "P", Minggu: "S" } },
    { no: 14, nama: "Tiara Devi Cristina Sihombing", tandem: "Amirul Mu’minin Rofico Putra Kurnia", shifts: { Senin: "S", Selasa: "S", Rabu: "P", Kamis: "S", Jumat: "M", Sabtu: "LP", Minggu: "S" } },
    { no: 15, nama: "Hiras Mando Rajagukguk", tandem: "Aris Mahmud Syafi’i", shifts: { Senin: "P", Selasa: "M", Rabu: "LP", Kamis: "S", Jumat: "S", Sabtu: "S", Minggu: "S" } },
    { no: 16, nama: "Rani Novita Asmi", tandem: "Hariyadi", shifts: { Senin: "S", Selasa: "P", Rabu: "M", Kamis: "LP", Jumat: "S", Sabtu: "S", Minggu: "S" } },
    { no: 17, nama: "Ade Kurnia", tandem: "Moch. Chabib", shifts: { Senin: "M", Selasa: "LP", Rabu: "S", Kamis: "S", Jumat: "P", Sabtu: "S", Minggu: "S" } },
    { no: 18, nama: "Inung Khuzaimatul Bariyah Y.", tandem: "Nanang Arifin", shifts: { Senin: "S", Selasa: "P", Rabu: "S", Kamis: "M", Jumat: "LP", Sabtu: "S", Minggu: "S" } }
  ];

  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Header Banner Red
  doc.setFillColor(185, 28, 28); // Red 700
  doc.rect(10, 10, 277, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JADWAL KERJA 18 WALI ASUH BARU', 148.5, 19, { align: 'center' });

  // Subtitle Banner Cream
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.rect(10, 24, 277, 7, 'F');
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SRT 1 KABUPATEN KEDIRI - Sesuai SE Nomor 4749/2026 - Pola 1P-4S-1M-1LP - M -> LP/Off -> Sore', 148.5, 28.5, { align: 'center' });

  // Table Header
  let tableY = 35;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(10, tableY, 277, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);

  doc.text('No.', 14, tableY + 5.5);
  doc.text('Nama Wali Asuh', 26, tableY + 5.5);
  doc.text('Tandem Pengasuhan', 92, tableY + 5.5);

  const dayXStart = 160;
  const dayColWidth = 17;

  daysList.forEach((d, i) => {
    const x = dayXStart + (i * dayColWidth);
    doc.text(d, x + (dayColWidth / 2), tableY + 5.5, { align: 'center' });
  });

  // Table Body
  tableY += 8;
  doc.setFontSize(7.5);

  data.forEach((row, idx) => {
    const bgCol = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bgCol[0], bgCol[1], bgCol[2]);
    doc.rect(10, tableY, 277, 6.5, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(10, tableY + 6.5, 287, tableY + 6.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(row.no), 14, tableY + 4.5);

    doc.setFont('Helvetica', 'bold');
    doc.text(row.nama, 26, tableY + 4.5);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row.tandem, 92, tableY + 4.5);

    daysList.forEach((d, i) => {
      const shift = row.shifts[d as keyof typeof row.shifts];
      const x = dayXStart + (i * dayColWidth);

      let shiftBg = [241, 245, 249];
      let shiftText = [71, 85, 105];

      if (shift === 'P') { shiftBg = [209, 250, 229]; shiftText = [6, 95, 70]; }
      else if (shift === 'S') { shiftBg = [254, 243, 199]; shiftText = [146, 64, 14]; }
      else if (shift === 'M') { shiftBg = [224, 231, 255]; shiftText = [55, 48, 163]; }
      else if (shift === 'LP') { shiftBg = [224, 242, 254]; shiftText = [7, 89, 133]; }

      doc.setFillColor(shiftBg[0], shiftBg[1], shiftBg[2]);
      doc.roundedRect(x + 3, tableY + 1, 11, 4.5, 1, 1, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(shiftText[0], shiftText[1], shiftText[2]);
      doc.text(shift, x + (dayColWidth / 2), tableY + 4.2, { align: 'center' });
    });

    tableY += 6.5;
  });

  // Footer Legend Banner
  tableY += 3;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, tableY, 277, 6, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Kode shift: P = Pagi (07.00-15.00)  -  S = Sore (15.00-23.00)  -  M = Malam (23.00-07.00)  -  LP = Lepas Piket/Off', 148.5, tableY + 4, { align: 'center' });

  // Note text
  tableY += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Catatan: Jadwal kerja bersifat individual; nama tandem menunjukkan pasangan pengasuhan siswa. Anita Kurniawati memperoleh LP hari Minggu untuk ibadah.', 10, tableY);

  // Official Signature
  const sigX = 220;
  let sigY = tableY + 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Mengetahui,', sigX, sigY);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, sigY + 4);

  // QR Code
  try {
    const qrStr = `DOKUMEN SE RESMI NO 4749/2026\nSRT 1 KABUPATEN KEDIRI\nJadwal Kerja 18 Wali Asuh Baru\nKepala Sekolah: Fadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 20, sigY + 2, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  sigY += 20;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 4);

  doc.save(`Jadwal_Kerja_18_Wali_Asuh_Baru_SE_4749_2026.pdf`);
};

/**
 * Generate PDF for Rekapitulasi Jumlah Hari Kerja Bulanan 18 Tendik Wali Asuh Baru
 */
export const generateRekapHariKerjaTendikBaruPDF = async (
  monthLabel: string = 'Agustus 2026',
  totalMonthDays: number = 31,
  rekapItems: any[] = []
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate Grand Totals
  const totalTendik = rekapItems.length;
  const grandTotalPagi = rekapItems.reduce((acc, curr) => acc + (curr.countPagi || 0), 0);
  const grandTotalSore = rekapItems.reduce((acc, curr) => acc + (curr.countSore || 0), 0);
  const grandTotalMalam = rekapItems.reduce((acc, curr) => acc + (curr.countMalam || 0), 0);
  const grandTotalHariKerja = rekapItems.reduce((acc, curr) => acc + (curr.totalHariKerja || 0), 0);
  const grandTotalLP = rekapItems.reduce((acc, curr) => acc + (curr.countLP || 0), 0);
  const grandTotalJamKerja = rekapItems.reduce((acc, curr) => acc + (curr.totalJamKerja || 0), 0);
  const avgHariKerja = totalTendik > 0 ? (grandTotalHariKerja / totalTendik).toFixed(1) : '0';

  // 1. Header Banner Red/Rose
  doc.setFillColor(190, 18, 60); // Rose 700
  doc.rect(10, 10, 277, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REKAPITULASI JUMLAH HARI KERJA BULANAN TENDIK WALI ASUH BARU', 148.5, 18.5, { align: 'center' });

  // 2. Subtitle Banner Amber/Cream
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.rect(10, 24, 277, 7, 'F');
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`SRT 1 KABUPATEN KEDIRI  •  PERIODE: ${monthLabel.toUpperCase()} (${totalMonthDays} HARI)  •  SE NOMOR 4749/2026`, 148.5, 28.5, { align: 'center' });

  // 3. Metric Summary Bar
  let topY = 34;
  doc.setFillColor(248, 250, 252);
  doc.rect(10, topY, 277, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(10, topY, 277, 8, 'S');

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Personel: ${totalTendik} Tendik`, 15, topY + 5.2);
  doc.text(`Total Shift Bertugas: ${grandTotalHariKerja} Shift`, 75, topY + 5.2);
  doc.text(`Rata-rata Kerja: ${avgHariKerja} Hari/Tendik`, 145, topY + 5.2);
  doc.text(`Akumulasi Jam Kerja: ${grandTotalJamKerja.toLocaleString('id-ID')} Jam`, 215, topY + 5.2);

  // 4. Table Header
  let tableY = 44;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(10, tableY, 277, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);

  const colX = {
    no: 10,
    nama: 18,
    tandem: 70,
    pagi: 118,
    sore: 140,
    malam: 162,
    total: 184,
    off: 214,
    jam: 234,
    beban: 259
  };

  doc.text('No', colX.no + 4, tableY + 5.2, { align: 'center' });
  doc.text('Nama Tendik Wali Asuh', colX.nama + 2, tableY + 5.2);
  doc.text('Tandem Pengasuhan', colX.tandem + 2, tableY + 5.2);
  doc.text('Pagi (P)', colX.pagi + 11, tableY + 5.2, { align: 'center' });
  doc.text('Sore (S)', colX.sore + 11, tableY + 5.2, { align: 'center' });
  doc.text('Malam (M)', colX.malam + 11, tableY + 5.2, { align: 'center' });
  doc.text('TOTAL HARI KERJA', colX.total + 15, tableY + 5.2, { align: 'center' });
  doc.text('Off / LP', colX.off + 10, tableY + 5.2, { align: 'center' });
  doc.text('Jam Kerja', colX.jam + 12.5, tableY + 5.2, { align: 'center' });
  doc.text('Beban Kerja', colX.beban + 9, tableY + 5.2, { align: 'center' });

  tableY += 8;

  // 5. Table Rows
  doc.setFontSize(7.5);
  rekapItems.forEach((row: any, idx: number) => {
    const bgCol = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bgCol[0], bgCol[1], bgCol[2]);
    doc.rect(10, tableY, 277, 6.2, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(10, tableY + 6.2, 287, tableY + 6.2);

    // Columns
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(idx + 1), colX.no + 4, tableY + 4.2, { align: 'center' });

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row.nama || '', colX.nama + 2, tableY + 4.2);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row.tandem || '', colX.tandem + 2, tableY + 4.2);

    // Pagi
    doc.setTextColor(6, 95, 70);
    doc.text(`${row.countPagi || 0} H`, colX.pagi + 11, tableY + 4.2, { align: 'center' });

    // Sore
    doc.setTextColor(146, 64, 14);
    doc.text(`${row.countSore || 0} H`, colX.sore + 11, tableY + 4.2, { align: 'center' });

    // Malam
    doc.setTextColor(55, 48, 163);
    doc.text(`${row.countMalam || 0} H`, colX.malam + 11, tableY + 4.2, { align: 'center' });

    // TOTAL HARI KERJA (Highlight)
    doc.setFillColor(255, 241, 242); // Rose 50
    doc.roundedRect(colX.total + 2, tableY + 0.8, 26, 4.6, 1, 1, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(190, 18, 60); // Rose 700
    doc.text(`${row.totalHariKerja || 0} Hari`, colX.total + 15, tableY + 4.2, { align: 'center' });

    // Off
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(7, 89, 133);
    doc.text(`${row.countLP || 0} H`, colX.off + 10, tableY + 4.2, { align: 'center' });

    // Jam Kerja
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${row.totalJamKerja || 0} Jam`, colX.jam + 12.5, tableY + 4.2, { align: 'center' });

    // Beban
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${row.percentageWork || 0}%`, colX.beban + 9, tableY + 4.2, { align: 'center' });

    tableY += 6.2;
  });

  // 6. Table Total Footer Row
  doc.setFillColor(226, 232, 240); // Slate 200
  doc.rect(10, tableY, 277, 7, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL KESELURUHAN', colX.nama + 2, tableY + 4.8);

  doc.setTextColor(6, 95, 70);
  doc.text(`${grandTotalPagi} H`, colX.pagi + 11, tableY + 4.8, { align: 'center' });

  doc.setTextColor(146, 64, 14);
  doc.text(`${grandTotalSore} H`, colX.sore + 11, tableY + 4.8, { align: 'center' });

  doc.setTextColor(55, 48, 163);
  doc.text(`${grandTotalMalam} H`, colX.malam + 11, tableY + 4.8, { align: 'center' });

  doc.setTextColor(190, 18, 60);
  doc.text(`${grandTotalHariKerja} Hari`, colX.total + 15, tableY + 4.8, { align: 'center' });

  doc.setTextColor(7, 89, 133);
  doc.text(`${grandTotalLP} H`, colX.off + 10, tableY + 4.8, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.text(`${grandTotalJamKerja.toLocaleString('id-ID')} Jam`, colX.jam + 12.5, tableY + 4.8, { align: 'center' });

  tableY += 10;

  // 7. Signature & QR Stamp
  const sigX = 220;
  let sigY = tableY;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), sigX, sigY);
  doc.text('Mengetahui,', sigX, sigY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, sigY + 8);

  // QR Code
  try {
    const qrStr = `REKAP HARI KERJA BULANAN 18 TENDIK BARU\nPERIODE: ${monthLabel}\nSRT 1 KABUPATEN KEDIRI\nKepala Sekolah: Fadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, sigY + 6, 17, 17);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  sigY += 24;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 4);

  // Save PDF
  const cleanMonth = monthLabel.replace(/\s+/g, '_');
  doc.save(`Rekap_Hari_Kerja_Tendik_Baru_${cleanMonth}.pdf`);
};

/**
 * Generate PDF for Jadwal 38 Wali Asuh
 */
export const generateJadwal38WaliAsuhPDF = async (
  items: any[] = []
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // 1. Header Title
  doc.setFillColor(15, 23, 42); // Slate 900 Header
  doc.rect(10, 10, 277, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('JADWAL 38 WALI ASUH', 148.5, 18, { align: 'center' });

  // 2. Subtitle
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(10, 22, 277, 6, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Jadwal kerja individual sesuai SE Nomor 4749/2026 • Pola 1P–4S–1M–1Off • M → Off/Off → Sore • Anita Kurniawati Off Minggu untuk ibadah', 148.5, 26, { align: 'center' });

  // 3. Table Header
  let tableY = 30;
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(10, tableY, 277, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);

  const colX = {
    no: 10,
    nama: 22,
    days: {
      Senin: 135,
      Selasa: 157,
      Rabu: 179,
      Kamis: 201,
      Jumat: 223,
      Sabtu: 245,
      Minggu: 267
    }
  };

  doc.text('No.', colX.no + 5, tableY + 4.8, { align: 'center' });
  doc.text('Nama Wali Asuh', colX.nama + 2, tableY + 4.8);
  doc.text('Senin', colX.days.Senin + 10, tableY + 4.8, { align: 'center' });
  doc.text('Selasa', colX.days.Selasa + 10, tableY + 4.8, { align: 'center' });
  doc.text('Rabu', colX.days.Rabu + 10, tableY + 4.8, { align: 'center' });
  doc.text('Kamis', colX.days.Kamis + 10, tableY + 4.8, { align: 'center' });
  doc.text('Jumat', colX.days.Jumat + 10, tableY + 4.8, { align: 'center' });
  doc.text('Sabtu', colX.days.Sabtu + 10, tableY + 4.8, { align: 'center' });
  doc.text('Minggu', colX.days.Minggu + 10, tableY + 4.8, { align: 'center' });

  tableY += 7;

  // 4. Table Body
  doc.setFontSize(7.5);
  const daysArr = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  items.forEach((row: any, idx: number) => {
    if (tableY > 180) {
      doc.addPage();
      tableY = 15;
      doc.setFillColor(30, 41, 59);
      doc.rect(10, tableY, 277, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('No.', colX.no + 5, tableY + 4.8, { align: 'center' });
      doc.text('Nama Wali Asuh', colX.nama + 2, tableY + 4.8);
      daysArr.forEach(d => {
        doc.text(d, (colX.days as any)[d] + 10, tableY + 4.8, { align: 'center' });
      });
      tableY += 7;
    }

    const bgCol = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bgCol[0], bgCol[1], bgCol[2]);
    doc.rect(10, tableY, 277, 4.3, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(10, tableY + 4.3, 287, tableY + 4.3);

    // No
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(String(row.no || idx + 1), colX.no + 5, tableY + 3.2, { align: 'center' });

    // Nama
    doc.setFont('Helvetica', 'bold');
    if (row.isWaliAsrama) {
      doc.setFillColor(243, 232, 255); // Purple 100
      doc.rect(colX.nama - 1, tableY - 0.8, 110, 4.3, 'F');
      doc.setTextColor(107, 33, 168); // Purple 800
      doc.text(`${row.nama} (Wali Asrama)`, colX.nama + 2, tableY + 3.2);
    } else {
      doc.setTextColor(15, 23, 42);
      doc.text(row.nama || '', colX.nama + 2, tableY + 3.2);
    }

    // Days
    daysArr.forEach(d => {
      const shift = row.shifts ? row.shifts[d] : '';
      const xPos = (colX.days as any)[d] + 10;

      if (shift === 'P') {
        doc.setTextColor(6, 95, 70); // Emerald 800
        doc.setFont('Helvetica', 'bold');
      } else if (shift === 'S') {
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.setFont('Helvetica', 'bold');
      } else if (shift === 'M') {
        doc.setTextColor(67, 56, 202); // Indigo 700
        doc.setFont('Helvetica', 'bold');
      } else if (shift === 'Off' || shift === 'OFF') {
        doc.setTextColor(190, 18, 60); // Rose 700
        doc.setFont('Helvetica', 'bold');
      } else {
        doc.setTextColor(100, 116, 139);
        doc.setFont('Helvetica', 'normal');
      }

      doc.text(shift, xPos, tableY + 3.2, { align: 'center' });
    });

    tableY += 4.3;
  });

  tableY += 4;

  // 5. Footer Notes
  doc.setFillColor(241, 245, 249);
  doc.rect(10, tableY, 277, 9, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Kode shift: P = Pagi (07.00–15.00) • S = Sore (15.00–23.00) • M = Malam (23.00–07.00) • Off = Lepas Piket/Off', 148.5, tableY + 3.5, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.text('Catatan: Anita Kurniawati ditetapkan Off pada hari Minggu untuk kegiatan ibadah rutin. Jadwal kerja individual sesuai SE Nomor 4749/2026.', 148.5, tableY + 7, { align: 'center' });

  tableY += 13;

  // 6. Signatures
  if (tableY > 175) {
    doc.addPage();
    tableY = 20;
  }

  const sigX = 220;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), sigX, tableY);
  doc.text('Mengetahui,', sigX, tableY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, tableY + 8);

  try {
    const qrStr = `JADWAL 38 WALI ASUH\nSE NOMOR 4749/2026\nSRT 1 KABUPATEN KEDIRI\nKepala Sekolah: Fadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, tableY + 6, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  tableY += 24;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, tableY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, tableY + 4);

  doc.save('Jadwal_38_Wali_Asuh.pdf');
};

/**
 * Render a single classified day page in jsPDF (Portrait A4)
 */
const renderClassifiedDayPDFPage = async (
  doc: jsPDF,
  dayName: string,
  items: any[],
  isFirstPage: boolean = true
) => {
  if (!isFirstPage) {
    doc.addPage();
  }

  // 1. Header Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(10, 10, 190, 13, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`KLASIFIKASI SHIFT PIKET WALI ASUH - HARI ${dayName.toUpperCase()}`, 105, 18, { align: 'center' });

  // 2. Subtitle Bar
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(10, 23, 190, 6, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`SRT 1 KABUPATEN KEDIRI • SE NOMOR 4749/2026 • POLA SHIFT 1P–4S–1M–1Off`, 105, 27, { align: 'center' });

  // Filter shifts for dayName
  const shiftPagi = items.filter(i => (i.shifts ? i.shifts[dayName] === 'P' : false));
  const shiftSore = items.filter(i => (i.shifts ? i.shifts[dayName] === 'S' : false));
  const shiftMalam = items.filter(i => (i.shifts ? i.shifts[dayName] === 'M' : false));
  const shiftOff = items.filter(i => i.shifts && i.shifts[dayName] !== 'P' && i.shifts[dayName] !== 'S' && i.shifts[dayName] !== 'M');

  // Render 4 Shift Boxes in a 2x2 Grid
  const boxes = [
    {
      title: 'SHIFT PAGI (07.00 – 15.00 WIB)',
      items: shiftPagi,
      x: 10,
      y: 32,
      w: 92,
      h: 102,
      headerBg: [5, 150, 105], // Emerald 600
      bodyBg: [240, 253, 244], // Emerald 50
      borderColor: [167, 243, 208], // Emerald 200
      badgeText: `${shiftPagi.length} Personel`
    },
    {
      title: 'SHIFT SORE (15.00 – 23.00 WIB)',
      items: shiftSore,
      x: 108,
      y: 32,
      w: 92,
      h: 102,
      headerBg: [217, 119, 6], // Amber 600
      bodyBg: [254, 252, 232], // Amber 50
      borderColor: [253, 230, 138], // Amber 200
      badgeText: `${shiftSore.length} Personel`
    },
    {
      title: 'SHIFT MALAM (23.00 – 07.00 WIB)',
      items: shiftMalam,
      x: 10,
      y: 137,
      w: 92,
      h: 102,
      headerBg: [67, 56, 202], // Indigo 700
      bodyBg: [238, 242, 255], // Indigo 50
      borderColor: [199, 210, 254], // Indigo 200
      badgeText: `${shiftMalam.length} Personel`
    },
    {
      title: 'LEPAS PIKET / OFF (Bebas Tugas)',
      items: shiftOff,
      x: 108,
      y: 137,
      w: 92,
      h: 102,
      headerBg: [225, 29, 72], // Rose 600
      bodyBg: [255, 241, 242], // Rose 50
      borderColor: [254, 205, 211], // Rose 200
      badgeText: `${shiftOff.length} Personel`
    }
  ];

  boxes.forEach(box => {
    // Body Background
    doc.setFillColor(box.bodyBg[0], box.bodyBg[1], box.bodyBg[2]);
    doc.rect(box.x, box.y, box.w, box.h, 'F');

    // Body Border
    doc.setDrawColor(box.borderColor[0], box.borderColor[1], box.borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(box.x, box.y, box.w, box.h, 'D');

    // Header Background
    doc.setFillColor(box.headerBg[0], box.headerBg[1], box.headerBg[2]);
    doc.rect(box.x, box.y, box.w, 7.5, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(box.title, box.x + 3, box.y + 5);

    // Badge
    doc.setFontSize(6.5);
    doc.text(box.badgeText, box.x + box.w - 3, box.y + 5, { align: 'right' });

    // Personnel List - Dynamic Row Height & Font Size Scaling
    const totalItems = box.items.length;
    const availableHeight = box.h - 13; // ~89mm available for list
    const stepY = totalItems > 0 ? Math.min(4.3, Math.max(2.4, availableHeight / totalItems)) : 4.3;
    const fontSize = stepY < 3.0 ? 5.5 : stepY < 3.8 ? 6.2 : 7.2;
    const boxRectH = Math.max(2.0, stepY - 0.3);

    let listY = box.y + 10.5 + (stepY > 3.5 ? 2.0 : 1.0);

    if (box.items.length === 0) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('- Tidak ada personel -', box.x + box.w / 2, listY + 5, { align: 'center' });
    } else {
      box.items.forEach((item: any, idx: number) => {
        // Highlight Wali Asrama with a purple block, else row striping
        if (item.isWaliAsrama) {
          doc.setFillColor(243, 232, 255); // Purple 100
          doc.rect(box.x + 1, listY - (boxRectH * 0.75), box.w - 2, boxRectH, 'F');
          doc.setDrawColor(216, 180, 254); // Purple 300
          doc.setLineWidth(0.2);
          doc.rect(box.x + 1, listY - (boxRectH * 0.75), box.w - 2, boxRectH, 'D');
        } else if (idx % 2 === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(box.x + 1, listY - (boxRectH * 0.75), box.w - 2, boxRectH, 'F');
        }

        // Bullet number + Full Name
        doc.setFont('Helvetica', 'bold');
        if (item.isWaliAsrama) {
          doc.setTextColor(107, 33, 168); // Purple 800
        } else {
          doc.setTextColor(15, 23, 42);
        }
        doc.setFontSize(fontSize);
        const nameStr = `${idx + 1}.  ${item.nama}${item.isWaliAsrama ? ' (Wali Asrama)' : ''}`;
        
        // Truncate if string exceeds box width
        const maxStrWidth = box.w - 6;
        let finalStr = nameStr;
        if (doc.getTextWidth(finalStr) > maxStrWidth) {
          while (doc.getTextWidth(finalStr + '...') > maxStrWidth && finalStr.length > 5) {
            finalStr = finalStr.slice(0, -1);
          }
          finalStr += '...';
        }

        doc.text(finalStr, box.x + 3, listY);
        listY += stepY;
      });
    }
  });

  // Footer Info
  const footerY = 242;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, footerY, 190, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Catatan: Anita Kurniawati ditetapkan Off pada hari Minggu untuk ibadah rutin. Seluruh 38 Wali Asuh mematuhi giliran kerja SE 4749/2026.', 105, footerY + 4.5, { align: 'center' });

  // Signature Block
  const sigY = 252;
  const sigX = 145;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), sigX, sigY);
  doc.text('Mengetahui,', sigX, sigY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, sigY + 8);

  try {
    const qrStr = `JADWAL HARIAN 38 WALI ASUH\nHARI ${dayName.toUpperCase()}\nSRT 1 KABUPATEN KEDIRI\nKepala Sekolah: Fadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, sigY + 6, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY + 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 32);
};

/**
 * Generate PDF for Jadwal 38 Wali Asuh Harian (Classified by Shift)
 */
export const generateJadwal38WaliAsuhHarianPDF = async (
  dayName: string,
  items: any[] = []
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  await renderClassifiedDayPDFPage(doc, dayName, items, true);
  doc.save(`Jadwal_Harian_Wali_Asuh_${dayName}.pdf`);
};

/**
 * Generate PDF for Jadwal 38 Wali Asuh Seluruh Hari (7 Pages, 1 per day classified)
 */
export const generateJadwal38WaliAsuhSeluruhHariClassifiedPDF = async (
  items: any[] = []
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  for (let i = 0; i < days.length; i++) {
    await renderClassifiedDayPDFPage(doc, days[i], items, i === 0);
  }
  doc.save(`Jadwal_Klasifikasi_Seluruh_Hari_38_Wali_Asuh.pdf`);
};

// Helper to calculate exact day occurrences for any given calendar month
export const getExactMonthDayCounts = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const counts: Record<string, number> = {
    Senin: 0,
    Selasa: 0,
    Rabu: 0,
    Kamis: 0,
    Jumat: 0,
    Sabtu: 0,
    Minggu: 0,
  };

  const dayMap: Record<number, string> = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayName = dayMap[date.getDay()];
    if (dayName) {
      counts[dayName]++;
    }
  }

  return { daysInMonth, counts };
};

/**
 * Generate PDF for Rekap Jam Kerja Bulanan (47 Personel)
 */
export const generateRekapJamKerjaBulananPDF = async (
  items: any[] = [],
  year: number = 2026,
  month: number = 8,
  monthName: string = 'Agustus 2026'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const { daysInMonth, counts } = getExactMonthDayCounts(year, month);

  // Summary string of day occurrences in this month
  const daySummary = `Kalender ${monthName} (${daysInMonth} Hari): ${counts.Senin}x Sn, ${counts.Selasa}x Sl, ${counts.Rabu}x Rb, ${counts.Kamis}x Km, ${counts.Jumat}x Jm, ${counts.Sabtu}x Sb, ${counts.Minggu}x Mg`;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`REKAPITULASI HARI & JAM KERJA BULANAN - ${monthName.toUpperCase()}`, 14, 11);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`SRT 1 KABUPATEN KEDIRI | Ketentuan Shift: 8 Jam/Shift | ${daySummary}`, 14, 18);

  // Table Headers
  const tableYStart = 30;
  const rowHeight = 4.6;
  const colX = {
    no: 10,
    nama: 20,
    kategori: 82,
    pagi: 115,
    sore: 128,
    malam: 141,
    off: 154,
    totalShift: 167,
    jamPekanan: 192,
    hariKerja: 222,
    jamBulanan: 252
  };

  // Draw Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(colX.no, tableYStart, 277, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', colX.no + 1, tableYStart + 5.5);
  doc.text('NAMA PERSONEL', colX.nama + 2, tableYStart + 5.5);
  doc.text('KATEGORI', colX.kategori + 2, tableYStart + 5.5);
  doc.text('PAGI (8j)', colX.pagi + 1, tableYStart + 5.5);
  doc.text('SORE (8j)', colX.sore + 1, tableYStart + 5.5);
  doc.text('MALAM (8j)', colX.malam + 1, tableYStart + 5.5);
  doc.text('OFF', colX.off + 2, tableYStart + 5.5);
  doc.text('SHIFT/WK', colX.totalShift + 2, tableYStart + 5.5);
  doc.text('JAM/PEKAN', colX.jamPekanan + 2, tableYStart + 5.5);
  doc.text(`HARI MASUK (${daysInMonth}j)`, colX.hariKerja + 1, tableYStart + 5.5);
  doc.text(`TOTAL JAM/${daysInMonth}j`, colX.jamBulanan + 1, tableYStart + 5.5);

  let currentY = tableYStart + 8;
  const pageHeight = 210;

  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  items.forEach((item, index) => {
    // Check page break
    if (currentY + rowHeight > pageHeight - 35) {
      doc.addPage();
      currentY = 20;

      // Repeat Table Header
      doc.setFillColor(30, 41, 59);
      doc.rect(colX.no, currentY, 277, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text('NO', colX.no + 1, currentY + 5.5);
      doc.text('NAMA PERSONEL', colX.nama + 2, currentY + 5.5);
      doc.text('KATEGORI', colX.kategori + 2, currentY + 5.5);
      doc.text('PAGI (8j)', colX.pagi + 1, currentY + 5.5);
      doc.text('SORE (8j)', colX.sore + 1, currentY + 5.5);
      doc.text('MALAM (8j)', colX.malam + 1, currentY + 5.5);
      doc.text('OFF', colX.off + 2, currentY + 5.5);
      doc.text('SHIFT/WK', colX.totalShift + 2, currentY + 5.5);
      doc.text('JAM/PEKAN', colX.jamPekanan + 2, currentY + 5.5);
      doc.text(`HARI MASUK (${daysInMonth}j)`, colX.hariKerja + 1, currentY + 5.5);
      doc.text(`TOTAL JAM/${daysInMonth}j`, colX.jamBulanan + 1, currentY + 5.5);
      currentY += 8;
    }

    // Calculate shift counts & exact calendar month days
    let pCount = 0;
    let sCount = 0;
    let mCount = 0;
    let offCount = 0;

    let pDaysMonth = 0;
    let sDaysMonth = 0;
    let mDaysMonth = 0;

    daysList.forEach(d => {
      const shift = item.shifts[d];
      const dayOcc = counts[d] || 0;
      if (shift === 'P') {
        pCount++;
        pDaysMonth += dayOcc;
      } else if (shift === 'S') {
        sCount++;
        sDaysMonth += dayOcc;
      } else if (shift === 'M') {
        mCount++;
        mDaysMonth += dayOcc;
      } else {
        offCount++;
      }
    });

    const totalShiftWk = pCount + sCount + mCount;
    const jamPekanan = totalShiftWk * 8;
    const hariKerjaBulanan = pDaysMonth + sDaysMonth + mDaysMonth;
    const jamBulanan = hariKerjaBulanan * 8;

    // Row Background
    if (item.isWaliAsrama) {
      doc.setFillColor(243, 232, 255); // Purple 100
      doc.rect(colX.no, currentY, 277, rowHeight, 'F');
    } else if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(colX.no, currentY, 277, rowHeight, 'F');
    }

    // Border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(colX.no, currentY + rowHeight, colX.no + 277, currentY + rowHeight);

    // Text rendering
    doc.setFontSize(7);

    // No
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), colX.no + 2, currentY + 3.4);

    // Nama
    doc.setFont('Helvetica', 'bold');
    if (item.isWaliAsrama) {
      doc.setTextColor(107, 33, 168); // Purple 800
      doc.text(`${item.nama} (Wali Asrama)`, colX.nama + 2, currentY + 3.4);
    } else {
      doc.setTextColor(15, 23, 42);
      doc.text(item.nama || '', colX.nama + 2, currentY + 3.4);
    }

    // Kategori
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(item.isWaliAsrama ? 'Wali Asrama' : 'Wali Asuh', colX.kategori + 2, currentY + 3.4);

    // Shift counts
    doc.text(`${pCount} shift`, colX.pagi + 1, currentY + 3.4);
    doc.text(`${sCount} shift`, colX.sore + 1, currentY + 3.4);
    doc.text(`${mCount} shift`, colX.malam + 1, currentY + 3.4);
    doc.text(`${offCount} hari`, colX.off + 2, currentY + 3.4);

    // Totals
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalShiftWk} shift`, colX.totalShift + 2, currentY + 3.4);
    doc.text(`${jamPekanan} Jam`, colX.jamPekanan + 2, currentY + 3.4);

    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text(`${hariKerjaBulanan} Hari`, colX.hariKerja + 2, currentY + 3.4);

    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text(`${jamBulanan} Jam`, colX.jamBulanan + 2, currentY + 3.4);

    currentY += rowHeight;
  });

  // Footer Signature on last page
  const sigY = Math.min(currentY + 10, pageHeight - 35);
  const sigX = 220;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), sigX, sigY);
  doc.text('Mengetahui,', sigX, sigY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, sigY + 8);

  try {
    const qrStr = `REKAP JAM KERJA BULANAN\n47 PERSONEL WALI ASUH & ASRAMA\nSRT 1 KABUPATEN KEDIRI\nFadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, sigY + 6, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY + 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 32);

  doc.save(`Rekap_Jam_Kerja_Bulanan_47_Personel.pdf`);
};

/**
 * Generate PDF for Khusus 9 Wali Asrama Schedule
 */
export const generateJadwalWaliAsramaPDF = async (
  items: any[] = []
) => {
  const waliAsramaItems = items.filter(i => i.isWaliAsrama);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(88, 28, 135); // Purple 900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('JADWAL KERJA OPERASIONAL KHUSUS 9 WALI ASRAMA SRT 1 KABUPATEN KEDIRI', 14, 11);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(243, 232, 255);
  doc.text('Layanan Pengasuhan Asrama 24/7 | Sesuai SE Nomor 4749/2026 | Rotasi Shift: Pagi (P), Sore (S), Malam (M), Off', 14, 18);

  const tableYStart = 32;
  const rowHeight = 7;
  const colX = {
    no: 12,
    nama: 22,
    senin: 95,
    selasa: 115,
    rabu: 135,
    kamis: 155,
    jumat: 175,
    sabtu: 195,
    minggu: 215,
    jamWk: 240
  };

  // Table Header
  doc.setFillColor(58, 12, 92);
  doc.rect(colX.no, tableYStart, 273, 9, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', colX.no + 2, tableYStart + 6);
  doc.text('NAMA WALI ASRAMA', colX.nama + 2, tableYStart + 6);
  doc.text('SENIN', colX.senin + 3, tableYStart + 6);
  doc.text('SELASA', colX.selasa + 3, tableYStart + 6);
  doc.text('RABU', colX.rabu + 4, tableYStart + 6);
  doc.text('KAMIS', colX.kamis + 3, tableYStart + 6);
  doc.text('JUMAT', colX.jumat + 3, tableYStart + 6);
  doc.text('SABTU', colX.sabtu + 3, tableYStart + 6);
  doc.text('MINGGU', colX.minggu + 2, tableYStart + 6);
  doc.text('TOTAL JAM/WK', colX.jamWk + 2, tableYStart + 6);

  let currentY = tableYStart + 9;
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  waliAsramaItems.forEach((item, index) => {
    // Row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 245, 255);
      doc.rect(colX.no, currentY, 273, rowHeight, 'F');
    } else {
      doc.setFillColor(243, 232, 255);
      doc.rect(colX.no, currentY, 273, rowHeight, 'F');
    }

    // Border
    doc.setDrawColor(216, 180, 254);
    doc.setLineWidth(0.2);
    doc.line(colX.no, currentY + rowHeight, colX.no + 273, currentY + rowHeight);

    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text(String(index + 1), colX.no + 3, currentY + 4.8);
    doc.text(item.nama, colX.nama + 2, currentY + 4.8);

    let totalShift = 0;

    days.forEach((day, dIdx) => {
      const code = item.shifts[day] || 'Off';
      const xPos = [colX.senin, colX.selasa, colX.rabu, colX.kamis, colX.jumat, colX.sabtu, colX.minggu][dIdx];

      if (code === 'P') {
        doc.setFillColor(209, 250, 229);
        doc.setTextColor(6, 95, 70);
        totalShift++;
      } else if (code === 'S') {
        doc.setFillColor(254, 243, 199);
        doc.setTextColor(146, 64, 14);
        totalShift++;
      } else if (code === 'M') {
        doc.setFillColor(224, 231, 255);
        doc.setTextColor(55, 48, 163);
        totalShift++;
      } else {
        doc.setFillColor(254, 226, 226);
        doc.setTextColor(153, 27, 27);
      }

      doc.rect(xPos + 1, currentY + 1.2, 14, 4.6, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(code, xPos + (code.length > 2 ? 2 : 5), currentY + 4.5);
    });

    // Total Jam / Pekan
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 33, 168);
    doc.text(`${totalShift * 8} Jam (${totalShift} shift)`, colX.jamWk + 2, currentY + 4.8);

    currentY += rowHeight;
  });

  // Daily Summary Box
  currentY += 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(192, 132, 252);
  doc.rect(colX.no, currentY, 273, 40, 'F');
  doc.rect(colX.no, currentY, 273, 40, 'S');

  doc.setFillColor(126, 34, 206);
  doc.rect(colX.no, currentY, 273, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('RINCIAN PENUGASAN WALI ASRAMA PER HARI (SABTU HIGHLIGHT: NUKI SHIFT SORE)', colX.no + 4, currentY + 5);

  let subY = currentY + 12;
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'bold');

  const dailyInfo = [
    { day: 'Senin', info: 'Pagi: Sunarmi | Sore: Moh. Nursalim | Off: Eko W, Rio A | Malam: 5 Wali Asrama' },
    { day: 'Selasa', info: 'Pagi: Moh. Nursalim | Sore: Eko W, Rio A | Off: Widiastutik | Malam: 5 Wali Asrama' },
    { day: 'Rabu', info: 'Pagi: Eko Warasno | Sore: Widiastutik | Off: Hartor P | Malam: 6 Wali Asrama' },
    { day: 'Kamis', info: 'Pagi: Widiastutik | Sore: Hartor P | Off: Priselia D | Malam: 6 Wali Asrama' },
    { day: 'Jumat', info: 'Pagi: Hartor P | Sore: Priselia D | Off: Nukik (Nuki), Sifa N | Malam: 5 Wali Asrama' },
    { day: 'Sabtu', info: 'Pagi: Priselia D | Sore: Nukik Riyan A (Nuki), Sifa N | Off: Sunarmi | Malam: 5 Wali Asrama' },
    { day: 'Minggu', info: 'Pagi: Nukik Riyan A (Nuki) | Sore: Sunarmi | Off: Moh. Nursalim | Malam: 6 Wali Asrama' }
  ];

  dailyInfo.forEach((d, i) => {
    const colLeft = i < 4 ? colX.no + 4 : colX.no + 140;
    const rowLineY = subY + (i % 4) * 6.5;

    doc.setTextColor(88, 28, 135);
    doc.text(`${d.day}:`, colLeft, rowLineY);

    if (d.day === 'Sabtu') {
      doc.setTextColor(180, 83, 9); // Highlight Sabtu
      doc.setFont('Helvetica', 'bold');
    } else {
      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'normal');
    }
    doc.text(d.info, colLeft + 18, rowLineY);
  });

  // Footer Signature
  const sigY = 160;
  const sigX = 220;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), sigX, sigY);
  doc.text('Mengetahui,', sigX, sigY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRT 1 Kabupaten Kediri', sigX, sigY + 8);

  try {
    const qrStr = `JADWAL KHUSUS WALI ASRAMA (9 STAFF)\nSRT 1 KABUPATEN KEDIRI\nFadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, sigY + 6, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY + 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 32);

  doc.save(`Jadwal_Khusus_9_Wali_Asrama.pdf`);
};

/**
 * PDF Generator: Klasifikasi Shift Harian (Layout 4-Box Grid sesuai Screenshot)
 * 28 Wali Asuh per Tanggal (1-31 Agustus 2026)
 */
export const generateKlasifikasiShiftHarian28PDF = async (
  selectedDay: number,
  items: any[],
  docInstance?: jsPDF,
  isMultiPageMode: boolean = false
) => {
  const doc = docInstance || new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1 Aug 2026 = Saturday (Sabtu)
  const namaHariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dateObj = new Date(2026, 7, selectedDay);
  const dayName = namaHariList[dateObj.getDay()];

  // 1. Header Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(10, 10, 190, 13, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`KLASIFIKASI SHIFT PIKET WALI ASUH - HARI ${dayName.toUpperCase()}, ${selectedDay} AGUSTUS 2026`, 105, 18, { align: 'center' });

  // 2. Subtitle Bar
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(10, 23, 190, 6, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI • TANGGAL ${selectedDay} AGUSTUS 2026 • POLA SHIFT HARIAN`, 105, 27, { align: 'center' });

  // Filter items for selectedDay
  const shiftPagi = items.filter(i => (i.shifts ? i.shifts[selectedDay] === 'P' : false));
  const shiftSore = items.filter(i => (i.shifts ? i.shifts[selectedDay] === 'S' : false));
  const shiftMalam = items.filter(i => (i.shifts ? i.shifts[selectedDay] === 'M' : false));
  const shiftOff = items.filter(i => i.shifts && i.shifts[selectedDay] !== 'P' && i.shifts[selectedDay] !== 'S' && i.shifts[selectedDay] !== 'M');

  // Render 4 Shift Boxes in a 2x2 Grid
  const boxes = [
    {
      title: 'SHIFT PAGI (07.00 – 15.00 WIB)',
      items: shiftPagi,
      x: 10,
      y: 32,
      w: 92,
      h: 102,
      headerBg: [5, 150, 105], // Emerald 600
      bodyBg: [240, 253, 244], // Emerald 50
      borderColor: [167, 243, 208], // Emerald 200
      badgeText: `${shiftPagi.length} Personel`
    },
    {
      title: 'SHIFT SORE (15.00 – 23.00 WIB)',
      items: shiftSore,
      x: 108,
      y: 32,
      w: 92,
      h: 102,
      headerBg: [217, 119, 6], // Amber 600
      bodyBg: [254, 252, 232], // Amber 50
      borderColor: [253, 230, 138], // Amber 200
      badgeText: `${shiftSore.length} Personel`
    },
    {
      title: 'SHIFT MALAM (23.00 – 07.00 WIB)',
      items: shiftMalam,
      x: 10,
      y: 137,
      w: 92,
      h: 102,
      headerBg: [67, 56, 202], // Indigo 700
      bodyBg: [238, 242, 255], // Indigo 50
      borderColor: [199, 210, 254], // Indigo 200
      badgeText: `${shiftMalam.length} Personel`
    },
    {
      title: 'LEPAS PIKET / OFF (Bebas Tugas)',
      items: shiftOff,
      x: 108,
      y: 137,
      w: 92,
      h: 102,
      headerBg: [225, 29, 72], // Rose 600
      bodyBg: [255, 241, 242], // Rose 50
      borderColor: [254, 205, 211], // Rose 200
      badgeText: `${shiftOff.length} Personel`
    }
  ];

  boxes.forEach(box => {
    // Body Background
    doc.setFillColor(box.bodyBg[0], box.bodyBg[1], box.bodyBg[2]);
    doc.rect(box.x, box.y, box.w, box.h, 'F');

    // Body Border
    doc.setDrawColor(box.borderColor[0], box.borderColor[1], box.borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(box.x, box.y, box.w, box.h, 'D');

    // Header Background
    doc.setFillColor(box.headerBg[0], box.headerBg[1], box.headerBg[2]);
    doc.rect(box.x, box.y, box.w, 7.5, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(box.title, box.x + 3, box.y + 5);

    // Badge
    doc.setFontSize(6.5);
    doc.text(box.badgeText, box.x + box.w - 3, box.y + 5, { align: 'right' });

    // Personnel List - Dynamic Row Height & Font Size Scaling
    const totalItems = box.items.length;
    const availableHeight = box.h - 13; // ~89mm available for list
    const stepY = totalItems > 0 ? Math.min(4.3, Math.max(2.4, availableHeight / totalItems)) : 4.3;
    const fontSize = stepY < 3.0 ? 5.5 : stepY < 3.8 ? 6.2 : 7.2;
    const boxRectH = Math.max(2.0, stepY - 0.3);

    let listY = box.y + 10.5 + (stepY > 3.5 ? 2.0 : 1.0);

    if (box.items.length === 0) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('- Tidak ada personel -', box.x + box.w / 2, listY + 5, { align: 'center' });
    } else {
      box.items.forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(box.x + 1, listY - (boxRectH * 0.75), box.w - 2, boxRectH, 'F');
        }

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(fontSize);

        const shiftCode = box.title.includes('PAGI') ? 'P' : box.title.includes('SORE') ? 'S' : box.title.includes('MALAM') ? 'M' : 'OFF';
        const slotCode = shiftCode !== 'OFF' ? getKodeSlotSOP(shiftCode, idx) : '';
        const statusTag = item.shifts[selectedDay] === 'C' ? ' (Cuti)' : item.shifts[selectedDay] === 'SKT' ? ' (Sakit)' : '';
        const nameStr = `${idx + 1}. ${slotCode ? `[${slotCode}] ` : ''}${item.nama}${item.anakAsuh ? ` (${item.anakAsuh})` : ''}${statusTag}`;
        
        // Truncate if string exceeds box width
        const maxStrWidth = box.w - 6;
        let finalStr = nameStr;
        if (doc.getTextWidth(finalStr) > maxStrWidth) {
          while (doc.getTextWidth(finalStr + '...') > maxStrWidth && finalStr.length > 5) {
            finalStr = finalStr.slice(0, -1);
          }
          finalStr += '...';
        }

        doc.text(finalStr, box.x + 3, listY);
        listY += stepY;
      });
    }
  });

  // Footer Info Note
  const footerY = 242;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, footerY, 190, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Catatan: Kode [P1-P4, S1-S12, M1-M4] merujuk pada penugasan SOP spesifik pendampingan anak asuh.`, 105, footerY + 4.5, { align: 'center' });

  // Signature Block
  const sigY = 252;
  const sigX = 145;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Kediri, ${selectedDay} Agustus 2026`, sigX, sigY);
  doc.text('Mengetahui,', sigX, sigY + 4);
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRMA 24 Kediri', sigX, sigY + 8);

  try {
    const qrStr = `KLASIFIKASI SHIFT HARIAN WALI ASUH\nTanggal: ${dayName}, ${selectedDay} Agustus 2026\nSRMA 24 KEDIRI\nKepala Sekolah: Fadeli, S.Pd., M.Pd.`;
    const qrUrl = await QRCode.toDataURL(qrStr, { margin: 1, width: 100 });
    doc.addImage(qrUrl, 'PNG', sigX - 22, sigY + 6, 16, 16);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, sigY + 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, sigY + 32);

  // PAGE 2: Lembar Rincian Penugasan SOP Personel Piket (Only for Single Day Print)
  if (!isMultiPageMode) {
    doc.addPage();

    // Header Page 2
    let p2Y = 10;
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(10, p2Y, 190, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`LEMBAR INTEGRASI TUGAS SOP PER PERSONEL PIKET - ${dayName.toUpperCase()}, ${selectedDay} AGUSTUS 2026`, 105, p2Y + 7.5, { align: 'center' });
    p2Y += 15;

    // Build Rows
    const sopRows: any[] = [];
    let rowNo = 1;

    // Shift Pagi
    shiftPagi.forEach((item: any, idx: number) => {
      const slot = getKodeSlotSOP('P', idx);
      const desc = getDeskripsiSlotSOP(slot);
      sopRows.push([
        rowNo++,
        item.nama,
        `PAGI\n[${slot}]`,
        `${desc.label}\nUnit: ${desc.unit}`,
        desc.deskripsi
      ]);
    });

    // Shift Sore
    shiftSore.forEach((item: any, idx: number) => {
      const slot = getKodeSlotSOP('S', idx);
      const desc = getDeskripsiSlotSOP(slot);
      sopRows.push([
        rowNo++,
        item.nama,
        `SORE\n[${slot}]`,
        `${desc.label}\nUnit: ${desc.unit}`,
        desc.deskripsi
      ]);
    });

    // Shift Malam
    shiftMalam.forEach((item: any, idx: number) => {
      const slot = getKodeSlotSOP('M', idx);
      const desc = getDeskripsiSlotSOP(slot);
      sopRows.push([
        rowNo++,
        item.nama,
        `MALAM\n[${slot}]`,
        `${desc.label}\nUnit: ${desc.unit}`,
        desc.deskripsi
      ]);
    });

    autoTable(doc, {
      startY: p2Y,
      head: [['NO', 'NAMA WALI ASUH', 'SHIFT & KODE', 'FOKUS & UNIT PENDAMPINGAN', 'RINCIAN SOP TUGAS & TANGGUNG JAWAB HARIAN']],
      body: sopRows,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'middle',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 42 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
        3: { fontStyle: 'bold', cellWidth: 45 },
        4: { cellWidth: 68 }
      },
      didDrawPage: (data) => {
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text('SRMA 24 Kediri — Lembar Penugasan SOP Harian Wali Asuh', 10, 287);
        doc.text('Halaman ' + doc.getNumberOfPages(), 105, 287, { align: 'center' });
      }
    });

    doc.save(`Klasifikasi_Shift_dan_SOP_Tugas_${selectedDay}_Agt_2026.pdf`);
  }
};

/**
 * PDF Generator: Rekap Absen Harian untuk 28 Wali Asuh (Presensi Tabel)
 */
export const generateRekapAbsenHarian28PDF = async (
  selectedDay: number,
  items: any[],
  docInstance?: jsPDF,
  isMultiPageMode: boolean = false
) => {
  const doc = docInstance || new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1 Aug 2026 = Saturday (Sabtu)
  const namaHariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dateObj = new Date(2026, 7, selectedDay);
  const dayName = namaHariList[dateObj.getDay()];

  // Kop Surat Header
  const startX = 14;
  let currentY = 12;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('KEMENTERIAN SOSIAL REPUBLIK INDONESIA', 105, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFontSize(9);
  doc.text('PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', 105, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI', 105, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Gedung Balai Pengembangan Kompetensi Aparatur Sipil Negara', 105, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text('Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri, Jawa Timur', 105, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text('Pos-el: srma24kediri@gmail.com Kode Pos: 64152', 105, currentY, { align: 'center' });
  currentY += 4;

  // Double Line Separator
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(startX, currentY, 196, currentY);
  currentY += 1.2;
  doc.setLineWidth(0.2);
  doc.line(startX, currentY, 196, currentY);
  currentY += 6;

  // Title Document
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('REKAPITULASI PRESENSI & KEHADIRAN SHIFT HARIAN WALI ASUH', 105, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(9.5);
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.text(`TANGGAL: ${dayName.toUpperCase()}, ${selectedDay} AGUSTUS 2026`, 105, currentY, { align: 'center' });
  currentY += 7;

  // Shift Statistics Box on top
  const countP = items.filter(i => i.shifts && i.shifts[selectedDay] === 'P').length;
  const countS = items.filter(i => i.shifts && i.shifts[selectedDay] === 'S').length;
  const countM = items.filter(i => i.shifts && i.shifts[selectedDay] === 'M').length;
  const countC = items.filter(i => i.shifts && i.shifts[selectedDay] === 'C').length;
  const countSkt = items.filter(i => i.shifts && i.shifts[selectedDay] === 'SKT').length;
  const countOff = items.filter(i => i.shifts && (i.shifts[selectedDay] === 'O' || i.shifts[selectedDay] === 'LP' || i.shifts[selectedDay] === 'OFF')).length;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(startX, currentY, 182, 11, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Wali Asuh: ${items.length} Personel`, startX + 4, currentY + 7);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`• Shift Pagi: ${countP}`, startX + 48, currentY + 7);

  doc.setTextColor(217, 119, 6); // Amber
  doc.text(`• Shift Sore: ${countS}`, startX + 78, currentY + 7);

  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(`• Shift Malam: ${countM}`, startX + 108, currentY + 7);

  doc.setTextColor(100, 116, 139); // Slate
  doc.text(`• Off/Lepas: ${countOff}`, startX + 138, currentY + 7);

  if (countC > 0 || countSkt > 0) {
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(`• Cuti/Skt: ${countC + countSkt}`, startX + 165, currentY + 7);
  }

  currentY += 15;

  // Table Column Definitions
  const cols = {
    no: { x: startX, w: 8, label: 'No' },
    nama: { x: startX + 8, w: 48, label: 'Nama Wali Asuh' },
    anakAsuh: { x: startX + 56, w: 25, label: 'Anak Asuh' },
    shift: { x: startX + 81, w: 24, label: 'Jadwal Shift' },
    jam: { x: startX + 105, w: 28, label: 'Jam Dinas' },
    presensi: { x: startX + 133, w: 26, label: 'Status Kehadiran' },
    paraf: { x: startX + 159, w: 23, label: 'Paraf / TTD' }
  };

  // Header Table
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(startX, currentY, 182, 6, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  doc.text(cols.no.label, cols.no.x + 4, currentY + 4, { align: 'center' });
  doc.text(cols.nama.label, cols.nama.x + 2, currentY + 4);
  doc.text(cols.anakAsuh.label, cols.anakAsuh.x + 2, currentY + 4);
  doc.text(cols.shift.label, cols.shift.x + cols.shift.w / 2, currentY + 4, { align: 'center' });
  doc.text(cols.jam.label, cols.jam.x + cols.jam.w / 2, currentY + 4, { align: 'center' });
  doc.text(cols.presensi.label, cols.presensi.x + cols.presensi.w / 2, currentY + 4, { align: 'center' });
  doc.text(cols.paraf.label, cols.paraf.x + cols.paraf.w / 2, currentY + 4, { align: 'center' });

  currentY += 6;

  // Render Rows
  const rowHeight = 6.2;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 1;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, currentY, 182, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.rect(startX, currentY, 182, rowHeight, 'S');

    // Dividers
    doc.line(cols.nama.x, currentY, cols.nama.x, currentY + rowHeight);
    doc.line(cols.anakAsuh.x, currentY, cols.anakAsuh.x, currentY + rowHeight);
    doc.line(cols.shift.x, currentY, cols.shift.x, currentY + rowHeight);
    doc.line(cols.jam.x, currentY, cols.jam.x, currentY + rowHeight);
    doc.line(cols.presensi.x, currentY, cols.presensi.x, currentY + rowHeight);
    doc.line(cols.paraf.x, currentY, cols.paraf.x, currentY + rowHeight);

    // Data
    const shiftVal = item.shifts ? item.shifts[selectedDay] || '-' : '-';

    let shiftLabel = 'OFF';
    let jamLabel = '-';
    let badgeColor = [100, 116, 139]; // slate

    if (shiftVal === 'P') {
      shiftLabel = 'PAGI (P)';
      jamLabel = '07:00 - 15:00';
      badgeColor = [16, 185, 129]; // emerald
    } else if (shiftVal === 'S') {
      shiftLabel = 'SORE (S)';
      jamLabel = '15:00 - 23:00';
      badgeColor = [217, 119, 6]; // amber
    } else if (shiftVal === 'M') {
      shiftLabel = 'MALAM (M)';
      jamLabel = '23:00 - 08:00';
      badgeColor = [79, 70, 229]; // indigo
    } else if (shiftVal === 'LP') {
      shiftLabel = 'LEPAS (LP)';
      jamLabel = 'Izin Istirahat';
      badgeColor = [100, 116, 139];
    } else if (shiftVal === 'C') {
      shiftLabel = 'CUTI (C)';
      jamLabel = 'Izin Cuti';
      badgeColor = [147, 51, 234]; // purple
    } else if (shiftVal === 'SKT') {
      shiftLabel = 'SAKIT';
      jamLabel = 'Izin Sakit';
      badgeColor = [225, 29, 72]; // rose
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${idx + 1}`, cols.no.x + 4, currentY + 4.2, { align: 'center' });

    // Truncate name if long
    let nameText = item.nama;
    if (nameText.length > 25) nameText = nameText.substring(0, 24) + '..';
    doc.text(nameText, cols.nama.x + 2, currentY + 4.2);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(item.anakAsuh || '-', cols.anakAsuh.x + 2, currentY + 4.2);

    // Shift Tag Badge
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.text(shiftLabel, cols.shift.x + cols.shift.w / 2, currentY + 4.2, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(jamLabel, cols.jam.x + cols.jam.w / 2, currentY + 4.2, { align: 'center' });

    // Presensi Checkbox
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('[  ] Hadir  [  ] Izin', cols.presensi.x + cols.presensi.w / 2, currentY + 4.2, { align: 'center' });

    currentY += rowHeight;
  });

  // Footer Signature Block
  currentY += 8;
  const sigXLeft = startX + 10;
  const sigXRight = startX + 125;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text(`Kediri, ${selectedDay} Agustus 2026`, sigXRight, currentY);
  currentY += 4;

  doc.text('Mengetahui,', sigXLeft, currentY);
  doc.text('Mengetahui,', sigXRight, currentY);
  currentY += 4;

  doc.setFont('Helvetica', 'bold');
  doc.text('Koordinator Wali Asuh SRMA 24', sigXLeft, currentY);
  doc.text('Kepala SRMA 24 Kediri', sigXRight, currentY);

  // QR verification
  try {
    const qrText = `REKAP PRESENSI HARIAN WALI ASUH\nTanggal: ${dayName}, ${selectedDay} Agustus 2026\nSRMA 24 KEDIRI\nValidasi Resmi`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 80 });
    doc.addImage(qrDataUrl, 'PNG', sigXRight - 20, currentY + 2, 16, 16);
  } catch (err) {
    console.warn('QR Code generation failed:', err);
  }

  currentY += 22;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Suhariyono, S.Pd.', sigXLeft, currentY);
  doc.text('Fadeli, S.Pd., M.Pd.', sigXRight, currentY);

  currentY += 3.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 198204122008011005', sigXLeft, currentY);
  doc.text('NIP. 196905211992031008', sigXRight, currentY);

  if (!isMultiPageMode) {
    doc.save(`Rekap_Absen_Harian_WaliAsuh_${selectedDay}_Agt_2026.pdf`);
  }
};

/**
 * Cetak Seluruh Rekap Absen Harian 31 Hari sekaligus (Multi-page PDF)
 */
export const generateSeluruhHariKlasifikasiShift28PDF = async (items: any[]) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let day = 1; day <= 31; day++) {
    if (day > 1) doc.addPage();
    await generateKlasifikasiShiftHarian28PDF(day, items, doc, true);
  }

  doc.save(`Klasifikasi_Shift_Harian_Lengkap_31_Hari_Agustus_2026.pdf`);
};

export const generateSeluruhHariRekapAbsen28PDF = generateSeluruhHariKlasifikasiShift28PDF;

/**
 * PDF Generator: Matriks Jadwal 28 Wali Asuh Agustus 2026 (Landscape A4)
 */
export const generateMatriksJadwal28PDF = async (items: any[]) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Kop Surat Landscape
  let currentY = 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('KEMENTERIAN SOSIAL REPUBLIK INDONESIA', 148.5, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(9);
  doc.text('PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI — SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI', 148.5, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Gedung Balai Pengembangan Kompetensi ASN, Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri, Jawa Timur', 148.5, currentY, { align: 'center' });
  currentY += 4;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(10, currentY, 287, currentY);
  currentY += 5;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('JADWAL PEMBAGIAN SHIFT 28 WALI ASUH — AGUSTUS 2026', 148.5, currentY, { align: 'center' });
  currentY += 6;

  // Table Setup
  const startX = 10;
  const colNoW = 7;
  const colNamaW = 38;
  const colAnakW = 16;
  const colDayW = 5.8; // 31 * 5.8 = 179.8 mm
  const colTotalW = 6.2; // 6 * 6.2 = 37.2 mm

  // Header row
  doc.setFillColor(15, 23, 42);
  doc.rect(startX, currentY, 277, 6, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);

  doc.text('No', startX + colNoW / 2, currentY + 4, { align: 'center' });
  doc.text('Nama Wali Asuh', startX + colNoW + 2, currentY + 4);
  doc.text('Anak Asuh', startX + colNoW + colNamaW + 1, currentY + 4);

  // Day Headers 1..31
  let dayX = startX + colNoW + colNamaW + colAnakW;
  for (let d = 1; d <= 31; d++) {
    doc.text(`${d}`, dayX + colDayW / 2, currentY + 4, { align: 'center' });
    dayX += colDayW;
  }

  // Totals Headers
  doc.text('P', dayX + colTotalW / 2, currentY + 4, { align: 'center' });
  doc.text('S', dayX + colTotalW * 1.5, currentY + 4, { align: 'center' });
  doc.text('M', dayX + colTotalW * 2.5, currentY + 4, { align: 'center' });
  doc.text('LP', dayX + colTotalW * 3.5, currentY + 4, { align: 'center' });
  doc.text('O', dayX + colTotalW * 4.5, currentY + 4, { align: 'center' });
  doc.text('JK', dayX + colTotalW * 5.5, currentY + 4, { align: 'center' });

  currentY += 6;

  // Render Table Rows
  const rowH = 4.2;
  doc.setFontSize(5.5);

  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, currentY, 277, rowH, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.rect(startX, currentY, 277, rowH, 'S');

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    doc.text(`${idx + 1}`, startX + colNoW / 2, currentY + 3, { align: 'center' });

    let nameStr = item.nama;
    if (nameStr.length > 22) nameStr = nameStr.substring(0, 21) + '..';
    doc.text(nameStr, startX + colNoW + 1, currentY + 3);

    doc.setFont('Helvetica', 'bold');
    doc.text(item.anakAsuh || '-', startX + colNoW + colNamaW + 1, currentY + 3);

    // Days 1..31
    let dX = startX + colNoW + colNamaW + colAnakW;
    for (let d = 1; d <= 31; d++) {
      const shift = item.shifts ? item.shifts[d] || '' : '';
      if (shift === 'P') doc.setTextColor(16, 185, 129);
      else if (shift === 'S') doc.setTextColor(217, 119, 6);
      else if (shift === 'M') doc.setTextColor(79, 70, 229);
      else if (shift === 'C') doc.setTextColor(147, 51, 234);
      else if (shift === 'SKT') doc.setTextColor(225, 29, 72);
      else doc.setTextColor(148, 163, 184);

      doc.setFont('Helvetica', shift === 'P' || shift === 'S' || shift === 'M' ? 'bold' : 'normal');
      doc.text(shift, dX + colDayW / 2, currentY + 3, { align: 'center' });
      dX += colDayW;
    }

    // Totals
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.pFul ?? item.p ?? 0}`, dX + colTotalW / 2, currentY + 3, { align: 'center' });
    doc.text(`${item.s ?? 0}`, dX + colTotalW * 1.5, currentY + 3, { align: 'center' });
    doc.text(`${item.m ?? 0}`, dX + colTotalW * 2.5, currentY + 3, { align: 'center' });
    doc.text(`${item.lp ?? 0}`, dX + colTotalW * 3.5, currentY + 3, { align: 'center' });
    doc.text(`${item.off ?? 0}`, dX + colTotalW * 4.5, currentY + 3, { align: 'center' });
    doc.text(`${item.jk ?? 0}`, dX + colTotalW * 5.5, currentY + 3, { align: 'center' });

    currentY += rowH;
  });

  // Footer Signature Block
  currentY += 6;
  const sigX = 220;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Kediri, 1 Agustus 2026', sigX, currentY);
  currentY += 3.5;
  doc.text('Mengetahui,', sigX, currentY);
  currentY += 3.5;
  doc.setFont('Helvetica', 'bold');
  doc.text('Kepala SRMA 24 Kediri', sigX, currentY);

  currentY += 16;
  doc.setFontSize(8);
  doc.text('Fadeli, S.Pd., M.Pd.', sigX, currentY);
  currentY += 3.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('NIP. 196905211992031008', sigX, currentY);

  doc.save(`Matriks_Jadwal_28_WaliAsuh_Agustus_2026.pdf`);
};

/**
 * PDF Generator: Uraian Tugas & SOP Pendampingan Harian Wali Asuh (Portrait A4)
 */
export const generateUraianTugasHarianPDF = async (activities: any[]) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Kop Surat Official
  let currentY = 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('KEMENTERIAN SOSIAL REPUBLIK INDONESIA', 105, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(8.5);
  doc.text('PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', 105, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(10);
  doc.text('SEKOLAH RAKYAT MENENGAH ATAS 24 KEDIRI', 105, currentY, { align: 'center' });
  currentY += 4;

  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Gedung Balai Pengembangan Kompetensi ASN, Gg. 2 Bulusari Utara, Bulusari, Kec. Tarokan, Kab. Kediri', 105, currentY, { align: 'center' });
  currentY += 4;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(10, currentY, 200, currentY);
  currentY += 5;

  // Title Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(10, currentY, 190, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('STANDAR OPERASIONAL PROSEDUR (SOP) & URAIAN TUGAS HARIAN WALI ASUH', 105, currentY + 5.5, { align: 'center' });
  currentY += 11;

  // Legend Box
  doc.setFillColor(241, 245, 249);
  doc.rect(10, currentY, 190, 10, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(10, currentY, 190, 10, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('KODE PETUGAS:', 13, currentY + 3.5);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('M1-M4: Shift Malam (03.30-07.00 WIB)  |  P1-P4: Shift Pagi (07.00-15.00 WIB)  |  S1-S12: Shift Sore (15.00-23.00 WIB)', 35, currentY + 3.5);
  doc.text('Catatan: Wali Asuh mengacu pada kode urut petugas piket yang bertugas pada hari berkenaan.', 13, currentY + 7.5);
  currentY += 13;

  // Table Columns
  const colX = { no: 10, pukul: 18, kelas: 42, kegiatan: 68, tempat: 135, kode: 168 };
  const colW = { no: 8, pukul: 24, kelas: 26, kegiatan: 67, tempat: 33, kode: 32 };
  const headerH = 7;

  autoTable(doc, {
    startY: currentY,
    head: [[
      'NO', 'PUKUL (WIB)', 'PESERTA', 'URAIAN KEGIATAN & TUGAS PENDAMPINGAN', 'TEMPAT', 'PETUGAS / KODE'
    ]],
    body: activities.map((act, index) => [
      index + 1,
      act.pukul,
      act.kelas,
      `${act.kegiatan}\n${act.uraian}`,
      act.tempat,
      act.waliAsuhKode
    ]),
    margin: { left: 10, right: 10, bottom: 20 },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      valign: 'top',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 70 },
      4: { cellWidth: 34 },
      5: { halign: 'center', cellWidth: 32, fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      // Footer page number
      const str = 'Halaman ' + doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.text(str, 105, 287, { align: 'center' });
      doc.text('Dokumen Resmi SRMA 24 Kediri — SOP Pendampingan Keasramaan', 10, 287);
    }
  });

  doc.save(`SOP_Uraian_Tugas_Harian_WaliAsuh_SRMA24.pdf`);
};







