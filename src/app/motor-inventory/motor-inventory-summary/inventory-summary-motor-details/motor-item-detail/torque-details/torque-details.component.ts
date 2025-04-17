import { Component, OnInit, Input } from '@angular/core';
import { TorqueOptions, TorqueData } from '../../../../motor-inventory';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-torque-details',
    templateUrl: './torque-details.component.html',
    styleUrls: ['./torque-details.component.css'],
    standalone: false
})
export class TorqueDetailsComponent implements OnInit {
  @Input()
  displayOptions: TorqueOptions;
  @Input()
  torqueData: TorqueData;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit(): void {
  }

}
