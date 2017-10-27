import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast/phast';
@Injectable()
export class LossesService {
  lossIndex: BehaviorSubject<number>;

  baseline: BehaviorSubject<PHAST>;
  modification: BehaviorSubject<Modification>;

  lossesTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  chargeDone: BehaviorSubject<boolean>;
  enInput1Done: BehaviorSubject<boolean>;
  enInput2Done: BehaviorSubject<boolean>;
  flueGasDone: BehaviorSubject<boolean>;
  efficiencyDone: BehaviorSubject<boolean>;


  constructor() {
    this.lossIndex = new BehaviorSubject<number>(0);
    this.baseline = new BehaviorSubject<PHAST>(null);
    this.modification = new BehaviorSubject<Modification>(null);
    this.lossesTab = new BehaviorSubject<string>('charge-material');
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.chargeDone = new BehaviorSubject<boolean>(false);
    this.enInput1Done = new BehaviorSubject<boolean>(false);
    this.enInput2Done = new BehaviorSubject<boolean>(false);
    this.flueGasDone = new BehaviorSubject<boolean>(false);
    this.efficiencyDone = new BehaviorSubject<boolean>(false);
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

  checkSetupDone(){
    
  }

}
