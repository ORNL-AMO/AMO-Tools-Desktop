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

  checkCost(assessment: PreAssessment, settings: Settings): PreAssessment{
    if(!assessment.fuelCost){
      assessment.fuelCost = settings.fuelCost;
    }
    if(!assessment.steamCost){
      assessment.steamCost = settings.steamCost;
    }
    if(!assessment.electricityCost){
      assessment.electricityCost = settings.electricityCost;
    }
    return assessment;
  }

  calculateMetered(assessment: PreAssessment, settings: Settings): { name: string, percent: number, value: number, color: string, energyCost: number } {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      //may need to convert to MMBtu, fuel /MMBtu
      let energyCost = tmpResults * assessment.fuelCost;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
      tmpResults = this.convertSteamResults(tmpResults, settings);
      //May need to convert to MMBtu, steam /MMBtu
      let energyCost = tmpResults * assessment.steamCost;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    }
    else if (assessment.settings.energySourceType == 'Electricity' || assessment.settings.energySourceType == 'Hybrid') {
      let tmpResults = this.meteredEnergyService.calcElectricityUsed(assessment.meteredEnergy.meteredEnergyElectricity);
      //may need conversion
      let energyCost = tmpResults * assessment.electricityCost;
      tmpResults = this.convertElectrotechResults(tmpResults, settings);
      let tmpFuelResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      //may need conversion
      energyCost = energyCost + (tmpFuelResults * assessment.fuelCost);
      tmpResults = tmpFuelResults + tmpResults;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    }
  }

  calculateDesigned(assessment: PreAssessment, settings: Settings): { name: string, percent: number, value: number, color: string, energyCost: number } {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      let energyCost = tmpResults * assessment.fuelCost;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergySteam(assessment.designedEnergy.designedEnergySteam);
      tmpResults = this.convertSteamResults(tmpResults, settings);
      let energyCost = tmpResults * assessment.steamCost;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    }
    else if (assessment.settings.energySourceType == 'Electricity' || assessment.settings.energySourceType == 'Hybrid') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyElectricity(assessment.designedEnergy.designedEnergyElectricity);
      let energyCost = tmpResults * assessment.electricityCost;
      tmpResults = this.convertElectrotechResults(tmpResults, settings);
      let tmpFuelResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      energyCost = energyCost + (tmpFuelResults * assessment.fuelCost);
      tmpResults = tmpFuelResults + tmpResults;

      return this.addResult(tmpResults, assessment.name, assessment.borderColor, energyCost);
    }
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
