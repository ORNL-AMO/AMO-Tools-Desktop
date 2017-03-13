import { Injectable } from '@angular/core';
declare var phastAddon: any;


@Injectable()
export class PhastService {

  constructor() { }
  test(){
    console.log(phastAddon)
  }

  fixtureLosses(specificHeat: number, feedRate: number, initialTemperature: number, finalTemperature: number, correctionFactor: number): number{
    //returns heatLoss
    return phastAddon.fixtureLosses(specificHeat, feedRate, initialTemperature, finalTemperature, correctionFactor)
  }

  gasCoolingLosses(flowRate: number, initialTemperature: number, finalTemperature: number, specificHeat: number, correctionFactor: number): number{
    //returns heatLoss
    return phastAddon.gasCoolingLosses(flowRate, initialTemperature, finalTemperature, specificHeat, correctionFactor);
  }

  gasLoadChargeMaterial(thermicReactionType: number, specificHeatGas: number, feedRate: number, percentVapor: number, initialTemperature: number, dischargeTemperature: number, specificHeatVapor: number, percentReacted: number, reactionHeat: number, additionalHeat: number ): number {
    //returns heatLoss
    return phastAddon.gasLoadChargeMaterial(thermicReactionType, specificHeatGas, feedRate, percentVapor, initialTemperature, dischargeTemperature, specificHeatVapor, percentReacted, reactionHeat, additionalHeat);
  }

  wallLosses(surfaceArea:number, ambientTemperature: number, surfaceTemperature: number, windVelocity:number, surfaceEmissivity: number, conditionFactor: number, correctionFactor: number){
    
    return phastAddon.wallLosses(surfaceArea, ambientTemperature, surfaceTemperature, windVelocity, surfaceEmissivity, conditionFactor, correctionFactor);
  }

}
