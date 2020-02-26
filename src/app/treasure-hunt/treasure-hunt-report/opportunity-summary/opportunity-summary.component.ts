import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunitySummary, OpportunityCost } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-opportunity-summary',
  templateUrl: './opportunity-summary.component.html',
  styleUrls: ['./opportunity-summary.component.css']
})
export class OpportunitySummaryComponent implements OnInit {
  @Input()
  opportunitySummaries: Array<OpportunitySummary>;
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Output('emitUpdateOpportunities')
  emitUpdateOpportunities = new EventEmitter<Array<OpportunitySummary>>();
  @Input()
  assessment: Assessment;
  @Input()
  showPrint: boolean;

  sortBy: string = 'utilityType';
  sortByDirection: string = 'asc';

  printOpportunitySummaries: Array<Array<OpportunitySummary>>;

  rowsPerPrintedPage: number = 10;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.prepOpportunitySummariesPrintArray();
  }

  prepOpportunitySummariesPrintArray() {
    this.printOpportunitySummaries = new Array<Array<OpportunitySummary>>();
    let tmpArray = new Array<OpportunitySummary>();
    for (let i = 0; i < this.opportunitySummaries.length; i++) {
      tmpArray.push(this.opportunitySummaries[i]);
      if (i % this.rowsPerPrintedPage == 0 && i != 0) {
        this.printOpportunitySummaries.push(tmpArray);
        tmpArray = new Array<OpportunitySummary>();
      }
    }
  }

  updateOpportunities() {
    this.emitUpdateOpportunities.emit(this.opportunitySummaries);
    if (this.inRollup) {
      this.reportRollupService.updateTreasureHuntResults(this.opportunitySummaries, this.assessment.id);
    }
  }

  getMaterialCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.material;
    } else {
      return 0;
    }
  }

  getLaborCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.labor;
    } else {
      return 0;
    }
  }

  getOtherCost(oppCost: OpportunityCost): number {
    if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0) {
      let total: number = 0;
      oppCost.otherCosts.forEach(oCost => {
        total = total + oCost.cost;
      })
      return total;
    } else {
      return 0;
    }
  }

  getEngineeringCost(oppCost: OpportunityCost): number {
    if (oppCost) {
      return oppCost.engineeringServices;
    } else {
      return 0;
    }
  }

  setSortBy(str: string) {
    if (str == this.sortBy) {
      if (this.sortByDirection == 'desc') {
        this.sortByDirection = 'asc';
      } else if (this.sortByDirection == 'asc') {
        this.sortByDirection = 'desc';
      }
    } else {
      this.sortBy = str;
      this.sortByDirection = 'desc';
    }
  }
}
