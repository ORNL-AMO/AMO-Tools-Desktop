import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SteamPropertiesOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-hover-condensate-table',
    templateUrl: './hover-condensate-table.component.html',
    styleUrls: ['./hover-condensate-table.component.css'],
    standalone: false
})
export class HoverCondensateTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inResultsPanel: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  returnCondensate: SteamPropertiesOutput;
  volumeFlow: number = 0;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.returnCondensate = this.outputData.returnCondensate;
    // specific volume = m3kg
    let specificVolume: number = this.convertUnitsService.value(this.returnCondensate.specificVolume).from(this.settings.steamSpecificVolumeMeasurement).to('m3kg')
    // mass flow kg/hr
    let massFlow: number = this.convertUnitsService.value(this.returnCondensate.massFlow).from(this.settings.steamMassFlowMeasurement).to('kg');
    // volume flow (m3/hr) = specific volume (m3kg) * mass flow (kg/hr) 
    this.volumeFlow = specificVolume * massFlow;
    //convert from m3/h to settings volume flow measurement (gpm | m3/h | L/min)
    this.volumeFlow = this.convertUnitsService.value(this.volumeFlow).from('m3/h').to(this.settings.steamVolumeFlowMeasurement);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
