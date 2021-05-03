import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { SuiteApiEnumService } from './tools-suite-api/suite-api-enum.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../assets/styles/application.scss', './app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app works!';
  private viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef, private SuiteApiEnumService: SuiteApiEnumService) {
    this.viewContainerRef = viewContainerRef;
  }
}

