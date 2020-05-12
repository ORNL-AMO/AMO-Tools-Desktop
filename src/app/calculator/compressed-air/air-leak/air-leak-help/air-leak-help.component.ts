import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-air-leak-help',
  templateUrl: './air-leak-help.component.html',
  styleUrls: ['./air-leak-help.component.css']
})
export class AirLeakHelpComponent implements OnInit {

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
