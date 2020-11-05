import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastResultsService } from '../phast/phast-results.service';
import { AllPhastResultsData, PhastCompare, PhastResultsData, ReportItem } from './report-rollup-models';
import * as _ from 'lodash';
import { ExecutiveSummaryService } from '../phast/phast-report/executive-summary.service';
import { ExecutiveSummary } from '../shared/models/phast/phast';

@Injectable()
export class PhastReportRollupService {

  phastAssessments: BehaviorSubject<Array<ReportItem>>;
  phastArray: Array<ReportItem>;
  selectedPhasts: BehaviorSubject<Array<PhastCompare>>;
  phastResults: BehaviorSubject<Array<PhastResultsData>>;
  allPhastResults: BehaviorSubject<Array<AllPhastResultsData>>;
  constructor(
    private executiveSummaryService: ExecutiveSummaryService,
    private phastResultsService: PhastResultsService) { 
      this.initSummary();
    }

  initSummary() {
    this.phastAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedPhasts = new BehaviorSubject<Array<PhastCompare>>(new Array<PhastCompare>());
    this.phastResults = new BehaviorSubject<Array<PhastResultsData>>(new Array<PhastResultsData>());
    this.allPhastResults = new BehaviorSubject<Array<AllPhastResultsData>>(new Array<AllPhastResultsData>());

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

}
