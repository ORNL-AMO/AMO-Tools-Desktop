import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemTrueCostData } from '../water-assessment-results.service';
import * as _ from 'lodash';

@Injectable()
export class WaterReportService {
  systemTrueCostReport: BehaviorSubject<SystemTrueCostData[]>;
  constructor() {
     this.systemTrueCostReport = new BehaviorSubject<SystemTrueCostData[]>(undefined);
   }

   getSortedTrueCostReport(report: SystemTrueCostData[]): SystemTrueCostData[] {
     return _.orderBy(report, item => item.connectionCostByType[7] || 0, 'desc');
   }
}
