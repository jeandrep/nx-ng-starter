import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule, MarkdownModuleConfig, MarkedOptions } from 'ngx-markdown';
import { environment } from '../environments/environment';
import { AppDocRoutingModule } from './app-routing.module';
import { AppDocRootComponent } from './componenets/root/root.component';
import { AppDocMarkdownReferenceTreeComponent } from './componenets/md-reference-tree/md-reference-tree.component';
import { AppDocMarkdownReferenceComponent } from './componenets/md-reference/md-reference.component';
import { AppDocStoreModule } from './modules/store/store.module';
import { AppClientMaterialModule } from '@nx-ng-starter/client-material';
import { WINDOW, windowFactory, documentFactory } from '@nx-ng-starter/client-util';
import { DOC_APP_ENV } from './interfaces/environment.interface';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';

const markdownModuleConfig: MarkdownModuleConfig = {
  loader: HttpClient,
  markedOptions: {
    provide: MarkedOptions,
    useValue: {
      gfm: true,
      breaks: false,
      pedantic: false,
      smartLists: true,
      smartypants: false,
    },
  },
};

@NgModule({
  declarations: [
    AppDocRootComponent,
    AppDocMarkdownReferenceTreeComponent,
    AppDocMarkdownReferenceComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    HttpClientModule,
    MarkdownModule.forRoot(markdownModuleConfig),
    AppDocRoutingModule,
    AppClientMaterialModule.forRoot(),
    FlexLayoutModule,
    NgxsModule.forRoot([], { developmentMode: !environment.production }),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production, collapsed: true }),
    NgxsRouterPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    AppDocStoreModule,
  ],
  providers: [
    { provide: WINDOW, useFactory: windowFactory },
    { provide: DOCUMENT, useFactory: documentFactory },
    { provide: DOC_APP_ENV, useValue: environment },
  ],
  bootstrap: [AppDocRootComponent],
})
export class AppDocModule {}