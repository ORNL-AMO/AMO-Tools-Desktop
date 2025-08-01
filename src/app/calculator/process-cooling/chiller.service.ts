import { Injectable } from '@angular/core';
import { CoolingTowerOutput, CoolingTowerInput } from '../../shared/models/chillers';
import { ChillerCalculatorSuiteApiService } from '../../tools-suite-api/chiller-calculator-suite-api.service';


@Injectable()
export class ChillerService {

  constructor(private chillersApiService: ChillerCalculatorSuiteApiService) { }

  coolingTowerMakeupWater(inputObj: CoolingTowerInput): CoolingTowerOutput {
    let output: CoolingTowerOutput = this.chillersApiService.coolingTowerMakeupWater(inputObj);
    return output;
  }

}
