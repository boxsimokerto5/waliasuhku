import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waliasuhku.app',
  appName: 'WaliAsuhku',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
