import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemTrueCostData } from '../water-assessment-results.service';
import * as _ from 'lodash';
import { PlantSystemSummaryResults } from 'process-flow-lib';

@Injectable()
export class WaterReportService {
  systemTrueCostReport: BehaviorSubject<SystemTrueCostData[]>;
  plantSummaryReport: BehaviorSubject<PlantSystemSummaryResults>;
  systemStackedBarPercentView: BehaviorSubject<boolean>;

  constructor() {
    this.systemTrueCostReport = new BehaviorSubject<SystemTrueCostData[]>(undefined);
    this.plantSummaryReport = new BehaviorSubject<PlantSystemSummaryResults>(undefined);
    this.systemStackedBarPercentView = new BehaviorSubject<boolean>(false);
  }

  getSortedTrueCostReport(report: SystemTrueCostData[]): SystemTrueCostData[] {
    // todo hardcoded index, investigate, improve
    return _.orderBy(report, item => item.connectionCostByType[7] || 0, 'desc');
  }
}
