import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { OpportunitiesPaybackDetails, OpportunitySummary, TreasureHuntResults } from '../shared/models/treasure-hunt';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-hunt/treasure-chest/opportunity-cards/opportunity-cards.service';
import { OpportunityPaybackService } from '../treasure-hunt/treasure-hunt-report/opportunity-payback.service';
import { OpportunitySummaryService } from '../treasure-hunt/treasure-hunt-report/opportunity-summary.service';
import { TreasureHuntReportService } from '../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';
import { ReportItem, TreasureHuntResultsData } from './report-rollup-models';

@Injectable()
export class TreasureHuntReportRollupService {
  
  treasureHuntAssessments: BehaviorSubject<Array<ReportItem>>;
  allTreasureHuntResults: BehaviorSubject<Array<TreasureHuntResultsData>>;
  constructor(    
    private treasureHuntReportService: TreasureHuntReportService,
    private opportunitySummaryService: OpportunitySummaryService,
    private opportunityCardsService: OpportunityCardsService,
    private opportunityPaybackService: OpportunityPaybackService) { }

  initSummary(){
    this.treasureHuntAssessments = new BehaviorSubject<Array<ReportItem>>(Array<ReportItem>());
    this.allTreasureHuntResults = new BehaviorSubject<Array<TreasureHuntResultsData>>(new Array<TreasureHuntResultsData>());
  }

   //TREASURE HUNT
   initTreasureHuntResultsArray(thuntItems: Array<ReportItem>, settings?: Settings) {
    let tmpResultsArr: Array<TreasureHuntResultsData> = new Array<TreasureHuntResultsData>();
    thuntItems.forEach(item => {
      if (item.assessment.treasureHunt) {
        let opportunitySummaries: Array<OpportunitySummary> = this.opportunitySummaryService.getOpportunitySummaries(item.assessment.treasureHunt, item.settings)
        let thuntResults: TreasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, item.assessment.treasureHunt, item.settings);
        let opportunityCardsData: Array<OpportunityCardData> = this.opportunityCardsService.getOpportunityCardsData(item.assessment.treasureHunt, item.settings);
        let opportunitiesPaybackDetails: OpportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(thuntResults.opportunitySummaries, settings);
        tmpResultsArr.push(
          {
            treasureHuntResults: thuntResults,
            assessment: item.assessment,
            opportunityCardsData: opportunityCardsData,
            opportunitiesPaybackDetails: opportunitiesPaybackDetails
          }
        );
      }
    });
    this.allTreasureHuntResults.next(tmpResultsArr);
  }

  updateTreasureHuntResults(thuntResults: TreasureHuntResults, opportunityCardsData: Array<OpportunityCardData>, opportunitiesPaybackDetails: OpportunitiesPaybackDetails, assessmentId: number) {
    let currentResults: Array<TreasureHuntResultsData> = this.allTreasureHuntResults.value;
    let resultToBeUpdated: TreasureHuntResultsData = currentResults.find(result => { return result.assessment.id == assessmentId });
    resultToBeUpdated.treasureHuntResults = thuntResults;
    resultToBeUpdated.opportunityCardsData = opportunityCardsData;
    resultToBeUpdated.opportunitiesPaybackDetails = opportunitiesPaybackDetails;
    this.allTreasureHuntResults.next(currentResults);
  }

}
