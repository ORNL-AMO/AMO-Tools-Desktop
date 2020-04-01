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


@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<ReportItem>>;
  phastAssessments: BehaviorSubject<Array<ReportItem>>;
  psatAssessments: BehaviorSubject<Array<ReportItem>>;
  fsatAssessments: BehaviorSubject<Array<ReportItem>>;
  ssmtAssessments: BehaviorSubject<Array<ReportItem>>;
  treasureHuntAssessments: BehaviorSubject<Array<ReportItem>>;

  assessmentsArray: Array<ReportItem>;
  phastArray: Array<ReportItem>;
  psatArray: Array<ReportItem>;
  fsatArray: Array<ReportItem>;
  ssmtArray: Array<ReportItem>;
  treasureHuntArray: Array<ReportItem>;

  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  psatResults: BehaviorSubject<Array<PsatResultsData>>;
  allPsatResults: BehaviorSubject<Array<AllPsatResultsData>>;

  selectedPhasts: BehaviorSubject<Array<PhastCompare>>;
  phastResults: BehaviorSubject<Array<PhastResultsData>>;
  allPhastResults: BehaviorSubject<Array<AllPhastResultsData>>;

  selectedFsats: BehaviorSubject<Array<FsatCompare>>;
  fsatResults: BehaviorSubject<Array<FsatResultsData>>;
  allFsatResults: BehaviorSubject<Array<AllFsatResultsData>>;

  selectedSsmt: BehaviorSubject<Array<SsmtCompare>>;
  ssmtResults: BehaviorSubject<Array<SsmtResultsData>>;
  allSsmtResults: BehaviorSubject<Array<AllSsmtResultsData>>;

  allTreasureHuntResults: BehaviorSubject<Array<TreasureHuntResultsData>>;

  calcsArray: Array<Calculator>;
  selectedCalcs: BehaviorSubject<Array<Calculator>>;
  numPhasts: number = 0;
  numPsats: number = 0;
  numFsats: number = 0;
  numSsmt: number = 0;
  numTreasureHunt: number = 0;
  showSummaryModal: BehaviorSubject<string>;
  constructor(
    private psatService: PsatService,
    private executiveSummaryService: ExecutiveSummaryService,
    private settingsService: SettingsService,
    private phastResultsService: PhastResultsService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private fsatService: FsatService,
    private ssmtService: SsmtService,
    private treasureHuntReportService: TreasureHuntReportService,
    private opportunitySummaryService: OpportunitySummaryService,
    private opportunityCardsService: OpportunityCardsService,
    private opportunityPaybackService: OpportunityPaybackService

  ) {
    this.initSummary();
  }

  initSummary() {
    this.reportAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.phastAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.psatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.fsatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.ssmtAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.treasureHuntAssessments = new BehaviorSubject<Array<ReportItem>>(Array<ReportItem>());

    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.psatResults = new BehaviorSubject<Array<PsatResultsData>>(new Array<PsatResultsData>());
    this.allPsatResults = new BehaviorSubject<Array<AllPsatResultsData>>(new Array<AllPsatResultsData>());

    this.selectedPhasts = new BehaviorSubject<Array<PhastCompare>>(new Array<PhastCompare>());
    this.phastResults = new BehaviorSubject<Array<PhastResultsData>>(new Array<PhastResultsData>());
    this.allPhastResults = new BehaviorSubject<Array<AllPhastResultsData>>(new Array<AllPhastResultsData>());

    this.selectedFsats = new BehaviorSubject<Array<FsatCompare>>(new Array<FsatCompare>());
    this.fsatResults = new BehaviorSubject<Array<FsatResultsData>>(new Array<FsatResultsData>());
    this.allFsatResults = new BehaviorSubject<Array<AllFsatResultsData>>(new Array<AllFsatResultsData>());

    this.selectedSsmt = new BehaviorSubject<Array<SsmtCompare>>(new Array<SsmtCompare>());
    this.ssmtResults = new BehaviorSubject<Array<SsmtResultsData>>(new Array<SsmtResultsData>());
    this.allSsmtResults = new BehaviorSubject<Array<AllSsmtResultsData>>(new Array<AllSsmtResultsData>());

    this.calcsArray = new Array<Calculator>();
    this.selectedCalcs = new BehaviorSubject<Array<Calculator>>(new Array<Calculator>());

    this.allTreasureHuntResults = new BehaviorSubject<Array<TreasureHuntResultsData>>(new Array<TreasureHuntResultsData>())
    this.showSummaryModal = new BehaviorSubject<string>(undefined);
  }


  pushAssessment(assessment: Assessment) {
    let settings = this.settingsDbService.getByAssessmentId(assessment);
    let tmpSettings = this.checkSettings(settings);
    this.assessmentsArray.push({ assessment: assessment, settings: tmpSettings });
    if (assessment.psat) {
      this.psatArray.push({ assessment: assessment, settings: tmpSettings });
    } else if (assessment.phast) {
      this.phastArray.push({ assessment: assessment, settings: tmpSettings });
    } else if (assessment.fsat) {
      this.fsatArray.push({ assessment: assessment, settings: tmpSettings });
    } else if (assessment.ssmt) {
      this.ssmtArray.push({
        assessment: assessment,
        settings: tmpSettings
      })
    } else if (assessment.treasureHunt) {
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
    this.phastArray = new Array<ReportItem>();
    this.psatArray = new Array<ReportItem>();
    this.fsatArray = new Array<ReportItem>();
    this.ssmtArray = new Array<ReportItem>();
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
    this.phastAssessments.next(this.phastArray);
    this.psatAssessments.next(this.psatArray);
    this.fsatAssessments.next(this.fsatArray);
    this.ssmtAssessments.next(this.ssmtArray);
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


  //USED FOR PSAT SUMMARY
  initPsatCompare(resultsArr: Array<AllPsatResultsData>) {
    let tmpResults: Array<PsatCompare> = new Array<PsatCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annual_cost; });
      let modIndex = _.findIndex(result.modificationResults, { annual_cost: minCost.annual_cost });
      let psatAssessments = this.psatAssessments.value;
      let assessmentIndex = _.findIndex(psatAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item = psatAssessments[assessmentIndex];
      if (result.isBaseline) {
        tmpResults.push({ baseline: item.assessment.psat, modification: item.assessment.psat, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.psat, modification: item.assessment.psat.modifications[modIndex].psat, assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedPsats.next(tmpResults);
  }

  updateSelectedPsats(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedPsats.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.psat, modification: item.assessment.psat.modifications[modIndex].psat, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.psat, modification: item.assessment.psat, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedPsats.next(tmpSelected);
  }

  initResultsArr(psatArr: Array<ReportItem>) {
    let tmpResultsArr = new Array<AllPsatResultsData>();
    psatArr.forEach(val => {
      if (val.assessment.psat.setupDone) {
        let baselineResults = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.assessment.psat.inputs)), val.settings);
        if (val.assessment.psat.modifications) {
          if (val.assessment.psat.modifications.length !== 0) {
            let modResultsArr = new Array<PsatOutputs>();
            val.assessment.psat.modifications.forEach(mod => {
              let tmpResults: PsatOutputs = this.psatService.resultsModified(JSON.parse(JSON.stringify(mod.psat.inputs)), val.settings);
              modResultsArr.push(tmpResults);
            });
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<PsatOutputs>();
            modResultsArr.push(baselineResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<PsatOutputs>();
          modResultsArr.push(baselineResults);
          tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
    this.allPsatResults.next(tmpResultsArr);
  }

  getResultsFromSelected(selectedPsats: Array<PsatCompare>) {
    let tmpResultsArr = new Array<PsatResultsData>();
    selectedPsats.forEach(val => {
      let baselineResults: PsatOutputs = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.baseline.inputs)), val.settings);
      let modificationResults: PsatOutputs = this.psatService.resultsModified(JSON.parse(JSON.stringify(val.modification.inputs)), val.settings);
      tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
    this.psatResults.next(tmpResultsArr);
  }

  //USED FOR PHAST SUMMARY
  initPhastCompare(resultsArr: Array<AllPhastResultsData>) {
    let tmpResults: Array<PhastCompare> = new Array<PhastCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annualCost; });
      if (minCost) {
        let modIndex = _.findIndex(result.modificationResults, { annualCost: minCost.annualCost });
        if (modIndex !== -1) {
          let phastAssessments: Array<ReportItem> = this.phastAssessments.value;
          let assessmentIndex = _.findIndex(phastAssessments, (val) => { return val.assessment.id === result.assessmentId; });
          let item = phastAssessments[assessmentIndex];
          if (result.isBaseline) {
            tmpResults.push({ baseline: item.assessment.phast, modification: item.assessment.phast, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
          } else {
            tmpResults.push({ baseline: item.assessment.phast, modification: item.assessment.phast.modifications[modIndex].phast, assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
          }
        }
      }
    });
    this.selectedPhasts.next(tmpResults);
  }

  updateSelectedPhasts(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedPhasts.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.phast, modification: item.assessment.phast.modifications[modIndex].phast, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.phast, modification: item.assessment.phast, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedPhasts.next(tmpSelected);
  }

  initPhastResultsArr(phastArray: Array<ReportItem>) {
    let tmpResultsArr = new Array<AllPhastResultsData>();
    phastArray.forEach(val => {
      if (val.assessment.phast.setupDone) {
        let baselineResults = this.executiveSummaryService.getSummary(val.assessment.phast, false, val.settings, val.assessment.phast);
        if (val.assessment.phast.modifications) {
          if (val.assessment.phast.modifications.length !== 0) {
            let modResultsArr = new Array<ExecutiveSummary>();
            val.assessment.phast.modifications.forEach(mod => {
              let tmpResults = this.executiveSummaryService.getSummary(mod.phast, true, val.settings, val.assessment.phast, baselineResults);
              modResultsArr.push(tmpResults);
            });
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<ExecutiveSummary>();
            let tmpResults = this.executiveSummaryService.getSummary(val.assessment.phast, true, val.settings, val.assessment.phast, baselineResults);
            modResultsArr.push(tmpResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<ExecutiveSummary>();
          let tmpResults = this.executiveSummaryService.getSummary(val.assessment.phast, true, val.settings, val.assessment.phast, baselineResults);
          modResultsArr.push(tmpResults);
          tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
    this.allPhastResults.next(tmpResultsArr);
  }

  getPhastResultsFromSelected(selectedPhasts: Array<PhastCompare>) {
    let tmpResultsArr = new Array<PhastResultsData>();
    selectedPhasts.forEach(val => {
      let baselineResults = this.executiveSummaryService.getSummary(val.baseline, false, val.settings, val.baseline);
      let modificationResults = this.executiveSummaryService.getSummary(val.modification, true, val.settings, val.baseline, baselineResults);
      let baselineResultData = this.phastResultsService.getResults(val.baseline, val.settings);
      let modificationResultData = this.phastResultsService.getResults(val.modification, val.settings);
      tmpResultsArr.push({
        baselineResults: baselineResults,
        modificationResults: modificationResults,
        assessmentId: val.assessmentId,
        settings: val.settings,
        name: val.name,
        modName: val.modification.name,
        assessment: val.assessment,
        baselineResultData: baselineResultData,
        modificationResultData: modificationResultData
      });
    });
    this.phastResults.next(tmpResultsArr);
  }

  //USED FOR FSAT SUMMARY
  initFsatCompare(resultsArr: Array<AllFsatResultsData>) {
    let tmpResults: Array<FsatCompare> = new Array<FsatCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annualCost; });
      let modIndex = _.findIndex(result.modificationResults, { annualCost: minCost.annualCost });
      let fsatAssessments = this.fsatAssessments.value;
      let assessmentIndex = _.findIndex(fsatAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item = fsatAssessments[assessmentIndex];
      if (result.isBaseline) {
        tmpResults.push({ baseline: item.assessment.fsat, modification: item.assessment.fsat, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.fsat, modification: item.assessment.fsat.modifications[modIndex].fsat, assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedFsats.next(tmpResults);
  }

  updateSelectedFsats(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedFsats.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.fsat, modification: item.assessment.fsat.modifications[modIndex].fsat, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.fsat, modification: item.assessment.fsat, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedFsats.next(tmpSelected);
  }

  initFsatResultsArr(fsatArr: Array<ReportItem>) {
    let tmpResultsArr = new Array<AllFsatResultsData>();
    fsatArr.forEach(val => {
      if (val.assessment.fsat.setupDone) {
        let baselineResults = this.fsatService.getResults(JSON.parse(JSON.stringify(val.assessment.fsat)), true, val.settings);
        if (val.assessment.fsat.modifications) {
          if (val.assessment.fsat.modifications.length !== 0) {
            let modResultsArr = new Array<FsatOutput>();
            val.assessment.fsat.modifications.forEach(mod => {
              let tmpResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(mod.fsat)), false, val.settings);
              modResultsArr.push(tmpResults);
            });
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<FsatOutput>();
            modResultsArr.push(baselineResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<FsatOutput>();
          modResultsArr.push(baselineResults);
          tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
    this.allFsatResults.next(tmpResultsArr);
  }

  getFsatResultsFromSelected(selectedFsats: Array<FsatCompare>) {
    let tmpResultsArr = new Array<FsatResultsData>();
    selectedFsats.forEach(val => {
      let baselineResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(val.baseline)), true, val.settings);
      let modificationResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(val.modification)), false, val.settings);
      tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
    this.fsatResults.next(tmpResultsArr);
  }

  //used for ssmt summary
  initSsmtCompare(resultsArr: Array<AllSsmtResultsData>) {
    let tmpResults: Array<SsmtCompare> = new Array<SsmtCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.operationsOutput.totalOperatingCost; });
      let modIndex;
      if (minCost != undefined) {
        modIndex = _.findIndex(result.modificationResults, (result) => { return result.operationsOutput.totalOperatingCost == minCost.operationsOutput.totalOperatingCost });
      }
      let ssmtAssessments = this.ssmtAssessments.value;
      let assessmentIndex = _.findIndex(ssmtAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item = ssmtAssessments[assessmentIndex];
      if (result.isBaseline || modIndex == undefined || modIndex == -1) {
        tmpResults.push({ baseline: item.assessment.ssmt, modification: item.assessment.ssmt, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.ssmt, modification: item.assessment.ssmt.modifications[modIndex].ssmt, assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedSsmt.next(tmpResults);
  }

  updateSelectedSsmt(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedSsmt.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.ssmt, modification: item.assessment.ssmt.modifications[modIndex].ssmt, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.ssmt, modification: item.assessment.ssmt, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedSsmt.next(tmpSelected);
  }

  initSsmtResultsArr(ssmtArr: Array<ReportItem>) {
    let tmpResultsArr = new Array<AllSsmtResultsData>();
    ssmtArr.forEach(val => {
      if (val.assessment.ssmt.setupDone) {
        //get results
        val.assessment.ssmt.outputData = this.ssmtService.calculateBaselineModel(val.assessment.ssmt, val.settings).outputData;
        let baselineResults: SSMTOutput = val.assessment.ssmt.outputData;
        if (val.assessment.ssmt.modifications) {
          if (val.assessment.ssmt.modifications.length !== 0) {
            let modResultsArr = new Array<SSMTOutput>();
            val.assessment.ssmt.modifications.forEach(mod => {
              mod.ssmt.outputData = this.ssmtService.calculateModificationModel(mod.ssmt, val.settings, baselineResults).outputData;
              let tmpResults: SSMTOutput = mod.ssmt.outputData;
              modResultsArr.push(tmpResults);
            });
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<SSMTOutput>();
            modResultsArr.push(baselineResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<SSMTOutput>();
          modResultsArr.push(baselineResults);
          tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
    this.allSsmtResults.next(tmpResultsArr);
  }

  getSsmtResultsFromSelected(selectedSsmt: Array<SsmtCompare>) {
    let tmpResultsArr = new Array<SsmtResultsData>();
    selectedSsmt.forEach(val => {
      let baselineResults: SSMTOutput = val.baseline.outputData;
      let modificationResults: SSMTOutput = val.modification.outputData;
      tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
    this.ssmtResults.next(tmpResultsArr);
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
