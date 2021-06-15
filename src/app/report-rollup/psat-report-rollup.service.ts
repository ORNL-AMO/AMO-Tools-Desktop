import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsatService } from '../psat/psat.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { AllPsatResultsData, PsatCompare, PsatResultsData, ReportItem } from './report-rollup-models';
import * as _ from 'lodash';

@Injectable()
export class PsatReportRollupService {
  psatAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  selectedPsatResults: Array<PsatResultsData>;
  allPsatResults: Array<AllPsatResultsData>;
  constructor(private psatService: PsatService) {
    this.initSummary();
  }

  initSummary() {
    this.psatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.selectedPsatResults = new Array<PsatResultsData>();
    this.allPsatResults = new Array<AllPsatResultsData>();
  }

  //USED FOR PSAT SUMMARY
  initPsatCompare() {
    let tmpResults: Array<PsatCompare> = new Array<PsatCompare>();
    this.allPsatResults.forEach(result => {
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

  setAllPsatResults(psatArr: Array<ReportItem>) {
    this.allPsatResults = new Array<AllPsatResultsData>();
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
            this.allPsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<PsatOutputs>();
            modResultsArr.push(baselineResults);
            this.allPsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<PsatOutputs>();
          modResultsArr.push(baselineResults);
          this.allPsatResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setResultsFromSelected(selectedPsats: Array<PsatCompare>) {
    this.selectedPsatResults = new Array<PsatResultsData>();
    selectedPsats.forEach(val => {
      let baselineResults: PsatOutputs = this.psatService.resultsExisting(JSON.parse(JSON.stringify(val.baseline.inputs)), val.settings);
      let modificationResults: PsatOutputs = this.psatService.resultsModified(JSON.parse(JSON.stringify(val.modification.inputs)), val.settings);
      this.selectedPsatResults.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
  }
}

