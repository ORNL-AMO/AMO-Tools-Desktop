import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SsmtService } from '../ssmt/ssmt.service';
import { AllSsmtResultsData, ReportItem, SsmtCompare, SsmtResultsData } from './report-rollup-models';
import * as _ from 'lodash';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';

@Injectable()
export class SsmtReportRollupService {
  
  ssmtAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedSsmt: BehaviorSubject<Array<SsmtCompare>>;
  ssmtResults: BehaviorSubject<Array<SsmtResultsData>>;
  allSsmtResults: BehaviorSubject<Array<AllSsmtResultsData>>;

  constructor(private ssmtService: SsmtService) { }

  initSummary(){
    this.ssmtAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedSsmt = new BehaviorSubject<Array<SsmtCompare>>(new Array<SsmtCompare>());
    this.ssmtResults = new BehaviorSubject<Array<SsmtResultsData>>(new Array<SsmtResultsData>());
    this.allSsmtResults = new BehaviorSubject<Array<AllSsmtResultsData>>(new Array<AllSsmtResultsData>());

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

}
