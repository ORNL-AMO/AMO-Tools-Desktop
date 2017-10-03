import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';

@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<Assessment>>;
  phastAssessments: BehaviorSubject<Array<Assessment>>;
  psatAssessments: BehaviorSubject<Array<Assessment>>;

  assessmentsArray: Array<Assessment>;
  phastArray: Array<Assessment>;
  psatArray: Array<Assessment>;

  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  psatResults: BehaviorSubject<Array<ResultsData>>;
  allPsatResults: BehaviorSubject<Array<AllResultsData>>;
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService) {
    this.reportAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>());
    this.phastAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
    this.psatAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())

    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.psatResults = new BehaviorSubject<Array<ResultsData>>(new Array<ResultsData>());
    this.allPsatResults = new BehaviorSubject<Array<AllResultsData>>(new Array<AllResultsData>());
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
  initPsatCompare(resultsArr: Array<AllResultsData>) {
    let tmpResults: Array<PsatCompare> = new Array<PsatCompare>();
    resultsArr.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.annual_cost })
      let modIndex = _.findIndex(result.modificationResults, { annual_cost: minCost.annual_cost });
      let psatAssessments = this.psatAssessments.value;
      let assessmentIndex = _.findIndex(psatAssessments, { id: result.assessmentId });
      let assessment = psatAssessments[assessmentIndex];
      tmpResults.push({ baseline: assessment.psat, modification: assessment.psat.modifications[modIndex].psat, assessmentId: result.assessmentId });
    });
    this.selectedPsats.next(tmpResults);
  }

  updateSelectedPsats(assessment: Assessment, modIndex: number) {
    let tmpSelected = this.selectedPsats.value;
    let selectedIndex = _.findIndex(tmpSelected, { assessmentId: assessment.id });
    tmpSelected.splice(selectedIndex, 1, { baseline: assessment.psat, modification: assessment.psat.modifications[modIndex].psat, assessmentId: assessment.id });
    this.selectedPsats.next(tmpSelected);
  }

  initResultsArr(psatArr: Array<Assessment>) {
    let tmpResultsArr = new Array<AllResultsData>();
    psatArr.forEach(val => {
      if (val.psat.setupDone) {
        this.indexedDbService.getAssessmentSettings(val.id).then(settings => {
          let baselineResults = this.psatService.resultsExisting(val.psat.inputs, settings[0]);
          let modResultsArr = new Array<PsatOutputs>();
          val.psat.modifications.forEach(mod => {
            let tmpResults;
            if (mod.psat.inputs.optimize_calculation) {
              tmpResults = this.psatService.resultsOptimal(mod.psat.inputs, settings[0]);
            } else {
              tmpResults = this.psatService.resultsModified(mod.psat.inputs, settings[0], baselineResults.pump_efficiency);
            }
            modResultsArr.push(tmpResults);
          })
          tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.id });
          this.allPsatResults.next(tmpResultsArr);
        })
      }
    })
  }

  getResultsFromSelected(selectedPsats: Array<PsatCompare>) {
    let tmpResultsArr = new Array<ResultsData>();
    selectedPsats.forEach(val => {
      this.indexedDbService.getAssessmentSettings(val.assessmentId).then(settings => {
        let modificationResults;
        let baselineResults = this.psatService.resultsExisting(val.baseline.inputs, settings[0]);
        if (val.modification.inputs.optimize_calculation) {
          modificationResults = this.psatService.resultsOptimal(val.modification.inputs, settings[0]);
        } else {
          modificationResults = this.psatService.resultsModified(val.modification.inputs, settings[0], baselineResults.pump_efficiency);
        }
        tmpResultsArr.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId });
        this.psatResults.next(tmpResultsArr);
      })
    })
  }
}

export interface PsatCompare {
  baseline: PSAT,
  modification: PSAT,
  assessmentId: number
}


export interface ResultsData {
  baselineResults: PsatOutputs,
  modificationResults: PsatOutputs,
  assessmentId: number
}


export interface AllResultsData {
  baselineResults: PsatOutputs,
  modificationResults: Array<PsatOutputs>,
  assessmentId: number
}