import { Component, ViewEncapsulation, ViewContainerRef, ApplicationRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService } from './shared/analytics/analytics.service';
import { concat, first, interval } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { ElectronService } from './electron/electron.service';
import { PwaService } from './shared/pwa/pwa.service';
// declare ga as a function to access the JS code in TS
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  constructor(
    private analyticsService: AnalyticsService,
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private pwaService: PwaService,
    private electronService: ElectronService,
    private router: Router) {

    if (environment.production) {
      // analytics handled through gatg() automatically manages sessions, visits, clicks, etc
      gtag('config', 'G-EEHE8GEBH4');
      this.analyticsService.sendEvent('measur_app_open');
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          let path: string = environment.production ? event.urlAfterRedirects : 'testing-web';
          path = this.analyticsService.getPageWithoutId(path);
          this.analyticsService.sendEvent('page_view', path);
        }
      });
    }

    if (!this.electronService.isElectron && environment.production) {
      const appIsStable = this.appRef.isStable.pipe(first((isStable) => isStable === true));
      const everySixHours = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable = concat(appIsStable, everySixHours);

      everySixHoursOnceAppIsStable.subscribe(async () => {
        try {
          const updateFound = await updates.checkForUpdate();
          if (updateFound) {
            this.pwaService.displayUpdateToast.next(true);
          }
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      });

      updates.unrecoverable.subscribe((event) => {
        console.log(
          'An error occurred that MEASUR cannot recover from:\n' +
          event.reason +
          '\n\nPlease reload the page or reinstall the application.',
        );
      });

    }
  }

}