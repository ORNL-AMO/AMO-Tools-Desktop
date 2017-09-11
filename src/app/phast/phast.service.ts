import { Injectable } from '@angular/core';
import { EfficiencyImprovementInputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGasEAF } from '../shared/models/phast/losses/exhaustGasEAF';
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
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { FlueGasByMass, FlueGasByVolume, FlueGas } from '../shared/models/phast/losses/flueGas';
import { ExtendedSurface } from '../shared/models/phast/losses/extendedSurface';
import { OtherLoss } from '../shared/models/phast/losses/otherLoss';
import { EnergyInputExhaustGasLoss } from '../shared/models/phast/losses/energyInputExhaustGasLosses';
declare var phastAddon: any;
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';

import { OpeningLossesService } from './losses/opening-losses/opening-losses.service';
import { AtmosphereLossesService } from './losses/atmosphere-losses/atmosphere-losses.service';
import { AuxiliaryPowerLossesService } from './losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { ChargeMaterialService } from './losses/charge-material/charge-material.service';
import { CoolingLossesService } from './losses/cooling-losses/cooling-losses.service';
import { WallLossesService } from './losses/wall-losses/wall-losses.service';
import { FixtureLossesService } from './losses/fixture-losses/fixture-losses.service';
import { GasLeakageLossesService } from './losses/gas-leakage-losses/gas-leakage-losses.service';
import { OtherLossesService } from './losses/other-losses/other-losses.service';
import { SlagService } from './losses/slag/slag.service';
@Injectable()
export class PhastService {

  mainTab: BehaviorSubject<string>;
  secondaryTab: BehaviorSubject<string>;

  constructor(
    private openingLossesService: OpeningLossesService,
    private convertUnitsService: ConvertUnitsService,
    private atmosphereLossesService: AtmosphereLossesService,
    private auxiliaryPowerLossesService: AuxiliaryPowerLossesService,
    private chargeMaterialService: ChargeMaterialService,
    private coolingLossesService: CoolingLossesService,
    private wallLossesService: WallLossesService,
    private fixtureLossesService: FixtureLossesService,
    private gasLeakageLossesService: GasLeakageLossesService,
    private otherLossessService: OtherLossesService,
    private slagService: SlagService
  ) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
  }
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

  wallLosses(inputs: WallLoss, settings: Settings) {
    let results = 0;
    // if (settings.unitsOfMeasure == 'Metric') {
    //   inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('F').to('C');
    //   inputs.surfaceTemperature = this.convertUnitsService.value(inputs.surfaceTemperature).from('F').to('C');
    //   inputs.windVelocity = this.convertUnitsService.value(inputs.windVelocity).from('mph').to('km/h');
    //   inputs.surfaceArea = this.convertUnitsService.value(inputs.surfaceArea).from('ft2').to('m2');
    //   results = phastAddon.wallLosses(inputs);
    //   results = this.convertUnitsService.value(results).from('Btu').to('kJ');
    // } else {
    //   results = phastAddon.wallLosses(inputs);
    // }
    results = phastAddon.wallLosses(inputs);
    return results;
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

  //Electric Arc Furnace
  energyInputEAF(inputs: EnergyInputEAF) {
    return phastAddon.energyInputEAF(inputs);
  }

  //Electric Arc Furnace
  exhaustGasEAF(inputs: ExhaustGasEAF) {
    return phastAddon.exhaustGasEAF(inputs);
  }

  //used in energyInputExhaustGasLosses
  availableHeat(inputs: EnergyInputExhaustGasLoss) {
    return phastAddon.availableHeat(inputs);
  }

  //energy input for non-EAF Electric process heating
  energyInputExhaustGasLosses(inputs: EnergyInputExhaustGasLoss) {
    inputs.availableHeat = this.availableHeat(inputs);
    return phastAddon.energyInputExhaustGasLosses(inputs);
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

  sumHeatInput(losses: Losses, settings: Settings): number {
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
    if (losses.extendedSurfaces) {
      grossHeatRequired += this.sumExtendedSurface(losses.extendedSurfaces, settings);
    }
    if (losses.fixtureLosses) {
      grossHeatRequired += this.sumFixtureLosses(losses.fixtureLosses);
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
      grossHeatRequired += this.sumSlagLosses(losses.slagLosses);
    }
    if (losses.wallLosses) {
      grossHeatRequired += this.sumWallLosses(losses.wallLosses, settings);
    }
    return grossHeatRequired;
  }

  sumAtmosphereLosses(losses: AtmosphereLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.atmosphereLossesService.getAtmosphereForm(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.atmosphere(loss);
      }
    });
    return sum;
  }

  sumAuxilaryPowerLosses(losses: AuxiliaryPowerLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.auxiliaryPowerLoss(loss);
      }
    });
    return sum;
  }

  sumChargeMaterials(losses: ChargeMaterial[]): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.chargeMaterialType == 'Gas') {
        let tmpForm = this.chargeMaterialService.getGasChargeMaterialForm(loss.gasChargeMaterial);
        if (tmpForm.status == 'VALID') {
          sum += this.gasLoadChargeMaterial(loss.gasChargeMaterial);
        }
      } else if (loss.chargeMaterialType == 'Solid') {
        let tmpForm = this.chargeMaterialService.getSolidChargeMaterialForm(loss.solidChargeMaterial);
        if (tmpForm.status == 'VALID') {
          sum += this.solidLoadChargeMaterial(loss.solidChargeMaterial);
        }
      } else if (loss.chargeMaterialType == 'Liquid') {
        let tmpForm = this.chargeMaterialService.getLiquidChargeMaterialForm(loss.liquidChargeMaterial);
        if (tmpForm.status == 'VALID') {
          sum += this.liquidLoadChargeMaterial(loss.liquidChargeMaterial);
        }
      }
    });
    return sum;
  }

  sumCoolingLosses(losses: CoolingLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.coolingLossType == 'Gas') {
        let tmpForm = this.coolingLossesService.initGasFormFromLoss(loss.gasCoolingLoss);
        if (tmpForm.status == 'VALID') {
          sum += this.gasCoolingLosses(loss.gasCoolingLoss);
        }
      } else if (loss.coolingLossType == 'Liquid') {
        let tmpForm = this.coolingLossesService.initLiquidFormFromLoss(loss.liquidCoolingLoss);
        if (tmpForm.status == 'VALID') {
          sum += this.liquidCoolingLosses(loss.liquidCoolingLoss);
        }
      }
    })
    return sum;
  }

  // sumEnergyInputEAF(losses: EnergyInputEAF[]): number {
  //   let sum: any = {
  //     heatDelivered: 0,
  //     kwhCycle: 0,
  //     totalKwhCycle: 0
  //   };
  //   losses.forEach(loss => {
  //     let tmpResult = this.energyInputEAF(loss);
  //     sum.heatDelivered += tmpResult.heatDelivered;
  //     sum.kwhCycle += tmpResult.kwhCycle;
  //     sum.totalKwhCycle += tmpResult.totalKwhCycle;
  //   })
  //   return sum;
  // }

  // sumExhaustGasEAF(losses: ExhaustGasEAF[]): number {
  //   let sum = 0;
  //   losses.forEach(loss => {
  //     sum += this.exhaustGasEAF(loss);
  //   })
  //   return sum;
  // }

  // sumEnergyInputExhaustGas(losses: EnergyInputExhaustGasLoss[]): number {
  //   let sum = 0;
  //   losses.forEach(loss => {
  //     sum += this.energyInputExhaustGasLosses(loss);
  //   })
  //   return sum;
  // }

  sumExtendedSurface(losses: ExtendedSurface[], settings: Settings): number {
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
      let tmpForm = this.wallLossesService.getWallLossForm(tmpWallLoss);
      if (tmpForm.status == 'VALID') {
        sum += this.wallLosses(tmpWallLoss, settings);
      }
    })
    return sum;
  }

  sumFixtureLosses(losses: FixtureLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.fixtureLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.fixtureLosses(loss);
      }
    })
    return sum;
  }

  // sumFlueGasLosses(losses: FlueGas[]): number {
  //   let sum = 0;
  //   losses.forEach(loss => {
  //     if (loss.flueGasType == 'By Mass') {
  //       sum += this.flueGasByMass(loss.flueGasByMass);
  //     } else if (loss.flueGasType == 'By Volume') {
  //       sum += this.flueGasByVolume(loss.flueGasByVolume);
  //     }
  //   })
  //   return sum;
  // }

  sumLeakageLosses(losses: LeakageLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.gasLeakageLossesService.initFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.leakageLosses(loss);
      }
    })
    return sum;
  }

  sumOpeningLosses(losses: OpeningLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.openingLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        if (loss.openingType == 'Round') {
          let tmpLoss = this.openingLossesService.getCircularLossFromForm(tmpForm);
          sum += this.openingLossesCircular(tmpLoss) * loss.numberOfOpenings;
        } else if (loss.openingType == 'Rectangular (Square)') {
          let tmpLoss = this.openingLossesService.getQuadLossFromForm(tmpForm);
          sum += this.openingLossesQuad(tmpLoss) * loss.numberOfOpenings
        }
      }
    })

    return sum;
  }

  sumOtherLosses(losses: OtherLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.otherLossessService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += loss.heatLoss;
      }
    })
    return sum;
  }

  sumSlagLosses(losses: Slag[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.slagService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.slagOtherMaterialLosses(loss);
      }
    })
    return sum;
  }

  sumWallLosses(losses: WallLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.wallLossesService.getWallLossForm(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.wallLosses(loss, settings);
      }
    })
    return sum;
  }

  sumChargeMaterialFeedRate(materials: ChargeMaterial[]): number {
    let sum = 0;
    if (materials) {
      materials.forEach(material => {
        if (material.chargeMaterialType == 'Gas') {
          sum += material.gasChargeMaterial.feedRate;
        } else if (material.chargeMaterialType == 'Solid') {
          sum += material.solidChargeMaterial.chargeFeedRate;
        } else if (material.chargeMaterialType == 'Liquid') {
          sum += material.liquidChargeMaterial.chargeFeedRate;
        }
      })
    }
    return sum;
  }

  sumAuxiliaryEquipment(phast: PHAST, results: Array<any>) {
    let sum = 0;
    results.forEach(result => {
      if (result.motorPower == 'Calculated') {
        sum += result.totalPower;
      } else if (result.motorPower == 'Rated') {
        if (result.totalPower != 0) {
          let convert = this.convertUnitsService.value(result.totalPower).from('hp').to('kW');
          sum += convert;
        }
      }
    })
    return sum;
  }
}

