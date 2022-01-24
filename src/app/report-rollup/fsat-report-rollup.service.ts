import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllFsatResultsData, FsatCompare, FsatResultsData, ReportItem, ReportUtilityTotal } from './report-rollup-models';
import * as _ from 'lodash';
import { FsatService } from '../fsat/fsat.service';
import { FsatOutput } from '../shared/models/fans';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class FsatReportRollupService {

  fsatAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedFsats: BehaviorSubject<Array<FsatCompare>>;
  selectedFsatResults: Array<FsatResultsData>;
  allFsatResults: Array<AllFsatResultsData>;
  totals: ReportUtilityTotal;
  constructor(private fsatService: FsatService, private convertUnitsService: ConvertUnitsService) { }

  initSummary() {
    this.fsatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedFsats = new BehaviorSubject<Array<FsatCompare>>(new Array<FsatCompare>());
    this.selectedFsatResults = new Array<FsatResultsData>();
    this.allFsatResults = new Array<AllFsatResultsData>();
    this.totals = {
      totalEnergy: 0,
      totalCost: 0,
      savingPotential: 0,
      energySavingsPotential: 0,
      fuelEnergy: 0,
      electricityEnergy: 0,
      carbonEmissions: 0,
      carbonSavings: 0
    }
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

  setTotals(settings: Settings) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    let sumCo2Emissions = 0;
    let sumCo2Savings = 0;
    this.selectedFsatResults.forEach(result => {
      let diffCost = result.baselineResults.annualCost - result.modificationResults.annualCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annualCost;
      let diffEnergy = result.baselineResults.annualEnergy - result.modificationResults.annualEnergy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annualEnergy;
      let diffCO2 = result.baselineResults.co2EmissionsOutput - result.modificationResults.co2EmissionsOutput;
      sumCo2Savings += diffCO2;
      sumCo2Emissions += result.modificationResults.co2EmissionsOutput;
    })
    sumEnergy = this.convertUnitsService.value(sumEnergy).from('MWh').to(settings.fansRollupUnit);
    sumEnergySavings = this.convertUnitsService.value(sumEnergySavings).from('MWh').to(settings.fansRollupUnit);
    this.totals = {
      energySavingsPotential: sumEnergySavings,
      totalEnergy: sumEnergy,
      savingPotential: sumSavings,
      totalCost: sumCost,
      electricityEnergy: sumEnergy + sumEnergySavings,
      fuelEnergy: 0,
      carbonEmissions: sumCo2Emissions,
      carbonSavings: sumCo2Savings
    }
  }
}
