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

  headerSteamUsage: number;
  calculatedHeader: HeaderOutputObj;
  processSteamUsage: ProcessSteamUsage;
  condensate: SteamPropertiesOutput;
  constructor(private calculateModelService: CalculateModelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.pressureLevel == 'Low') {
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.lowPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.lowPressureHeader;
      this.condensate = this.calculateModelService.lowPressureCondensate;
    } else if (this.pressureLevel == 'Medium') {
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.mediumPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.mediumPressureHeader;
      this.condensate = this.calculateModelService.mediumPressureCondensate;
    } else if (this.pressureLevel == 'High') {
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.highPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.highPressureHeader;
      this.condensate = this.calculateModelService.highPressureCondensate;
    }
    let processSteamUsageEnergyFlow: number = this.headerSteamUsage * this.calculatedHeader.specificEnthalpy / 1000;
    let processUsage: number = (this.headerSteamUsage) * (this.calculatedHeader.specificEnthalpy - this.condensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);
    //TODO: Calculate processUsage
    this.processSteamUsage = {
      pressure: this.calculatedHeader.pressure,
      temperature: this.calculatedHeader.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.headerSteamUsage,
      processUsage: processUsage
    };
  }

}
