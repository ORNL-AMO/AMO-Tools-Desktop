import { Component, ViewEncapsulation, ViewContainerRef, ApplicationRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService } from './shared/analytics/analytics.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, filter, first, interval } from 'rxjs';
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

    updates.versionUpdates.subscribe(evt => {
      // TODO pwa only
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          // this.promptUserUpdate();
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });

    const appIsStable = appRef.isStable.pipe(first((isStable) => isStable === true));
    const everyThirtySec = interval(1 * 20 * 1000);
    // const everySixHours = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable = concat(appIsStable, everyThirtySec);
    
    everySixHoursOnceAppIsStable.subscribe(async () => {
      try {
        const updateFound = await updates.checkForUpdate();
        debugger;
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });

    updates.unrecoverable.subscribe((event) => {
      console.log(
        'An error occurred that we cannot recover from:\n' +
          event.reason +
          '\n\nPlease reload the page.',
      );
    });
  }

  ngOnInit() {
    console.log(window.location.origin);
    console.log(window.location.href);
  }

    promptUserUpdate(): void {
      // Ask user to update
      this.updates.activateUpdate()
          .then((success) => {
            console.log('successful update?', success);
            // todo need to have current location saved somewhere to reload page
            // todo below will fail because it will be '/landing-screen'

            window.location.assign('');
            // window.location.href = '';
            // window.location.reload();
            // todo this reload does not work in local dev, but may on the dev server? in prod we can reload from landing page
          })
          .catch(error => {
            console.error('Failed to apply SW updates:', error);
          });
  }

}