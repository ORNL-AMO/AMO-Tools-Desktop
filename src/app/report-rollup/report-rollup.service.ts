import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { PHAST, ExecutiveSummary } from '../shared/models/phast/phast';
import { PhastResultsService } from '../phast/phast-results.service';
import { ExecutiveSummaryService } from '../phast/phast-report/executive-summary.service';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../shared/models/settings';


@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<Assessment>>;
  phastAssessments: BehaviorSubject<Array<Assessment>>;
  psatAssessments: BehaviorSubject<Array<Assessment>>;

  assessmentsArray: Array<Assessment>;
  phastArray: Array<Assessment>;
  psatArray: Array<Assessment>;

  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  psatResults: BehaviorSubject<Array<PsatResultsData>>;
  allPsatResults: BehaviorSubject<Array<AllPsatResultsData>>;

  selectedPhasts: BehaviorSubject<Array<PhastCompare>>;
  phastResults: BehaviorSubject<Array<PhastResultsData>>;
  allPhastResults: BehaviorSubject<Array<AllPhastResultsData>>;

  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private executiveSummaryService: ExecutiveSummaryService, private settingsService: SettingsService) {
    this.initSummary();
  }

  initSummary() {
    this.reportAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>());
    this.phastAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
    this.psatAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())

    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.psatResults = new BehaviorSubject<Array<PsatResultsData>>(new Array<PsatResultsData>());
    this.allPsatResults = new BehaviorSubject<Array<AllPsatResultsData>>(new Array<AllPsatResultsData>());

    this.selectedPhasts = new BehaviorSubject<Array<PhastCompare>>(new Array<PhastCompare>());
    this.phastResults = new BehaviorSubject<Array<PhastResultsData>>(new Array<PhastResultsData>());
    this.allPhastResults = new BehaviorSubject<Array<AllPhastResultsData>>(new Array<AllPhastResultsData>());
  }


  pushAssessment(assessment: Assessment) {
    this.assessmentsArray.push(assessment);
    this.reportAssessments.next(this.assessmentsArray);
    if (assessment.psat) {
      this.psatArray.push(assessment);
      this.psatAssessments.next(this.psatArray);
    } else if (assessment.phast) {
      this.phastArray.push(assessment);
      this.phastAssessments.next(this.phastArray);
    }
  }

  getReportData(directory: Directory) {
    this.assessmentsArray = new Array<Assessment>();
    this.phastArray = new Array<Assessment>();
    this.psatArray = new Array<Assessment>();
    this.psatAssessments.next(this.psatArray);
    this.phastAssessments.next(this.phastArray);
    directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        this.pushAssessment(assessment);
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
      if (results) {
        results.forEach(assessment => {
          this.pushAssessment(assessment);
        })
      }
    })
  }


  //USED FOR PSAT SUMMARY
  initPsatCompare(resultsArr: Array<AllPsatResultsData>) {
    let tmpResults: Array<PsatCompare> = new Array<PsatCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annual_cost })
      let modIndex = _.findIndex(result.modificationResults, { annual_cost: minCost.annual_cost });
      let psatAssessments = this.psatAssessments.value;
      let assessmentIndex = _.findIndex(psatAssessments, { id: result.assessmentId });
      let assessment = psatAssessments[assessmentIndex];
      if (result.isBaseline) {
        tmpResults.push({ baseline: assessment.psat, modification: assessment.psat, assessmentId: result.assessmentId, selectedIndex: -1 });
      } else {
        tmpResults.push({ baseline: assessment.psat, modification: assessment.psat.modifications[modIndex].psat, assessmentId: result.assessmentId, selectedIndex: modIndex });
      }
    });
    this.selectedPsats.next(tmpResults);
  }

  updateSelectedPsats(assessment: Assessment, modIndex: number) {
    let tmpSelected = this.selectedPsats.value;
    if (modIndex != -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.psat, modification: assessment.psat.modifications[modIndex].psat, assessmentId: assessment.id, selectedIndex: modIndex });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.psat, modification: assessment.psat, assessmentId: assessment.id, selectedIndex: modIndex });
    }
    this.selectedPsats.next(tmpSelected);
  }

  initResultsArr(psatArr: Array<Assessment>) {
    let tmpResultsArr = new Array<AllPsatResultsData>();
    psatArr.forEach(val => {
      if (val.psat.setupDone && (val.psat.modifications.length != 0)) {
        this.indexedDbService.getAssessmentSettings(val.id).then(settings => {
          settings[0] = this.checkSettings(settings[0]);
          let baselineResults = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.psat.inputs)), settings[0]);
          if (val.psat.modifications) {
            if (val.psat.modifications.length != 0) {
              let modResultsArr = new Array<PsatOutputs>();
              val.psat.modifications.forEach(mod => {
                let tmpResults;
                if (mod.psat.inputs.optimize_calculation) {
                  tmpResults = this.psatService.resultsOptimal(JSON.parse(JSON.stringify(mod.psat.inputs)), settings[0]);
                } else {
                  tmpResults = this.psatService.resultsModified(JSON.parse(JSON.stringify(mod.psat.inputs)), settings[0], baselineResults.pump_efficiency);
                }
                modResultsArr.push(tmpResults);
              })
              tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id });
            } else {
              let modResultsArr = new Array<PsatOutputs>();
              modResultsArr.push(baselineResults);
              tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id, isBaseline: true });
            }
          } else {
            let modResultsArr = new Array<PsatOutputs>();
            modResultsArr.push(baselineResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id, isBaseline: true });
          }

          this.allPsatResults.next(tmpResultsArr);
        })
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
        tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId });
        this.psatResults.next(tmpResultsArr);
      })
    })
  }

  //USED FOR PHAST SUMMARY
  initPhastCompare(resultsArr: Array<AllPhastResultsData>) {
    let tmpResults: Array<PhastCompare> = new Array<PhastCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annualCost })
      if (minCost) {
        let modIndex = _.findIndex(result.modificationResults, { annualCost: minCost.annualCost });
        if (modIndex != -1) {
          let phastAssessments = this.phastAssessments.value;
          let assessmentIndex = _.findIndex(phastAssessments, { id: result.assessmentId });
          let assessment = phastAssessments[assessmentIndex];
          if (result.isBaseline) {
            tmpResults.push({ baseline: assessment.phast, modification: assessment.phast, assessmentId: result.assessmentId, selectedIndex: -1, name: assessment.name });
          } else {
            tmpResults.push({ baseline: assessment.phast, modification: assessment.phast.modifications[modIndex].phast, assessmentId: result.assessmentId, selectedIndex: modIndex, name: assessment.name });
          }
        }
      }
    });
    this.selectedPhasts.next(tmpResults);
  }

  updateSelectedPhasts(assessment: Assessment, modIndex: number) {
    let tmpSelected = this.selectedPhasts.value;
    if (modIndex != -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.phast, modification: assessment.phast.modifications[modIndex].phast, assessmentId: assessment.id, selectedIndex: modIndex, name: assessment.name });
    }
    else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: assessment.phast, modification: assessment.phast, assessmentId: assessment.id, selectedIndex: modIndex, name: assessment.name });
    }
    this.selectedPhasts.next(tmpSelected);
  }

  initPhastResultsArr(phastArray: Array<Assessment>) {
    let tmpResultsArr = new Array<AllPhastResultsData>();
    phastArray.forEach(val => {
      if (val.phast.setupDone) {
        this.indexedDbService.getAssessmentSettings(val.id).then(settings => {
          settings[0] = this.checkSettings(settings[0]);
          let baselineResults = this.executiveSummaryService.getSummary(val.phast, false, settings[0], val.phast)
          if (val.phast.modifications) {
            if (val.phast.modifications.length != 0) {
              let modResultsArr = new Array<ExecutiveSummary>();
              val.phast.modifications.forEach(mod => {
                let tmpResults = this.executiveSummaryService.getSummary(mod.phast, true, settings[0], val.phast, baselineResults);
                modResultsArr.push(tmpResults);
              })
              tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id });
            } else {
              let modResultsArr = new Array<ExecutiveSummary>();
              let tmpResults = this.executiveSummaryService.getSummary(val.phast, true, settings[0], val.phast, baselineResults);
              modResultsArr.push(tmpResults);
              tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id, isBaseline: true });
            }
          } else {
            let modResultsArr = new Array<ExecutiveSummary>();
            let tmpResults = this.executiveSummaryService.getSummary(val.phast, true, settings[0], val.phast, baselineResults);
            modResultsArr.push(tmpResults);
            tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id, isBaseline: true });
          }
          this.allPhastResults.next(tmpResultsArr);
        })
      }
    })
  }

  getPhastResultsFromSelected(selectedPhasts: Array<PhastCompare>) {
    let tmpResultsArr = new Array<PhastResultsData>();
    selectedPhasts.forEach(val => {
      this.indexedDbService.getAssessmentSettings(val.assessmentId).then(settings => {
        settings[0] = this.checkSettings(settings[0]);
        let baselineResults = this.executiveSummaryService.getSummary(val.baseline, false, settings[0], val.baseline);
        let modificationResults = this.executiveSummaryService.getSummary(val.modification, true, settings[0], val.baseline, baselineResults);
        tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, settings: settings[0], name: val.name });
        this.phastResults.next(tmpResultsArr);
      })
    })
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

}

export interface PsatCompare {
  baseline: PSAT,
  modification: PSAT,
  assessmentId: number,
  selectedIndex: number
}


export interface PsatResultsData {
  baselineResults: PsatOutputs,
  modificationResults: PsatOutputs,
  assessmentId: number
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
  name: string
}


export interface PhastResultsData {
  baselineResults: ExecutiveSummary,
  modificationResults: ExecutiveSummary,
  assessmentId: number,
  settings: Settings,
  name: string
}


export interface AllPhastResultsData {
  baselineResults: ExecutiveSummary,
  modificationResults: Array<ExecutiveSummary>,
  assessmentId: number,
  isBaseline?: boolean
}