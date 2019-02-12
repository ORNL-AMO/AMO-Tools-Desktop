import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TreasureHuntService {

  mainTab: BehaviorSubject<string>;
  constructor() { 
    this.mainTab = new BehaviorSubject<string>('system-basics');
  }
}
