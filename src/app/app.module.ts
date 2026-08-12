import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { MeasurErrorHandler } from './shared/errors/MeasurErrorHandler';
import { AppErrorModule } from './shared/errors/app-error.module';
import { ElectronService } from './electron/electron.service';
import { BrowserStorageAvailable, BrowserStorageService } from './shared/browser-storage.service';
import { CORE_DATA_WARNING } from './shared/snackbar-notification/snackbar.service';
import { filter, take } from 'rxjs/operators';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppErrorModule,
    CoreModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production && environment.useServiceWorker,
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: ErrorHandler, useClass: MeasurErrorHandler },
    provideAppInitializer(() => {
      const initializerFn = (initializeAppFactory)(inject(ElectronService), inject(SwUpdate), inject(BrowserStorageService));
      return initializerFn();
    }),
  ],
})
export class AppModule { }

export function initializeAppFactory(
  electronService: ElectronService,
  serviceWorkerUpdates: SwUpdate,
  browserStorageService: BrowserStorageService
) {
  console.log('MEASUR version', environment.version);
  console.time('initializeAppFactory');

  return async () => {
    const MAX_RELOAD_TRIES = 2;
    const RELOAD_TRIES = 'measur_reload_tries';
    const RELOAD_REASON = 'measur_reload_reason';
    const LOAD_ERROR = 'measur_loading_error';

    browserStorageService.detectAppStorageOptions().pipe(
      filter((val: BrowserStorageAvailable) => val !== undefined),
      take(1)
    ).subscribe((browserStorageOptions: BrowserStorageAvailable) => {
      browserStorageService.browserStorageAvailable.next(browserStorageOptions);

      if (browserStorageOptions.indexedDB.success === false && browserStorageOptions.indexedDB.failType === 'exception') {
        // * Display message - Browser is likely firefox or safari. app module imports will fail, snackbar warning will not load (unlike chrome or edge)
        const warningDiv = document.createElement('div');
        warningDiv.id = 'core-support-warning';
        warningDiv.style.cssText = `
          background: #ffcccc;
          color: #900;
          padding: 2em 1em 1.5em 1em;
          font-family: sans-serif;
          text-align: center;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 90vw;
          width: 75%;
          border-radius: 12px;
          z-index: 9999;
        `;
        warningDiv.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;margin-bottom:0.75em;">
            <img src='assets/images/app-icon.png' alt='MEASUR Icon' style='height:2.2em;width:2.2em;margin-right:0.7em;vertical-align:middle;'/>
            <h2 style="margin:0;font-size:1.5em;color:#900;display:inline-block;vertical-align:middle;">MEASUR Error</h2>
          </div>
          <div>${CORE_DATA_WARNING}</div>
        `;
        document.body.appendChild(warningDiv);
      }
    });


    if ((!electronService.isElectron && serviceWorkerUpdates.isEnabled)) {
      console.log('=== Initialize for production web');
    } else {
      console.log('=== Initialize for electron or dev web');
    }
    return;
  }
}