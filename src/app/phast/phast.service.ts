import { Injectable } from '@angular/core';
import { EfficiencyImprovementInputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGas } from '../shared/models/phast/losses/exhaustGas';
import { PHAST, Losses } from '../shared/models/phast/phast';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, WaterCoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial, ChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../shared/models/phast/losses/openingLoss';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { AuxiliaryPowerLoss } from '../shared/models/phast/losses/auxiliaryPowerLoss';
import { EnergyInput } from '../shared/models/phast/losses/energyInput';
import { FlueGasByMass, FlueGasByVolume } from '../shared/models/phast/losses/flueGas';
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
  openingLossesQuad(inputs: QuadOpeningLoss): number {
    return phastAddon.openingLossesQuad(inputs);
  }

  openingLossesCircular(inputs: CircularOpeningLoss): number {
    return phastAddon.openingLossesCircular(inputs);
  }

  solidLoadChargeMaterial(inputs: SolidChargeMaterial) {
    return phastAddon.solidLoadChargeMaterial(inputs);
  }

  wallLosses(inputs: WallLoss) {
    return phastAddon.wallLosses(inputs);
  }

  waterCoolingLosses(inputs: WaterCoolingLoss) {
    return phastAddon.waterCoolingLosses(inputs);
  }

  leakageLosses(inputs: LeakageLoss) {
    return phastAddon.leakageLosses(inputs)
  }

  flueGasByVolume(inputs: FlueGasByVolume) {
    return phastAddon.flueGasLossesByVolume(inputs);
  }

  flueGasByMass(inputs: FlueGasByMass) {
    return phastAddon.flueGasLossesByMass(inputs)
  }

  atmosphere(inputs: AtmosphereLoss) {
    return phastAddon.atmosphere(inputs);
  }

  slagOtherMaterialLosses(inputs: Slag) {
    return phastAddon.slagOtherMaterialLosses(inputs);
  }

  auxiliaryPowerLoss(inputs: AuxiliaryPowerLoss) {
    return phastAddon.auxiliaryPowerLoss(inputs);
  }

  energyInput(inputs: EnergyInput) {
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

  sumHeatInput(losses: Losses): number {
    let grossHeatRequired: number = 0;
    if (losses.atmosphereLosses) {
      grossHeatRequired += this.sumAtmosphereLosses(losses.atmosphereLosses);
    }
    if (losses.auxiliaryPowerLosses) {
      grossHeatRequired += this.sumAuxilaryPowerLosses(losses.auxiliaryPowerLosses);
    }
    if (losses.chargeMaterials) {
     grossHeatRequired += this.sumChargeMaterials(losses.chargeMaterials);
    }
    if (losses.coolingLosses) {

    }
    if (losses.energyInput) {

    }
    if (losses.exhaustGas) {

    }
    if (losses.extendedSurfaces) {

    }
    if (losses.fixtureLosses) {

    }
    if (losses.flueGasLosses) {

    }
    if (losses.leakageLosses) {

    }
    if (losses.openingLosses) {

    }
    if (losses.otherLosses) {

    }
    if (losses.slagLosses) {
    }
    if (losses.wallLosses) {
    }

    console.log(grossHeatRequired);
    return grossHeatRequired;
  }

  sumAtmosphereLosses(losses: AtmosphereLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.atmosphere(loss);
    });
    console.log('Atmosphere: ' + sum);
    return sum;
  }

  sumAuxilaryPowerLosses(losses: AuxiliaryPowerLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.auxiliaryPowerLoss(loss);
    });
    console.log('Aux: ' + sum);
    return sum;
  }

  sumChargeMaterials(losses: ChargeMaterial[]) {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.chargeMaterialType == 'Gas') {
        sum += this.gasLoadChargeMaterial(loss.gasChargeMaterial);
      } else if (loss.chargeMaterialType == 'Solid') {
        sum += this.solidLoadChargeMaterial(loss.solidChargeMaterial);
      } else if (loss.chargeMaterialType == 'Liquid') {
        sum += this.liquidLoadChargeMaterial(loss.liquidChargeMaterial);
      }
    });
    console.log('Charge: ' + sum);
    return sum;
  }
  //TODO:Functions in addon need to be implemented
  // humidityRatio
  // flueGasLossesByMassGivenO2
  // flueGasLossesByVolumeGivenO2
}

