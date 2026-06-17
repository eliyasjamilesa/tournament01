
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ignitearena.app',
  appName: 'Ignite Arena',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
