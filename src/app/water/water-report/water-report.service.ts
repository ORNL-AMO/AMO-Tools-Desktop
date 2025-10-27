import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemTrueCostData } from '../water-assessment-results.service';
import * as _ from 'lodash';
import { PlantSystemSummaryResults } from 'process-flow-lib';

@Injectable()
export class WaterReportService {
  systemTrueCostReport: BehaviorSubject<SystemTrueCostData[]>;
  systemSummaryReport: BehaviorSubject<PlantSystemSummaryResults>;
  constructor() {
     this.systemTrueCostReport = new BehaviorSubject<SystemTrueCostData[]>(undefined);
     this.systemSummaryReport = new BehaviorSubject<PlantSystemSummaryResults>(undefined);
   }

   getSortedTrueCostReport(report: SystemTrueCostData[]): SystemTrueCostData[] {
     return _.orderBy(report, item => item.connectionCostByType[7] || 0, 'desc');
   }
}
