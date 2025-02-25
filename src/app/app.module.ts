import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { MeasurErrorHandler } from './shared/errors/MeasurErrorHandler';
import { MeasurAppError } from './shared/errors/errors';
import { AppErrorModule } from './shared/errors/app-error.module';
import { ElectronService } from './electron/electron.service';


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
   {provide: ErrorHandler, useClass: MeasurErrorHandler},
   {
    provide: APP_INITIALIZER,
    useFactory: initializeAppFactory,
    deps: [ElectronService, SwUpdate],
    multi: true
   },
  ]
})
export class AppModule {}


export function loadScriptFromPath(id: string, url: string): Promise<void> {
  let script = <HTMLScriptElement>document.getElementById(id);
  if (script) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    script = document.createElement("script");
    document.body.appendChild(script);
    script.onload = () => {
      resolve()
    };
    script.onerror = (ev: ErrorEvent) => {
      reject(ev.error);
    };
    script.id = id;
    script.async = true;
    script.src = url;
  });
}



export function initializeAppFactory(electronService: ElectronService, serviceWorkerUpdates: SwUpdate) {
  return async () => {
    const MAX_RELOAD_TRIES = 1;
    const RELOAD_TRIES = 'measur_reload_tries';

    // * prevent infinite reloads
    // todo use two reload flows, one for SW updates, one for errors
    function checkReloadApp() {
      const reloads = Number(sessionStorage.getItem(RELOAD_TRIES) || '0');
      console.log('--- reload tries', reloads);
      if (reloads < MAX_RELOAD_TRIES) {
        console.log('--- reloading app, setting tries to', reloads + 1);
        sessionStorage.setItem(RELOAD_TRIES, (reloads + 1).toString());
        window.location.reload();
      }
    }

    async function checkWebUpdate(): Promise<void> {
      // * Reload app if update found
      // todo check return promises only to satisfy compiler
      return serviceWorkerUpdates.checkForUpdate()
        .then(updateFound => {
          if (updateFound) {
            console.log('SW Updates found, reloading');
            checkReloadApp();
            // return Promise.reject(new Error('Reloading due to update')); 
            return Promise.resolve();
          }
        })
        .catch(err => {
          console.error('Error checking for SW update', err);
          // return Promise.reject(new Error('Reloading due to update')); 
          return Promise.resolve();
        });
    }

    function initializeWASMScript() {
      return new Promise((resolve, reject) => {
        // * No changes
        // Prepare global objects 
        debugger;
        console.log('=== Initializing MEASUR Tools Suite module ===');
        window['dbInstance'] = undefined;
        window['Module'] = {
          onRuntimeInitialized: function () {
            window['dbInstance'] = new window['Module'].SQLite(":memory:", true);
            console.log(' === MEASUR Tools Suite module initialized ===');
            resolve(module);
          },
          onAbort: function () {
            new MeasurAppError('Error occurred in MEASUR Tools Suite', undefined);
            checkReloadApp();
          }
        };

        // Load client.js, ensure module created before app init
        loadScriptFromPath('wasmClient', `client.js`)
          .then(() => {
            const module = <any>{ locateFile: (file: string) => { } };
          })
          .catch(err => {
            reject(new MeasurAppError('Unable to load MEASUR Tools Suite', err));
            checkReloadApp();
          });
      });
    }

    if ((!electronService.isElectron && serviceWorkerUpdates.isEnabled)) {
      return checkWebUpdate().then(() => {
        return initializeWASMScript();
      });
    } else {
      return initializeWASMScript();
    }
  }
}

