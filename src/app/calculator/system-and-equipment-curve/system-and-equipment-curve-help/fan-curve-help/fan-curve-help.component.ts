import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fan-curve-help',
    templateUrl: './fan-curve-help.component.html',
    styleUrls: ['./fan-curve-help.component.css'],
    standalone: false
})
export class FanCurveHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
