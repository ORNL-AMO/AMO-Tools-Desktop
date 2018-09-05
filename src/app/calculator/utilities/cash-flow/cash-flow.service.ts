import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CashFlowForm } from './cash-flow';

@Injectable()
export class CashFlowService {

  calculate: BehaviorSubject<boolean>;
  inputData: CashFlowForm;
  constructor() { 
    this.calculate = new BehaviorSubject<boolean>(true);
  }

}
