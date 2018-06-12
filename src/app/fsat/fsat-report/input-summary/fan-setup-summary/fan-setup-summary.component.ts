import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';

@Component({
  selector: 'app-fan-setup-summary',
  templateUrl: './fan-setup-summary.component.html',
  styleUrls: ['./fan-setup-summary.component.css']
})
export class FanSetupSummaryComponent implements OnInit {
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
