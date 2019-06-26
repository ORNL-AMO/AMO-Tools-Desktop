import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FanAnalysisService {

  mainTab: BehaviorSubject<string>;
  constructor() { 
    this.mainTab = new BehaviorSubject<string>('fan-info');
  }
}
