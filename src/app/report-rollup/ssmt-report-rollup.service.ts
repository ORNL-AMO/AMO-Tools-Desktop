import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SsmtService } from '../ssmt/ssmt.service';
import { AllSsmtResultsData, ReportItem, ReportUtilityTotal, SsmtCompare, SsmtResultsData } from './report-rollup-models';
import * as _ from 'lodash';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';

@Injectable()
export class SsmtReportRollupService {
  
  ssmtAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedSsmt: BehaviorSubject<Array<SsmtCompare>>;
  selectedSsmtResults: Array<SsmtResultsData>;
  allSsmtResults:Array<AllSsmtResultsData>;
  totals: ReportUtilityTotal;
  constructor(private ssmtService: SsmtService, private convertUnitsService: ConvertUnitsService) { }

  initSummary(){
    this.ssmtAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedSsmt = new BehaviorSubject<Array<SsmtCompare>>(new Array<SsmtCompare>());
    this.selectedSsmtResults = new Array<SsmtResultsData>();
    this.allSsmtResults = new Array<AllSsmtResultsData>();
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

  //used for ssmt summary
  initSsmtCompare() {
    let tmpResults: Array<SsmtCompare> = new Array<SsmtCompare>();
    this.allSsmtResults.forEach(result => {
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

  setAllSsmtResults(ssmtArr: Array<ReportItem>) {
    this.allSsmtResults = new Array<AllSsmtResultsData>();
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
            this.allSsmtResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<SSMTOutput>();
            modResultsArr.push(baselineResults);
            this.allSsmtResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<SSMTOutput>();
          modResultsArr.push(baselineResults);
          this.allSsmtResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setSsmtResultsFromSelected(selectedSsmt: Array<SsmtCompare>) {
    this.selectedSsmtResults = new Array<SsmtResultsData>();
    selectedSsmt.forEach(val => {
      let baselineResults: SSMTOutput = val.baseline.outputData;
      let modificationResults: SSMTOutput = val.modification.outputData;
      this.selectedSsmtResults.push({ baselineResults: baselineResults, modificationResults: modificationResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
    });

  }

  setTotals(settings: Settings){
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    let sumCo2Emissions = 0;
    let sumCo2Savings = 0;
    this.selectedSsmtResults.forEach(result => {
      //need to convert fuel usage from result setting to common unit
      let resultsCopy: SsmtResultsData = JSON.parse(JSON.stringify(result));
      resultsCopy.baselineResults.operationsOutput.boilerFuelUsage = this.convertUnitsService.value(resultsCopy.baselineResults.operationsOutput.boilerFuelUsage).from(result.settings.steamEnergyMeasurement).to(settings.steamRollupUnit);
      resultsCopy.modificationResults.operationsOutput.boilerFuelUsage = this.convertUnitsService.value(resultsCopy.modificationResults.operationsOutput.boilerFuelUsage).from(result.settings.steamEnergyMeasurement).to(settings.steamRollupUnit);

      let diffCost = result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.operationsOutput.totalOperatingCost;
      let diffEnergy = resultsCopy.baselineResults.operationsOutput.boilerFuelUsage - resultsCopy.modificationResults.operationsOutput.boilerFuelUsage;
      sumEnergySavings += diffEnergy;
      sumEnergy += resultsCopy.modificationResults.operationsOutput.boilerFuelUsage;
      let diffCO2 = resultsCopy.baselineResults.co2EmissionsOutput.totalEmissionOutput - resultsCopy.modificationResults.co2EmissionsOutput.totalEmissionOutput;
      sumCo2Savings += diffCO2;
      sumCo2Emissions += resultsCopy.modificationResults.co2EmissionsOutput.totalEmissionOutput;
    });
    this.totals = {
      totalCost: sumCost,
      totalEnergy: sumEnergy,
      energySavingsPotential: sumEnergySavings,
      savingPotential: sumSavings,
      fuelEnergy: sumEnergy + sumEnergySavings,
      electricityEnergy: 0,
      carbonEmissions: sumCo2Emissions,
      carbonSavings: sumCo2Savings
    }
  }

}
