import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then((() => {
  if ('serviceWorker' in navigator && environment.production && environment.useServiceWorker) {
    navigator.serviceWorker.register('ngsw-worker.js');
  }
})).catch(err => {
  const loadingSpinnerElement = document.getElementById('loadingSpinner');
  const loadingErrorElement = document.getElementById('loadingError');
  loadingErrorElement.setAttribute('style', 'display: block;');
  loadingSpinnerElement.setAttribute('style', 'display: none;');
});
