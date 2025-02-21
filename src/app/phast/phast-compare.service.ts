import { Injectable } from '@angular/core';
import { WallLossCompareService } from './losses/wall-losses/wall-loss-compare.service';
import { SlagCompareService } from './losses/slag/slag-compare.service';
import { OtherLossesCompareService } from './losses/other-losses/other-losses-compare.service';
import { OpeningLossesCompareService } from './losses/opening-losses/opening-losses-compare.service';
import { HeatSystemEfficiencyCompareService } from './losses/heat-system-efficiency/heat-system-efficiency-compare.service';
import { GasLeakageCompareService } from './losses/gas-leakage-losses/gas-leakage-compare.service';
import { FixtureLossesCompareService } from './losses/fixture-losses/fixture-losses-compare.service';
import { ExtendedSurfaceCompareService } from './losses/extended-surface-losses/extended-surface-compare.service';
import { ExhaustGasCompareService } from './losses/exhaust-gas/exhaust-gas-compare.service';
import { EnergyInputExhaustGasCompareService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas-compare.service';
import { CoolingLossesCompareService } from './losses/cooling-losses/cooling-losses-compare.service';
import { ChargeMaterialCompareService } from './losses/charge-material/charge-material-compare.service';
import { AuxiliaryPowerCompareService } from './losses/auxiliary-power-losses/auxiliary-power-compare.service';
import { AtmosphereLossesCompareService } from './losses/atmosphere-losses/atmosphere-losses-compare.service';
import { PHAST, Losses } from '../shared/models/phast/phast';
import { EnergyInputCompareService } from './losses/energy-input/energy-input-compare.service';
import { OperationsCompareService } from './losses/operations/operations-compare.service';
import { BehaviorSubject } from 'rxjs';
import { FlueGasCompareService } from './losses/flue-gas-losses/flue-gas-compare.service';

@Injectable()
export class PhastCompareService {
  selectedModification: BehaviorSubject<PHAST>;
  baseline: PHAST;
  baselineSet: boolean;
  modifiedSet: boolean;
  constructor(
    private wallLossCompareService: WallLossCompareService,
    private slagCompareService: SlagCompareService,
    private otherLossCompareService: OtherLossesCompareService,
    private openingLossCompareService: OpeningLossesCompareService,
    private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService,
    private gasLeakageCompareService: GasLeakageCompareService,
    private flueGasCompareService: FlueGasCompareService,
    private fixtureLossCompareService: FixtureLossesCompareService,
    private extendedSurfaceCompareService: ExtendedSurfaceCompareService,
    private exhaustGasCompareService: ExhaustGasCompareService,
    private energyInputService: EnergyInputCompareService,
    private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService,
    private coolingLossCompareService: CoolingLossesCompareService,
    private chargeMaterialCompareService: ChargeMaterialCompareService,
    private auxiliaryPowerCompareService: AuxiliaryPowerCompareService,
    private atmosphereLossesCompareService: AtmosphereLossesCompareService,
    private operationsCompareService: OperationsCompareService
  ) {
    this.selectedModification = new BehaviorSubject<PHAST>(undefined);
  }


  setCompareVals(phast: PHAST, selectedModIndex: number, inSetup: boolean) {
    if (phast.losses) {
      this.setBaseline(phast.losses);
    }
    if (phast.modifications && !inSetup) {
      if (phast.modifications.length !== 0) {
        if (!selectedModIndex) {
          selectedModIndex = 0;
        }
        this.selectedModification.next(phast.modifications[selectedModIndex].phast);
        this.setModified(phast.modifications[selectedModIndex].phast.losses);
        if (phast.modifications[selectedModIndex].phast) {
          this.heatSystemEfficiencyCompareService.modification = phast.modifications[selectedModIndex].phast;
          this.operationsCompareService.modification = phast.modifications[selectedModIndex].phast;
        }
      } else {
        this.selectedModification.next(undefined);
        this.setNoModification();
      }
    }

    if (phast.systemEfficiency) {
      this.heatSystemEfficiencyCompareService.baseline = phast;
      this.operationsCompareService.baseline = phast;
    }
  }

  setBaseline(losses: Losses) {
    this.baselineSet = true;
    if (losses.atmosphereLosses) {
      this.atmosphereLossesCompareService.baselineAtmosphereLosses = losses.atmosphereLosses;
    }
    if (losses.auxiliaryPowerLosses) {
      this.auxiliaryPowerCompareService.baselineAuxLosses = losses.auxiliaryPowerLosses;
    }
    if (losses.chargeMaterials) {
      this.chargeMaterialCompareService.baselineMaterials = losses.chargeMaterials;
    }
    if (losses.coolingLosses) {
      this.coolingLossCompareService.baselineCoolingLosses = losses.coolingLosses;
    }
    if (losses.energyInputEAF) {
      this.energyInputService.baselineEnergyInput = losses.energyInputEAF;
    }
    if (losses.energyInputExhaustGasLoss) {
      this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses = losses.energyInputExhaustGasLoss;
    }
    if (losses.exhaustGasEAF) {
      this.exhaustGasCompareService.baselineExhaustGasLosses = losses.exhaustGasEAF;
    }
    if (losses.extendedSurfaces) {
      this.extendedSurfaceCompareService.baselineSurface = losses.extendedSurfaces;
    }
    if (losses.fixtureLosses) {
      this.fixtureLossCompareService.baselineFixtureLosses = losses.fixtureLosses;
    }
    if (losses.flueGasLosses) {
      this.flueGasCompareService.baselineFlueGasLoss = losses.flueGasLosses;
    }
    if (losses.leakageLosses) {
      this.gasLeakageCompareService.baselineLeakageLoss = losses.leakageLosses;
    }
    if (losses.openingLosses) {
      this.openingLossCompareService.baselineOpeningLosses = losses.openingLosses;
    }
    if (losses.otherLosses) {
      this.otherLossCompareService.baselineOtherLoss = losses.otherLosses;
    }
    if (losses.slagLosses) {
      this.slagCompareService.baselineSlag = losses.slagLosses;
    }
    if (losses.wallLosses) {
      this.wallLossCompareService.baselineWallLosses = losses.wallLosses;
    }
  }

  setModified(losses: Losses) {
    this.modifiedSet = true;
    if (losses.atmosphereLosses) {
      this.atmosphereLossesCompareService.modifiedAtmosphereLosses = losses.atmosphereLosses;
    }
    if (losses.auxiliaryPowerLosses) {
      this.auxiliaryPowerCompareService.modifiedAuxLosses = losses.auxiliaryPowerLosses;
    }
    if (losses.chargeMaterials) {
      this.chargeMaterialCompareService.modifiedMaterials = losses.chargeMaterials;
    }
    if (losses.coolingLosses) {
      this.coolingLossCompareService.modifiedCoolingLosses = losses.coolingLosses;
    }
    if (losses.energyInputEAF) {
      this.energyInputService.modifiedEnergyInput = losses.energyInputEAF;
    }
    if (losses.energyInputExhaustGasLoss) {
      this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses = losses.energyInputExhaustGasLoss;
    }
    if (losses.exhaustGasEAF) {
      this.exhaustGasCompareService.modifiedExhaustGasLosses = losses.exhaustGasEAF;
    }
    if (losses.extendedSurfaces) {
      this.extendedSurfaceCompareService.modifiedSurface = losses.extendedSurfaces;
    }
    if (losses.fixtureLosses) {
      this.fixtureLossCompareService.modifiedFixtureLosses = losses.fixtureLosses;
    }
    if (losses.flueGasLosses) {
      this.flueGasCompareService.modifiedFlueGasLoss = losses.flueGasLosses;
    }
    if (losses.leakageLosses) {
      this.gasLeakageCompareService.modifiedLeakageLoss = losses.leakageLosses;
    }
    if (losses.openingLosses) {
      this.openingLossCompareService.modifiedOpeningLosses = losses.openingLosses;
    }
    if (losses.otherLosses) {
      this.otherLossCompareService.modifiedOtherLoss = losses.otherLosses;
    }
    if (losses.slagLosses) {
      this.slagCompareService.modifiedSlag = losses.slagLosses;
    }
    if (losses.wallLosses) {
      this.wallLossCompareService.modifiedWallLosses = losses.wallLosses;
    }
  }

  setNoModification() {
    this.modifiedSet = false;
    this.atmosphereLossesCompareService.modifiedAtmosphereLosses = undefined;
    this.auxiliaryPowerCompareService.modifiedAuxLosses = undefined;
    this.chargeMaterialCompareService.modifiedMaterials = undefined;
    this.coolingLossCompareService.modifiedCoolingLosses = undefined;
    this.energyInputService.modifiedEnergyInput = undefined;
    this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses = undefined;
    this.exhaustGasCompareService.modifiedExhaustGasLosses = undefined;
    this.extendedSurfaceCompareService.modifiedSurface = undefined;
    this.fixtureLossCompareService.modifiedFixtureLosses = undefined;
    this.flueGasCompareService.modifiedFlueGasLoss = undefined;
    this.gasLeakageCompareService.modifiedLeakageLoss = undefined;
    this.openingLossCompareService.modifiedOpeningLosses = undefined;
    this.otherLossCompareService.modifiedOtherLoss = undefined;
    this.slagCompareService.modifiedSlag = undefined;
    this.wallLossCompareService.modifiedWallLosses = undefined;
    this.heatSystemEfficiencyCompareService.modification = undefined;
    this.operationsCompareService.modification = undefined;
  }

  getBadges(baseline: PHAST, modification: PHAST): Array<{ badge: string, componentStr: string, modName: string }> {
    let badges: Array<{ badge: string, componentStr: string , modName: string}> = [];
    if (baseline && modification) {
      if (baseline.losses.atmosphereLosses) {
        if (this.atmosphereLossesCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Atmo', componentStr: 'atmosphere-losses', modName: 'Atmosphere' });
        }
      }
      if (baseline.losses.auxiliaryPowerLosses) {
        if (this.auxiliaryPowerCompareService.compareBaseModLoss(baseline, modification)) {
          badges.push({ badge: 'Aux', componentStr: 'auxiliary-power', modName: 'Auxiliary power' });
        }
      }
      if (baseline.losses.chargeMaterials) {
        if (this.chargeMaterialCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'ChMat', componentStr: 'charge-material', modName: 'Charge Materials' });
        }
      }
      if (baseline.losses.coolingLosses) {
        if (this.coolingLossCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Cool', componentStr: 'cooling-losses', modName: 'Cooling' });
        }
      }
      if (baseline.losses.chargeMaterials) {
        if (this.energyInputService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'EI', componentStr: 'energy-input', modName: 'Energy Input' });
        }
      }
      if (baseline.losses.energyInputExhaustGasLoss) {
        if (this.energyInputExhaustGasCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'ExGas', componentStr: 'energy-input-exhaust-gas', modName: 'Exhaust Gas Energy Input' });
        }
      }
      if (baseline.losses.exhaustGasEAF) {
        if (this.exhaustGasCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'ExGas', componentStr: 'exhaust-gas', modName: 'Exhaust Gas' });
        }
      }
      if (baseline.losses.extendedSurfaces) {
        if (this.extendedSurfaceCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'ExSur', componentStr: 'extended-surface-losses', modName: 'Extended Surface' });
        }
      }
      if (baseline.losses.fixtureLosses) {
        if (this.fixtureLossCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Fix', componentStr: 'fixture-losses', modName: 'Fixture' });
        }
      }
      if (baseline.losses.flueGasLosses) {
        if (this.flueGasCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Flue', componentStr: 'flue-gas-losses', modName: 'Flue Gas' });
        }
      }
      if (baseline.losses.leakageLosses) {
        if (this.gasLeakageCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'GasL', componentStr: 'gas-leakage-losses', modName: 'Leakage' });
        }
      }
      if (baseline.losses.openingLosses) {
        if (this.openingLossCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Open', componentStr: 'opening-losses', modName: 'Opening' });
        }
      }
      if (baseline.losses.otherLosses) {
        if (this.otherLossCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Other', componentStr: 'other-losses', modName: 'Other' });
        }
      }
      if (baseline.losses.slagLosses) {
        if (this.slagCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Slag', componentStr: 'slag', modName: 'Slag' });
        }
      }
      if (baseline.losses.wallLosses) {
        if (this.wallLossCompareService.compareBaselineModification(baseline, modification)) {
          badges.push({ badge: 'Wall', componentStr: 'wall-losses', modName: 'Wall' });
        }
      }
      if (baseline.systemEfficiency) {
        if (this.heatSystemEfficiencyCompareService.compareEfficiency()) {
          badges.push({ badge: 'Eff', componentStr: 'heat-system-efficiency', modName: 'System Efficiency' });
        }
      }
      if (baseline) {
        if (this.operationsCompareService.compareBaseModLoss(baseline, modification)) {
          badges.push({ badge: 'Op', componentStr: 'operations', modName: 'Operations' });
        }
      }
    }
    return badges;
  }
}
