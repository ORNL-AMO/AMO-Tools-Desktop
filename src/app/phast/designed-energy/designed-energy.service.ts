import { Injectable } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergyResults, DesignedEnergySteam, EnergyResult } from '../../shared/models/phast/designedEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class DesignedEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }

  calculateDesignedEnergy(phast: PHAST, settings: Settings): DesignedEnergyResults {
    let results: DesignedEnergyResults = {
        designed: {
          hourlyEnergy: 0,
          annualEnergy: 0,
          hourlyElectricity: 0,
          annualElectricity: 0,
          energyIntensity: 0,
        },
        byPhast: {
          hourlyEnergy: 0,
          annualEnergy: 0,
          hourlyElectricity: 0,
          annualElectricity: 0,
          energyIntensity: 0,
        }
      };

    if (phast.designedEnergy && phast.designedEnergy.zones) {
      // Designed
      results.designed.hourlyEnergy = this.getTotalDesignedEnergy(phast, settings);
      results.designed.annualEnergy = this.getTotalDesignedEnergy(phast, settings, false);
      let sumFeedRate = 0;
      if (phast.losses) {
        sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials) * phast.operatingHours.hoursPerYear;
      }
      results.designed.energyIntensity = (results.designed.annualEnergy / sumFeedRate);
      results.designed.energyIntensity = this.convertIntensity(results.designed.energyIntensity, settings);
      
      let tmpAuxResults = this.auxEquipmentService.calculate(phast);
      results.designed.hourlyElectricity = this.auxEquipmentService.getResultsSum(tmpAuxResults);
      results.designed.annualElectricity = results.designed.hourlyElectricity * phast.operatingHours.hoursPerYear;
      // By Phast
      let byPhast = this.phastResultsService.calculatedByPhast(phast, settings);
      results.byPhast.annualElectricity = byPhast.electricityUsed * phast.operatingHours.hoursPerYear;
      results.byPhast.energyIntensity = byPhast.energyIntensity;
      results.byPhast.hourlyEnergy = byPhast.fuelEnergyUsed;
      results.byPhast.annualEnergy = byPhast.fuelEnergyUsed * phast.operatingHours.hoursPerYear;
    }
    return results;
  }

  getTotalDesignedEnergy(phast: PHAST, settings: Settings, isHourlyResult = true): number {
    let steamEnergyUsed: number = 0;
    let electricityEnergyUsed: number = 0;
    let fuelEnergyUsed: number = 0;

    phast.designedEnergy.zones.forEach(zone => {
      steamEnergyUsed += this.calculateSteamZoneEnergyUsed(zone.designedEnergySteam, isHourlyResult);
      electricityEnergyUsed += this.calculateElectricityZoneEnergyUsed(zone.designedEnergyElectricity, isHourlyResult);
      fuelEnergyUsed += this.calculateFuelZoneEnergyUsed(zone.designedEnergyFuel, isHourlyResult);
    });
    steamEnergyUsed = this.convertSteamEnergyUsed(steamEnergyUsed, settings);
    electricityEnergyUsed = this.convertUnitsService.value(electricityEnergyUsed).from('kWh').to(settings.energyResultUnit);
    fuelEnergyUsed = this.convertFuelEnergyUsed(fuelEnergyUsed, settings);
    return steamEnergyUsed + electricityEnergyUsed + fuelEnergyUsed;
  }

  calculateSteamZoneEnergyUsed(designedEnergySteam: DesignedEnergySteam, isHourlyResult: boolean): number {
    if (isHourlyResult) {
      return designedEnergySteam.totalHeat * designedEnergySteam.steamFlow * (designedEnergySteam.percentCapacityUsed / 100);
    } else {
      return designedEnergySteam.totalHeat * designedEnergySteam.steamFlow * (designedEnergySteam.percentCapacityUsed / 100) * designedEnergySteam.operatingHours;
    }
  }

  calculateFuelZoneEnergyUsed(designedEnergyFuel: DesignedEnergyFuel, isHourlyResult: boolean): number {
    if (isHourlyResult) {
      return designedEnergyFuel.totalBurnerCapacity * (designedEnergyFuel.percentCapacityUsed / 100);
    } else {
      return designedEnergyFuel.totalBurnerCapacity * (designedEnergyFuel.percentCapacityUsed / 100) * designedEnergyFuel.operatingHours;
    }
  }

  calculateElectricityZoneEnergyUsed(designedEnergyElectricity: DesignedEnergyElectricity, isHourlyResult: boolean): number {
    if(isHourlyResult){
      return designedEnergyElectricity.kwRating * (designedEnergyElectricity.percentCapacityUsed / 100);
    }else{
      return designedEnergyElectricity.kwRating * (designedEnergyElectricity.percentCapacityUsed / 100) * designedEnergyElectricity.operatingHours;
    }
  }

  convertIntensity(num: number, settings: Settings): number {
    if (settings.energyResultUnit === 'MMBtu') {
      num = this.convertUnitsService.value(num).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit === 'GJ') {
      num = this.convertUnitsService.value(num).from('GJ').to('kJ');
    }
    return num;
  }

  convertFuelEnergyUsed(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('GJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('MMBtu').to(settings.energyResultUnit);
    }
    return val;
  }

  convertSteamEnergyUsed(val: number, settings: Settings) {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

}

export interface DesignedResults {
  designedEnergyUsed: number;
  designedEnergyIntensity: number;
  designedElectricityUsed: number;
}
