import { Injectable } from '@angular/core';
import { PHAST, PhastResults, Losses } from '../shared/models/phast/phast';
import { PhastService } from './phast.service';
import { Settings } from '../shared/models/settings';

@Injectable()
export class PhastResultsService {

  constructor(private phastService: PhastService) { }
  checkLoss(loss: any) {
    if (!loss) {
      return false;
    }
    else if (loss.length == 0) {
      return false;
    } else {
      return true;
    }
  }

  initResults(): PhastResults {
    let results: PhastResults = {
      totalInput: 0,
      totalChargeMaterialLoss: 0,
      totalWallLoss: 0,
      totalOtherLoss: 0,
      totalOpeningLoss: 0,
      totalLeakageLoss: 0,
      totalFixtureLoss: 0,
      totalExtSurfaceLoss: 0,
      totalCoolingLoss: 0,
      totalAtmosphereLoss: 0,
      totalFlueGas: 0,
      totalSlag: 0,
      totalAuxPower: 0,
      totalEnergyInputEAF: 0,
      totalEnergyInput: 0,
      totalExhaustGas: 0,
      totalSystemLosses: 0,
      exothermicHeat: 0,
      energyInputTotalChemEnergy: 0,
      energyInputHeatDelivered: 0,
      flueGasSystemLosses: 0,
      flueGasGrossHeat: 0,
      flueGasAvailableHeat: 0,
      grossHeatInput: 0,
      heatingSystemEfficiency: 0
    }
    return results;
  }

  getResults(phast: PHAST, settings: Settings): PhastResults {
    let showFlueGas, showSlag, showExGas, showEnInput1, showEnInput2, showAuxPower, showSystemEff: boolean = false;
    if (settings.energySourceType == 'Fuel') {
      showFlueGas = true;
    } else if (settings.energySourceType == 'Electricity') {
      if (settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        showSlag = true;
        showExGas = true;
        showEnInput1 = true;
      } else if (settings.furnaceType != 'Custom Electrotechnology') {
        showAuxPower = true;
        showEnInput2 = true;
      } else if (settings.furnaceType == 'Custom Electrotechnology') {
        showSystemEff = true;
      }
    } else if (settings.energySourceType == 'Steam') {
      showSystemEff = true;
    }
    let results: PhastResults = this.initResults();
    if (this.checkLoss(phast.losses.wallLosses)) {
      results.totalWallLoss = this.phastService.sumWallLosses(phast.losses.wallLosses, settings);
    }
    if (this.checkLoss(phast.losses.wallLosses)) {
      results.totalAtmosphereLoss = this.phastService.sumAtmosphereLosses(phast.losses.atmosphereLosses, settings);
    }
    if (this.checkLoss(phast.losses.otherLosses)) {
      results.totalOtherLoss = this.phastService.sumOtherLosses(phast.losses.otherLosses);
    }
    if (this.checkLoss(phast.losses.coolingLosses)) {
      results.totalCoolingLoss = this.phastService.sumCoolingLosses(phast.losses.coolingLosses, settings);
    }
    if (this.checkLoss(phast.losses.openingLosses)) {
      results.totalOpeningLoss = this.phastService.sumOpeningLosses(phast.losses.openingLosses, settings);
    }
    if (this.checkLoss(phast.losses.fixtureLosses)) {
      results.totalFixtureLoss = this.phastService.sumFixtureLosses(phast.losses.fixtureLosses, settings);
    }
    if (this.checkLoss(phast.losses.leakageLosses)) {
      results.totalLeakageLoss = this.phastService.sumLeakageLosses(phast.losses.leakageLosses, settings);
    }
    if (this.checkLoss(phast.losses.extendedSurfaces)) {
      results.totalExtSurfaceLoss = this.phastService.sumExtendedSurface(phast.losses.extendedSurfaces, settings);
    }
    if (this.checkLoss(phast.losses.chargeMaterials)) {
      results.totalChargeMaterialLoss = this.phastService.sumChargeMaterials(phast.losses.chargeMaterials, settings);
    }

    if (showFlueGas && this.checkLoss(phast.losses.flueGasLosses)) {
      if (phast.losses.flueGasLosses[0].flueGasType == 'By Volume') {
        let tmpResult = this.phastService.flueGasByVolume(phast.losses.flueGasLosses[0].flueGasByVolume, settings);
        let grossHeat = this.phastService.sumHeatInput(phast.losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult);;

      } else if (phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
        let tmpResult = this.phastService.flueGasByMass(phast.losses.flueGasLosses[0].flueGasByMass, settings);
        let grossHeat = this.phastService.sumHeatInput(phast.losses, settings) / tmpResult;
        results.totalFlueGas = grossHeat * (1 - tmpResult);
      }
    }

    if (showAuxPower && this.checkLoss(phast.losses.auxiliaryPowerLosses)) {
      results.totalAuxPower = this.phastService.sumAuxilaryPowerLosses(phast.losses.auxiliaryPowerLosses);
    }

    if (showSlag && this.checkLoss(phast.losses.slagLosses)) {
      results.totalSlag = this.phastService.sumSlagLosses(phast.losses.slagLosses, settings);
    }
    if (showExGas && this.checkLoss(phast.losses.exhaustGasEAF)) {
      results.totalExhaustGas = this.phastService.sumExhaustGasEAF(phast.losses.exhaustGasEAF, settings);
    }
    if (showEnInput2 && this.checkLoss(phast.losses.energyInputExhaustGasLoss)) {
      let tmpResults = this.phastService.energyInputExhaustGasLosses(phast.losses.energyInputExhaustGasLoss[0], settings)
      results.totalExhaustGas = tmpResults.exhaustGasLosses;
    }
    if (phast.systemEfficiency && showSystemEff) {
      let grossHeatInput = this.phastService.sumHeatInput(phast.losses, settings) / phast.systemEfficiency;
      results.totalSystemLosses = grossHeatInput * (1 - (phast.systemEfficiency / 100));
    }
    results.totalInput = results.totalWallLoss + results.totalAtmosphereLoss + results.totalOtherLoss + results.totalCoolingLoss + results.totalOpeningLoss + results.totalFixtureLoss + results.totalLeakageLoss + results.totalExtSurfaceLoss + results.totalChargeMaterialLoss + results.totalFlueGas + results.totalAuxPower + results.totalSlag + results.totalExhaustGas + results.totalSystemLosses;
    return results;
  }

}
