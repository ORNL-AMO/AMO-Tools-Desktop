import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MeasurErrorHandler } from './shared/errors/MeasurErrorHandler';
import { MeasurAppError } from './shared/errors/errors';
import { AppErrorModule } from './shared/errors/app-error.module';


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
    useFactory: () => initializeWasmScript,
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


export function initializeWasmScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Prepare global objects
    window['dbInstance'] = undefined;
		window['Module'] = {
      onRuntimeInitialized: function () {
        window['dbInstance'] = new window['Module'].SQLite(":memory:", true);
        console.log('MEASUR Tools Suite module initialized');
        resolve(module);
			},
      onAbort: function () {
        new MeasurAppError('Error occured in MEASUR Tools Suite', undefined)
      } 
		}
    // load client.js, ensure module created before app init
    loadScriptFromPath('wasmClient', `client.js`)
      .then(() => {
        const module = <any>{ locateFile: (file: string) => { } };
      })
      .catch(err => {
        reject(new MeasurAppError('Unable to load MEASUR Tools Suite', err))
      });
  });
}