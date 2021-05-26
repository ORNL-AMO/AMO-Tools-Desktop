import { Injectable } from '@angular/core';
import { CoolingTowerOutput, CoolingTowerInput } from '../../shared/models/chillers';
import { ChillersSuiteApiService } from '../../tools-suite-api/chillers-suite-api.service';


@Injectable()
export class ChillerService {

  constructor(private chillersApiService: ChillersSuiteApiService) { }

  coolingTowerMakeupWater(inputObj: CoolingTowerInput): CoolingTowerOutput {
    let output: CoolingTowerOutput = this.chillersApiService.coolingTowerMakeupWater(inputObj);
    return output;
  }

}
