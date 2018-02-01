import { Injectable } from '@angular/core';
declare var standaloneAddon: any;
import { CombinedHeatPower, CombinedHeatPowerOutput } from '../shared/models/combinedHeatPower';


@Injectable()
export class StandaloneService {

  constructor() { }
  test(){
    console.log(standaloneAddon)
  }


  CHPcalculator(inputs: CombinedHeatPower): CombinedHeatPowerOutput{
    return standaloneAddon.CHPcalculator(inputs);
  }
}
