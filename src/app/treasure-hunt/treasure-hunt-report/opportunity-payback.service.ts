import { Injectable } from '@angular/core';
import { OpportunitiesPaybackDetails, OpportunitySummary } from '../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class OpportunityPaybackService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  getOpportunityPaybackDetails(opportunitySummaries: Array<OpportunitySummary>, settings?: Settings): OpportunitiesPaybackDetails {
    let lessThanOneYearOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback < 1 && opp.selected == true });
    let lessThanOneYearOppsOtherCosts: number = 0;
    lessThanOneYearOpps.forEach(opps => {
      if(opps.opportunityCost.additionalAnnualSavings) {
        lessThanOneYearOppsOtherCosts += opps.opportunityCost.additionalAnnualSavings.cost;
      }
    });
    let lessThanOneYear: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: lessThanOneYearOpps.length,
      totalSavings: _.sumBy(lessThanOneYearOpps, 'costSavings') + lessThanOneYearOppsOtherCosts
    };

    let oneToTwoYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 1 && opp.payback < 2 && opp.selected == true });
    let oneToTwoYearsOppsOtherCosts: number = 0;
    oneToTwoYearsOpps.forEach(opps => {
      if(opps.opportunityCost.additionalAnnualSavings) {
        oneToTwoYearsOppsOtherCosts += opps.opportunityCost.additionalAnnualSavings.cost;
      }
    });    
    let oneToTwoYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: oneToTwoYearsOpps.length,
      totalSavings: _.sumBy(oneToTwoYearsOpps, 'costSavings') + oneToTwoYearsOppsOtherCosts
    };

    let twoToThreeYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback >= 2 && opp.payback < 3 && opp.selected == true });
    let twoToThreeYearsOppsOtherCosts: number = 0;
    twoToThreeYearsOpps.forEach(opps => {
      if(opps.opportunityCost.additionalAnnualSavings) {
        twoToThreeYearsOppsOtherCosts += opps.opportunityCost.additionalAnnualSavings.cost;
      }
    });
    let twoToThreeYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: twoToThreeYearsOpps.length,
      totalSavings: _.sumBy(twoToThreeYearsOpps, 'costSavings') + twoToThreeYearsOppsOtherCosts
    };

    let moreThanThreeYearsOpps: Array<OpportunitySummary> = _.filter(opportunitySummaries, (opp: OpportunitySummary) => { return opp.payback > 3 && opp.selected == true });
    let moreThanThreeYearsOppsOtherCosts: number = 0;
    moreThanThreeYearsOpps.forEach(opps => {
      if(opps.opportunityCost.additionalAnnualSavings) {
        moreThanThreeYearsOppsOtherCosts += opps.opportunityCost.additionalAnnualSavings.cost;
      }
    });
    let moreThanThreeYears: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: moreThanThreeYearsOpps.length,
      totalSavings: _.sumBy(moreThanThreeYearsOpps, 'costSavings') + moreThanThreeYearsOppsOtherCosts
    };

    let totals: { numOpportunities: number, totalSavings: number } = {
      numOpportunities: lessThanOneYear.numOpportunities + oneToTwoYears.numOpportunities + twoToThreeYears.numOpportunities + moreThanThreeYears.numOpportunities,
      totalSavings: lessThanOneYear.totalSavings + oneToTwoYears.totalSavings + twoToThreeYears.totalSavings + moreThanThreeYears.totalSavings
    };

    if (settings && settings.currency !== '$') {
      totals.totalSavings = this.convertUnitsService.value(totals.totalSavings).from('$').to(settings.currency);
      lessThanOneYear = this.convertUnitsService.value(lessThanOneYear).from('$').to(settings.currency);
      oneToTwoYears = this.convertUnitsService.value(oneToTwoYears).from('$').to(settings.currency);
      twoToThreeYears = this.convertUnitsService.value(twoToThreeYears).from('$').to(settings.currency);
      moreThanThreeYears = this.convertUnitsService.value(moreThanThreeYears).from('$').to(settings.currency);
    }
    return {
      lessThanOneYear: lessThanOneYear,
      oneToTwoYears: oneToTwoYears,
      twoToThreeYears: twoToThreeYears,
      moreThanThreeYears: moreThanThreeYears,
      totals: totals
    }
  }
}
