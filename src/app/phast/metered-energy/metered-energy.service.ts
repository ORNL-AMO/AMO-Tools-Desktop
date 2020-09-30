import { Injectable } from '@angular/core';
import { MeteredEnergyResults, MeteredEnergyElectricity, MeteredEnergyFuel, MeteredEnergySteam } from '../../shared/models/phast/meteredEnergy';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastResultsService } from '../phast-results.service';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
@Injectable()
export class MeteredEnergyService {

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService, private auxEquipmentService: AuxEquipmentService) { }

  calculateMeteredEnergy(phast: PHAST, settings: Settings, isHourlyResult: boolean): MeteredEnergyResults {
    let results: MeteredEnergyResults = {
      meteredEnergyUsed: 0,
      meteredEnergyIntensity: 0,
      meteredElectricityUsed: 0,
      calculatedFuelEnergyUsed: 0,
      calculatedEnergyIntensity: 0,
      calculatedElectricityUsed: 0
    };
    let steamEnergyUsed: number = 0;
    let fuelEnergyUsed: number = 0;
    let electricityEnergyUsed: number = 0;
    if (phast.meteredEnergy.steam) {
      steamEnergyUsed = this.calcSteamEnergyUsed(phast.meteredEnergy.meteredEnergySteam, isHourlyResult);
      steamEnergyUsed = this.convertSteamEnergyUsed(steamEnergyUsed, settings);
    }
    if (phast.meteredEnergy.electricity) {
      electricityEnergyUsed = this.calcElectricEnergyUsed(phast.meteredEnergy.meteredEnergyElectricity, isHourlyResult);
      electricityEnergyUsed = this.convertUnitsService.value(electricityEnergyUsed).from('kWh').to(settings.energyResultUnit);
    }
    if (phast.meteredEnergy.fuel) {
      fuelEnergyUsed = this.calcFuelEnergyUsed(phast.meteredEnergy.meteredEnergyFuel, isHourlyResult);
      fuelEnergyUsed = this.convertFuelEnergyUsed(fuelEnergyUsed, settings);
    }

    let sumFeedRate = 0;
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    }

    results.meteredEnergyUsed = steamEnergyUsed + fuelEnergyUsed + electricityEnergyUsed;
    results.meteredEnergyIntensity = this.convertIntensity((results.meteredEnergyUsed / sumFeedRate), settings);
    let auxResults: Array<{ name: string, totalPower: number, motorPower: string }> = this.auxEquipmentService.calculate(phast);
    results.meteredElectricityUsed = this.auxEquipmentService.getResultsSum(auxResults);
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);
    results.calculatedElectricityUsed = calculated.electricityUsed;
    results.calculatedEnergyIntensity = calculated.energyIntensity;
    results.calculatedFuelEnergyUsed = calculated.fuelEnergyUsed;
    return results;
  }


  calcElectricEnergyUsed(inputs: MeteredEnergyElectricity, isHourlyResult: boolean): number {
    if (isHourlyResult) {
      return inputs.electricityUsed / inputs.electricityCollectionTime;
    } else {
      return inputs.electricityUsed / inputs.electricityCollectionTime * inputs.operatingHours;
    }
  }

  calcSteamEnergyUsed(inputs: MeteredEnergySteam, isHourlyResult: boolean): number {
    if(isHourlyResult){
      return (inputs.totalHeatSteam * inputs.flowRate / inputs.collectionTime);
    }else{
      return (inputs.totalHeatSteam * inputs.flowRate / inputs.collectionTime) * inputs.operatingHours;
    }
  }

  calcFuelEnergyUsed(inputs: MeteredEnergyFuel, isHourlyResult: boolean): number {
    if(isHourlyResult){
      return (inputs.fuelEnergy / inputs.collectionTime);
    }else{
      return (inputs.fuelEnergy / inputs.collectionTime) * inputs.operatingHours;
    }
  }

  convertSteamEnergyUsed(val: number, settings: Settings) {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

  convertFuelEnergyUsed(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('GJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('MMBtu').to(settings.energyResultUnit);
    }
    return val;
  }

  convertIntensity(num: number, settings: Settings): number {
    if (settings.energyResultUnit === 'MMBtu') {
      num = this.convertUnitsService.value(num).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit === 'GJ') {
      num = this.convertUnitsService.value(num).from('GJ').to('kJ');
    }
    return num;
  }
}
