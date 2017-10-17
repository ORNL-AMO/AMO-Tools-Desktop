import { Component, OnInit, Input } from '@angular/core';

import { CombinedHeatPower } from '../../../../shared/models/combinedHeatPower';
@Component({
  selector: 'app-combined-heat-power-help',
  templateUrl: './combined-heat-power-help.component.html',
  styleUrls: ['./combined-heat-power-help.component.css']
})
export class CombinedHeatPowerHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inputs: CombinedHeatPower;
  constructor() { }

  ngOnInit() {  }

}
