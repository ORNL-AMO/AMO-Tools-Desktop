import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class LightingReplacementService {

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
}

export interface LightingReplacementData {
  hoursPerDay?: number,
  daysPerMonth?: number,
  monthsPerYear?: number,
  hoursPerYear?: number,
  wattsPerLamp?: number,
  lampsPerFixture?: number,
  numberOfFixtures?: number,
  lumensPerLamp?: number,
  totalLighting?: number,
  electricityUse?: number
}


export interface LightingReplacementResults {
  totalElectricityUse: number;
  totalLighting: number;
  totalOperatingHours: number;
}