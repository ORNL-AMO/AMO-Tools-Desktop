import { Injectable } from '@angular/core';
import { FSAT } from '../shared/models/fans';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CompareService {
  baselineFSAT: FSAT;
  modifiedFSAT: FSAT;
  selectedModification: BehaviorSubject<FSAT>;
  constructor() {
    this.selectedModification = new BehaviorSubject<FSAT>(undefined);
  }


  setCompareVals(fsat: FSAT, selectedModIndex: number) {
    this.baselineFSAT = fsat;
    if (fsat.modifications) {
      if (fsat.modifications.length != 0) {
        this.selectedModification.next(fsat.modifications[selectedModIndex].fsat);
        this.modifiedFSAT = this.selectedModification.value;
      } else {
        this.selectedModification.next(undefined);
        this.modifiedFSAT = undefined;
      }
    } else {
      this.selectedModification.next(undefined);
      this.modifiedFSAT = undefined;
    }
  }
}
