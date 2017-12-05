import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { FlueGasLossesService } from './flue-gas-losses/flue-gas-losses.service';
@Injectable()
export class LossesService {
  lossIndex: BehaviorSubject<number>;

  baseline: BehaviorSubject<PHAST>;
  modification: BehaviorSubject<Modification>;

  lossesTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;


  chargeDone: boolean;
  enInput1Done: boolean;
  enInput2Done: boolean;
  flueGasDone: boolean;
  efficiencyDone: boolean;


  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private flueGasLossesService: FlueGasLossesService) {
    this.lossIndex = new BehaviorSubject<number>(0);
    this.baseline = new BehaviorSubject<PHAST>(null);
    this.modification = new BehaviorSubject<Modification>(null);
    this.lossesTab = new BehaviorSubject<string>('charge-material');
    this.modalOpen = new BehaviorSubject<boolean>(false);
    // this.chargeDone = new BehaviorSubject<boolean>(false);
    // this.enInput1Done = new BehaviorSubject<boolean>(false);
    // this.enInput2Done = new BehaviorSubject<boolean>(false);
    // this.flueGasDone = new BehaviorSubject<boolean>(false);
    // this.efficiencyDone = new BehaviorSubject<boolean>(false);
  }

  setBaseline(phast: PHAST) {
    this.baseline.next(phast);
  }

  setModification(modification: Modification) {
    this.modification.next(modification);
  }

  setLossIndex(num: number) {
    this.lossIndex.next(num);
  }

  checkSetupDone(phast: PHAST, settings: Settings) {
    //used to check if setup is done for an assessment
    let isDone, grossHeat = false;
    if (phast.losses) {
      this.checkChargeMaterials(phast, settings);
      //categories being used for assessment based on setup
      let categories = this.phastResultsService.getResultCategories(settings);
      if (categories.showEnInput1) {
        this.checkEAF(phast, settings);
      } else {
        this.enInput1Done = false;
      }

      if (categories.showEnInput2) {
        this.checkEnergyInputExhaustGas(phast, settings);
      } else {
        this.enInput2Done = false;
      }

      if (categories.showFlueGas) {
        this.checkFlueGas(phast, settings);
      } else {
        this.flueGasDone = false;
      }

      if (categories.showSystemEff) {
        this.checkSystemEfficiency(phast, settings);
      } else {
        this.efficiencyDone = false;
      }
    } else {
      this.efficiencyDone = false;
      this.enInput1Done = false;
      this.enInput2Done = false;
      this.flueGasDone = false;
      this.chargeDone = false;
      return false;
    }
    grossHeat = (this.efficiencyDone || this.enInput1Done || this.enInput2Done || this.flueGasDone);
    isDone = (grossHeat && this.chargeDone);
    return isDone;
  }

  checkChargeMaterials(phast: PHAST, settings: Settings) {
    if (phast.losses.chargeMaterials) {
      if (phast.losses.chargeMaterials.length != 0) {
        let test = this.phastService.sumChargeMaterials(phast.losses.chargeMaterials, settings);
        if (test != 0) {
          this.chargeDone = true;
        } else {
          this.chargeDone = false;
        }
      } else {
        this.chargeDone = false;
      }
    } else {
      this.chargeDone = false;
    }
  }

  checkSystemEfficiency(phast: PHAST, settings: Settings) {
    if (phast.systemEfficiency) {
      this.efficiencyDone = true;
    } else {
      this.efficiencyDone = false;
    }
  }

  checkFlueGas(phast: PHAST, settings: Settings) {
    if (phast.losses.flueGasLosses) {
      if (phast.losses.flueGasLosses.length != 0) {
        let flueGas = phast.losses.flueGasLosses[0];
        if (flueGas.flueGasType == 'By Mass') {
          let tmpForm = this.flueGasLossesService.initByMassFormFromLoss(flueGas);
          if (tmpForm.status == 'VALID') {
            let test = this.phastService.flueGasByMass(flueGas.flueGasByMass, settings);
            if (test != 0) {
              this.flueGasDone = true;
            } else {
              this.flueGasDone = false;
            }
          }
        } else if (flueGas.flueGasType == 'By Volume') {
          let tmpForm = this.flueGasLossesService.initByVolumeFormFromLoss(flueGas);
          if (tmpForm.status == 'VALID') {
            let test = this.phastService.flueGasByVolume(flueGas.flueGasByVolume, settings);
            if (test != 0) {
              this.flueGasDone = true;
            } else {
              this.flueGasDone = false;
            }
          }
        }
      } else {
        this.flueGasDone = false;
      }
    } else {
      this.flueGasDone = false;
    }
  }

  checkEnergyInputExhaustGas(phast: PHAST, settings: Settings) {
    if (phast.losses.energyInputExhaustGasLoss) {
      if (phast.losses.energyInputExhaustGasLoss.length != 0) {
        if (phast.losses.energyInputExhaustGasLoss[0].totalHeatInput) {
          this.enInput2Done = true
        } else {
          this.enInput2Done = false;
        }
      } else {
        this.enInput2Done = false;
      }
    } else {
      this.enInput2Done = false;
    }
  }

  checkEAF(phast: PHAST, settings: Settings) {
    if (phast.losses.energyInputEAF) {
      if (phast.losses.energyInputEAF.length != 0) {
        let test = this.phastService.sumEnergyInputEAF(phast.losses.energyInputEAF, settings);
        if (test != 0) {
          this.enInput1Done = true;
        } else {
          this.enInput1Done = false;
        }
      } else {
        this.enInput1Done = false;
      }
    } else {
      this.enInput1Done = false;
    }
  }
}