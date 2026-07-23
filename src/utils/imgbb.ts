/**
 * ImgBB Upload & Image Compression Utility
 * Powered by ImgBB API & Cloudflare CDN Proxy (wsrv.nl)
 */

export const IMGBB_API_KEY = "0726bacdc4908851e9a7e23031377029";

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file using Canvas HTML5 before uploading.
 * Reduces 5MB-10MB camera uploads to ~100KB-200KB JPEG for fast transmission.
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    // If not an image, return raw file
    if (file.type && !file.type.startsWith('image/')) {
      if (file instanceof File) return resolve(file);
      return resolve(new File([file], 'upload.bin', { type: file.type }));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (file instanceof File) return resolve(file);
          return resolve(new File([file], 'photo.jpg', { type: 'image/jpeg' }));
        }

        // Draw and compress image
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              if (file instanceof File) return resolve(file);
              return resolve(new File([file], 'photo.jpg', { type: 'image/jpeg' }));
            }
            const fileName = file instanceof File ? file.name.replace(/\.[^/.]+$/, '') + '.jpg' : 'photo.jpg';
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Wraps an image URL with a Cloudflare CDN proxy (wsrv.nl / images.weserv.nl).
 * Makes previews reload super fast, prevents CORS issues, and caches globally on Cloudflare Edge.
 */
export function getCloudflareProxyUrl(url: string, width?: number): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  
  // If already proxied, return
  if (url.includes('wsrv.nl') || url.includes('images.weserv.nl')) {
    return url;
  }

  // Sanitize protocol
  const cleanUrl = url.replace(/^http:\/\//i, 'https://');
  const encoded = encodeURIComponent(cleanUrl);
  
  const widthParam = width ? `&w=${width}` : '';
  return `https://wsrv.nl/?url=${encoded}&output=jpg&q=80${widthParam}`;
}

export interface UploadResult {
  url: string;
  displayUrl: string;
  proxiedUrl: string;
  deleteUrl?: string;
}

/**
 * Compresses and uploads an image to ImgBB using the user's API key.
 * Returns both direct ImgBB URL and Cloudflare proxied preview URL.
 */
export async function uploadToImgBB(
  file: File | Blob,
  customApiKey?: string
): Promise<UploadResult> {
  const apiKey = customApiKey || import.meta.env.VITE_IMGBB_API_KEY || IMGBB_API_KEY;

  // Step 1: Compress image client-side first
  const compressedFile = await compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.75,
  });

  // Step 2: Prepare FormData for ImgBB API
  const formData = new FormData();
  formData.append('image', compressedFile);

  // Step 3: Send POST request to ImgBB endpoint
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `ImgBB Upload Gagal: HTTP ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Gagal mengunggah foto ke ImgBB');
  }

  const directUrl = result.data.url || result.data.display_url;
  const proxiedUrl = getCloudflareProxyUrl(directUrl);

  return {
    url: directUrl,
    displayUrl: result.data.display_url || directUrl,
    proxiedUrl,
    deleteUrl: result.data.delete_url,
  };
}
