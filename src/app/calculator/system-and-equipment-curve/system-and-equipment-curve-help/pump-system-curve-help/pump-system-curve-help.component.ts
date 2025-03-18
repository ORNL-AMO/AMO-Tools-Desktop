import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-pump-system-curve-help',
    templateUrl: './pump-system-curve-help.component.html',
    styleUrls: ['./pump-system-curve-help.component.css'],
    standalone: false
})
export class PumpSystemCurveHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
