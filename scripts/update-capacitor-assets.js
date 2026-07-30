import fs from 'fs';
import path from 'path';

console.log('=== Updating Capacitor Android App Icons & Assets ===');

const androidResDir = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(androidResDir)) {
  console.log('Directory android/app/src/main/res does not exist yet. It will be created when "npx cap add android" runs.');
  process.exit(0);
}

const drawableDir = path.join(androidResDir, 'drawable');
const mipmapAnyDpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');

if (!fs.existsSync(drawableDir)) {
  fs.mkdirSync(drawableDir, { recursive: true });
}
if (!fs.existsSync(mipmapAnyDpiDir)) {
  fs.mkdirSync(mipmapAnyDpiDir, { recursive: true });
}

// 1. Adaptive Icon Background (Gradient)
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

// 2. Adaptive Icon Foreground (Heart Handshake Emblem)
const fgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Heart Handshake Emblem -->
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
    <!-- Sparkles -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M 27,27 L 28,29 L 30,30 L 28,31 L 27,33 L 26,31 L 24,30 L 26,29 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M 81,27 L 82,29 L 84,30 L 82,31 L 81,33 L 80,31 L 78,30 L 80,29 Z" />
</vector>`;

// 3. Adaptive Icon Definition XMLs
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background drawable="@drawable/ic_launcher_background"/>
    <foreground drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;

fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), bgXml, 'utf8');
fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), fgXml, 'utf8');
fs.writeFileSync(path.join(mipmapAnyDpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
fs.writeFileSync(path.join(mipmapAnyDpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

console.log('✓ Successfully created Android Adaptive Icon XML drawables.');
