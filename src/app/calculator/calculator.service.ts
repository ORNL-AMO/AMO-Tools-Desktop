import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CalculatorService {

  selectedToolType: BehaviorSubject<string>;
  selectedTool: BehaviorSubject<string>;
  constructor() { 
    this.selectedToolType = new BehaviorSubject<string>('none');
    this.selectedTool = new BehaviorSubject<string>('none');
  }
}
