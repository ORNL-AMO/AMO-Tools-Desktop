import { Injectable } from '@angular/core';
import { PreAssessment } from './pre-assessment';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PreAssessmentService {

  standaloneInputData: Array<PreAssessment>;
  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService) { }


  getResults(preAssessments: Array<PreAssessment>, settings: Settings, resultType: string): Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> {
    let results = new Array<{ name: string, percent: number, value: number, color: string, energyCost: number }>();
    //calculation logic to get results (in pre-assessment.component.ts)
    preAssessments.forEach(assessment => {
      if (assessment.type == 'Metered') {
        if (assessment.meteredEnergy) {
          let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.calculateMetered(assessment, settings)
          if (result) {
            results.push(result);
          }
        }
      } else if (assessment.type == 'Designed') {
        if (assessment.designedEnergy) {
          let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.calculateDesigned(assessment, settings);
          if (result) {
            results.push(result);
          }
        }
      }
    })
    if (results.length != 0) {
      let sum = this.getSum(results, resultType);
      results.forEach(result => {
        result.percent = this.getResultPercent(result[resultType], sum);
      });
    }
    return results;
  }

  calculateMetered(assessment: PreAssessment, settings: Settings): { name: string, percent: number, value: number, color: string, energyCost: number } {
    let fuelResults: number = 0;
    let fuelCost: number = 0;
    let steamResults: number = 0;
    let steamCost: number = 0;
    let electricityCost: number = 0;
    let electricityResults: number = 0;
    let totalResults: number = 0;
    let totalCost: number = 0;
    if (assessment.meteredEnergy) {
      if (assessment.fuel) {
        fuelResults = this.meteredEnergyService.calcFuelEnergyUsed(assessment.meteredEnergy.meteredEnergyFuel);
        fuelCost = fuelResults * assessment.fuelCost;
      }
      if (assessment.steam) {
        steamResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
        steamResults = this.convertSteamResults(steamResults, settings);
        steamCost = steamResults * assessment.steamCost;
      }
      if (assessment.electric) {
        electricityResults = this.meteredEnergyService.calcElectricEnergyUsed(assessment.meteredEnergy.meteredEnergyElectricity);
        electricityCost = electricityResults * assessment.electricityCost;
        electricityResults = this.convertElectrotechResults(electricityResults, settings);
      }
    }
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.buildResult(totalResults, assessment.name, assessment.borderColor, totalCost);
    return result;
  }

  calculateDesigned(assessment: PreAssessment, settings: Settings): { name: string, percent: number, value: number, color: string, energyCost: number } {
    let fuelResults: number = 0;
    let fuelCost: number = 0;
    let steamResults: number = 0;
    let steamCost: number = 0;
    let electricityCost: number = 0;
    let electricityResults: number = 0;
    let totalResults: number = 0;
    let totalCost: number = 0;
    assessment.designedEnergy.zones.forEach(zone => {
      if (assessment.designedEnergy.steam) {
        steamResults += this.designedEnergyService.calculateSteamZoneEnergyUsed(zone.designedEnergySteam);
      }
      if (assessment.designedEnergy.fuel) {
        fuelResults += this.designedEnergyService.calculateFuelZoneEnergyUsed(zone.designedEnergyFuel);
      }
      if (assessment.designedEnergy.electricity) {
        electricityResults += this.designedEnergyService.calculateElectricityZoneEnergyUsed(zone.designedEnergyElectricity);
      }
    })
    fuelCost = fuelResults * assessment.fuelCost;
    steamResults = this.convertSteamResults(steamResults, settings);
    steamCost = steamResults * assessment.steamCost;
    electricityCost = electricityResults * assessment.electricityCost;
    electricityResults = this.convertElectrotechResults(electricityResults, settings);
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    let result: { name: string, percent: number, value: number, color: string, energyCost: number } = this.buildResult(totalResults, assessment.name, assessment.borderColor, totalCost);
    return result;
  }

  convertSteamResults(val: number, settings: Settings) {
    if (val) {
      if (settings.unitsOfMeasure == 'Metric') {
        val = this.convertUnitsService.value(val).from('kJ').to('GJ');
      } else {
        val = this.convertUnitsService.value(val).from('Btu').to('MMBtu');
      }
    }
    return val;
  }

  convertElectrotechResults(val: number, settings: Settings) {
    if (val) {
      if (settings.unitsOfMeasure == 'Metric') {
        val = this.convertUnitsService.value(val).from('kWh').to('GJ');
      } else {
        val = this.convertUnitsService.value(val).from('kWh').to('MMBtu');
      }
    }
    return val;
  }

  buildResult(num: number, name: string, color: string, energyCost: number): { name: string, percent: number, value: number, color: string, energyCost: number } {
    if (isNaN(num) != true) {
      let result: { name: string, percent: number, value: number, color: string, energyCost: number } = {
        name: name,
        percent: null,
        value: num,
        color: color,
        energyCost: energyCost
      }
      return result;
    }
  }

  getSum(data: Array<{ name: string, percent: number, value: number, color: string }>, resultType: string): number {
    let sum = _.sumBy(data, resultType);
    return sum;
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    return percent;
  }
}
