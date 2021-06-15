import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllFsatResultsData, FsatCompare, FsatResultsData, ReportItem } from './report-rollup-models';
import * as _ from 'lodash';
import { FsatService } from '../fsat/fsat.service';
import { FSAT, FsatOutput } from '../shared/models/fans';

@Injectable()
export class FsatReportRollupService {

  fsatAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedFsats: BehaviorSubject<Array<FsatCompare>>;
  selectedFsatResults: Array<FsatResultsData>;
  allFsatResults: Array<AllFsatResultsData>;
  constructor(private fsatService: FsatService) { }

  initSummary() {
    this.fsatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedFsats = new BehaviorSubject<Array<FsatCompare>>(new Array<FsatCompare>());
    this.selectedFsatResults = new Array<FsatResultsData>();
    this.allFsatResults = new Array<AllFsatResultsData>();
  }

  //USED FOR FSAT SUMMARY
  initFsatCompare() {
    let tmpResults: Array<FsatCompare> = new Array<FsatCompare>();
    this.allFsatResults.forEach(result => {
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

  setAllFsatResults(fsatArr: Array<ReportItem>) {
    this.allFsatResults = new Array<AllFsatResultsData>();
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
            this.allFsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<FsatOutput>();
            modResultsArr.push(baselineResults);
            this.allFsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<FsatOutput>();
          modResultsArr.push(baselineResults);
          this.allFsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setFsatResultsFromSelected(selectedFsats: Array<FsatCompare>) {
    this.selectedFsatResults = new Array<FsatResultsData>();
    selectedFsats.forEach(val => {
      let baselineResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(val.baseline)), true, val.settings);
      let modificationResults: FsatOutput = this.fsatService.getResults(JSON.parse(JSON.stringify(val.modification)), false, val.settings);
      this.selectedFsatResults.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
  } 
}
