import { Injectable } from '@angular/core';
import { EfficiencyImprovementInputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGas } from '../shared/models/phast/losses/exhaustGas';
import { PHAST, Losses } from '../shared/models/phast/phast';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, WaterCoolingLoss, CoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial, ChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../shared/models/phast/losses/openingLoss';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { AuxiliaryPowerLoss } from '../shared/models/phast/losses/auxiliaryPowerLoss';
import { EnergyInput } from '../shared/models/phast/losses/energyInput';
import { FlueGasByMass, FlueGasByVolume, FlueGas } from '../shared/models/phast/losses/flueGas';
import { ExtendedSurface } from '../shared/models/phast/losses/extendedSurface';
import { OtherLoss } from '../shared/models/phast/losses/otherLoss';
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

  //TODO:Functions in addon need to be implemented
  // humidityRatio
  // flueGasLossesByMassGivenO2
  // flueGasLossesByVolumeGivenO2

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
      grossHeatRequired += this.sumCoolingLosses(losses.coolingLosses);
    }
    // if (losses.energyInput) {

    // }
    if (losses.exhaustGas) {
      grossHeatRequired += this.sumExhaustGas(losses.exhaustGas);
    }
    if (losses.extendedSurfaces) {
      grossHeatRequired += this.sumExtendedSurface(losses.extendedSurfaces);
    }
    if (losses.fixtureLosses) {
      grossHeatRequired += this.sumFixtureLosses(losses.fixtureLosses);
    }
    if (losses.flueGasLosses) {
      grossHeatRequired += this.sumFlueGasLosses(losses.flueGasLosses);
    }
    if (losses.leakageLosses) {
      grossHeatRequired += this.sumLeakageLosses(losses.leakageLosses);
    }
    if (losses.openingLosses) {
      grossHeatRequired += this.sumOpeningLosses(losses.openingLosses);
    }
    if (losses.otherLosses) {
      grossHeatRequired += this.sumOtherLosses(losses.otherLosses);
    }
    if (losses.slagLosses) {
      grossHeatRequired +=  this.sumSlagLosses(losses.slagLosses);
    }
    if (losses.wallLosses) {
      grossHeatRequired += this.sumWallLosses(losses.wallLosses);
    }

    console.log(grossHeatRequired);
    return grossHeatRequired;
  }

  sumAtmosphereLosses(losses: AtmosphereLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.atmosphere(loss);
    });
    return sum;
  }

  sumAuxilaryPowerLosses(losses: AuxiliaryPowerLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.auxiliaryPowerLoss(loss);
    });
    return sum;
  }

  sumChargeMaterials(losses: ChargeMaterial[]): number {
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
    return sum;
  }

  sumCoolingLosses(losses: CoolingLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.coolingLossType == 'Gas') {
        sum += this.gasCoolingLosses(loss.gasCoolingLoss);
      } else if (loss.coolingLossType == 'Liquid') {
        sum += this.liquidCoolingLosses(loss.liquidCoolingLoss);
      }
    })
    return sum;
  }

  sumEnergyInput(losses: EnergyInput[]): number {
    let sum: any = {
      heatDelivered: 0,
      kwhCycle: 0,
      totalKwhCycle: 0
    };
    losses.forEach(loss => {
      let tmpResult = this.energyInput(loss);
      sum.heatDelivered += tmpResult.heatDelivered;
      sum.kwhCycle += tmpResult.kwhCycle;
      sum.totalKwhCycle += tmpResult.totalKwhCycle;
    })
    return sum;
  }

  sumExhaustGas(losses: ExhaustGas[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.exhaustGas(loss);
    })
    return sum;
  }

  sumExtendedSurface(losses: ExtendedSurface[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpWallLoss: WallLoss = {
        surfaceArea: loss.surfaceArea,
        ambientTemperature: loss.ambientTemperature,
        surfaceTemperature: loss.surfaceTemperature,
        windVelocity: 5,
        surfaceEmissivity: loss.surfaceEmissivity,
        conditionFactor: 1,
        correctionFactor: 1,
      }
      sum += this.wallLosses(tmpWallLoss);
    })
    return sum;
  }

  sumFixtureLosses(losses: FixtureLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.fixtureLosses(loss);
    })
    return sum;
  }

  sumFlueGasLosses(losses: FlueGas[]): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.flueGasType == 'By Mass') {
        sum += this.flueGasByMass(loss.flueGasByMass);
      } else if (loss.flueGasType == 'By Volume') {
        sum += this.flueGasByVolume(loss.flueGasByVolume);
      }
    })
    return sum;
  }

  sumLeakageLosses(losses: LeakageLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.leakageLosses(loss);
    })
    return sum;
  }

  sumOpeningLosses(losses: OpeningLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.openingType == 'Round') {
        sum += this.openingLossesCircular(loss) * loss.numberOfOpenings;
      } else if (loss.openingType == 'Rectangular (Square)') {
        sum += this.openingLossesQuad(loss) * loss.numberOfOpenings
      }
    })
    return sum;
  }

  sumOtherLosses(losses: OtherLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += loss.heatLoss;
    })
    return sum;
  }

  sumSlagLosses(losses: Slag[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.slagOtherMaterialLosses(loss);
    })
    return sum;
  }

  sumWallLosses(losses: WallLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.wallLosses(loss);
    })
    return sum;
  }

  sumChargeMaterialFeedRate(materials: ChargeMaterial[]): number {
    let sum = 0;
    materials.forEach(material => {
      if (material.chargeMaterialType == 'Gas') {
        sum += material.gasChargeMaterial.feedRate;
      } else if (material.chargeMaterialType == 'Solid') {
        sum += material.solidChargeMaterial.chargeFeedRate;
      } else if (material.chargeMaterialType == 'Liquid') {
        sum += material.liquidChargeMaterial.chargeFeedRate;
      }
    })
    return sum;
  }
}

