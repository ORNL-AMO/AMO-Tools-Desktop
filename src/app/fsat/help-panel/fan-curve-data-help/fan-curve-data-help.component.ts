import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fan-curve-data-help',
  templateUrl: './fan-curve-data-help.component.html',
  styleUrls: ['./fan-curve-data-help.component.css']
})
export class FanCurveDataHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}