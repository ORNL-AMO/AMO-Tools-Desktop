import { Injectable } from '@angular/core';
import { CoolingTowerOutput, CoolingTowerInput } from '../../shared/models/chillers';

declare var chillersAddon: any;

@Injectable()
export class ChillerService {

  constructor() { }

  coolingTowerMakeupWater(inputObj: CoolingTowerInput): CoolingTowerOutput {
    let output: CoolingTowerOutput = chillersAddon.coolingTowerMakeupWater(inputObj);
    return output;
  }

}
