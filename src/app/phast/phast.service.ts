import { Injectable } from '@angular/core';
declare var phastAddon: any;


@Injectable()
export class PhastService {

  constructor() { }
  test() {
    console.log(phastAddon)
  }

  fixtureLosses(
    specificHeat: number,
    feedRate: number,
    initialTemperature: number,
    finalTemperature: number,
    correctionFactor: number
  ): number {
    //returns heatLoss
    return phastAddon.fixtureLosses(specificHeat, feedRate, initialTemperature, finalTemperature, correctionFactor)
  }

  gasCoolingLosses(
    flowRate: number,
    initialTemperature: number,
    finalTemperature: number,
    specificHeat: number,
    correctionFactor: number
  ): number {
    //returns heatLoss
    return phastAddon.gasCoolingLosses(flowRate, initialTemperature, finalTemperature, specificHeat, correctionFactor);
  }

  gasLoadChargeMaterial(
    thermicReactionType: number,
    specificHeatGas: number,
    feedRate: number,
    percentVapor: number,
    initialTemperature: number,
    dischargeTemperature: number,
    specificHeatVapor: number,
    percentReacted: number,
    reactionHeat: number,
    additionalHeat: number
  ): number {
    //returns heatLoss
    return phastAddon.gasLoadChargeMaterial(thermicReactionType, specificHeatGas, feedRate, percentVapor, initialTemperature, dischargeTemperature, specificHeatVapor, percentReacted, reactionHeat, additionalHeat);
  }

  liquidCoolingLosses(
    flowRate: number,
    density: number,
    initialTemperature: number,
    outletTemperature: number,
    specificHeat: number,
    correctionFactor: number
  ): number {
    //returns heatLoss
    return phastAddon.liquidCoolingLosses(flowRate, density, initialTemperature, outletTemperature, specificHeat, correctionFactor);
  }

  liquidLoadChargeMaterial(
    thermicReactionType: number,
    specificHeatLiquid: number,
    vaporizingTemperature: number,
    latentHeat: number,
    specificHeatVapor: number,
    chargeFeedRate: number,
    initialTemperature: number,
    dischargeTemperature: number,
    percentVaporized: number,
    percentReacted: number,
    reactionHeat: number,
    additionalHeat: number
  ): number {
    //returns heatLoss
    return phastAddon.liquidLoadChargeMaterial(thermicReactionType, specificHeatLiquid, vaporizingTemperature, latentHeat, specificHeatVapor, chargeFeedRate, initialTemperature, dischargeTemperature, percentVaporized, percentReacted, reactionHeat, additionalHeat);
  }

  openingLossesQuad(
    emessivity: number,
    openingLength: number,
    openingHeight: number,
    thickness: number,
    ratio: number,
    ambientTemperature: number,
    insideTemperature: number,
    percentTimeOpen: number,
    viewFactor: number
  ): number {
    //TODO: Update call for quad
    return phastAddon.openingLossesQuad(emessivity, openingLength, openingHeight, thickness, ratio, ambientTemperature, insideTemperature, percentTimeOpen, viewFactor);
  }

  openingLossesCircular(
    emessivity: number,
    diameterLength: number,
    thickness: number,
    ratio: number,
    ambientTemperature: number,
    insideTemperature: number,
    percentTimeOpen: number,
    viewFactor: number
  ): number {
    //TODO: update call for round
    return phastAddon.openingLossesCircular(emessivity, diameterLength, thickness, ratio, ambientTemperature, insideTemperature, percentTimeOpen, viewFactor);
  }

  solidLoadChargeMaterial(
    thermicReactionType: number,
    specificHeatSolid: number,
    latentHeat: number,
    specificHeatLiquid: number,
    meltingPoint: number,
    chargeFeedRate: number,
    waterContentCharged: number,
    waterContentDischarged: number,
    initialTemperature: number,
    dischargeTemperature: number,
    waterVaporDischargeTemperature: number,
    chargeMelted: number,
    chargeReacted: number,
    reactionHeat: number,
    additionalHeat: number) {
    return phastAddon.solidLoadChargeMaterial(thermicReactionType, specificHeatSolid, latentHeat, specificHeatLiquid, meltingPoint, chargeFeedRate, waterContentCharged, waterContentDischarged, initialTemperature, dischargeTemperature, waterVaporDischargeTemperature, chargeMelted, chargeReacted, reactionHeat, additionalHeat);
  }

  wallLosses(
    surfaceArea: number,
    ambientTemperature: number,
    surfaceTemperature: number,
    windVelocity: number,
    surfaceEmissivity: number,
    conditionFactor: number,
    correctionFactor: number
  ) {
    //returns heatLoss
    return phastAddon.wallLosses(surfaceArea, ambientTemperature, surfaceTemperature, windVelocity, surfaceEmissivity, conditionFactor, correctionFactor);
  }

  waterCoolingLosses(
    flowRate: number,
    initialTemperature: number,
    outletTemperature: number,
    correctionFactor: number
  ) {
    return phastAddon.waterCoolingLosses(flowRate, initialTemperature, outletTemperature, correctionFactor);
  }

  leakageLosses(
    draftPressure: number,
    openingArea: number,
    leakageGasTemperature: number,
    ambientTemperature: number,
    coefficient: number,
    specificGravity: number,
    correctionFactor: number
  ) {
    return phastAddon.leakageLosses(draftPressure, openingArea, leakageGasTemperature, ambientTemperature, coefficient, specificGravity, correctionFactor)
  }

  flueGasByVolume(
    flueGasTemperature: number,
    excessAirPercentage: number,
    combustionAirTemperature: number,
    CH4: number,
    C2H6: number,
    N2: number,
    H2: number,
    C3H8: number,
    C4H10_CnH2n: number,
    H2O: number,
    CO: number,
    CO2: number,
    SO2: number,
    O2: number
  ) {
    let inputs = {
      flueGasTemperature: flueGasTemperature,
      excessAirPercentage: excessAirPercentage,
      combustionAirTemperature: combustionAirTemperature,
      CH4: CH4,
      C2H6: C2H6,
      N2: N2,
      H2: H2,
      C3H8: C3H8,
      C4H10_CnH2n: C4H10_CnH2n,
      H2O: H2O,
      CO: CO,
      CO2: CO2,
      SO2: SO2,
      O2: O2
    }
    debugger
    return phastAddon.flueGasLossesByVolume(inputs);
  }

  flueGasByMass(
    flueGasTemperature: number,
    excessAirPercentage: number,
    combustionAirTemperature: number,
    fuelTemperature: number,
    ashDischargeTemperature: number,
    moistureInAirComposition: number,
    unburnedCarbonInAsh: number,
    carbon: number,
    hydrogen: number,
    sulphur: number,
    inertAsh: number,
    o2: number,
    moisture: number,
    nitrogen: number
  ) {
    let inputs = {
      flueGasTemperature: flueGasTemperature,
      excessAirPercentage: excessAirPercentage,
      combustionAirTemperature: combustionAirTemperature,
      fuelTemperature: fuelTemperature,
      ashDischargeTemperature: ashDischargeTemperature,
      moistureInAirComposition: moistureInAirComposition,
      unburnedCarbonInAsh: unburnedCarbonInAsh,
      carbon: carbon,
      hydrogen: hydrogen,
      sulphur: sulphur,
      inertAsh: inertAsh,
      o2: o2,
      moisture: moisture,
      nitrogen: nitrogen
    }
    debugger
    return phastAddon.flueGasLossesByMass(inputs)
  }

  atmosphere(
    inletTemperature: number,
    outletTemperature: number,
    flowRate: number,
    correctionFactor: number,
    specificHeat: number
  ) {
    return phastAddon.atmosphere(inletTemperature, outletTemperature, flowRate, correctionFactor, specificHeat);
  }
}

