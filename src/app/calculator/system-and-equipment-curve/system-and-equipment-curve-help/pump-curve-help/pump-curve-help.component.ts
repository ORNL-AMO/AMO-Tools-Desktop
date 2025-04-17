import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-pump-curve-help',
    templateUrl: './pump-curve-help.component.html',
    styleUrls: ['./pump-curve-help.component.css'],
    standalone: false
})
export class PumpCurveHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
