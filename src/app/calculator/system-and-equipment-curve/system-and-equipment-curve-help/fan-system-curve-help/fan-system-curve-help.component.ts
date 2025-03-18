import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fan-system-curve-help',
    templateUrl: './fan-system-curve-help.component.html',
    styleUrls: ['./fan-system-curve-help.component.css'],
    standalone: false
})
export class FanSystemCurveHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
