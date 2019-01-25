import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { HeaderOutputObj, HeatLossOutput } from '../../../../shared/models/steam/steam-outputs';
import { HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../../../shared/models/steam/ssmt';
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
  
  header: HeaderOutputObj;
  heatLoss: HeatLossOutput;
  headerInput: HeaderNotHighestPressure | HeaderWithHighestPressure;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if (this.headerPressure == 'highPressure') {
      this.header = this.calculateModelService.highPressureHeader;
      this.heatLoss = this.calculateModelService.highPressureSteamHeatLoss;
      this.headerInput = this.calculateModelService.inputData.headerInput.highPressure;
    } else if (this.headerPressure == 'mediumPressure') {
      this.header = this.calculateModelService.mediumPressureHeader;
      this.heatLoss = this.calculateModelService.mediumPressureSteamHeatLoss;
      this.headerInput = this.calculateModelService.inputData.headerInput.mediumPressure;
    } else if (this.headerPressure == 'lowPressure') {
      this.header = this.calculateModelService.lowPressureHeader;
      this.heatLoss = this.calculateModelService.lowPressureSteamHeatLoss;
      this.headerInput = this.calculateModelService.inputData.headerInput.lowPressure;
    }
  }

}
