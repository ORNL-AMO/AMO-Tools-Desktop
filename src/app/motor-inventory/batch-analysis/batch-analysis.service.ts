import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BatchAnalysisService {

  selectedTab: BehaviorSubject<string>;
  constructor() { 
    this.selectedTab = new BehaviorSubject<string>('table');
  }
}
