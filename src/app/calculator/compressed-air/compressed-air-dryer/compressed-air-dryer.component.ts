import { Component, OnInit, inject } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';

@Component({
  selector: 'app-compressed-air-dryer',
  templateUrl: './compressed-air-dryer.component.html',
  styleUrl: './compressed-air-dryer.component.css',
  standalone: false,
})
export class CompressedAirDryerComponent implements OnInit {
  private readonly dryerSuiteApiService = inject(CompressedAirDryersSuiteApiService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly calculatorDbService = inject(CalculatorDbService);

  activeSettings: Settings;
  dryerInput: DryerOperatingCostInput;
  dryerOutput: DryerOperatingCostOutput;

  private currentCalculator: Calculator | undefined;

  ngOnInit(): void {
    this.calculatorDbService.isSaving = false;
    this.activeSettings = this.settingsDbService.globalSettings;

    this.dryerInput = this.getDefaultInput();
    this.calculate();
  }

  calculate(): void {
    this.dryerOutput = this.dryerSuiteApiService.dryerOperatingCost(this.dryerInput);
    console.log('Dryer Operating Cost Output:', this.dryerOutput);
  }

  private getDefaultInput(): DryerOperatingCostInput {
    return {
      dryerType: DryerType.Heatless,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      operatingHoursPerDay: 16,
      operatingDaysPerWeek: 5,
      operatingWeeksPerYear: 50,
      costOfElectricity: 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.50,
      heaterPower: 0,
      heatingHoursPerDay: 0,
      purgeRate: 0,
      designDDCPercentage: 0,
    };
  }
}
