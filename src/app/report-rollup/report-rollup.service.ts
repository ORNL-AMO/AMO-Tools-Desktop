import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import { PsatOutputs } from '../shared/models/psat';
import { ExecutiveSummary } from '../shared/models/phast/phast';
import { PhastResultsService } from '../phast/phast-results.service';
import { ExecutiveSummaryService } from '../phast/phast-report/executive-summary.service';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../shared/models/settings';
import { Calculator } from '../shared/models/calculators';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { FsatOutput } from '../shared/models/fans';
import { FsatService } from '../fsat/fsat.service';
import { ReportItem, PsatCompare, PsatResultsData, AllPsatResultsData, PhastCompare, PhastResultsData, AllPhastResultsData, FsatCompare, FsatResultsData, AllFsatResultsData, AllSsmtResultsData, SsmtCompare, SsmtResultsData, TreasureHuntResultsData } from './report-rollup-models';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { TreasureHuntReportService } from '../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';
import { TreasureHuntResults, OpportunitySummary, OpportunitiesPaybackDetails } from '../shared/models/treasure-hunt';
import { OpportunitySummaryService } from '../treasure-hunt/treasure-hunt-report/opportunity-summary.service';
import { SsmtService } from '../ssmt/ssmt.service';
import { OpportunityCardsService, OpportunityCardData } from '../treasure-hunt/treasure-chest/opportunity-cards/opportunity-cards.service';
import { OpportunityPaybackService } from '../treasure-hunt/treasure-hunt-report/opportunity-payback.service';
import { PsatReportRollupService } from './psat-report-rollup.service';
import { PhastReportRollupService } from './phast-report-rollup.service';
import { FsatReportRollupService } from './fsat-report-rollup.service';
import { SsmtReportRollupService } from './ssmt-report-rollup.service';


@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<ReportItem>>;
  treasureHuntAssessments: BehaviorSubject<Array<ReportItem>>;

  assessmentsArray: Array<ReportItem>;
  treasureHuntArray: Array<ReportItem>;





  allTreasureHuntResults: BehaviorSubject<Array<TreasureHuntResultsData>>;

  calcsArray: Array<Calculator>;
  selectedCalcs: BehaviorSubject<Array<Calculator>>;
  numTreasureHunt: number = 0;
  showSummaryModal: BehaviorSubject<string>;
  constructor(
    private settingsService: SettingsService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private treasureHuntReportService: TreasureHuntReportService,
    private opportunitySummaryService: OpportunitySummaryService,
    private opportunityCardsService: OpportunityCardsService,
    private opportunityPaybackService: OpportunityPaybackService,
    private psatReportRollupService: PsatReportRollupService,
    private phastReportRollupService: PhastReportRollupService,
    private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService

  ) {
    this.initSummary();
  }

  initSummary() {
    this.psatReportRollupService.initSummary();
    this.phastReportRollupService.initSummary();
    this.fsatReportRollupService.initSummary();
    this.ssmtReportRollupService.initSummary();
    this.reportAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());

    this.treasureHuntAssessments = new BehaviorSubject<Array<ReportItem>>(Array<ReportItem>());





    this.calcsArray = new Array<Calculator>();
    this.selectedCalcs = new BehaviorSubject<Array<Calculator>>(new Array<Calculator>());

    this.allTreasureHuntResults = new BehaviorSubject<Array<TreasureHuntResultsData>>(new Array<TreasureHuntResultsData>())
    this.showSummaryModal = new BehaviorSubject<string>(undefined);
  }


  pushAssessment(assessment: Assessment) {
    let settings = this.settingsDbService.getByAssessmentId(assessment);
    let tmpSettings = this.checkSettings(settings);
    this.assessmentsArray.push({ assessment: assessment, settings: tmpSettings });
 if (assessment.treasureHunt) {
      this.treasureHuntArray.push(
        {
          assessment: assessment,
          settings: tmpSettings
        }
      )
    }
  }

  getReportData(directory: Directory) {
    this.assessmentsArray = new Array<ReportItem>();
    // this.ssmtArray = new Array<ReportItem>();
    this.treasureHuntArray = new Array<ReportItem>();
    this.calcsArray = new Array<Calculator>();
    let selected = directory.assessments.filter((val) => { return val.selected; });
    selected.forEach(assessment => {
      this.pushAssessment(assessment);
    });
    if (directory.calculators) {
      directory.calculators.forEach(calc => {
        if (calc.selected == true && calc.preAssessments) {
          this.calcsArray.push(calc);
        }
      })
      this.selectedCalcs.next(this.calcsArray);
    }
    directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.getChildDirectoryAssessments(subDir.id);
        this.getChildDirectories(subDir);
      }
    });
    let phastArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.phast != undefined });
    this.phastReportRollupService.phastAssessments.next(phastArray);
    let psatArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.psat != undefined });
    this.psatReportRollupService.psatAssessments.next(psatArray);
    let fsatArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.fsat != undefined });
    this.fsatReportRollupService.fsatAssessments.next(fsatArray);
    let ssmtArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.ssmt != undefined });
    this.ssmtReportRollupService.ssmtAssessments.next(ssmtArray);
    this.treasureHuntAssessments.next(this.treasureHuntArray);
    this.reportAssessments.next(this.assessmentsArray);

  }

  getChildDirectories(subDir: Directory) {
    let calcs = this.calculatorDbService.getByDirectoryId(subDir.id);
    if (calcs) {
      for (let i = 0; i < calcs.length; i++) {
        if (calcs[i].preAssessments) {
          this.calcsArray.push(calcs[i]);
        }
      }
      this.selectedCalcs.next(this.calcsArray);
    }
    let subDirResults = this.directoryDbService.getSubDirectoriesById(subDir.id);
    if (subDirResults) {
      subDirResults.forEach(dir => {
        this.getChildDirectoryAssessments(dir.id);
        this.getChildDirectories(dir);
      });
    }
  }


  getChildDirectoryAssessments(dirId: number) {
    let results = this.assessmentDbService.getByDirectoryId(dirId);
    results.forEach(assessment => {
      this.pushAssessment(assessment);
    });
  }
  
  //TREASURE HUNT
  initTreasureHuntResultsArray(thuntItems: Array<ReportItem>) {
    let tmpResultsArr: Array<TreasureHuntResultsData> = new Array<TreasureHuntResultsData>();
    thuntItems.forEach(item => {
      if (item.assessment.treasureHunt) {
        let opportunitySummaries: Array<OpportunitySummary> = this.opportunitySummaryService.getOpportunitySummaries(item.assessment.treasureHunt, item.settings)
        let thuntResults: TreasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, item.assessment.treasureHunt.currentEnergyUsage);
        let opportunityCardsData: Array<OpportunityCardData> = this.opportunityCardsService.getOpportunityCardsData(item.assessment.treasureHunt, item.settings);
        let opportunitiesPaybackDetails: OpportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(thuntResults.opportunitySummaries);
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

  checkSettings(settings: Settings) {
    if (!settings.energyResultUnit) {
      settings = this.settingsService.setEnergyResultUnitSetting(settings);
    }
    if (!settings.phastRollupUnit) {
      settings = this.settingsService.setPhastResultUnit(settings);
    }
    if (!settings.temperatureMeasurement) {
      if (settings.unitsOfMeasure === 'Metric') {
        settings.temperatureMeasurement = 'C';
      } else {
        settings.temperatureMeasurement = 'F';
      }
    }
    return settings;
  }

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    if (isNaN(value) === false && value != null && value !== undefined) {
      //string value of number in scientific notation
      let newValString = value.toPrecision(sigFigs);
      //converted to number to get trailing/leading zeros
      let newValNumber = parseFloat(newValString);
      //convert back to string
      let numWithZerosAndCommas = newValNumber.toLocaleString();
      if (scientificNotation) {
        return newValString;
      } else {
        return numWithZerosAndCommas;
      }
    } else {
      return value;
    }
  }

}
