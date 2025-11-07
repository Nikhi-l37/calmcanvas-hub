import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.efbe28a2ea794dd8a955a30390665a53',
  appName: 'calmcanvas-hub',
  webDir: 'dist',
  server: {
    url: 'https://efbe28a2-ea79-4dd8-a955-a30390665a53.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
