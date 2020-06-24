import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MotorInventoryService {

  setupTab: BehaviorSubject<string>;
  constructor() {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
   }
}
