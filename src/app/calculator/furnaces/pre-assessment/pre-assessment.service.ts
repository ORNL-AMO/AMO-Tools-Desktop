import { Injectable } from '@angular/core';
import { PreAssessment } from './pre-assessment';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';

@Injectable()
export class PreAssessmentService {

  unitOfMeasurement: string;

  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService) { }


  getResults(preAssessments: Array<PreAssessment>, unitOfMeasurement: string): Array<{ name: string, percent: number, value: number, color: string }> {

    this.unitOfMeasurement = unitOfMeasurement;
    let results = new Array<{ name: string, percent: number, value: number, color: string }>();

    //calculation logic to get results (in pre-assessment.component.ts)
    let i = preAssessments.length - 1;
    preAssessments.forEach(assessment => {
      if (assessment.type == 'Metered') {
        if (assessment.meteredEnergy) {
          results.push(this.calculateMetered(assessment));
        }
      } else if (assessment.type == 'Designed') {
        if (assessment.designedEnergy) {
          results.push(this.calculateDesigned(assessment));
        }
      }
    })
    let sum = this.getSum(results);
    results.forEach(result => {
      result.percent = this.getResultPercent(result.value, sum);
    });

    return results;
  }

  calculateMetered(assessment: PreAssessment): { name: string, percent: number, value: number, color: string } {

    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.meteredEnergyService.calcElectricityUsed(assessment.meteredEnergy.meteredEnergyElectricity);
      tmpResults = this.convertElectrotechResults(tmpResults);
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
  }

  calculateDesigned(assessment: PreAssessment): { name: string, percent: number, value: number, color: string } {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      tmpResults = tmpResults;
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergySteam(assessment.designedEnergy.designedEnergySteam);
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyElectricity(assessment.designedEnergy.designedEnergyElectricity);
      tmpResults = this.convertElectrotechResults(tmpResults);
      return this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
  }

  convertElectrotechResults(val: number) {
    if (this.unitOfMeasurement == 'Metric') {
      val = this.convertUnitsService.value(val).from('kWh').to('kJ');
    } else {
      val = this.convertUnitsService.value(val).from('kWh').to('Btu');
    }
    return val;
  }

  addResult(num: number, name: string, color: string) {
    if (isNaN(num) != true) {
      // this.results.push({
      //   name: name,
      //   value: num,
      //   color: color
      // });

      let result = {
        name: name,
        percent: null,
        value: num,
        color: color  
      }

      return result;
    }
  }

  getSum(data: Array<{ name: string, percent: number, value: number, color: string }>): number {
    let sum = _.sumBy(data, 'value');
    return sum;
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    return percent;
  }
}
