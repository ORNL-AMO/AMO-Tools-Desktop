import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SteamPropertiesOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-hover-makeup-water',
    templateUrl: './hover-makeup-water.component.html',
    styleUrls: ['./hover-makeup-water.component.css'],
    standalone: false
})
export class HoverMakeupWaterComponent implements OnInit {
  @Input()
  combined: boolean;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inResultsPanel: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  makeupWater: SteamPropertiesOutput;
  makeupWaterLabel: string;
  volumeFlow: number = 0;
  constructor(private convertUnitsService: ConvertUnitsService) { }
  ngOnInit() {
    if (this.combined) {
      this.makeupWater = this.outputData.makeupWaterAndCondensate;
      this.makeupWaterLabel = 'Make-up Water and Condensate';
      // specific volume = m3kg
      let specificVolume: number = this.convertUnitsService.value(this.makeupWater.specificVolume).from(this.settings.steamSpecificVolumeMeasurement).to('m3kg')
      // mass flow kg/hr
      let massFlow: number = this.convertUnitsService.value(this.makeupWater.massFlow).from(this.settings.steamMassFlowMeasurement).to('kg');
      // volume flow (m3/hr) = specific volume (m3kg) * mass flow (kg/hr) 
      this.volumeFlow = specificVolume * massFlow;
      //convert from m3/h to settings volume flow measurement (gpm | m3/h | L/min)
      this.volumeFlow = this.convertUnitsService.value(this.volumeFlow).from('m3/h').to(this.settings.steamVolumeFlowMeasurement);
    } else {
      this.makeupWater = this.outputData.makeupWater;
      this.makeupWaterLabel = 'Make-up Water';
      this.volumeFlow = this.outputData.operationsOutput.makeupWaterVolumeFlow;
    }

  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
