import { Component, OnInit, Input } from '@angular/core';
import { HeaderOutputObj, HeatLossOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { HeaderNotHighestPressure, HeaderWithHighestPressure, SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-header-table',
  templateUrl: './hover-header-table.component.html',
  styleUrls: ['./hover-header-table.component.css']
})
export class HoverHeaderTableComponent implements OnInit {
  @Input()
  headerPressure: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;

  header: HeaderOutputObj;
  heatLoss: HeatLossOutput;
  headerInput: HeaderNotHighestPressure | HeaderWithHighestPressure;
  constructor() { }

  ngOnInit() {
    if (this.headerPressure == 'highPressure') {
      this.header = this.outputData.highPressureHeader;
      this.heatLoss = this.outputData.highPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.highPressure;
    } else if (this.headerPressure == 'mediumPressure') {
      this.header = this.outputData.mediumPressureHeader;
      this.heatLoss = this.outputData.mediumPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.mediumPressure;
    } else if (this.headerPressure == 'lowPressure') {
      this.header = this.outputData.lowPressureHeader;
      this.heatLoss = this.outputData.lowPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.lowPressure;
    }
  }

}
