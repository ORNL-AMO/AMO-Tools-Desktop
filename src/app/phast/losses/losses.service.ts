import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Losses, PHAST, Modification } from '../../shared/models/phast';
@Injectable()
export class LossesService {
  lossIndex: BehaviorSubject<number>;

  baseline: BehaviorSubject<PHAST>;
  modification: BehaviorSubject<Modification>;

  constructor() { 
    this.lossIndex = new BehaviorSubject<number>(0);
    this.baseline = new BehaviorSubject<PHAST>(null);
    this.modification = new BehaviorSubject<Modification>(null);
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
