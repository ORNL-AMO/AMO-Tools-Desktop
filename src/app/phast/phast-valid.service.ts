import { Injectable } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { ExtendedSurfaceLossesService } from './losses/extended-surface-losses/extended-surface-losses.service';
import { OperationsService } from './losses/operations/operations.service';
import { EnergyInputService } from './losses/energy-input/energy-input.service';
import { ExhaustGasService } from './losses/exhaust-gas/exhaust-gas.service';
import { EnergyInputExhaustGasService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { AuxiliaryPowerLossesService } from './losses/auxiliary-power-losses/auxiliary-power-losses.service';

import { PHAST, PhastValid } from '../shared/models/phast/phast';
import { OtherLossesService } from './losses/other-losses/other-losses.service';
import { SlagService } from './losses/slag/slag.service';
import { FlueGasFormService } from '../calculator/furnaces/flue-gas/flue-gas-form.service';
import { Settings } from '../shared/models/settings';
import { WallFormService } from '../calculator/furnaces/wall/wall-form.service';
import { PhastResultsService } from './phast-results.service';
import { LiquidMaterialFormService } from '../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { GasMaterialFormService } from '../calculator/furnaces/charge-material/gas-material-form/gas-material-form.service';
import { SolidMaterialFormService } from '../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';
import { AtmosphereFormService } from '../calculator/furnaces/atmosphere/atmosphere-form.service';
import { OpeningFormService } from '../calculator/furnaces/opening/opening-form.service';
import { LeakageFormService } from '../calculator/furnaces/leakage/leakage-form.service';
import { FixtureFormService } from '../calculator/furnaces/fixture/fixture-form.service';
import { CoolingFormService } from '../calculator/furnaces/cooling/cooling-form.service';


@Injectable()
export class PhastValidService {

  constructor(
    private openingFormService: OpeningFormService,
    private atmosphereFormService: AtmosphereFormService,
    private slagService: SlagService,
    private auxiliaryPowerLossesService: AuxiliaryPowerLossesService,
    private coolingFormService: CoolingFormService,
    private wallFormService: WallFormService,
    private flueGasFormService: FlueGasFormService,
    private extendedSurfaceLossesService: ExtendedSurfaceLossesService,
    private operationsService: OperationsService,
    private energyInputService: EnergyInputService,
    private exhaustGasService: ExhaustGasService,
    private energyInputExhaustGasService: EnergyInputExhaustGasService,
    private fixtureFormService: FixtureFormService,
    private otherLossessService: OtherLossesService,
    private liquidMaterialFormService: LiquidMaterialFormService,
    private gasMaterialFormService: GasMaterialFormService,
    private solidMaterialFormService: SolidMaterialFormService,
    private phastResultsService: PhastResultsService,
    private leakageFormService: LeakageFormService
  ) { }



  checkValid(phast: PHAST, settings: Settings): PhastValid {
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
    let isOperationsValid: boolean = this.checkOperationsValid(phast, settings);
    let isSystemEfficiencyValid: boolean = this.checkSysEfficiencyValid(phast);
    let isEnergyInputValid: boolean = this.checkEnergyInputValid(phast, settings);
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
    return valid;
  }

  checkInputExhaustValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses.energyInputExhaustGasLoss) {
      phast.losses.energyInputExhaustGasLoss.forEach(loss => {
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

  checkOperationsValid(phast: PHAST, settings: Settings): boolean {
    let operationsForm: FormGroup = this.operationsService.initForm(phast, settings);
    return operationsForm.status === 'VALID'
  }

  checkChargeMaterialValid(phast: PHAST): boolean {
    let valid = true;
    if (phast.losses && phast.losses.chargeMaterials) {
      let chargeMaterialForm: FormGroup;
      phast.losses.chargeMaterials.forEach(loss => {
        if (loss.chargeMaterialType === 'Gas') {
          chargeMaterialForm = this.gasMaterialFormService.getGasChargeMaterialForm(loss);
        } else if (loss.chargeMaterialType === 'Solid') {
          chargeMaterialForm = this.solidMaterialFormService.getSolidChargeMaterialForm(loss);
        } else if (loss.chargeMaterialType === 'Liquid') {
          chargeMaterialForm = this.liquidMaterialFormService.getLiquidChargeMaterialForm(loss);
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
          flueGasForm = this.flueGasFormService.initByVolumeFormFromLoss(loss, true);
        } else if (loss.flueGasByMass) {
          flueGasForm = this.flueGasFormService.initByMassFormFromLoss(loss, true);
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
        let fixtureForm: FormGroup = this.fixtureFormService.getFormFromLoss(loss);
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
        let wallForm: FormGroup = this.wallFormService.getWallLossForm(loss);
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
          coolingForm = this.coolingFormService.initGasFormFromLoss(loss);
        } else if (loss.liquidCoolingLoss) {
          coolingForm = this.coolingFormService.initLiquidFormFromLoss(loss);
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
        let atmosphereForm: FormGroup = this.atmosphereFormService.getAtmosphereForm(loss)
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
        let openingForm: FormGroup = this.openingFormService.getFormFromLoss(loss);
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
        let leakageForm: FormGroup = this.leakageFormService.initFormFromLoss(loss)
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

  checkEnergyInputValid(phast: PHAST, settings: Settings): boolean {
    let valid = true;
    if (phast.losses.energyInputEAF) {
      let minElectricityInput: number;
      if (phast.losses) {
        minElectricityInput = this.phastResultsService.getMinElectricityInputRequirement(phast, settings);
      }
      phast.losses.energyInputEAF.forEach(loss => {
        let energyInputForm: FormGroup = this.energyInputService.getFormFromLoss(loss, minElectricityInput)
        if (energyInputForm.status === 'INVALID') {
          valid = false;
        }
      });
    }
    return valid;
  }
}
