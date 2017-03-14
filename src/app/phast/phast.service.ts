import { Injectable } from '@angular/core';
declare var phastAddon: any;


@Injectable()
export class PhastService {

  constructor() { }
  test() {
    console.log(phastAddon)
  }

  fixtureLosses(specificHeat: number, feedRate: number, initialTemperature: number, finalTemperature: number, correctionFactor: number): number {
    //returns heatLoss
    return phastAddon.fixtureLosses(specificHeat, feedRate, initialTemperature, finalTemperature, correctionFactor)
  }

  gasCoolingLosses(flowRate: number, initialTemperature: number, finalTemperature: number, specificHeat: number, correctionFactor: number): number {
    //returns heatLoss
    return phastAddon.gasCoolingLosses(flowRate, initialTemperature, finalTemperature, specificHeat, correctionFactor);
  }

  gasLoadChargeMaterial(thermicReactionType: number, specificHeatGas: number, feedRate: number, percentVapor: number, initialTemperature: number, dischargeTemperature: number, specificHeatVapor: number, percentReacted: number, reactionHeat: number, additionalHeat: number): number {
    //returns heatLoss
    return phastAddon.gasLoadChargeMaterial(thermicReactionType, specificHeatGas, feedRate, percentVapor, initialTemperature, dischargeTemperature, specificHeatVapor, percentReacted, reactionHeat, additionalHeat);
  }

  liquidCoolingLosses(flowRate: number, density: number, initialTemperature: number, outletTemperature: number, specificHeat: number, correctionFactor: number): number {
    //returns heatLoss
    return phastAddon.liquidCoolingLosses(flowRate, density, initialTemperature, outletTemperature, specificHeat, correctionFactor);
  }

  liquidLoadChargeMaterial(thermicReactionType: number, specificHeatLiquid: number, vaporizingTemperature: number, latentHeat: number, specificHeatVapor: number, chargeFeedRate: number, initialTemperature: number, dischargeTemperature: number, percentVaporized: number, percentReacted: number, reactionHeat: number, additionalHeat: number): number {
    //returns heatLoss
    return phastAddon.liquidLoadChargeMaterial(thermicReactionType, specificHeatLiquid, vaporizingTemperature, latentHeat, specificHeatVapor, chargeFeedRate, initialTemperature, dischargeTemperature, percentVaporized, percentReacted, reactionHeat, additionalHeat);
  }

  openingLosses(emessivity: number, diameterWidth: number, thickness: number, ratio: number, ambientTemperature: number, insideTemperature: number, percentTimeOpen: number, viewFactor: number): number {
    //returns nothing?
    return phastAddon.openingLosses(emessivity, diameterWidth, thickness, ratio, ambientTemperature, insideTemperature, percentTimeOpen, viewFactor);
  }

  solidLoadChargeMaterial(thermicReactionType: number, specificHeatSolid: number, latentHeat: number, specificHeatLiquid: number, meltingPoint: number, chargeFeedRate: number, waterContentCharged: number, waterContentDischarged: number, initialTemperature: number, dischargeTemperature: number, waterVaporDischargeTemperature: number, chargeMelted: number, chargedReacted: number, reactionHeat: number, additionalHeat: number) {
    //return nothing?
    return phastAddon.solidLoadChargeMaterial(thermicReactionType, specificHeatSolid, latentHeat, specificHeatLiquid, meltingPoint, chargeFeedRate, waterContentCharged, waterContentDischarged, initialTemperature, dischargeTemperature, waterVaporDischargeTemperature, chargeMelted, chargedReacted, reactionHeat, additionalHeat);
  }

  wallLosses(surfaceArea: number, ambientTemperature: number, surfaceTemperature: number, windVelocity: number, surfaceEmissivity: number, conditionFactor: number, correctionFactor: number) {
    //returns heatLoss
    return phastAddon.wallLosses(surfaceArea, ambientTemperature, surfaceTemperature, windVelocity, surfaceEmissivity, conditionFactor, correctionFactor);
  }

  waterCoolingLosses(flowRate: number, initialTemperature: number, outletTemperature: number, correctionFactor: number){
    return phastAddon.waterCoolingLosses(flowRate, initialTemperature, outletTemperature, correctionFactor);
  }

}
