import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tstour.app',
  appName: 'Ts Tour',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;