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
  resultType: string = 'value';
  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService) { }


  getResults(preAssessments: Array<PreAssessment>, settings: Settings, resultType: string, isHourlyResult: boolean): Array<PreAssessmentResult> {
    let results = new Array<PreAssessmentResult>();
    //calculation logic to get results (in pre-assessment.component.ts)
    preAssessments.forEach(assessment => {
      if (assessment.type === 'Metered') {
        if (assessment.meteredEnergy) {
          let result: PreAssessmentResult = this.calculateMetered(assessment, settings, isHourlyResult);
          if (result) {
            results.push(result);
          }
        }
      } else if (assessment.type === 'Designed') {
        if (assessment.designedEnergy) {
          let result: PreAssessmentResult = this.calculateDesigned(assessment, settings, isHourlyResult);
          if (result) {
            results.push(result);
          }
        }
      }
    });
    if (results.length !== 0) {
      let sum = this.getSum(results, resultType);
      results.forEach(result => {
        result.percent = this.getResultPercent(result[resultType], sum);
      });
    }
    return results;
  }

  calculateMetered(assessment: PreAssessment, settings: Settings, isHourlyResult: boolean): PreAssessmentResult {
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
        fuelResults = this.meteredEnergyService.calcFuelEnergyUsed(assessment.meteredEnergy.meteredEnergyFuel, isHourlyResult);
        fuelCost = fuelResults * assessment.fuelCost;
      }
      if (assessment.steam) {
        steamResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam, isHourlyResult);
        steamResults = this.convertSteamResults(steamResults, settings);
        steamCost = steamResults * assessment.steamCost;
      }
      if (assessment.electric) {
        electricityResults = this.meteredEnergyService.calcElectricEnergyUsed(assessment.meteredEnergy.meteredEnergyElectricity, isHourlyResult);
        electricityCost = electricityResults * assessment.electricityCost;
        electricityResults = this.convertElectrotechResults(electricityResults, settings);
      }
    }
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    let result: PreAssessmentResult = this.buildResult(totalResults, assessment.name, assessment.borderColor, totalCost, 'Metered');
    return result;
  }

  calculateDesigned(assessment: PreAssessment, settings: Settings, isHourlyResult: boolean): PreAssessmentResult {
    let fuelResults: number = 0;
    let fuelCost: number = 0;
    let steamResults: number = 0;
    let steamCost: number = 0;
    let electricityCost: number = 0;
    let electricityResults: number = 0;
    let totalResults: number = 0;
    let totalCost: number = 0;
    if (assessment.designedEnergy) {
      assessment.designedEnergy.zones.forEach(zone => {
        if (assessment.designedEnergy.steam) {
          steamResults += this.designedEnergyService.calculateSteamZoneEnergyUsed(zone.designedEnergySteam, isHourlyResult);
        }
        if (assessment.designedEnergy.fuel) {
          fuelResults += this.designedEnergyService.calculateFuelZoneEnergyUsed(zone.designedEnergyFuel, isHourlyResult);
        }
        if (assessment.designedEnergy.electricity) {
          electricityResults += this.designedEnergyService.calculateElectricityZoneEnergyUsed(zone.designedEnergyElectricity, isHourlyResult);
        }
      });
    }
    fuelCost = fuelResults * assessment.fuelCost;
    steamResults = this.convertSteamResults(steamResults, settings);
    steamCost = steamResults * assessment.steamCost;
    electricityCost = electricityResults * assessment.electricityCost;
    electricityResults = this.convertElectrotechResults(electricityResults, settings);
    totalResults = electricityResults + steamResults + fuelResults;
    totalCost = electricityCost + steamCost + fuelCost;
    let result: PreAssessmentResult = this.buildResult(totalResults, assessment.name, assessment.borderColor, totalCost, 'Designed');
    return result;
  }

  convertSteamResults(val: number, settings: Settings) {
    if (val) {
      if (settings.unitsOfMeasure === 'Metric') {
        val = this.convertUnitsService.value(val).from('kJ').to('GJ');
      } else {
        val = this.convertUnitsService.value(val).from('Btu').to('MMBtu');
      }
    }
    return val;
  }

  convertElectrotechResults(val: number, settings: Settings) {
    if (val) {
      if (settings.unitsOfMeasure === 'Metric') {
        val = this.convertUnitsService.value(val).from('kWh').to('GJ');
      } else {
        val = this.convertUnitsService.value(val).from('kWh').to('MMBtu');
      }
    }
    return val;
  }

  buildResult(num: number, name: string, color: string, energyCost: number, type: string): PreAssessmentResult {
    if (isNaN(num) !== true) {
      let result: PreAssessmentResult = {
        name: name,
        percent: null,
        value: num,
        color: color,
        energyCost: energyCost,
        type: type
      };
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

  generateExample(settings: Settings, graphColors: Array<string>): Array<PreAssessment> {
    let examples: Array<PreAssessment>;
    let example1: PreAssessment = {
      designedEnergy: {
        zones: [
          {
            name: 'Top Preheat',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 60,
              totalBurnerCapacity: 169,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          },
          {
            name: 'Bottom Preheat',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 60,
              totalBurnerCapacity: 169,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          },
          {
            name: 'Top Heat',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 80,
              totalBurnerCapacity: 81.6,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          },
          {
            name: 'Bottom Heat',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 80,
              totalBurnerCapacity: 102,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          },
          {
            name: 'Screen',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 40,
              totalBurnerCapacity: 41.4,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          },
          {
            name: 'Soak',
            designedEnergyFuel: {
              fuelType: 0,
              percentCapacityUsed: 40,
              totalBurnerCapacity: 34.8,
              operatingHours: 7708
            },
            designedEnergySteam: null,
            designedEnergyElectricity: null
          }
        ],
        steam: false,
        fuel: true,
        electricity: false
      },
      meteredEnergy: null,
      energyUsed: 334.541,
      name: 'Reheat Furnace',
      type: 'Designed',
      settings: settings,
      collapsed: false,
      collapsedState: 'open',
      borderColor: graphColors[0],
      fuelCost: 3.99,
      steamCost: 4.69,
      electricityCost: 0.066,
      fuel: true,
      electric: false,
      steam: false
    }
    let example2: PreAssessment = {
      designedEnergy: null,
      meteredEnergy: {
        meteredEnergyFuel: {
          fuelDescription: '',
          fuelType: 0,
          heatingValue: 0,
          collectionTime: 0,
          fuelFlowRateInput: 0,
          electricityUsed: 0,
          electricityCollectionTime: 0,
          fuelEnergy: 0,
          userDefinedMeteredEnergy: false,
          operatingHours: 0
        },
        meteredEnergyElectricity: {
          electricityCollectionTime: 1,
          electricityUsed: 80000,
          auxElectricityUsed: 0,
          auxElectricityCollectionTime: 0,
          operatingHours: 0
        },
        meteredEnergySteam: {
          totalHeatSteam: 0,
          flowRate: 0,
          collectionTime: 0,
          electricityUsed: 0,
          electricityCollectionTime: 0,
          operatingHours: 0
        },
        fuel: false,
        steam: false,
        electricity: true
      },
      energyUsed: 272.970,
      name: 'EAF',
      type: 'Metered',
      settings: settings,
      collapsed: false,
      collapsedState: 'open',
      borderColor: graphColors[1],
      fuelCost: 3.99,
      steamCost: 4.69,
      electricityCost: 0.066,
      fuel: false,
      electric: true,
      steam: false
    }
    examples = [example2, example1];
    return examples;
  }
}


export interface PreAssessmentResult { 
  name: string, 
  percent: number, 
  value: number, 
  color: string, 
  energyCost: number,
  type: string
}