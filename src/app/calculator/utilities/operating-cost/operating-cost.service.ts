import { Injectable } from '@angular/core';
import { ElectricityType, FuelType, SteamType } from './operating-cost';
// import { OperatingCost } from './operating-costs';

@Injectable()
export class OperatingCostService {
  // End declaration with semi colon
  // fuel: new Array<FuelType>();

  // To declare and instantiate in same line (there are other ways)
  fuel: Array<FuelType> = [];
  // Otherwise 
  // fuel: Array<FuelType> = new Array<FuelType>();
  steam: Array<SteamType> = [];
  electricity: Array<ElectricityType> = [];
  result: number;

  constructor() { }

}
