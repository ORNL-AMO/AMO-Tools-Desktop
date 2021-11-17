import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllCompressedAirResultsData, CompressedAirCompare, CompressedAirResultsData, ReportItem } from './report-rollup-models';
import * as _ from 'lodash';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../compressed-air-assessment/compressed-air-assessment-results.service';
@Injectable()
export class CompressedAirReportRollupService {

  compressedAirAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedAssessments: BehaviorSubject<Array<CompressedAirCompare>>;
  selectedAssessmentResults: Array<CompressedAirResultsData>;
  allAssessmentResults: Array<AllCompressedAirResultsData>;
  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) {
    this.initSummary();
  }

  initSummary() {
    this.compressedAirAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedAssessments = new BehaviorSubject<Array<CompressedAirCompare>>(new Array<CompressedAirCompare>());
    this.selectedAssessmentResults = new Array<CompressedAirResultsData>();
    this.allAssessmentResults = new Array<AllCompressedAirResultsData>();
  }

  //USED FOR Compressed air  SUMMARY
  initCompressedAirCompare() {
    let tmpResults: Array<CompressedAirCompare> = new Array<CompressedAirCompare>();
    this.allAssessmentResults.forEach(result => {
      let minCost: DayTypeModificationResult = _.minBy(result.modificationResults, (result) => { return result.totalAnnualOperatingCost; });
      let modIndex: number = _.findIndex(result.modificationResults, { totalAnnualOperatingCost: minCost.totalAnnualOperatingCost });
      let compressedAirAssessments: Array<ReportItem> = this.compressedAirAssessments.value;
      let assessmentIndex: number = _.findIndex(compressedAirAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item: ReportItem = compressedAirAssessments[assessmentIndex];
      if (result.isBaseline) {
        tmpResults.push({ baseline: item.assessment.compressedAirAssessment, modification: undefined, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.compressedAirAssessment, modification: item.assessment.compressedAirAssessment.modifications[modIndex], assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedAssessments.next(tmpResults);
  }

  updateSelectedCompressorAssessments(item: ReportItem, modIndex: number) {
    let tmpSelected: Array<CompressedAirCompare> = this.selectedAssessments.value;
    if (modIndex !== -1) {
      let selectedIndex: number = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.compressedAirAssessment, modification: item.assessment.compressedAirAssessment.modifications[modIndex], assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex: number = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.compressedAirAssessment, modification: undefined, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedAssessments.next(tmpSelected);
  }

  setAllAssessmentResults(assessmentArr: Array<ReportItem>) {
    this.allAssessmentResults = new Array<AllCompressedAirResultsData>();
    assessmentArr.forEach(val => {
      if (val.assessment.compressedAirAssessment.setupDone) {
        let baselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(val.assessment.compressedAirAssessment, val.settings);
        if (val.assessment.compressedAirAssessment.modifications) {
          if (val.assessment.compressedAirAssessment.modifications.length !== 0) {
            let modResultsArr: Array<DayTypeModificationResult> = new Array<DayTypeModificationResult>();
            val.assessment.compressedAirAssessment.modifications.forEach(mod => {
              let tmpResults: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(val.assessment.compressedAirAssessment, mod, val.settings);
              let combinedResults: DayTypeModificationResult = this.compressedAirAssessmentResultsService.combineDayTypeResults(tmpResults, baselineResults)
              modResultsArr.push(combinedResults);
            });
            this.allAssessmentResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr: Array<DayTypeModificationResult> = new Array<DayTypeModificationResult>();
            modResultsArr.push(undefined);
            this.allAssessmentResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr: Array<DayTypeModificationResult> = new Array<DayTypeModificationResult>();
          modResultsArr.push(undefined);
          this.allAssessmentResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setAssessmentResultsFromSelected(selectedAssessments: Array<CompressedAirCompare>) {
    this.selectedAssessmentResults = new Array<CompressedAirResultsData>();
    selectedAssessments.forEach(val => {
      let baselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(val.assessment.compressedAirAssessment, val.settings);
      if (val.modification) {
        let modificationResults: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(val.assessment.compressedAirAssessment, val.modification, val.settings);
        let combinedResults: DayTypeModificationResult = this.compressedAirAssessmentResultsService.combineDayTypeResults(modificationResults, baselineResults)
        this.selectedAssessmentResults.push({ baselineResults: baselineResults, modificationResults: combinedResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
      } else {
        this.selectedAssessmentResults.push({ baselineResults: baselineResults, modificationResults: undefined, assessmentId: val.assessmentId, name: val.name, modName: 'Baseline', baseline: val.baseline, modification: val.modification, settings: val.settings });
      }
    });
  }
}