import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class PumpCurveService {

  calcMethod: BehaviorSubject<string>;
  regEquation: BehaviorSubject<string>;
  rSquared: BehaviorSubject<string>;
  constructor() { 
    this.calcMethod = new BehaviorSubject<string>('Equation');
    this.regEquation = new BehaviorSubject<string>(null);
  }

}
