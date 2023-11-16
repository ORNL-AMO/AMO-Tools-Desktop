import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService, EventParameters } from './shared/analytics/analytics.service';
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
      this.analyticsService.sendEvent('measur_app_open', undefined);
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          let path: string = environment.production ? event.urlAfterRedirects : 'testing-web';
          path = this.analyticsService.getPageWithoutId(path);
          this.analyticsService.sendEvent('page_view', path);
        }
      });
      
      //need to subscribe for events from other pieces of app.
      this.analyticsService.eventItem.subscribe(eventItem => {
        if (eventItem) {
          //gtag handles a bunch of the session related content automatically
          let eventParams: EventParameters = {
            page_path: eventItem.path,
            measur_platform: 'measur-web',
            session_id: undefined
          }
          gtag('event', eventItem.eventName, eventParams);
        }
      })
    }
  }
}