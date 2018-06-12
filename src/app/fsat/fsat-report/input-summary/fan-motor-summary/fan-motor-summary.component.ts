import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-fan-motor-summary',
  templateUrl: './fan-motor-summary.component.html',
  styleUrls: ['./fan-motor-summary.component.css']
})
export class FanMotorSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  collapse: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

}
