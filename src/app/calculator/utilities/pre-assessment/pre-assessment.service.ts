import { Injectable } from '@angular/core';
import { PreAssessment } from './pre-assessment';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PreAssessmentService {

  //unitOfMeasurement: string;
  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService) { }


  getResults(preAssessments: Array<PreAssessment>, settings: Settings, resultType: string): Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> {

    // this.unitOfMeasurement = unitOfMeasurement;
    let results = new Array<{ name: string, percent: number, value: number, color: string, energyCost: number }>();

    //calculation logic to get results (in pre-assessment.component.ts)
    let i = preAssessments.length - 1;
    preAssessments.forEach(assessment => {
      assessment = this.checkCost(assessment, settings);
      if (assessment.type == 'Metered') {
        if (assessment.meteredEnergy) {
          results.push(this.calculateMetered(assessment, settings));
        }
      } else if (assessment.type == 'Designed') {
        if (assessment.designedEnergy) {
          results.push(this.calculateDesigned(assessment, settings));
        }
      }
    })
    let sum = this.getSum(results, resultType);
    results.forEach(result => {
      result.percent = this.getResultPercent(result[resultType], sum);
    });

    return results;
  }

  checkCost(assessment: PreAssessment, settings: Settings): PreAssessment {
    if (!assessment.fuelCost) {
      assessment.fuelCost = settings.fuelCost;
    }
    if (!assessment.steamCost) {
      assessment.steamCost = settings.steamCost;
    }
    if (!assessment.electricityCost) {
      assessment.electricityCost = settings.electricityCost;
    }
    return assessment;
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
    if (assessment.fuel) {
      fuelResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      fuelCost = fuelResults * assessment.fuelCost;
    }
    if (assessment.steam) {
      steamResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
      steamResults = this.convertSteamResults(steamResults, settings);
      steamCost = steamResults * assessment.steamCost;
    }
    if (assessment.electric) {
      electricityResults = this.meteredEnergyService.calcElectricityUsed(assessment.meteredEnergy.meteredEnergyElectricity);
      electricityCost = electricityResults * assessment.electricityCost;
      electricityResults = this.convertElectrotechResults(electricityResults, settings);
    }
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    return this.addResult(totalResults, assessment.name, assessment.borderColor, totalCost);
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
    if (assessment.fuel) {
      fuelResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      fuelCost = fuelResults * assessment.fuelCost;
    }
    if (assessment.steam) {
      steamResults = this.designedEnergyService.sumDesignedEnergySteam(assessment.designedEnergy.designedEnergySteam);
      steamResults = this.convertSteamResults(steamResults, settings);
      steamCost = steamResults * assessment.steamCost;
    }
    if (assessment.electric) {
      electricityResults = this.designedEnergyService.sumDesignedEnergyElectricity(assessment.designedEnergy.designedEnergyElectricity);
      electricityCost = electricityResults * assessment.electricityCost;
      electricityResults = this.convertElectrotechResults(electricityResults, settings);
    }
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    return this.addResult(totalResults, assessment.name, assessment.borderColor, totalCost);
  }

  convertSteamResults(val: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to('GJ');
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to('MMBtu');
    }
    return val;
  }

  convertElectrotechResults(val: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kWh').to('GJ');
    } else {
      val = this.convertUnitsService.value(val).from('kWh').to('MMBtu');
    }
    return val;
  }

  addResult(num: number, name: string, color: string, energyCost: number): { name: string, percent: number, value: number, color: string, energyCost: number } {
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
