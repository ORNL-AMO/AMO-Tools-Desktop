import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-motor-performance-help',
    templateUrl: './motor-performance-help.component.html',
    styleUrls: ['./motor-performance-help.component.css'],
    standalone: false
})
export class MotorPerformanceHelpComponent implements OnInit {
  docsLink: string = environment.measurDocsUrl;

  @Input ()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
