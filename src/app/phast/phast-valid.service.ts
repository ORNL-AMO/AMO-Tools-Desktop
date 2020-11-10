import { Injectable } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { FlueGasLossesService } from './losses/flue-gas-losses/flue-gas-losses.service';
import { ExtendedSurfaceLossesService } from './losses/extended-surface-losses/extended-surface-losses.service';
import { OperationsService } from './losses/operations/operations.service';
import { EnergyInputService } from './losses/energy-input/energy-input.service';
import { HeatSystemEfficiencyCompareService } from './losses/heat-system-efficiency/heat-system-efficiency-compare.service';
import { ExhaustGasService } from './losses/exhaust-gas/exhaust-gas.service';
import { EnergyInputExhaustGasService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { AuxiliaryPowerLossesService } from './losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { ChargeMaterialService } from './losses/charge-material/charge-material.service';

import { PHAST, PhastValid } from '../shared/models/phast/phast';
import { WallLossesService } from './losses/wall-losses/wall-losses.service';
import { CoolingLossesService } from './losses/cooling-losses/cooling-losses.service';
import { FixtureLossesService } from './losses/fixture-losses/fixture-losses.service';
import { GasLeakageLossesService } from './losses/gas-leakage-losses/gas-leakage-losses.service';
import { OtherLossesService } from './losses/other-losses/other-losses.service';
import { OpeningLossesService } from './losses/opening-losses/opening-losses.service';
import { AtmosphereLossesService } from './losses/atmosphere-losses/atmosphere-losses.service';
import { SlagService } from './losses/slag/slag.service';


@Injectable()
export class PhastValidService {

  constructor(
    private openingLossesService: OpeningLossesService,
    private atmosphereLossesService: AtmosphereLossesService,
    private slagService: SlagService,
    private auxiliaryPowerLossesService: AuxiliaryPowerLossesService,
    private chargeMaterialService: ChargeMaterialService,
    private coolingLossesService: CoolingLossesService,
    private wallLossesService: WallLossesService,
    private flueGasLossesService: FlueGasLossesService,
    private extendedSurfaceLossesService: ExtendedSurfaceLossesService,
    private operationsService: OperationsService,
    private energyInputService: EnergyInputService,
    private exhaustGasService: ExhaustGasService,
    private energyInputExhaustGasService: EnergyInputExhaustGasService,
    private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService,
    private fixtureLossesService: FixtureLossesService,
    private gasLeakageLossesService: GasLeakageLossesService,
    private otherLossessService: OtherLossesService,
  ) { }



  checkValid(phast: PHAST): PhastValid {
    if (phast.losses) {
      let isChargeMaterialValid: boolean = this.checkChargeMaterialValid(phast);
      let isFlueGasValid: boolean = this.checkFlueGasValid(phast);
      let isFixtureValid: boolean = this.checkFixtureValid(phast);
      let isWallValid: boolean = this.checkWallValid(phast);
      let isCoolingValid: boolean = this.checkCoolingValid(phast);
      let isAtmosphereValid: boolean = this.checkAtmosphereValid(phast);
      let isOpeningValid: boolean = this.checkOpeningValid(phast);
      let isLeakageValid: boolean = this.checkLeakageValid(phast);
      let isExtendedValid: boolean = this.checkExtendedValid(phast);
      let isOtherValid: boolean = this.checkOtherValid(phast);
      let isOperationsValid: boolean = this.checkOperationsValid(phast);
      let isSystemEfficiencyValid: boolean = this.checkSysEfficiencyValid(phast);
      let isEnergyInputValid: boolean = this.checkEnergyInputValid(phast);
      let isSlagValid: boolean = this.checkSlagValid(phast);
      let isExhaustGasValid: boolean = this.checkExhaustGasValid(phast);
      let isInputExhaustValid: boolean = this.checkInputExhaustValid(phast);
      let isAuxPowerValid: boolean = this.checkAuxPowerValidValid(phast);

      return {
        isValid: isChargeMaterialValid
          && isFlueGasValid
          && isFixtureValid
          && isWallValid
          && isCoolingValid
          && isAtmosphereValid
          && isOpeningValid
          && isLeakageValid
          && isOtherValid
          && isExtendedValid
          && isOperationsValid
          && isEnergyInputValid
          && isSystemEfficiencyValid
          && isSlagValid
          && isExhaustGasValid
          && isInputExhaustValid
          && isAuxPowerValid,
        operationsValid: isOperationsValid,
        chargeMaterialValid: isChargeMaterialValid,
        flueGasValid: isFlueGasValid,
        fixtureValid: isFixtureValid,
        wallValid: isWallValid,
        coolingValid: isCoolingValid,
        atmosphereValid: isAtmosphereValid,
        openingValid: isOpeningValid,
        leakageValid: isLeakageValid,
        extendedSurfaceValid: isExtendedValid,
        otherValid: isOtherValid,
        systemEfficiencyValid: isSystemEfficiencyValid,
        energyInputValid: isEnergyInputValid,
        slagValid: isSlagValid,
        exhaustGasValid: isExhaustGasValid,
        inputExhaustValid: isInputExhaustValid,
        auxPowerValid: isAuxPowerValid
      };
    } else {
      return {
        isValid: false,
        operationsValid: false,
        chargeMaterialValid: false,
        flueGasValid: false,
        fixtureValid: false,
        wallValid: false,
        coolingValid: false,
        atmosphereValid: false,
        openingValid: false,
        leakageValid: false,
        extendedSurfaceValid: false,
        otherValid: false,
        systemEfficiencyValid: false,
        energyInputValid: false,
        slagValid: false,
        exhaustGasValid: false,
        inputExhaustValid: false,
        auxPowerValid: false
      }
    }
  }

  checkExhaustGasValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.exhaustGasEAF) {
      phast.losses.exhaustGasEAF.forEach(loss => {
        let exhaustGasForm: FormGroup = this.exhaustGasService.getFormFromLoss(loss);
        if (exhaustGasForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid
  }

  checkInputExhaustValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.exhaustGasEAF) {
      phast.losses.exhaustGasEAF.forEach(loss => {
        let exhaustGasForm: FormGroup = this.energyInputExhaustGasService.getFormFromLoss(loss);
        if (exhaustGasForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid
  }

  checkAuxPowerValidValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.auxiliaryPowerLosses) {
      phast.losses.auxiliaryPowerLosses.forEach(loss => {
        let auxPowerForm: FormGroup = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
        if (auxPowerForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid

  }

  checkOperationsValid(phast: PHAST): boolean {
    let operationsForm: FormGroup = this.operationsService.initForm(phast);
    return operationsForm.status === 'VALID'
  }

  checkChargeMaterialValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses && phast.losses.chargeMaterials) {
      let chargeMaterialForm: FormGroup;
      phast.losses.chargeMaterials.forEach(loss => {
        if (loss.chargeMaterialType === 'Gas') {
          chargeMaterialForm = this.chargeMaterialService.getGasChargeMaterialForm(loss);
        } else if (loss.chargeMaterialType === 'Solid') {
          chargeMaterialForm = this.chargeMaterialService.getSolidChargeMaterialForm(loss);
        } else if (loss.chargeMaterialType === 'Liquid') {
          chargeMaterialForm = this.chargeMaterialService.getLiquidChargeMaterialForm(loss);
        }

        if (chargeMaterialForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid
  }

  checkFlueGasValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.flueGasLosses) {
      let flueGasForm: FormGroup;
      phast.losses.flueGasLosses.forEach(loss => {
        if (loss.flueGasByVolume) {
          flueGasForm = this.flueGasLossesService.initByVolumeFormFromLoss(loss);
        } else if (loss.flueGasByMass) {
          flueGasForm = this.flueGasLossesService.initByVolumeFormFromLoss(loss);
        }

        if (flueGasForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkFixtureValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.fixtureLosses) {
      phast.losses.fixtureLosses.forEach(loss => {
        let fixtureForm: FormGroup = this.fixtureLossesService.getFormFromLoss(loss);
        if (fixtureForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkWallValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.wallLosses) {
      phast.losses.wallLosses.forEach(loss => {
        let wallForm: FormGroup = this.wallLossesService.getWallLossForm(loss);
        if (wallForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkCoolingValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.coolingLosses) {
      let coolingForm: FormGroup;
      phast.losses.coolingLosses.forEach(loss => {
        if (loss.gasCoolingLoss) {
          coolingForm = this.coolingLossesService.initGasFormFromLoss(loss);
        } else if (loss.liquidCoolingLoss) {
          coolingForm = this.coolingLossesService.initLiquidFormFromLoss(loss);
        }

        if (coolingForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkAtmosphereValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.atmosphereLosses) {
      phast.losses.atmosphereLosses.forEach(loss => {
        let atmosphereForm: FormGroup = this.atmosphereLossesService.getAtmosphereForm(loss)
        if (atmosphereForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkOpeningValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.openingLosses) {
      phast.losses.openingLosses.forEach(loss => {
        let openingForm: FormGroup = this.openingLossesService.getFormFromLoss(loss);
        if (openingForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkLeakageValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.leakageLosses) {
      phast.losses.leakageLosses.forEach(loss => {
        let leakageForm: FormGroup = this.gasLeakageLossesService.initFormFromLoss(loss)
        if (leakageForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkExtendedValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.extendedSurfaces) {
      phast.losses.extendedSurfaces.forEach(loss => {
        // Pass in wall loss here or exetended surface?
        let extendedSurfaceForm: FormGroup = this.extendedSurfaceLossesService.getSurfaceLossForm(loss)
        if (extendedSurfaceForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkOtherValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.otherLosses) {
      phast.losses.otherLosses.forEach(loss => {
        let otherLossForm: FormGroup = this.otherLossessService.getFormFromLoss(loss)
        if (otherLossForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkSysEfficiencyValid(phast: PHAST): boolean {
    return phast.systemEfficiency != undefined;
  }

  checkSlagValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.slagLosses) {
      phast.losses.slagLosses.forEach(loss => {
        let slagLossForm: FormGroup = this.slagService.getFormFromLoss(loss)
        if (slagLossForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }

  checkEnergyInputValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.energyInputEAF) {
      phast.losses.energyInputEAF.forEach(loss => {
        let energyInputForm: FormGroup = this.energyInputService.getFormFromLoss(loss)
        if (energyInputForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }
}
