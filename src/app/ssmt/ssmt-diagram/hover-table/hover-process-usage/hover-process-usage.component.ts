import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { HeaderOutputObj, ProcessSteamUsage, SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-process-usage',
  templateUrl: './hover-process-usage.component.html',
  styleUrls: ['./hover-process-usage.component.css']
})
export class HoverProcessUsageComponent implements OnInit {
  @Input()
  pressureLevel: string;
  @Input()
  settings: Settings;

  processSteamUsage: ProcessSteamUsage;
  constructor(private calculateModelService: CalculateModelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.pressureLevel == 'Low') {
      this.processSteamUsage = this.calculateModelService.lowPressureProcessUsage;
    } else if (this.pressureLevel == 'Medium') {
      this.processSteamUsage = this.calculateModelService.mediumPressureProcessUsage;

    } else if (this.pressureLevel == 'High') {
      this.processSteamUsage = this.calculateModelService.highPressureProcessUsage;

    }
  }

}
