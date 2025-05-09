
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.84ef75ac633249aab09193baeab261e9',
  appName: 'crusty-pizza-pal',
  webDir: 'dist',
  server: {
    url: 'https://84ef75ac-6332-49aa-b091-93baeab261e9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'my-release-key.keystore',
      keystorePassword: 'password',
      keystoreAlias: 'alias_name',
      keystoreAliasPassword: 'password',
      signingType: 'apk'
    }
  }
};

export default config;
