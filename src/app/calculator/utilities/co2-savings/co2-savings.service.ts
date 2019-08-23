import { Injectable } from '@angular/core';

@Injectable()
export class Co2SavingsService {
  baselineData: Array<Co2SavingsData>;
  modificationData: Array<Co2SavingsData>;
  constructor() { }

  generateExample(isBaseline: boolean): Co2SavingsData {
    if (isBaseline) {
      return {
        energyType: 'fuel',
        totalEmissionOutputRate: 53.06,
        electricityUse: 1995,
        fuelType: 'Natural Gas',
        energySource: 'Natural Gas',
        totalEmissionOutput: 0
      };
    }
    return {
      energyType: 'fuel',
      totalEmissionOutputRate: 53.06,
      electricityUse: 1500,
      fuelType: 'Natural Gas',
      energySource: 'Natural Gas',
      totalEmissionOutput: 0
    };
  }

  calculate(data: Co2SavingsData): Co2SavingsData {
    if (data.totalEmissionOutputRate && data.electricityUse) {
      data.totalEmissionOutput = (data.totalEmissionOutputRate) * (data.electricityUse / 1000);
    } else {
      data.totalEmissionOutput = 0;
    }
    return data;
  }
}

export interface Co2SavingsData {
  energyType: string;
  totalEmissionOutputRate: number;
  electricityUse: number;
  energySource?: string;
  fuelType?: string;
  eGridRegion?: string;
  eGridSubregion?: string;
  totalEmissionOutput: number;
}
