import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // registrationStrategy: 'registerImmediately',
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
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
    // TEST main.ts error
    // throw new WebAssembly.RuntimeError('TESTING - MODULE RUNTIME ERROR');
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
        console.log('AMO Tools Suite module initialized');
        resolve(module);
			}
		}

    // load client.js, ensure module created before app init
    loadScriptFromPath('wasmClient', `client.js`)
      .then(() => {
        const module = <any>{ locateFile: (file: string) => { } };
      })
      .catch(err => {
        reject(err)
      });
  });
}