import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mony.management',
  appName: 'Money Management',
  // Capacitor bundles the Vite production build (relative base, so it loads
  // from the local webview file server).
  webDir: 'dist',
};

export default config;
