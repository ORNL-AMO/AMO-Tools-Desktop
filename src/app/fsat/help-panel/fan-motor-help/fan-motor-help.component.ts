import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-fan-motor-help',
    templateUrl: './fan-motor-help.component.html',
    styleUrls: ['./fan-motor-help.component.css'],
    standalone: false
})
export class FanMotorHelpComponent implements OnInit {
  docsLink: string = environment.measurDocsUrl;

  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }


}
