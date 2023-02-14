import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
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
  constructor(viewContainerRef: ViewContainerRef, private router: Router) {
    this.viewContainerRef = viewContainerRef;
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          let path: string = environment.production? event.urlAfterRedirects : 'testing-web'
          gtag('config', 'G-EEHE8GEBH4', {
            'page_path': path,
            'measur_platform': 'web',
          });
        }
      });
  }
}

