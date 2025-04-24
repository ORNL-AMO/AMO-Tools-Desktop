import { Component, OnInit, Input } from '@angular/core';

import { CombinedHeatPower } from '../../../../shared/models/standalone';
@Component({
    selector: 'app-combined-heat-power-help',
    templateUrl: './combined-heat-power-help.component.html',
    styleUrls: ['./combined-heat-power-help.component.css'],
    standalone: false
})
export class CombinedHeatPowerHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inputs: CombinedHeatPower;
  constructor() { }

  ngOnInit() {  }

}
