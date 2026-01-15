import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalwellbeing.app',
  appName: 'Digital Wellbeing',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
