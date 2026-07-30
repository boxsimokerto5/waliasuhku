# Panduan Build APK & AAB (Google Play Store) via GitHub Actions

Workflow GitHub Actions telah dikonfigurasi di file `.github/workflows/build-android.yml`.

---

## 🚀 Cara Menjalankan Build Otomatis di GitHub

### Option A: Otomatis Setiap Commit / Push
Setiap kali Anda me-`push` kode ke branch `main` atau `master` di GitHub, GitHub Actions akan **otomatis mendeteksi, membuat aplikasi Android, membuat signature/keystore, dan mempublikasikan file `.apk` dan `.aab`**.

### Option B: Jalankan Secara Manual (Workflow Dispatch)
1. Buka repository Anda di GitHub.
2. Klik tab **Actions** di menu atas.
3. Pilih workflow **Build & Sign Android APK & AAB (Google Play Store)**.
4. Klik tombol **Run workflow** -> pilih branch `main` -> Klik **Run workflow**.

---

## 📦 Hasil Output (Artifacts)

Setelah proses build selesai (sekitar 3–5 menit), buka halaman detail run workflow di GitHub Actions. Di bagian bawah (**Artifacts**), Anda akan menemukan 3 file yang dapat diunduh:

1. **`WaliAsuhku-APK-Release`**  
   - File `.apk` yang sudah ditandatangani (signed).  
   - Bisa langsung dikirim ke HP Android untuk dites / diinstall langsung.

2. **`WaliAsuhku-AAB-PlayStore`**  
   - File `.aab` (Android App Bundle) yang sudah ditandatangani.  
   - **Ini adalah file utama yang di-upload ke Google Play Console** untuk mempublikasikan aplikasi ke Google Play Store.

3. **`Keystore-Backup-Simpan-Aman`**  
   - Berisi file `release.jks` dan `KEYSTORE_INFO.txt` (password & alias keystore).  
   - **PENTING:** Unduh dan simpan file `release.jks` serta password ini di komputer Anda secara aman! Setiap kali Anda ingin merilis update versi baru aplikasi di Play Store, Google mewajibkan penggunaan keystore yang sama.

---

## 🔑 (Opsional) Menggunakan Keystore Anda Sendiri via GitHub Secrets

Jika Anda sudah memiliki file Keystore pribadi untuk Play Store dan ingin menggunakannya di GitHub Actions:

1. Ubah file `release.jks` Anda ke format Base64 dengan perintah di terminal:
   ```bash
   base64 -w 0 release.jks > keystore_base64.txt
   ```
2. Buka repository GitHub Anda -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
3. Tambahkan 4 Secrets berikut:
   - `ANDROID_KEYSTORE_BASE64`: Isi dengan teks dari `keystore_base64.txt`
   - `ANDROID_KEYSTORE_PASSWORD`: Password keystore Anda
   - `ANDROID_KEY_ALIAS`: Alias key Anda
   - `ANDROID_KEY_PASSWORD`: Password alias key Anda

Jika Secrets ini diisi, GitHub Actions akan otomatis menggunakannya sebagai kunci tanda tangan produksi Anda. Jika belum diisi, GitHub Actions akan membuatkan signature/keystore rilis otomatis secara mandiri.
