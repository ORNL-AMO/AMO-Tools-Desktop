import { Injectable } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergy, DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergyResults, DesignedEnergySteam } from '../../shared/models/phast/designedEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
@Injectable()
export class DesignedEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService) { }

  designedEnergyElectricity(inputs: DesignedEnergyElectricity[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = 0;
    inputs.forEach(input => {
      designedEnergyUsed += (input.kwRating) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculatedFuelEnergyUsed = this.phastService.sumHeatInput(phast.losses, settings);
    let calculatedEnergyIntensity = (calculatedFuelEnergyUsed / sumFeedRate) || 0;
    let calculatedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: calculatedEnergyIntensity,
      calculatedElectricityUsed: calculatedElectricityUsed
    };
    return tmpResults;
  }

  designedEnergyFuel(inputs: DesignedEnergyFuel[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = 0;
    //
    let constant;
    if (settings.unitsOfMeasure == 'Metric') {
      constant = 1;
    } else {
      constant = Math.pow(10, 6);
    }
    inputs.forEach(input => {
      designedEnergyUsed += (input.totalBurnerCapacity * constant) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculatedFuelEnergyUsed = this.phastService.sumHeatInput(phast.losses, settings);
    let calculatedEnergyIntensity = (calculatedFuelEnergyUsed / sumFeedRate) || 0;
    let calculatedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: calculatedEnergyIntensity,
      calculatedElectricityUsed: calculatedElectricityUsed
    };
    return tmpResults;
  }

  designedEnergySteam(inputs: DesignedEnergySteam[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = 0;
    //
    inputs.forEach(input => {
      designedEnergyUsed += (input.totalHeat) * (input.steamFlow) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //Calculated by phast
    let calculatedFuelEnergyUsed = this.phastService.sumHeatInput(phast.losses, settings);
    let calculatedEnergyIntensity = (calculatedFuelEnergyUsed / sumFeedRate) || 0;
    let calculatedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);

    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: designedEnergyUsed,
      designedEnergyIntensity: designedEnergyIntensity,
      designedElectricityUsed: designedElectricityUsed,
      calculatedFuelEnergyUsed: calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: calculatedEnergyIntensity,
      calculatedElectricityUsed: calculatedElectricityUsed
    };
    return tmpResults;
  }

}
