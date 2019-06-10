import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReportItem, TreasureHuntResultsData } from './report-rollup-models';
import { TreasureHuntReportService } from '../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';

@Injectable()
export class TreasureHuntRollupService {

  treasureHuntAssessments: BehaviorSubject<Array<ReportItem>>;
  treasureHuntArray: Array<ReportItem>;
  allTreasureHuntResults: BehaviorSubject<Array<TreasureHuntResultsData>>;

  constructor(
    private treasureHuntReportService: TreasureHuntReportService) { }

  initData(){
    
    this.treasureHuntAssessments = new BehaviorSubject<Array<ReportItem>>(Array<ReportItem>());
  }
}
