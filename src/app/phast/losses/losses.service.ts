import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast/phast';
@Injectable()
export class LossesService {
  lossIndex: BehaviorSubject<number>;

  baseline: BehaviorSubject<PHAST>;
  modification: BehaviorSubject<Modification>;

  lossesTab: BehaviorSubject<string>;

  constructor() { 
    this.lossIndex = new BehaviorSubject<number>(0);
    this.baseline = new BehaviorSubject<PHAST>(null);
    this.modification = new BehaviorSubject<Modification>(null);
    this.lossesTab = new BehaviorSubject<string>('charge-material')
  }

  setBaseline(phast: PHAST){
    this.baseline.next(phast);
  }

  setModification(modification: Modification){
    this.modification.next(modification);
  }

  setLossIndex(num: number){
    this.lossIndex.next(num);
  }
}
