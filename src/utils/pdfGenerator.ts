import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { User, ActivityChecklist, EventChecklist, EventChecklistOption } from '../types';

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



