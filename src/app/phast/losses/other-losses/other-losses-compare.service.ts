import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OtherLoss } from '../../../shared/models/losses/otherLoss';

@Injectable()
export class OtherLossesCompareService {

  baselineOtherLoss: OtherLoss[];
  modifiedOtherLoss: OtherLoss[];

  //used to hold behavior subjects for each modification
  differentArray: Array<any>;

  constructor() { }


}


export interface OtherLossDifferent {
  
}