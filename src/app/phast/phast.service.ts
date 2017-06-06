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
    let inputs = { specificHeat, feedRate, initialTemperature, finalTemperature, correctionFactor }
    //returns heatLoss
    return phastAddon.fixtureLosses(inputs)
  }

  gasCoolingLosses(
    flowRate: number,
    initialTemperature: number,
    finalTemperature: number,
    specificHeat: number,
    correctionFactor: number
  ): number {
    //returns heatLoss
    let inputs = { flowRate, initialTemperature, finalTemperature, specificHeat, correctionFactor }
    return phastAddon.gasCoolingLosses(inputs);
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
    let inputs = { thermicReactionType, specificHeatGas, feedRate, percentVapor, initialTemperature, dischargeTemperature, specificHeatVapor, percentReacted, reactionHeat, additionalHeat }
    return phastAddon.gasLoadChargeMaterial(inputs);
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
    let inputs = { flowRate, density, initialTemperature, outletTemperature, specificHeat, correctionFactor }
    return phastAddon.liquidCoolingLosses(inputs);
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
    let inputs = { thermicReactionType, specificHeatLiquid, vaporizingTemperature, latentHeat, specificHeatVapor, chargeFeedRate, initialTemperature, dischargeTemperature, percentVaporized, percentReacted, reactionHeat, additionalHeat }
    return phastAddon.liquidLoadChargeMaterial(inputs);
  }

  openingLossesQuad(
    emissivity: number,
    length: number,
    widthHeight: number,
    thickness: number,
    ratio: number,
    ambientTemperature: number,
    insideTemperature: number,
    percentTimeOpen: number,
    viewFactor: number
  ): number {
    //TODO: Update call for quad
    let inputs = { emissivity, length, widthHeight, thickness, ratio, ambientTemperature, insideTemperature, percentTimeOpen, viewFactor }
    return phastAddon.openingLossesQuad(inputs);
  }

  openingLossesCircular(
    emissivity: number,
    diameterLength: number,
    thickness: number,
    ratio: number,
    ambientTemperature: number,
    insideTemperature: number,
    percentTimeOpen: number,
    viewFactor: number
  ): number {
    //TODO: update call for round
    let inputs = { emissivity, diameterLength, thickness, ratio, ambientTemperature, insideTemperature, percentTimeOpen, viewFactor }
    return phastAddon.openingLossesCircular(inputs);
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
    chargedReacted: number,
    reactionHeat: number,
    additionalHeat: number) {
    let inputs = { thermicReactionType, specificHeatSolid, latentHeat, specificHeatLiquid, meltingPoint, chargeFeedRate, waterContentCharged, waterContentDischarged, initialTemperature, dischargeTemperature, waterVaporDischargeTemperature, chargeMelted, chargedReacted, reactionHeat, additionalHeat }
    return phastAddon.solidLoadChargeMaterial(inputs);
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
    let inputs = { surfaceArea, ambientTemperature, surfaceTemperature, windVelocity, surfaceEmissivity, conditionFactor, correctionFactor }
    return phastAddon.wallLosses(inputs);
  }

  waterCoolingLosses(
    flowRate: number,
    initialTemperature: number,
    outletTemperature: number,
    correctionFactor: number
  ) {
    let inputs = { flowRate, initialTemperature, outletTemperature, correctionFactor }
    return phastAddon.waterCoolingLosses(inputs);
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
    let inputs = { draftPressure, openingArea, leakageGasTemperature, ambientTemperature, coefficient, specificGravity, correctionFactor }
    return phastAddon.leakageLosses(inputs)
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
    return phastAddon.flueGasLossesByMass(inputs)
  }

  atmosphere(
    inletTemperature: number,
    outletTemperature: number,
    flowRate: number,
    correctionFactor: number,
    specificHeat: number
  ) {
    let inputs = { inletTemperature, outletTemperature, flowRate, correctionFactor, specificHeat }
    return phastAddon.atmosphere(inputs);
  }

  slagOtherMaterialLosses(
    weight: number,
    inletTemperature: number,
    outletTemperature: number,
    specificHeat: number,
    correctionFactor: number
  ) {
    let inputs = {
      weight,
      inletTemperature,
      outletTemperature,
      specificHeat,
      correctionFactor
    }
    return phastAddon.slagOtherMaterialLosses(inputs);
  }

}

