import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-air-leak-help',
    templateUrl: './air-leak-help.component.html',
    styleUrls: ['./air-leak-help.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakHelpComponent implements OnInit {

  @Input()
  currentField: string;
  @Input()
  settings: Settings;

  dischargeLineLossCoefficientsExample: boolean = false;
  smallUnit: string;
  constructor() { }

  ngOnInit() {
  }

}
