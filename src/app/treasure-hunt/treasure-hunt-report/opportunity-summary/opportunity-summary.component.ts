import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { OpportunitySummary, OpportunityCost } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';

@Component({
    selector: 'app-opportunity-summary',
    templateUrl: './opportunity-summary.component.html',
    styleUrls: ['./opportunity-summary.component.css'],
    standalone: false
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

  constructor() { }

  ngOnInit() {
  }


  updateOpportunities() {
    this.emitUpdateOpportunities.emit(this.opportunitySummaries);
  }

  getAdditionalSavings(oppCost: OpportunityCost): number {
    if (oppCost && oppCost.additionalAnnualSavings) {
      return oppCost.additionalAnnualSavings.cost;
    } else {
      return 0;
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
    let total: number = 0;
    if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0) {
      oppCost.otherCosts.forEach(oCost => {
        total = total + oCost.cost;
      });
    }
    if (oppCost && oppCost.additionalSavings) {
      total = total - oppCost.additionalSavings.cost
    }
    return total;
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
