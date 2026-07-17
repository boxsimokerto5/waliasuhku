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
