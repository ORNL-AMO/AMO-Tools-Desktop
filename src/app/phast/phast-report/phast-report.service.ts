import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class PhastReportService {

  baselineChartLabels: BehaviorSubject<Array<string>>;
  modificationChartLabels: BehaviorSubject<Array<string>>;

  // showPrint: BehaviorSubject<boolean>;

  constructor() { 
    this.baselineChartLabels = new BehaviorSubject<Array<string>>(null);
    this.modificationChartLabels = new BehaviorSubject<Array<string>>(null);
    
    // this.showPrint = new BehaviorSubject<boolean>(false);
  }

}
