import { Injectable } from '@angular/core';
import { OpportunitiesPaybackDetails, OpportunitySummary } from '../../shared/models/treasure-hunt';
import * as _ from 'lodash';

@Injectable()
export class OpportunityPaybackService {

  constructor() { }

  getOpportunityPaybackDetails(opportunitySummaries: Array<OpportunitySummary>): OpportunitiesPaybackDetails {
    let lessThanOneYearOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback < 1 && opp.selected == true });
    let lessThanOneYear: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: lessThanOneYearOpps.length,
      totalSavings: _.sumBy(lessThanOneYearOpps, 'costSavings')
    };
    let oneToTwoYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 1 && opp.payback < 2 && opp.selected == true });
    let oneToTwoYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: oneToTwoYearsOpps.length,
      totalSavings: _.sumBy(oneToTwoYearsOpps, 'costSavings')
    };
    let twoToThreeYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 2 && opp.payback < 3 && opp.selected == true });
    let twoToThreeYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: twoToThreeYearsOpps.length,
      totalSavings: _.sumBy(twoToThreeYearsOpps, 'costSavings')
    };
    let moreThanThreeYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback > 3 && opp.selected == true });
    let moreThanThreeYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: moreThanThreeYearsOpps.length,
      totalSavings: _.sumBy(moreThanThreeYearsOpps, 'costSavings')
    };

    let totals: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: lessThanOneYear.numOpportunities + oneToTwoYears.numOpportunities + twoToThreeYears.numOpportunities + moreThanThreeYears.numOpportunities,
      totalSavings: lessThanOneYear.totalSavings + oneToTwoYears.totalSavings + twoToThreeYears.totalSavings + moreThanThreeYears.totalSavings
    };
    return {
      lessThanOneYear: lessThanOneYear,
      oneToTwoYears: oneToTwoYears,
      twoToThreeYears: twoToThreeYears,
      moreThanThreeYears: moreThanThreeYears,
      totals: totals
    }
  }
}
