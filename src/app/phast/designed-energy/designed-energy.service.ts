import { Injectable } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergy, DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergyResults, DesignedEnergySteam } from '../../shared/models/phast/designedEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Injectable()
export class DesignedEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }

  designedEnergyElectricity(inputs: DesignedEnergyElectricity[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = this.sumDesignedEnergyElectricity(inputs);
    let sumFeedRate = 0;
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    }
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    designedEnergyUsed = this.convertResult(designedEnergyUsed, settings);
    designedEnergyIntensity = this.convertIntensity(designedEnergyIntensity, settings);
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

  sumDesignedEnergyElectricity(inputs: DesignedEnergyElectricity[]): number {
    let designedEnergyUsed = 0;
    //used to convert burner capacity from MMBtu -> Btu or GJ -> kJ
    //results for designedEnergyUsed end up in Btu or kJ
    let constant = Math.pow(10, 6);
    inputs.forEach(input => {
      designedEnergyUsed += (input.kwRating) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    return designedEnergyUsed || 0;
  }

  designedEnergyFuel(inputs: DesignedEnergyFuel[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = this.sumDesignedEnergyFuel(inputs);
    let sumFeedRate = 0;
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    }
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    //convert to resultsUnit
    designedEnergyUsed = this.convertResult(designedEnergyUsed, settings);
    designedEnergyIntensity = this.convertIntensity(designedEnergyIntensity, settings);
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

  convertIntensity(num: number, settings: Settings): number {
    if (settings.energyResultUnit == 'MMBtu') {
      num = this.convertUnitsService.value(num).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit == 'GJ') {
      num = this.convertUnitsService.value(num).from('GJ').to('kJ');
    }
    return num;
  }

  sumDesignedEnergyFuel(inputs: DesignedEnergyFuel[]): number {
    let designedEnergyUsed = 0;
    let constant = Math.pow(10, 6);
    inputs.forEach(input => {
      designedEnergyUsed += ((input.totalBurnerCapacity) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100));
    })
    return designedEnergyUsed || 0;
  }

  designedEnergySteam(inputs: DesignedEnergySteam[], phast: PHAST, settings: Settings): DesignedEnergyResults {
    //Design Results
    let designedEnergyUsed = this.sumDesignedEnergySteam(inputs);
    let sumFeedRate = 0;
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    }
    let designedEnergyIntensity = (designedEnergyUsed / sumFeedRate) || 0;
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);

    designedEnergyUsed = this.convertSteamEnergyUsed(designedEnergyUsed, settings);
    designedEnergyIntensity = this.convertSteamEnergyUsed(designedEnergyIntensity, settings);
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

  sumDesignedEnergySteam(inputs: DesignedEnergySteam[]): number {
    let designedEnergyUsed = 0;
    inputs.forEach(input => {
      designedEnergyUsed += (input.totalHeat) * (input.steamFlow) * (input.percentCapacityUsed / 100) * (input.percentOperatingHours / 100);
    })
    return designedEnergyUsed || 0;
  }
  convertResult(val: number, settings: Settings): number {
    if (settings.energySourceType == 'Electricity') {
      val = this.convertUnitsService.value(val).from('kWh').to(settings.energyResultUnit)
    } else if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('GJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('MMBtu').to(settings.energyResultUnit);
    }
    return val;
  }

  sumFuelElectric(fuelResults: DesignedEnergyResults, electricResults: DesignedEnergyResults): DesignedEnergyResults {
    let results: DesignedEnergyResults = {
      designedEnergyUsed: fuelResults.designedEnergyUsed + electricResults.designedEnergyUsed,
      designedEnergyIntensity: fuelResults.designedEnergyIntensity + electricResults.designedEnergyIntensity,
      designedElectricityUsed: fuelResults.designedElectricityUsed + electricResults.designedElectricityUsed,
      calculatedFuelEnergyUsed: electricResults.calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: electricResults.calculatedEnergyIntensity,
      calculatedElectricityUsed: electricResults.calculatedElectricityUsed
    }
    return results;
  }

  convertFuelToElectric(fuelResults: DesignedEnergyResults, settings: Settings): DesignedEnergyResults {
    if (settings.unitsOfMeasure == 'Imperial') {
      fuelResults.designedEnergyIntensity = this.convertUnitsService.value(fuelResults.designedEnergyIntensity).from('MMBtu').to('kWh');
      fuelResults.designedEnergyUsed = this.convertUnitsService.value(fuelResults.designedEnergyUsed).from('MMBtu').to('kWh');
    } else {
      fuelResults.designedEnergyIntensity = this.convertUnitsService.value(fuelResults.designedEnergyIntensity).from('GJ').to('kWh');
      fuelResults.designedEnergyUsed = this.convertUnitsService.value(fuelResults.designedEnergyUsed).from('GJ').to('kWh');
    }
    return fuelResults;
  }

  convertSteamEnergyUsed(val: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }



  //6/7/18 update
  /////////////////////////////////////////////////////////////////////////////////////

  calculateDesignedEnergy(phast: PHAST, settings: Settings): DesignedEnergyResults {
    let tmpResults: DesignedEnergyResults = {
      designedEnergyUsed: 0,
      designedEnergyIntensity: 0,
      designedElectricityUsed: 0,
      calculatedFuelEnergyUsed: 0,
      calculatedEnergyIntensity: 0,
      calculatedElectricityUsed: 0
    };

    let steamEnergyUsed: number = 0;
    let electricityEnergyUsed: number = 0;
    let fuelEnergyUsed: number = 0;

    phast.designedEnergy.zones.forEach(zone => {
      steamEnergyUsed += this.calculateSteamZoneEnergyUsed(zone.designedEnergySteam);
      electricityEnergyUsed += this.calculateElectricityZoneEnergyUsed(zone.designedEnergyElectricity);
      fuelEnergyUsed += this.calculateFuelZoneEnergyUsed(zone.designedEnergyFuel);
    })
    steamEnergyUsed = this.convertSteamEnergyUsed(steamEnergyUsed, settings);
    electricityEnergyUsed = this.convertUnitsService.value(electricityEnergyUsed).from('kWh').to(settings.energyResultUnit);
    fuelEnergyUsed = this.convertResult(fuelEnergyUsed, settings);
    tmpResults.designedEnergyUsed = steamEnergyUsed + electricityEnergyUsed + fuelEnergyUsed;

    let sumFeedRate = 0;
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    }
    tmpResults.designedEnergyIntensity = (tmpResults.designedEnergyUsed / sumFeedRate);
    tmpResults.designedEnergyIntensity = this.convertIntensity(tmpResults.designedEnergyIntensity, settings);
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    let designedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    tmpResults.designedElectricityUsed = designedElectricityUsed;
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);
    tmpResults.calculatedElectricityUsed = calculated.electricityUsed;
    tmpResults.calculatedEnergyIntensity = calculated.energyIntensity;
    tmpResults.calculatedFuelEnergyUsed = calculated.fuelEnergyUsed;

    return tmpResults;
  }

  calculateSteamZoneEnergyUsed(designedEnergySteam: DesignedEnergySteam): number {
    return (designedEnergySteam.totalHeat) * (designedEnergySteam.steamFlow) * (designedEnergySteam.percentCapacityUsed / 100) * (designedEnergySteam.percentOperatingHours / 100);
  }

  calculateFuelZoneEnergyUsed(designedEnergyFuel: DesignedEnergyFuel): number {
    return ((designedEnergyFuel.totalBurnerCapacity) * (designedEnergyFuel.percentCapacityUsed / 100) * (designedEnergyFuel.percentOperatingHours / 100));
  }

  calculateElectricityZoneEnergyUsed(designedEnergyElectricity: DesignedEnergyElectricity): number {
    return (designedEnergyElectricity.kwRating) * (designedEnergyElectricity.percentCapacityUsed / 100) * (designedEnergyElectricity.percentOperatingHours / 100);
  }
}

export interface DesignedResults {
  designedEnergyUsed: number,
  designedEnergyIntensity: number,
  designedElectricityUsed: number,
}