import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BatchAnalysisService {

  selectedTab: BehaviorSubject<string>;
  batchAnalysisSettings: BehaviorSubject<BatchAnalysisSettings>;
  constructor() {
    this.selectedTab = new BehaviorSubject<string>('table');
    this.batchAnalysisSettings = new BehaviorSubject<BatchAnalysisSettings>({ displayIncompleteMotors: true, paybackThreshold: 2 })
  }
}


export interface BatchAnalysisSettings {
  displayIncompleteMotors: boolean;
  paybackThreshold: number
}
