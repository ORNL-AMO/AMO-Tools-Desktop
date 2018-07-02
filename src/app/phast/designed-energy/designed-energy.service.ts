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
    if (phast.designedEnergy && phast.designedEnergy.zones) {
      phast.designedEnergy.zones.forEach(zone => {
        steamEnergyUsed += this.calculateSteamZoneEnergyUsed(zone.designedEnergySteam);
        electricityEnergyUsed += this.calculateElectricityZoneEnergyUsed(zone.designedEnergyElectricity);
        fuelEnergyUsed += this.calculateFuelZoneEnergyUsed(zone.designedEnergyFuel);
      })
      steamEnergyUsed = this.convertSteamEnergyUsed(steamEnergyUsed, settings);
      electricityEnergyUsed = this.convertUnitsService.value(electricityEnergyUsed).from('kWh').to(settings.energyResultUnit);
      fuelEnergyUsed = this.convertFuelEnergyUsed(fuelEnergyUsed, settings);
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
    }
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

  convertIntensity(num: number, settings: Settings): number {
    if (settings.energyResultUnit == 'MMBtu') {
      num = this.convertUnitsService.value(num).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit == 'GJ') {
      num = this.convertUnitsService.value(num).from('GJ').to('kJ');
    }
    return num;
  }

  convertFuelEnergyUsed(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('GJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('MMBtu').to(settings.energyResultUnit);
    }
    return val;
  }

  convertSteamEnergyUsed(val: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

}

export interface DesignedResults {
  designedEnergyUsed: number,
  designedEnergyIntensity: number,
  designedElectricityUsed: number,
}