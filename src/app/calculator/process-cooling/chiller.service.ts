import { Injectable } from '@angular/core';
import { CoolingTowerOutput, CoolingTowerInput } from '../../shared/models/chillers';
import { ChillersSuiteApiService } from '../../tools-suite-api/chillers-suite-api.service';

declare var chillersAddon: any;

@Injectable()
export class ChillerService {

  constructor(private chillersApiService: ChillersSuiteApiService) { }

  coolingTowerMakeupWater(inputObj: CoolingTowerInput): CoolingTowerOutput {
    let output: CoolingTowerOutput = this.chillersApiService.coolingTowerMakeupWater(inputObj);
    return output;
  }

  basinHeaterEnergyConsumption(input) {
    let output = this.chillersApiService.basinHeaterEnergyConsumption(input);
    return output;
  }

  fanEnergyConsumption(input) {
    let output = this.chillersApiService.fanEnergyConsumption(input);
    return output;
  }

  chillerCapacityEfficiency(input) {
    let output = this.chillersApiService.chillerCapacityEfficiency(input);
    return output;
  }

  chillerStagingEfficiency(input) {
    let output = this.chillersApiService.chillerStagingEfficiency(input);
    return output;
  }

}
