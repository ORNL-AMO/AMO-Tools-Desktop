import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
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


  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) {
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
    let isDone, chargeDone, grossHeat = false;
    if (phast.losses) {
      if (phast.losses.chargeMaterials) {
        if (phast.losses.chargeMaterials.length != 0) {
          let test = this.phastService.sumChargeMaterials(phast.losses.chargeMaterials, settings);
          if (test != 0) {
            chargeDone = true;
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

      let categories = this.phastResultsService.getResultCategories(settings);
      if (categories.showEnInput1) {
        if (phast.losses.energyInputEAF) {
          if (phast.losses.energyInputEAF.length != 0) {
            let test = this.phastService.sumEnergyInputEAF(phast.losses.energyInputEAF, settings);
            if (test != 0) {
              grossHeat = true;
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
      else if (categories.showEnInput2) {
        if (phast.losses.energyInputExhaustGasLoss) {
          if (phast.losses.energyInputExhaustGasLoss.length != 0) {
            let test = this.phastService.sumEnergyInputExhaustGas(phast.losses.energyInputExhaustGasLoss, settings);
            if (test != 0) {
              grossHeat = true;
              this.enInput2Done = true;
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
      else if (categories.showFlueGas) {
        if (phast.losses.flueGasLosses) {
          if (phast.losses.flueGasLosses.length != 0) {
            let flueGas = phast.losses.flueGasLosses[0];
            if (flueGas.flueGasType == 'By Mass') {
              let test = this.phastService.flueGasByMass(flueGas.flueGasByMass, settings);
              if (test != 0) {
                grossHeat = true;
                this.flueGasDone = true;
              } else {
                this.flueGasDone = false;
              }
            } else if (flueGas.flueGasType == 'By Volume') {
              let test = this.phastService.flueGasByVolume(flueGas.flueGasByVolume, settings);
              if (test != 0) {
                grossHeat = true;
                this.flueGasDone = true;
              } else {
                this.flueGasDone = false;
              }
            }
          } else {
            this.flueGasDone = false;
          }
        } else {
          this.flueGasDone = false;
        }
      }
      else if (categories.showSystemEff) {
        if (phast.systemEfficiency) {
          grossHeat = true;
          this.efficiencyDone = true;
        } else {
          this.efficiencyDone = false;
        }
      } else {
        this.efficiencyDone = false;
      }
    }
    isDone = (grossHeat && chargeDone);
    return isDone;
  }
}
