import { Injectable } from '@angular/core';
import { CombinedHeatPower } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class CombinedHeatPowerService {
  inputData: CombinedHeatPower;
  operatingHours: OperatingHours;
  constructor() { }
}
