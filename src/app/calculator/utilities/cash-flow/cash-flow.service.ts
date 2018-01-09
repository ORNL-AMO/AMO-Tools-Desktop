import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CashFlowService {

  calculate: BehaviorSubject<boolean>;

  constructor() { 
    this.calculate = new BehaviorSubject<boolean>(true);
  }

}
