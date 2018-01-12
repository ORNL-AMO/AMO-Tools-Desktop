import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { PHAST, ExecutiveSummary, PhastResults } from '../shared/models/phast/phast';
import { PhastResultsService } from '../phast/phast-results.service';
import { ExecutiveSummaryService } from '../phast/phast-report/executive-summary.service';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../shared/models/settings';


@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<ReportItem>>;
  phastAssessments: BehaviorSubject<Array<ReportItem>>;
  psatAssessments: BehaviorSubject<Array<ReportItem>>;

  assessmentsArray: Array<ReportItem>;
  phastArray: Array<ReportItem>;
  psatArray: Array<ReportItem>;

  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  psatResults: BehaviorSubject<Array<PsatResultsData>>;
  allPsatResults: BehaviorSubject<Array<AllPsatResultsData>>;

  selectedPhasts: BehaviorSubject<Array<PhastCompare>>;
  phastResults: BehaviorSubject<Array<PhastResultsData>>;
  allPhastResults: BehaviorSubject<Array<AllPhastResultsData>>;

  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private executiveSummaryService: ExecutiveSummaryService, private settingsService: SettingsService, private phastResultsService: PhastResultsService) {
    this.initSummary();
  }

  initSummary() {
    this.reportAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.phastAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>())
    this.psatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>())

    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.psatResults = new BehaviorSubject<Array<PsatResultsData>>(new Array<PsatResultsData>());
    this.allPsatResults = new BehaviorSubject<Array<AllPsatResultsData>>(new Array<AllPsatResultsData>());

    this.selectedPhasts = new BehaviorSubject<Array<PhastCompare>>(new Array<PhastCompare>());
    this.phastResults = new BehaviorSubject<Array<PhastResultsData>>(new Array<PhastResultsData>());
    this.allPhastResults = new BehaviorSubject<Array<AllPhastResultsData>>(new Array<AllPhastResultsData>());
  }


  pushAssessment(assessment: Assessment): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAssessmentSettings(assessment.id).then(settings => {
        let tmpSettings = this.checkSettings(settings[0]);
        this.assessmentsArray.push({ assessment: assessment, settings: tmpSettings });
        if (assessment.psat) {
          this.psatArray.push({ assessment: assessment, settings: tmpSettings });
          resolve(true);
        } else if (assessment.phast) {
          this.phastArray.push({ assessment: assessment, settings: tmpSettings });
          resolve(true);
        }
      })
    })
  }

  getReportData(directory: Directory) {
    this.assessmentsArray = new Array<ReportItem>();
    this.phastArray = new Array<ReportItem>();
    this.psatArray = new Array<ReportItem>();
    let selected = directory.assessments.filter((val) => { return val.selected })
    let i = selected.length;
    let count = 1;
    selected.forEach(assessment => {
      if (count != i) {
        this.pushAssessment(assessment);
        count++;
      } else {
        this.pushAssessment(assessment).then(() => {
          this.phastAssessments.next(this.phastArray);
          this.psatAssessments.next(this.psatArray);
          this.reportAssessments.next(this.assessmentsArray);
        })
      }
    });
    directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.getDirectoryAssessments(subDir.id);
        this.getChildDirectories(subDir);
      }
    })
  }

  getChildDirectories(subDir: Directory) {
    this.indexedDbService.getChildrenDirectories(subDir.id).then(subDirResults => {
      if (subDirResults) {
        subDirResults.forEach(dir => {
          this.getDirectoryAssessments(dir.id);
          this.getChildDirectories(dir);
        })
      }
    })
  }

  getDirectoryAssessments(dirId: number) {
    this.indexedDbService.getDirectoryAssessments(dirId).then(results => {
      //let selected = results.assessments.filter((val) => { return val.selected })
      let i = results.length;
      let count = 1;
      results.forEach(assessment => {
        if (count != i) {
          this.pushAssessment(assessment);
          count++;
        } else {
          this.pushAssessment(assessment).then(() => {
            this.phastAssessments.next(this.phastArray);
            this.psatAssessments.next(this.psatArray);
            this.reportAssessments.next(this.assessmentsArray);
          })
        }
      });
    })
  }


  //USED FOR PSAT SUMMARY
  initPsatCompare(resultsArr: Array<AllPsatResultsData>) {
    let tmpResults: Array<PsatCompare> = new Array<PsatCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annual_cost })
      let modIndex = _.findIndex(result.modificationResults, { annual_cost: minCost.annual_cost });
      let psatAssessments = this.psatAssessments.value;
      let assessmentIndex = _.findIndex(psatAssessments, (val) => { return val.assessment.id == result.assessmentId });
      let item = psatAssessments[assessmentIndex];
      if (result.isBaseline) {
        tmpResults.push({ baseline: item.assessment.psat, modification: item.assessment.psat, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment });
      } else {
        tmpResults.push({ baseline: item.assessment.psat, modification: item.assessment.psat.modifications[modIndex].psat, assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment });
      }
    });
    this.selectedPsats.next(tmpResults);
  }

  updateSelectedPsats(assessment: Assessment, modIndex: number) {
    let tmpSelected = this.selectedPsats.value;
    if (modIndex != -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.psat, modification: assessment.psat.modifications[modIndex].psat, assessmentId: assessment.id, selectedIndex: modIndex, name: assessment.name, assessment: assessment });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.psat, modification: assessment.psat, assessmentId: assessment.id, selectedIndex: modIndex, name: assessment.name, assessment: assessment });
    }
    this.selectedPsats.next(tmpSelected);
  }

  initResultsArr(psatArr: Array<ReportItem>) {
    let tmpResultsArr = new Array<AllPsatResultsData>();
    psatArr.forEach(val => {
      if (val.assessment.psat.setupDone && (val.assessment.psat.modifications.length != 0)) {
        let baselineResults = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.assessment.psat.inputs)), val.settings);
        if (val.assessment.psat.modifications) {
          if (val.assessment.psat.modifications.length != 0) {
            let modResultsArr = new Array<PsatOutputs>();
            val.assessment.psat.modifications.forEach(mod => {
              let tmpResults;
              if (mod.psat.inputs.optimize_calculation) {
                tmpResults = this.psatService.resultsOptimal(JSON.parse(JSON.stringify(mod.psat.inputs)), val.settings);
              } else {
                tmpResults = this.psatService.resultsModified(JSON.parse(JSON.stringify(mod.psat.inputs)), val.settings, baselineResults.pump_efficiency);
              }
              modResultsArr.push(tmpResults);
            })
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
        this.allPsatResults.next(tmpResultsArr);
      }
    })
  }

  getResultsFromSelected(selectedPsats: Array<PsatCompare>) {
    let tmpResultsArr = new Array<PsatResultsData>();
    selectedPsats.forEach(val => {
      this.indexedDbService.getAssessmentSettings(val.assessmentId).then(settings => {
        settings[0] = this.checkSettings(settings[0]);
        let modificationResults;
        let baselineResults = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.baseline.inputs)), settings[0]);
        if (val.modification.inputs.optimize_calculation) {
          modificationResults = this.psatService.resultsOptimal(JSON.parse(JSON.stringify(val.modification.inputs)), settings[0]);
        } else {
          modificationResults = this.psatService.resultsModified(JSON.parse(JSON.stringify(val.modification.inputs)), settings[0], baselineResults.pump_efficiency);
        }
        tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification });
      })
    })
    this.psatResults.next(tmpResultsArr);
  }

  //USED FOR PHAST SUMMARY
  initPhastCompare(resultsArr: Array<AllPhastResultsData>) {
    let tmpResults: Array<PhastCompare> = new Array<PhastCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annualCost })
      if (minCost) {
        let modIndex = _.findIndex(result.modificationResults, { annualCost: minCost.annualCost });
        if (modIndex != -1) {
          let phastAssessments: Array<ReportItem> = this.phastAssessments.value;
          let assessmentIndex = _.findIndex(phastAssessments, (val) => { return val.assessment.id == result.assessmentId });
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
    if (modIndex != -1) {
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
        let baselineResults = this.executiveSummaryService.getSummary(val.assessment.phast, false, val.settings, val.assessment.phast)
        if (val.assessment.phast.modifications) {
          if (val.assessment.phast.modifications.length != 0) {
            let modResultsArr = new Array<ExecutiveSummary>();
            val.assessment.phast.modifications.forEach(mod => {
              let tmpResults = this.executiveSummaryService.getSummary(mod.phast, true, val.settings, val.assessment.phast, baselineResults);
              modResultsArr.push(tmpResults);
            })
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
    })
    this.allPhastResults.next(tmpResultsArr);
  }

  getPhastResultsFromSelected(selectedPhasts: Array<PhastCompare>) {
    let tmpResultsArr = new Array<PhastResultsData>();
    selectedPhasts.forEach(val => {
      let baselineResults = this.executiveSummaryService.getSummary(val.baseline, false, val.settings, val.baseline);
      let modificationResults = this.executiveSummaryService.getSummary(val.modification, true, val.settings, val.baseline, baselineResults);
      let baselineResultData = this.phastResultsService.getResults(val.baseline, val.settings, );
      let modificationResultData = this.phastResultsService.getResults(val.modification, val.settings, );
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
    })
    this.phastResults.next(tmpResultsArr);
  }

  checkSettings(settings: Settings) {
    if (!settings.energyResultUnit) {
      settings = this.settingsService.setEnergyResultUnitSetting(settings);
    }
    if (!settings.phastRollupUnit) {
      settings = this.settingsService.setPhastResultUnit(settings);
    }
    if (!settings.temperatureMeasurement) {
      if (settings.unitsOfMeasure == 'Metric') {
        settings.temperatureMeasurement = 'C';
      } else {
        settings.temperatureMeasurement = 'F';
      }
    }
    return settings;
  }

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    if (isNaN(value) == false && value != null && value != undefined) {
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

export interface ReportItem {
  assessment: Assessment,
  settings: Settings
}

export interface PsatCompare {
  baseline: PSAT,
  modification: PSAT,
  assessmentId: number,
  selectedIndex: number,
  name: string,
  assessment: Assessment
}


export interface PsatResultsData {
  baselineResults: PsatOutputs,
  modificationResults: PsatOutputs,
  assessmentId: number,
  name: string,
  modName: string,
  baseline: PSAT,
  modification: PSAT
}


export interface AllPsatResultsData {
  baselineResults: PsatOutputs,
  modificationResults: Array<PsatOutputs>,
  assessmentId: number,
  isBaseline?: boolean
}


export interface PhastCompare {
  baseline: PHAST,
  modification: PHAST,
  assessmentId: number,
  selectedIndex: number,
  name: string,
  assessment: Assessment,
  settings: Settings
}


export interface PhastResultsData {
  baselineResults: ExecutiveSummary,
  modificationResults: ExecutiveSummary,
  baselineResultData: PhastResults,
  modificationResultData: PhastResults,
  assessmentId: number,
  settings: Settings,
  name: string,
  modName: string,
  assessment: Assessment
}


export interface AllPhastResultsData {
  baselineResults: ExecutiveSummary,
  modificationResults: Array<ExecutiveSummary>,
  assessmentId: number,
  isBaseline?: boolean
}