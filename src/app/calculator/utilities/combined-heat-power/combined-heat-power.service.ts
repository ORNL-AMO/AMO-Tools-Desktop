import { Injectable } from '@angular/core';
import { CombinedHeatPower } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class CombinedHeatPowerService {
  inputData: CombinedHeatPower;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  generateExample(settings: Settings): CombinedHeatPower {
    let annualThermalDemand: number = 3560;
    let fuelCosts: number = 7.9;
    if (settings.unitsOfMeasure != 'Imperial') {
      let fuelCostHelper: number = this.convertUnitsService.value(1).from('MMBtu').to('GJ'); 
      fuelCosts = fuelCosts / fuelCostHelper;
      fuelCosts = Number(fuelCosts.toFixed(2));
      annualThermalDemand = this.convertUnitsService.value(annualThermalDemand).from('MMBtu').to('GJ');
      annualThermalDemand = Number(annualThermalDemand.toFixed(2));
    }
    return {
      annualOperatingHours: 7000,
      annualElectricityConsumption: 1885367,
      annualThermalDemand: annualThermalDemand,
      boilerThermalFuelCosts: fuelCosts,
      avgElectricityCosts: 0.066,
      option: 0,
      boilerThermalFuelCostsCHPcase: fuelCosts,
      CHPfuelCosts: fuelCosts,
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
