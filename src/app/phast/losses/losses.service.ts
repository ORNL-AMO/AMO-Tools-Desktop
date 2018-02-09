import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { FlueGasLossesService } from './flue-gas-losses/flue-gas-losses.service';
import { LossTab, defaultTabs } from '../tabs';
import * as _ from 'lodash';
@Injectable()
export class LossesService {
  lossIndex: BehaviorSubject<number>;

  baseline: BehaviorSubject<PHAST>;
  modification: BehaviorSubject<Modification>;

  lossesTab: BehaviorSubject<number>;
  modalOpen: BehaviorSubject<boolean>;


  chargeDone: boolean;
  enInput1Done: boolean;
  enInput2Done: boolean;
  flueGasDone: boolean;
  efficiencyDone: boolean;

  lossesTabs: Array<LossTab>;
  tabsSet: boolean;
  updateTabs: BehaviorSubject<boolean>;
  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private flueGasLossesService: FlueGasLossesService) {
    this.lossIndex = new BehaviorSubject<number>(0);
    this.baseline = new BehaviorSubject<PHAST>(null);
    this.modification = new BehaviorSubject<Modification>(null);
    this.lossesTab = new BehaviorSubject<number>(1);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.updateTabs = new BehaviorSubject<boolean>(false);
    // this.chargeDone = new BehaviorSubject<boolean>(false);
    // this.enInput1Done = new BehaviorSubject<boolean>(false);
    // this.enInput2Done = new BehaviorSubject<boolean>(false);
    // this.flueGasDone = new BehaviorSubject<boolean>(false);
    // this.efficiencyDone = new BehaviorSubject<boolean>(false);    
  }

  getTab(num: number){
    let newTab = _.find(this.lossesTabs, (t) => {return num == t.step});
    return newTab;
  }

  setTabs(settings: Settings){
    this.lossesTabs = new Array();
    defaultTabs.forEach(tab => {
      this.lossesTabs.push(tab);
    })
    if (settings.energySourceType == 'Electricity') {
      if (settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        this.lossesTabs.push({
          tabName: 'Slag',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'slag' 
        })
        this.lossesTabs.push({
          tabName: 'Exhaust Gas',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'exhaust-gas' 
        })
        this.lossesTabs.push({
          tabName: 'Energy Input',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'energy-input' 
        })
      } 
      
      else if (settings.furnaceType != 'Custom Electrotechnology') {
        this.lossesTabs.push({
          tabName: 'Auxiliary Power',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'auxiliary-power' 
        })
        this.lossesTabs.push({
          tabName: 'Energy Input',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'energy-input-exhaust-gas' 
        })
      } 
      
      else if (settings.furnaceType == 'Custom Electrotechnology') {
        this.lossesTabs.push({
          tabName: 'Heat System Efficiency',
          step: this.lossesTabs.length+1,
          back: this.lossesTabs.length,
          next: this.lossesTabs.length+2,
          componentStr: 'heat-system-efficiency' 
        })
      }
    } 
    
    else if (settings.energySourceType == 'Steam') {
      this.lossesTabs.push({
        tabName: 'Heat System Efficiency',
        step: this.lossesTabs.length+1,
        back: this.lossesTabs.length,
        next: this.lossesTabs.length+2,
        componentStr: 'heat-system-efficiency' 
      })
    } 
    
    else if (settings.energySourceType == 'Fuel') {
      this.lossesTabs.push({
        tabName: 'Flue Gas',
        step: this.lossesTabs.length+1,
        back: this.lossesTabs.length,
        next: this.lossesTabs.length+2,
        componentStr: 'flue-gas-losses' 
      })
    }
    this.lossesTabs.push({
      tabName: 'Operations',
      step: this.lossesTabs.length+1,
      back: this.lossesTabs.length,
      componentStr: 'operations' 
    })
    this.lossesTab.next(1);
  }

  initDone() {
    this.chargeDone = false;
    this.enInput1Done = false;
    this.enInput2Done = false;
    this.flueGasDone = false;
    this.efficiencyDone = false;
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
        let test = this.phastService.sumEnergyInputExhaustGas(phast.losses.energyInputExhaustGasLoss, settings);
        if (test != 0) {
          //fuel heat delivered not 0
          this.enInput2Done = true
        } else if (phast.losses.energyInputExhaustGasLoss[0].totalHeatInput == 0) {
          //fuel heat delevired 0 && "Total heat for burners" = 0
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