import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// declare ga as a function to access the JS code in TS
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../assets/styles/application.scss', './app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef, private router: Router) {
    this.viewContainerRef = viewContainerRef;
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-EEHE8GEBH4', {'page_path': event.urlAfterRedirects});
        }
      });
    }
}

