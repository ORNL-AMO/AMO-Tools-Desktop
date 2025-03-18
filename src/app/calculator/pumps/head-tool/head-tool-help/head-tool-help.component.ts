import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-head-tool-help',
    templateUrl: './head-tool-help.component.html',
    styleUrls: ['./head-tool-help.component.css'],
    standalone: false
})
export class HeadToolHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  headToolType: string;
  @Input()
  settings: Settings;

  dischargeLineLossCoefficientsExample: boolean = false;
  smallUnit: string;
  constructor() { }

  ngOnInit() {
    if (this.settings.distanceMeasurement == 'ft') {
      this.smallUnit = 'in'
    } else {
      this.smallUnit = 'mm'
    }
  }

  showExample(bool: boolean) {
    bool != bool;
  }
}
