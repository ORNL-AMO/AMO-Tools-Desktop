import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Injectable()
export class PumpCurveService {

  calcMethod: BehaviorSubject<string>;
  regEquation: BehaviorSubject<string>;
  rSquared: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.calcMethod = new BehaviorSubject<string>('Equation');
    this.regEquation = new BehaviorSubject<string>(null);
  }



  getRangeValues(): PumpCurveRanges {
    let ranges: PumpCurveRanges = {
      maxFlowMin: 0,
      constantMin: 0
    }

    return ranges;
  }

}


export interface PumpCurveRanges {
  maxFlowMin: number;
  constantMin: number;
}
