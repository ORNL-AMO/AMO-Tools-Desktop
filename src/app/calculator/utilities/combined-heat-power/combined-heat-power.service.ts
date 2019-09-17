import { Injectable } from '@angular/core';
import { CombinedHeatPower } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class CombinedHeatPowerService {
  inputData: CombinedHeatPower;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  generateExample(): CombinedHeatPower {
    return {
      annualOperatingHours: 7000,
      annualElectricityConsumption: 1885367,
      annualThermalDemand: 3560,
      boilerThermalFuelCosts: 7.90,
      avgElectricityCosts: 0.066,
      option: 0,
      boilerThermalFuelCostsCHPcase: 7.90,
      CHPfuelCosts: 7.90,
      percentAvgkWhElectricCostAvoidedOrStandbyRate: 75,
      displacedThermalEfficiency: 80,
      chpAvailability: 93,
      thermalUtilization: 90
    };
  }

  getResetData(): CombinedHeatPower {
    return {
      annualOperatingHours: 0,
      annualElectricityConsumption: 0,
      annualThermalDemand: 0,
      boilerThermalFuelCosts: 0,
      avgElectricityCosts: 0,
      option: 0,
      boilerThermalFuelCostsCHPcase: 0,
      CHPfuelCosts: 0,
      percentAvgkWhElectricCostAvoidedOrStandbyRate: 0,
      displacedThermalEfficiency: 0,
      chpAvailability: 0,
      thermalUtilization: 0
    }
  }
}
