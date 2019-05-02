import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LightingReplacementResults, LightingReplacementData, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class LightingReplacementService {

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;
  baselineElectricityCost: number;
  modificationElectricityCost: number;
  constructor() { }

  calculate(data: LightingReplacementData): LightingReplacementData {
    // data = this.calculateOperatingHours(data);
    data = this.calculateElectricityUse(data);
    data = this.calculateTotalLighting(data);
    return data;
  }

  // calculateOperatingHours(data: LightingReplacementData): LightingReplacementData {
  //   data.hoursPerYear = data.hoursPerDay * data.daysPerMonth * data.monthsPerYear;
  //   return data;
  // }

  calculateElectricityUse(data: LightingReplacementData): LightingReplacementData {
    data.electricityUse = data.wattsPerLamp * data.lampsPerFixture * data.numberOfFixtures * (1 / 1000) * data.hoursPerYear;
    return data;
  }

  calculateTotalLighting(data: LightingReplacementData): LightingReplacementData {
    data.totalLighting = data.lumensPerLamp * data.lampsPerFixture * data.numberOfFixtures;
    return data;
  }

  getTotals(data: Array<LightingReplacementData>, cost: number): LightingReplacementResult {
    let totalElectricityUse: number = _.sumBy(data, 'electricityUse');
    let totalLighting: number = _.sumBy(data, 'totalLighting');
    let totalOperatingHours: number = _.sumBy(data, 'hoursPerYear');
    let totalOperatingCosts: number = totalElectricityUse * cost;

    let tmpResults: LightingReplacementResult = {
      totalElectricityUse: totalElectricityUse,
      totalLighting: totalLighting,
      totalOperatingHours: totalOperatingHours,
      totalOperatingCosts: totalOperatingCosts
    }
    return tmpResults;
  }

  getResults(lightingData: LightingReplacementTreasureHunt): LightingReplacementResults {
    let baselineResults: LightingReplacementResult = this.getTotals(lightingData.baseline, lightingData.baselineElectricityCost);
    let modificationResults: LightingReplacementResult = this.getTotals(lightingData.modifications, lightingData.modificationElectricityCost);
    let totalEnergySavings: number = baselineResults.totalElectricityUse - modificationResults.totalElectricityUse;
    let totalCostSavings: number = baselineResults.totalOperatingCosts - modificationResults.totalOperatingCosts;
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      totalEnergySavings: totalEnergySavings,
      totalCostSavings: totalCostSavings
    }
  }

  getDefaultData(operatingHours?: OperatingHours): LightingReplacementData {
    let hoursPerYear: number = 8736;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    return {
      hoursPerYear: hoursPerYear,
      wattsPerLamp: 0,
      lampsPerFixture: 0,
      numberOfFixtures: 0,
      lumensPerLamp: 0,
      totalLighting: 0,
      electricityUse: 0
    }
  }

  getInitializedData(operatingHours?: OperatingHours): Array<LightingReplacementData> {
    let data: LightingReplacementData = this.getDefaultData(operatingHours);
    return [data]
  }
}

