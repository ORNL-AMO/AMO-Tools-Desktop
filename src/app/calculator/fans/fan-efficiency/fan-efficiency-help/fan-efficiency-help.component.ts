import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fan-efficiency-help',
    templateUrl: './fan-efficiency-help.component.html',
    styleUrls: ['./fan-efficiency-help.component.css'],
    standalone: false
})
export class FanEfficiencyHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
