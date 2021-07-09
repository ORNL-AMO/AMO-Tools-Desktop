import { Injectable } from '@angular/core';
import { OperatingCost } from './operating-costs';

@Injectable()
export class OperatingCostService {
  fuel: new Array<fuelType>(),
  steam: new Array<steamType>(),
  electricity: new Array<electricityType>(),
  result: number;
  constructor() { }
}
