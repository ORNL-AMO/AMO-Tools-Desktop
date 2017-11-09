import { Injectable } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergy, DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergyResults, DesignedEnergySteam } from '../../shared/models/phast/designedEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';

@Injectable()
export class DesignedEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService, private phastResultsService: PhastResultsService) { }

  designedEnergyElectricity(inputs: DesignedEnergyElectricity[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed =  this.sumDesignedEnergyElectricity(inputs);
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    };
    return tmpResults;
  }

  sumDesignedEnergyElectricity(inputs: DesignedEnergyElectricity[]): number{
    let designedEnergyUsed = 0;
    inputs.forEach(input => {
      designedEnergyUsed += (input.kwRating) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    return designedEnergyUsed || 0;
  }

  designedEnergyFuel(inputs: DesignedEnergyFuel[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = this.sumDesignedEnergyFuel(inputs);
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    };
    return tmpResults;
  }

  sumDesignedEnergyFuel(inputs: DesignedEnergyFuel[]): number{
    let designedEnergyUsed = 0;
    let constant = Math.pow(10, 6);
    inputs.forEach(input => {
      designedEnergyUsed += (input.totalBurnerCapacity * constant) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    return designedEnergyUsed || 0;
  }

  designedEnergySteam(inputs: DesignedEnergySteam[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = this.sumDesignedEnergySteam(inputs);
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    };
    return tmpResults;
  }

  sumDesignedEnergySteam(inputs: DesignedEnergySteam[]): number{
    let designedEnergyUsed = 0;
    inputs.forEach(input => {
      designedEnergyUsed += (input.totalHeat) * (input.steamFlow) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    return designedEnergyUsed || 0;
  }
}
