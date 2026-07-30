import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

console.log('=== Generating & Updating WaliAsuhku Capacitor App Icons & Assets ===');

async function main() {
  const rootDir = process.cwd();
  const assetsDir = path.join(rootDir, 'assets');
  const publicDir = path.join(rootDir, 'public');
  const svgIconPath = path.join(assetsDir, 'icon.svg');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (!fs.existsSync(svgIconPath)) {
    console.error('Error: assets/icon.svg not found!');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgIconPath);

  // 1. Generate PNG source files for @capacitor/assets & PWA
  console.log('Generating high-res PNG source assets...');

  const png1024 = await sharp(svgBuffer).resize(1024, 1024).png().toBuffer();
  
  // Save to assets and public
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), png1024);
  fs.writeFileSync(path.join(assetsDir, 'icon-only.png'), png1024);
  fs.writeFileSync(path.join(assetsDir, 'icon-foreground.png'), png1024);
  fs.writeFileSync(path.join(assetsDir, 'icon-background.png'), png1024);
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), png1024);
  fs.writeFileSync(path.join(assetsDir, 'splash-dark.png'), png1024);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), png1024);

  console.log('✓ Successfully generated 1024x1024 PNG assets in /assets and /public.');

  // 2. Check if Android project exists
  const androidResDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

  if (!fs.existsSync(androidResDir)) {
    console.log('Note: android/app/src/main/res does not exist yet. It will be updated when "npx cap add android" runs.');
    return;
  }

  console.log('Updating Android mipmap & drawable assets directly...');

  const drawableDir = path.join(androidResDir, 'drawable');
  const mipmapAnyDpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');

  if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });
  if (!fs.existsSync(mipmapAnyDpiDir)) fs.mkdirSync(mipmapAnyDpiDir, { recursive: true });

  // XML Adaptive Vector Drawables
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:pathData="M0,0h108v108h-108z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:startX="0"
                android:startY="0"
                android:endX="108"
                android:endY="108"
                android:type="linear">
                <item android:color="#FF6366F1" android:offset="0.0" />
                <item android:color="#FFA855F7" android:offset="0.5" />
                <item android:color="#FFEC4899" android:offset="1.0" />
            </gradient>
        </aapt:attr>
    </path>
</vector>`;

  const fgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="2.5"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M65.25 49.5c3.35-3.28 6.75-7.22 6.75-12.375a12.375 12.375 0 0 0 -21.375-8.775c-3.95-3.375-6.165-4.5-10.125-4.5A12.375 12.375 0 0 0 28.125 37.125c0 5.175 3.375 9.113 6.75 12.375l15.75 15.75Z" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="2.2"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M49.5 29.25l-6.66 6.66a4.88 4.88 0 0 0 0 6.93v0c1.845 1.845 4.793 1.913 6.75 0.158l4.658-4.275a6.345 6.345 0 0 1 8.528 0l6.66 6.66" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="2.2"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M38.25 51.75l-6.75-6.75" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="2.2"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M56.25 47.25l-6.75-6.75" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M 27,27 L 28,29 L 30,30 L 28,31 L 27,33 L 26,31 L 24,30 L 26,29 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M 81,27 L 82,29 L 84,30 L 82,31 L 81,33 L 80,31 L 78,30 L 80,29 Z" />
</vector>`;

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background drawable="@drawable/ic_launcher_background"/>
    <foreground drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;

  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), bgXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), fgXml, 'utf8');
  fs.writeFileSync(path.join(mipmapAnyDpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
  fs.writeFileSync(path.join(mipmapAnyDpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

  // 3. Generate PNGs for all mipmap density folders
  const densities = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 108 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 108 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 108 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 108 },
  ];

  for (const { dir, size, fgSize } of densities) {
    const targetDir = path.join(androidResDir, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Square Launcher PNG
    const squarePng = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), squarePng);

    // Round Launcher PNG
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );
    const roundPng = await sharp(svgBuffer)
      .resize(size, size)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundPng);

    // Foreground Launcher PNG
    const fgPng = await sharp(svgBuffer).resize(fgSize, fgSize).png().toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgPng);

    console.log(`✓ Updated ${dir} icons (${size}x${size}px)`);
  }

  // 4. Save splash image in drawable
  const splashPng = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(drawableDir, 'splash.png'), splashPng);

  console.log('🎉 Successfully updated all Android App Icons & Assets to WaliAsuhku branding!');
}

main().catch((err) => {
  console.error('Error updating capacitor assets:', err);
  process.exit(1);
});
