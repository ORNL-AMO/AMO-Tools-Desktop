import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CalculatorDragBarService {

  sidebarX: BehaviorSubject<number>;

  constructor() {
    this.sidebarX = new BehaviorSubject<number>(undefined);
   }
}
