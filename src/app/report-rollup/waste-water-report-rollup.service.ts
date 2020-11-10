import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WasteWaterService } from '../waste-water/waste-water.service';
import { AllWasteWaterResultsData, ReportItem, WasteWaterCompare, WasteWaterResultsData } from './report-rollup-models';
import * as _ from 'lodash';
import { WasteWaterResults } from '../shared/models/waste-water';
@Injectable()
export class WasteWaterReportRollupService {

  wasteWaterAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedWasteWater: BehaviorSubject<Array<WasteWaterCompare>>;
  selectedWasteWaterResults: Array<WasteWaterResultsData>;
  allWasteWaterResults: Array<AllWasteWaterResultsData>;
  constructor(
    private wasteWaterService: WasteWaterService) { }

  initSummary() {
    this.wasteWaterAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedWasteWater = new BehaviorSubject<Array<WasteWaterCompare>>(new Array<WasteWaterCompare>());
    this.selectedWasteWaterResults = new Array<WasteWaterResultsData>();
    this.allWasteWaterResults = new Array<AllWasteWaterResultsData>();
  }

  //WASTE WATER
  initWasteWaterCompare() {
    let tmpResults: Array<WasteWaterCompare> = new Array<WasteWaterCompare>();
    this.allWasteWaterResults.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.AeCost; });
      let modIndex;
      if (minCost != undefined) {
        modIndex = _.findIndex(result.modificationResults, (result) => { return result.AeCost == minCost.AeCost });
      }
      let wasteWaterAssessments: Array<ReportItem> = this.wasteWaterAssessments.value;
      let assessmentIndex = _.findIndex(wasteWaterAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item = wasteWaterAssessments[assessmentIndex];
      if (result.isBaseline || modIndex == undefined || modIndex == -1) {
        tmpResults.push({ baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.baselineData, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.modifications[modIndex], assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedWasteWater.next(tmpResults);
  }

  updateSelectedWasteWater(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedWasteWater.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.modifications[modIndex], assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.baselineData, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedWasteWater.next(tmpSelected);
  }

  setAllWasteWaterResults(wasteWaterArr: Array<ReportItem>) {
    this.allWasteWaterResults = new Array<AllWasteWaterResultsData>();
    wasteWaterArr.forEach(val => {
      if (val.assessment.wasteWater.setupDone) {
        //get results
        val.assessment.wasteWater.baselineData.outputs = this.wasteWaterService.calculateResults(val.assessment.wasteWater.baselineData.activatedSludgeData, val.assessment.wasteWater.baselineData.aeratorPerformanceData, val.assessment.wasteWater.systemBasics, val.settings);
        let baselineResults: WasteWaterResults = val.assessment.wasteWater.baselineData.outputs;
        if (val.assessment.wasteWater.modifications) {
          if (val.assessment.wasteWater.modifications.length !== 0) {
            let modResultsArr = new Array<WasteWaterResults>();
            val.assessment.wasteWater.modifications.forEach(mod => {
              mod.outputs = this.wasteWaterService.calculateResults(mod.activatedSludgeData, mod.aeratorPerformanceData, val.assessment.wasteWater.systemBasics, val.settings, baselineResults);
              let tmpResults: WasteWaterResults = mod.outputs;
              modResultsArr.push(tmpResults);
            });
            this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<WasteWaterResults>();
            modResultsArr.push(baselineResults);
            this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<WasteWaterResults>();
          modResultsArr.push(baselineResults);
          this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setWasteWaterResultsFromSelected(selectedWasteWater: Array<WasteWaterCompare>) {
    this.selectedWasteWaterResults = new Array<WasteWaterResultsData>();
    selectedWasteWater.forEach(val => {
      let baselineResults: WasteWaterResults = val.baseline.outputs;
      let modificationResults: WasteWaterResults = val.modification.outputs;
      this.selectedWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });
  }
}
