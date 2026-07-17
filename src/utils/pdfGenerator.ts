import { jsPDF } from 'jspdf';
import { User } from '../types';

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

/**
 * Generate a beautiful A4 Student Portfolio PDF with photo, biodata, achievements, and caregiver info
 */
export const generateStudentPortfolioPDF = async (student: User, users: User[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = student.fotoUrl ? await loadImage(student.fotoUrl) : '';
  const waliAsuh = users.find(u => u.id === student.waliAsuhId && u.role === 'wali_asuh');
  const waliAsuhName = waliAsuh ? waliAsuh.name : 'Belum ditentukan';

  const drawHeaderBlock = (pageNumber: number) => {
    // Top colored band
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, 210, 25, 'F');
    
    // Header Accent Line
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 25, 210, 2, 'F');

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
    doc.text(`Halaman ${pageNumber}`, 195, 12, { align: 'right' });
  };

  // Page 1 Setup
  drawHeaderBlock(1);

  // Profile section layout
  // 1. Photo Frame at x=155, y=35, w=40, h=45
  const photoX = 155;
  const photoY = 35;
  const photoW = 40;
  const photoH = 45;

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

  // 2. Student Metadata Panel at x=15, y=35, w=132, h=45
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(15, 35, 132, 45, 2, 2, 'F');

  // Let's draw fields
  // Left side info
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('Helvetica', 'normal');
  doc.text('NAMA LENGKAP ANAK ASUH', 20, 43);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  const safeStudentName = student.name.length > 25 ? student.name.substring(0, 23) + '...' : student.name;
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
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('USERNAME / ID AKUN', 85, 43);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.text(`@${student.username}`, 85, 48.5);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('WALI ASUH PENDAMPING', 85, 59);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  const safeWaliAsuhName = waliAsuhName.length > 20 ? waliAsuhName.substring(0, 18) + '...' : waliAsuhName;
  doc.text(safeWaliAsuhName, 85, 64);

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
  doc.line(15, currentY + 3, 195, currentY + 3);

  currentY += 9;

  // Let's create an elegant grid layout of 6 boxes for details
  // Grid layout config: 2 columns, 3 rows
  const gridW = 87;
  const gridH = 13;
  const col1X = 15;
  const col2X = 108;

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
    const safeVal = value.length > 42 ? value.substring(0, 39) + '...' : value;
    doc.text(safeVal, x + 4, y + 10);
  };

  const rupiahVal = `Rp ${(student.savingsBalance || 0).toLocaleString('id-ID')}`;

  drawGridItem(col1X, currentY, 'Nomor Induk Kependudukan (NIK)', student.nik || 'Belum diisi');
  drawGridItem(col2X, currentY, 'Nomor Kartu Keluarga (KK)', student.kk || 'Belum diisi');
  
  currentY += 17;
  drawGridItem(col1X, currentY, 'Nomor HP Orang Tua', student.parentPhone || 'Belum diisi');
  drawGridItem(col2X, currentY, 'Alamat Email', student.email || 'Belum diisi');

  currentY += 17;
  drawGridItem(col1X, currentY, 'Alamat Rumah / Asal', student.alamat || 'Belum diisi');
  drawGridItem(col2X, currentY, 'Saldo Tabungan Asrama', rupiahVal);

  currentY += 21;

  // Section 2: REKAM PRESTASI & PORTOFOLIO SISWA
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. REKAM PRESTASI & PORTOFOLIO SISWA', 15, currentY);

  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(15, currentY + 3, 195, currentY + 3);

  currentY += 10;

  const portfolios = student.portfolio || [];

  if (portfolios.length === 0) {
    // Print empty state notice
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(251, 191, 36); // Amber 400
    doc.setLineWidth(0.25);
    doc.roundedRect(15, currentY, 180, 15, 2, 2, 'FD');

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
      const descLines = doc.splitTextToSize(item.description, 135);
      const itemHeight = 12 + (descLines.length * 4);

      // Check for page overflow
      if (currentY + itemHeight > 260) {
        doc.addPage();
        drawHeaderBlock(2);
        
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('II. REKAM PRESTASI & PORTOFOLIO SISWA (Sambungan)', 15, 33);
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 35, 195, 35);
        currentY = 43;
      }

      // Draw item card wrapper background
      doc.setFillColor(252, 253, 255);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(15, currentY, 180, itemHeight - 2, 2, 2, 'FD');

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
  if (currentY + 35 > 280) {
    doc.addPage();
    drawHeaderBlock(3);
    currentY = 40;
  } else {
    currentY = Math.max(currentY + 10, 240); // Push signature block to bottom of the page
  }

  // Draw signature line and details
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, currentY - 5, 195, currentY - 5);

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
  doc.text('Tertanda,', 140, currentY + 5);
  doc.text('Wali Asuh Pendamping', 140, currentY + 9);
  doc.line(140, currentY + 28, 190, currentY + 28);
  doc.setFont('Helvetica', 'bold');
  doc.text(waliAsuhName, 140, currentY + 32);

  const safeStudentNameFile = student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`portofolio_siswa_${safeStudentNameFile}.pdf`);
};

