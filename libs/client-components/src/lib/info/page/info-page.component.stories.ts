import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppClientCoreModule } from '@nx-ng-starter/client-core';
import { AppClientMaterialModule } from '@nx-ng-starter/client-material';

import { AppInfoPage } from './info-page.component';

export default {
  title: 'AppInfoPage',
};

const testingEnvironment = {
  production: false,
  platform: '',
  appName: 'Nx Ng Starter Client',
  api: 'http://localhost:8080/api',
  envoyUrl: 'http://localhost:8081',
};

export const primary = () => ({
  moduleMetadata: {
    imports: [
      BrowserAnimationsModule,
      AppClientCoreModule.forRoot(testingEnvironment),
      AppClientMaterialModule.forRoot(),
    ],
  },
  component: AppInfoPage,
  props: {},
});
