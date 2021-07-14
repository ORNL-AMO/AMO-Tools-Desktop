import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app works!';
  private viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
}

