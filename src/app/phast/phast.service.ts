import { Injectable } from '@angular/core';
import { EfficiencyImprovementInputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGas } from '../shared/models/phast/losses/exhaustGas';

import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, WaterCoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss, } from '../shared/models/phast/losses/openingLoss';
declare var phastAddon: any;


@Injectable()
export class PhastService {

  constructor() { }
  test() {
    console.log(phastAddon)
  }

  fixtureLosses(inputs: FixtureLoss): number {
    return phastAddon.fixtureLosses(inputs)
  }

  gasCoolingLosses(inputs: GasCoolingLoss): number {
    return phastAddon.gasCoolingLosses(inputs);
  }

  gasLoadChargeMaterial(inputs: GasChargeMaterial): number {
    return phastAddon.gasLoadChargeMaterial(inputs);
  }

  liquidCoolingLosses(inputs: LiquidCoolingLoss): number {
    return phastAddon.liquidCoolingLosses(inputs);
  }

  liquidLoadChargeMaterial(inputs: LiquidChargeMaterial): number {
    return phastAddon.liquidLoadChargeMaterial(inputs);
  }

  openingLossesQuad(inputs: OpeningLoss): number {
    inputs.ratio = Math.min(inputs.diameterLength, inputs.widthHeight) / inputs.thickness;
    return phastAddon.openingLossesQuad(inputs);
  }

  openingLossesCircular(inputs: OpeningLoss): number {
    //TODO: update call for round
    inputs.ratio = inputs.diameterLength / inputs.thickness;
    return phastAddon.openingLossesCircular(inputs);
  }

  solidLoadChargeMaterial(inputs: SolidChargeMaterial) {
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

  waterCoolingLosses(inputs: WaterCoolingLoss) {
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

  auxiliaryPowerLoss(
    motorPhase: number,
    supplyVoltage: number,
    avgCurrent: number,
    powerFactor: number,
    operatingTime: number,
  ) {
    let inputs = {
      motorPhase: motorPhase,
      supplyVoltage: supplyVoltage,
      avgCurrent: avgCurrent,
      powerFactor: powerFactor,
      operatingTime: operatingTime,
    }
    return phastAddon.auxiliaryPowerLoss(inputs);
  }


  energyInput(
    naturalGasHeatInput: number,
    naturalGasFlow: number,
    measuredOxygenFlow: number,
    coalCarbonInjection: number,
    coalHeatingValue: number,
    electrodeUse: number,
    electrodeHeatingValue: number,
    otherFuels: number,
    electricityInput: number
  ) {
    let inputs = {
      naturalGasHeatInput: naturalGasHeatInput,
      naturalGasFlow: naturalGasFlow,
      measuredOxygenFlow: measuredOxygenFlow,
      coalCarbonInjection: coalCarbonInjection,
      coalHeatingValue: coalHeatingValue,
      electrodeUse: electrodeUse,
      electrodeHeatingValue: electrodeHeatingValue,
      otherFuels: otherFuels,
      electricityInput: electricityInput
    }
    return phastAddon.energyInput(inputs);
  }

  efficiencyImprovement(inputs: EfficiencyImprovementInputs) {
    return phastAddon.efficiencyImprovement(inputs);
  }

  energyEquivalencyElectric(inputs: EnergyEquivalencyElectric) {
    return phastAddon.energyEquivalencyElectric(inputs);
  }

  energyEquivalencyFuel(inputs: EnergyEquivalencyFuel) {
    return phastAddon.energyEquivalencyFuel(inputs);
  }

  exhaustGas(inputs: ExhaustGas) {
    return phastAddon.exhaustGas(inputs);
  }

  flowCalculations(inputs: FlowCalculations) {
    return phastAddon.flowCalculations(inputs);
  }

  o2Enrichment(inputs: O2Enrichment) {
    return phastAddon.o2Enrichment(inputs);
  }

  //TODO:Functions in addon need to be implemented
  // humidityRatio
  // flueGasLossesByMassGivenO2
  // flueGasLossesByVolumeGivenO2
}

