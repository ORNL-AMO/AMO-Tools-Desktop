import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SteamPropertiesOutput, HeatLossOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { HeaderNotHighestPressure, HeaderWithHighestPressure, SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-hover-header-table',
    templateUrl: './hover-header-table.component.html',
    styleUrls: ['./hover-header-table.component.css'],
    standalone: false
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
  @Input()
  inResultsPanel: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  header: SteamPropertiesOutput;
  heatLoss: HeatLossOutput;
  headerInput: HeaderNotHighestPressure | HeaderWithHighestPressure;
  condensingWarning: boolean;
  constructor() { }

  ngOnInit() {
    if (this.headerPressure === 'highPressure') {
      this.header = this.outputData.highPressureHeaderSteam;
      this.heatLoss = this.outputData.highPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.highPressureHeader;
    } else if (this.headerPressure === 'mediumPressure') {
      this.header = this.outputData.mediumPressureHeaderSteam;
      this.heatLoss = this.outputData.mediumPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.mediumPressureHeader;
    } else if (this.headerPressure === 'lowPressure') {
      this.header = this.outputData.lowPressureHeaderSteam;
      this.heatLoss = this.outputData.lowPressureSteamHeatLoss;
      this.headerInput = this.inputData.headerInput.lowPressureHeader;
    }

    if(this.header.quality < 1){
      this.condensingWarning = true;
    }else{
      this.condensingWarning = false;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
