import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class PhastReportService {

  baselineChartLabels: BehaviorSubject<Array<string>>;
  modificationChartLabels: BehaviorSubject<Array<string>>;
  constructor() { 
    this.baselineChartLabels = new BehaviorSubject<Array<string>>(null);
    this.modificationChartLabels = new BehaviorSubject<Array<string>>(null);
  }

}
