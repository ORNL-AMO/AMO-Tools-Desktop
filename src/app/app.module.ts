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
  console.log('MEASUR version', environment.version);
  console.time('initializeAppFactory');
  
  return async () => {
    const MAX_RELOAD_TRIES = 2;
    const RELOAD_TRIES = 'measur_reload_tries';
    const RELOAD_REASON = 'measur_reload_reason';
    const LOAD_ERROR = 'measur_loading_error';

    // * Use for debugging
    // * prevent infinite reloads
    // function checkReloadApp(reason: string, err?: any) {
    //   console.log('--- checkReloadApp');
    //   const reloads = Number(sessionStorage.getItem(RELOAD_TRIES) || '0');
    //   console.log('--- reload tries', reloads);

    //   if (reloads < MAX_RELOAD_TRIES) {
    //     console.log('--- reloading app, setting tries to', reloads + 1);
    //     sessionStorage.setItem(RELOAD_TRIES, (reloads + 1).toString());
    //     sessionStorage.setItem(`${RELOAD_REASON}_${reloads + 1}`, reason);
    //     if (err) {
    //       sessionStorage.setItem(`${LOAD_ERROR}_${reloads + 1}`, err.toString());
    //     }
    //     window.location.reload();
    //   }
    // }

    // * Use for debugging
    // * Turned off due to reload here may be problematic during version change. Currently causing mismatched state/assets
    // async function checkWebUpdate(): Promise<void> {
    //   return Promise.resolve();
    //   return serviceWorkerUpdates.checkForUpdate()
    //     .then(updateFound => {
    //       if (updateFound) {
    //         console.log('SW Updates found, reloading');
    //         console.log('--- reloading app after SW update found');
    //         checkReloadApp('sw update'); 
    //       } else {
    //         console.log('NO SW Updates found, continue to load script');
    //       }
    //       return Promise.resolve();
    //     })
    //     .catch(err => {
    //       console.error('Error checking for SW update', err);
    //       checkReloadApp('err checking for sw update', err); 
    //       return Promise.resolve();
    //     });
    // }

    function initializeWASMScript() {
      return new Promise((resolve, reject) => {
        // * No changes
        // Prepare global objects 
        console.log('=== Initializing MEASUR Tools Suite module ===');
        window['dbInstance'] = undefined;
        window['Module'] = {
          onRuntimeInitialized: function () {
            window['dbInstance'] = new window['Module'].SQLite(":memory:", true);
            console.log('=== MEASUR Tools Suite module initialized ===');
            console.timeEnd('initializeAppFactory');
            resolve(module);
          },
          onAbort: function (err) {
            new MeasurAppError('Error occurred in MEASUR Tools Suite', undefined);
            // checkReloadApp('error tools suite onabort', err); 
          }
        };

        // Load client.js, ensure module created before app init
        loadScriptFromPath('wasmClient', `client.js`)
          .then(() => {
            console.log('=== Loading MEASUR Tools Suite client.js ===');
            const module = <any>{ locateFile: (file: string) => { } };
          })
          .catch(err => {
            reject(new MeasurAppError('Unable to load MEASUR Tools Suite', err));
            // checkReloadApp('unable to load tools suite clientjs', err);
          });
      });
    }

    if ((!electronService.isElectron && serviceWorkerUpdates.isEnabled)) {
      console.log('=== Initialize for production web');
    } else {
      console.log('=== Initialize for electron or dev web');
    }
    return initializeWASMScript();

    // * Use for debugging
    // * Turned off due to reload here may be problematic during version change. Currently causing mismatched state/assets
    // if ((!electronService.isElectron && serviceWorkerUpdates.isEnabled)) {
    //   console.log('=== Initialize for production web');
    //   return checkWebUpdate().then(() => {
    //     console.log('=== Web update checked')
    //     return initializeWASMScript();
    //   });
    // } else {
    //   console.log('=== Initialize for electron or dev web');
    //   return initializeWASMScript();
    // }
  }
}