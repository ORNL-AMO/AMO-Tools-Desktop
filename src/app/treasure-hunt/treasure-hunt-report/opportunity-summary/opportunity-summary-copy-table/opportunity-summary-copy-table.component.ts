import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { OpportunityCost, OpportunitySummary } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-opportunity-summary-copy-table',
  templateUrl: './opportunity-summary-copy-table.component.html',
  styleUrls: ['./opportunity-summary-copy-table.component.css']
})
export class OpportunitySummaryCopyTableComponent implements OnInit {
  @Input()
  opportunitySummaries: Array<OpportunitySummary>;
  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  individualOpportunitySummaries: Array<OpportunitySummary>;
  constructor() { }

  ngOnInit(): void {
    this.individualOpportunitySummaries = new Array();
  }

  setIndividualSummaries() {
    this.individualOpportunitySummaries = new Array();
    this.opportunitySummaries.forEach(summary => {
      if (summary.mixedIndividualResults) {
        summary.mixedIndividualResults.forEach(mixedSummary => {
          this.individualOpportunitySummaries.push(mixedSummary);
        })
      } else {
        this.individualOpportunitySummaries.push(summary);
      }
    })
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

  updateTableString() {
    this.setIndividualSummaries();
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
