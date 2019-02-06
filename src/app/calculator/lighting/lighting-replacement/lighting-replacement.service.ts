import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LightingReplacementResults, LightingReplacementData } from '../../../shared/models/lighting';

@Injectable()
export class LightingReplacementService {

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;
  constructor() { }

  calculate(data: LightingReplacementData): LightingReplacementData {
    data = this.calculateOperatingHours(data);
    data = this.calculateElectricityUse(data);
    data = this.calculateTotalLighting(data);
    return data;
  }

  calculateOperatingHours(data: LightingReplacementData): LightingReplacementData {
    data.hoursPerYear = data.hoursPerDay * data.daysPerMonth * data.monthsPerYear;
    return data;
  }

  calculateElectricityUse(data: LightingReplacementData): LightingReplacementData {
    data.electricityUse = data.wattsPerLamp * data.lampsPerFixture * data.numberOfFixtures * (1 / 1000) * data.hoursPerYear;
    return data;
  }

  calculateTotalLighting(data: LightingReplacementData): LightingReplacementData {
    data.totalLighting = data.lumensPerLamp * data.lampsPerFixture * data.numberOfFixtures;
    return data;
  }

  getTotals(data: Array<LightingReplacementData>): LightingReplacementResults {
    let tmpResults: LightingReplacementResults = {
      totalElectricityUse: _.sumBy(data, 'electricityUse'),
      totalLighting: _.sumBy(data, 'totalLighting'),
      totalOperatingHours: _.sumBy(data, 'hoursPerYear')
    }
    return tmpResults;
  }

  getInitializedData(): Array<LightingReplacementData> {
    return [{
      hoursPerDay: 0,
      daysPerMonth: 30,
      monthsPerYear: 12,
      hoursPerYear: 0,
      wattsPerLamp: 0,
      lampsPerFixture: 0,
      numberOfFixtures: 0,
      lumensPerLamp: 0,
      totalLighting: 0,
      electricityUse: 0
    }]
  }
}

