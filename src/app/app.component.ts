import { Component, ViewEncapsulation, ViewContainerRef, ApplicationRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService } from './shared/analytics/analytics.service';
import { Subscription, catchError, concat, first, interval, pipe } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { ElectronService } from './electron/electron.service';
import { AppErrorService } from './shared/errors/app-error.service';
import { UpdateApplicationService } from './shared/update-application/update-application.service';
import { MeasurAppError } from './shared/errors/errors';
// declare ga as a function to access the JS code in TS
declare let gtag: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AppComponent {
  measurFormattedErrorSubscription: Subscription;
  showAppErrorModal: boolean;

  constructor(
    private analyticsService: AnalyticsService,
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private updateApplicationService: UpdateApplicationService,
    private electronService: ElectronService,
    private appErrorService: AppErrorService,
    private router: Router) {

    if (environment.production) {
      // analytics handled through gatg() automatically manages sessions, visits, clicks, etc
      gtag('config', 'G-EEHE8GEBH4');

      if (!this.electronService.isElectron) {
        this.analyticsService.sendEvent('measur_app_open_v2');
      }
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          let path: string = environment.production ? event.urlAfterRedirects : 'testing-web';
          path = this.analyticsService.getPageWithoutId(path);
          this.analyticsService.sendEvent('page_view', path);
        }
      });
    }

    if (!this.electronService.isElectron && environment.production) {

      updates.versionUpdates.subscribe((evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`SW VERSION_DETECTED - SW Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`SW VERSION READY - Current app version: ${evt.currentVersion.hash}`);
            console.log(`SW VERSION READY - New app version ready for use: ${evt.latestVersion.hash}`);
            break;
          case 'NO_NEW_VERSION_DETECTED':
            console.log(`SW NO_NEW_VERSION_DETECTED - Current app version: ${evt.version.hash}`);
          break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`SW VERSION_INSTALLATION_FAILED - Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });

      const appIsStable = this.appRef.isStable.pipe(first((isStable) => isStable === true));
      const everySixHours = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable = concat(appIsStable, everySixHours);

      everySixHoursOnceAppIsStable.subscribe(async () => {
        try {
          const updateFound = await updates.checkForUpdate();
          console.log('SW checking for updates', updateFound);
          if (updateFound) {
            this.updateApplicationService.webUpdateAvailable.next(true);
          }
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      });

      updates.unrecoverable
        .pipe(catchError(error => this.appErrorService.handleObservableAppError('SW version unrecoverable - reload application', error)
        ))
        .subscribe({
          next: (resp) => {
            new MeasurAppError('SW version unrecoverable - reload application', undefined);
          },
          error: (error) => { }
        });

    }
  }

  ngOnInit() {
    this.measurFormattedErrorSubscription = this.appErrorService.measurFormattedError.subscribe(error => {
      this.showAppErrorModal = (error !== undefined);
    });
  }

  ngOnDestroy() {
    this.measurFormattedErrorSubscription.unsubscribe();
  }

  closeErrorModal(isClosedEvent?: boolean) {
    this.appErrorService.measurFormattedError.next(undefined);
  }


}