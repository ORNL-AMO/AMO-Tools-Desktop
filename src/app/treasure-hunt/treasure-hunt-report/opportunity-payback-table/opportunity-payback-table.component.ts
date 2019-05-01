import { Component, OnInit, Input } from '@angular/core';
import { OpportunitySummary } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
@Component({
  selector: 'app-opportunity-payback-table',
  templateUrl: './opportunity-payback-table.component.html',
  styleUrls: ['./opportunity-payback-table.component.css']
})
export class OpportunityPaybackTableComponent implements OnInit {
  @Input()
  opportunitySummaries: Array<OpportunitySummary>;

  lessThanOneYear: { numOpportunities: number, totalSavings: number };
  oneToTwoYears: { numOpportunities: number, totalSavings: number };
  twoToThreeYears: { numOpportunities: number, totalSavings: number };
  moreThanThreeYears: { numOpportunities: number, totalSavings: number };
  totals: { numOpportunities: number, totalSavings: number };
  constructor() { }

  ngOnInit() {
    let lessThanOneYearOpps: Array<OpportunitySummary> = _.filter(this.opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback < 1 });
    this.lessThanOneYear = {
      numOpportunities: lessThanOneYearOpps.length,
      totalSavings: _.sumBy(lessThanOneYearOpps, 'costSavings')
    };
    let oneToTwoYearsOpps: Array<OpportunitySummary> = _.filter(this.opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 1 && opp.payback < 2 });
    this.oneToTwoYears = {
      numOpportunities: oneToTwoYearsOpps.length,
      totalSavings: _.sumBy(oneToTwoYearsOpps, 'costSavings')
    };
    let twoToThreeYearsOpps: Array<OpportunitySummary> = _.filter(this.opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 2 && opp.payback < 3 });
    this.twoToThreeYears = {
      numOpportunities: twoToThreeYearsOpps.length,
      totalSavings: _.sumBy(twoToThreeYearsOpps, 'costSavings')
    };
    let moreThanThreeYearsOpps: Array<OpportunitySummary> = _.filter(this.opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback > 3 });
    this.moreThanThreeYears = {
      numOpportunities: moreThanThreeYearsOpps.length,
      totalSavings: _.sumBy(moreThanThreeYearsOpps, 'costSavings')
    };

    this.totals = {
      numOpportunities: this.lessThanOneYear.numOpportunities + this.oneToTwoYears.numOpportunities + this.twoToThreeYears.numOpportunities + this.moreThanThreeYears.numOpportunities,
      totalSavings: this.lessThanOneYear.totalSavings + this.oneToTwoYears.totalSavings + this.twoToThreeYears.totalSavings + this.moreThanThreeYears.totalSavings
    };
  }

}
