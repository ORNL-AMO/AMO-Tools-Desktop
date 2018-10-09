import { Injectable } from '@angular/core';

@Injectable()
export class Co2SavingsService {
  baselineData: Array<Co2SavingsData>;
  modificationData: Array<Co2SavingsData>;
  constructor() { }

  calculate(data: Co2SavingsData): Co2SavingsResults {
    return
  }

  getTotals(data: Array<Co2SavingsData>): Co2SavingsResults {
    return
  }
}



export interface Co2SavingsResults {

}

export interface Co2SavingsData {
  energyType: string;
  totalEmissionOutputRate: number;
  electricityUse: number;
  energySource?: string;
  fuelType?: string;
  eGridRegion?: string;
  eGridSubregion?: string;
}