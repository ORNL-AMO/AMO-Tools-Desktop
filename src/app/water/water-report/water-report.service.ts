import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlantSystemSummaryResults, sortTrueCostReport, SystemTrueCostData } from 'process-flow-lib';

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
    return sortTrueCostReport(report);
  
  }
}
