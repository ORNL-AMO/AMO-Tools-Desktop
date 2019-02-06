import { Injectable } from '@angular/core';

@Injectable()
export class ElectricityReductionService {

  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;

  constructor() { }

}

export interface ElectricityReductionData {
  hoursPerDay?: number,
  daysPerMonth?: number,
  monthsPerYear?: number,
  electricityCost?: number,
  measurementMethod?: string,
  numberOfPhases?: number,
  supplyVoltage?: number,
  averageCurrent?: number,
  powerFactor?: number,
}

export interface ElectricityReductionResults {
  energyUse: number,
  energyCost: number,
  annualEnergySavings: number,
  costSavings: number
}