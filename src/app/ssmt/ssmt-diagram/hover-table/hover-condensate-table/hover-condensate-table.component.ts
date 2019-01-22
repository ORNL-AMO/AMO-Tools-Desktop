import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-condensate-table',
  templateUrl: './hover-condensate-table.component.html',
  styleUrls: ['./hover-condensate-table.component.css']
})
export class HoverCondensateTableComponent implements OnInit {
  @Input()
  settings: Settings

  returnCondensate: SteamPropertiesOutput;
  volumeFlow: number = 0;
  constructor(private calculateModelService: CalculateModelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.returnCondensate = this.calculateModelService.returnCondensate;
    // let tmpMassFlow: number = this.returnCondensate.massFlow;
    // tmpMassFlow = this.convertUnitsService.value(tmpMassFlow).from(this.settings.steamMassFlowMeasurement).to('kg');
    // let tmpSpecificVolume: number = this.convertUnitsService.value(this.returnCondensate.specificVolume).from(this.settings.steamSpecificVolumeMeasurement).to('m3kg');
    // // this.volumeFlow = tmpSpecificVolume * tmpMassFlow * 1000 * (1 / 60);
    // this.volumeFlow = tmpSpecificVolume * tmpMassFlow * (1 / 60);
    // this.volumeFlow = this.convertUnitsService.value(this.volumeFlow).from('L/min').to('gpm');
  }
}
