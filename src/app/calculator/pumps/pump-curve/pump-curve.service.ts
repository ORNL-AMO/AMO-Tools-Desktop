import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PumpCurveForm, PumpCurveDataRow } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';
@Injectable()
export class PumpCurveService {

  pumpCurveData: PumpCurveForm;
  pumpPointOne: { form: FormGroup, fluidPower: number };
  pumpPointTwo: { form: FormGroup, fluidPower: number };
  pumpCurveConstants: { form: FormGroup };

  fanCurveData: PumpCurveForm;
  fanPointOne: { form: FormGroup, fluidPower: number };
  fanPointTwo: { form: FormGroup, fluidPower: number };
  fanCurveConstants: { form: FormGroup };


  calcMethod: BehaviorSubject<string>;
  regEquation: BehaviorSubject<string>;
  rSquared: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.calcMethod = new BehaviorSubject<string>('Equation');
    this.regEquation = new BehaviorSubject<string>(null);
  }

  initForm(): PumpCurveForm {
    return {
      dataRows: new Array<PumpCurveDataRow>(
        { flow: 0, head: 355 },
        { flow: 100, head: 351 },
        // { flow: 200, head: 343.6188 },
        // { flow: 300, head: 335.9542 },
        // { flow: 400, head: 324.9089 },
        // { flow: 480, head: 314.7216 },
        // { flow: 560, head: 304.5332 },
        { flow: 630, head: 294 },
        // { flow: 690, head: 284.1775 },
        // { flow: 800, head: 264.6842 },
        // { flow: 900, head: 241.8114 },
        // { flow: 970, head: 222.3425 },
        { flow: 1020, head: 202 }
      ),
      maxFlow: 1020,
      dataOrder: 3,
      baselineMeasurement: 1,
      modifiedMeasurement: 1,
      exploreLine: 0,
      exploreFlow: 0,
      exploreHead: 0,
      explorePumpEfficiency: 0,
      headOrder: 3,
      headConstant: 356.96,
      headFlow: -0.0686,
      headFlow2: 0.000005,
      headFlow3: -0.00000008,
      headFlow4: 0,
      headFlow5: 0,
      headFlow6: 0,
      pumpEfficiencyOrder: 3,
      pumpEfficiencyConstant: 0,
      measurementOption: 'Diameter'
    }
  }

}


export interface PumpCurveRanges {
  maxFlowMin: number;
  constantMin: number;
}
