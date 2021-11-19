import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntResultsData } from '../../report-rollup-models';
import { TreasureHuntReportRollupService } from '../../treasure-hunt-report-rollup.service';

@Component({
  selector: 'app-treasure-hunt-summary',
  templateUrl: './treasure-hunt-summary.component.html',
  styleUrls: ['./treasure-hunt-summary.component.css', '../report-summary.component.css']
})
export class TreasureHuntSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  treasureHuntAssessmentsSub: Subscription;
  treasureResultsSub: Subscription;
  totalSavings: number;
  totalCost: number;
  numTreasureHunt: number;
  constructor(public treasureHuntReportRollupService: TreasureHuntReportRollupService) { }

  ngOnInit() {
    this.treasureResultsSub = this.treasureHuntReportRollupService.allTreasureHuntResults.subscribe(val => {
      this.getTotalSavings(val);
    });

    this.treasureHuntAssessmentsSub = this.treasureHuntReportRollupService.treasureHuntAssessments.subscribe(items => {
      this.numTreasureHunt = items.length;
      if (items) {
        this.treasureHuntReportRollupService.initTreasureHuntResultsArray(items);
      }
    });
  }

  ngOnDestroy() {
    this.treasureHuntAssessmentsSub.unsubscribe();
    this.treasureResultsSub.unsubscribe();
  }

  getTotalSavings(resultsArr: Array<TreasureHuntResultsData>) {
    let tmpSavings: number = 0;
    let tmpCost: number = 0;
    resultsArr.forEach(result => {
      tmpSavings = tmpSavings + result.treasureHuntResults.totalSavings;
      tmpCost = tmpCost + result.treasureHuntResults.totalModificationCost;
    });
    this.totalSavings = tmpSavings;
    this.totalCost = tmpCost;

  }
}
