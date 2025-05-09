
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.bemycrust.pizza',
  appName: 'BE MY CRUST',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
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
