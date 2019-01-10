import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { HeaderOutputObj, ProcessSteamUsage } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-process-usage',
  templateUrl: './hover-process-usage.component.html',
  styleUrls: ['./hover-process-usage.component.css']
})
export class HoverProcessUsageComponent implements OnInit {
  @Input()
  pressureLevel: string;

  headerSteamUsage: number;
  calculatedHeader: HeaderOutputObj;
  processSteamUsage: ProcessSteamUsage
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if(this.pressureLevel == 'Low'){
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.lowPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.lowPressureHeader;
    }else if(this.pressureLevel == 'Medium'){
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.mediumPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.mediumPressureHeader;
    }else if(this.pressureLevel == 'High'){
      this.headerSteamUsage = this.calculateModelService.inputData.headerInput.highPressure.processSteamUsage;
      this.calculatedHeader = this.calculateModelService.highPressureHeader;
    }
    let processSteamUsageEnergyFlow: number = this.headerSteamUsage * this.calculatedHeader.specificEnthalpy / 1000;
    //TODO: Calculate processUsage
    this.processSteamUsage = {
      pressure: this.calculatedHeader.pressure,
      temperature: this.calculatedHeader.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.headerSteamUsage,
      processUsage: 0
    };
  }

}
