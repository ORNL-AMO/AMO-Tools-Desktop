import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService } from './shared/analytics/analytics.service';
// declare ga as a function to access the JS code in TS
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef,
    private analyticsService: AnalyticsService,
    private router: Router) {
    this.viewContainerRef = viewContainerRef;
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
  }
}