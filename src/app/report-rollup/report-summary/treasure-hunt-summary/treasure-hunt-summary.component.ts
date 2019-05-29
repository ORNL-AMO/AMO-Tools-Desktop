import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { Subscription } from 'rxjs';
import { TreasureHuntResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-treasure-hunt-summary',
  templateUrl: './treasure-hunt-summary.component.html',
  styleUrls: ['./treasure-hunt-summary.component.css', '../report-summary.component.css']
})
export class TreasureHuntSummaryComponent implements OnInit {
  @Input()
  numTreasureHunt: number;
  @Input()
  settings: Settings;

  treasureHuntAssessmentsSub: Subscription;
  totalSavings: number;
  totalCost: number;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.treasureHuntAssessmentsSub = this.reportRollupService.allTreasureHuntResults.subscribe(val => {
      this.getTotalSavings(val);
    })
  }

  ngOnDestroy(){
    this.treasureHuntAssessmentsSub.unsubscribe();
  }

  getTotalSavings(resultsArr: Array<TreasureHuntResultsData>){
    let tmpSavings: number = 0;
    let tmpCost: number = 0;
    resultsArr.forEach(result => {
      tmpSavings = tmpSavings + result.treasureHuntResults.totalSavings;
      tmpCost = tmpCost + result.treasureHuntResults.totalModificationCost;
    })
    this.totalSavings = tmpSavings;
    this.totalCost = tmpCost;

  }
}
