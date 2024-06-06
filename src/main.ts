import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';
import { getPlatformDebugInfo } from './app/shared/errors/errors';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then((() => {
  if ('serviceWorker' in navigator && environment.production && environment.useServiceWorker) {
    navigator.serviceWorker.register('ngsw-worker.js');
  }
})).catch(error => {
  const loadingSpinnerElement = document.getElementById('loadingSpinner');
  loadingSpinnerElement.setAttribute('style', 'display: none;');
  
  getPlatformDebugInfo();
  const loadingErrorElement = document.getElementById('loadingError');
  const errorMessage = document.getElementById('errorMessage');
  const indexAppVersion = document.getElementById('indexAppVersion');
  errorMessage.textContent = error.message;
  loadingErrorElement.setAttribute('style', 'display: block;');  
  indexAppVersion.textContent = environment.version;
});
