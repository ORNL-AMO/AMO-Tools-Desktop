import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsatService } from '../psat/psat.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { AllPsatResultsData, PsatCompare, PsatResultsData, ReportItem, ReportUtilityTotal } from './report-rollup-models';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class PsatReportRollupService {
  psatAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedPsats: BehaviorSubject<Array<PsatCompare>>;
  selectedPsatResults: Array<PsatResultsData>;
  allPsatResults: Array<AllPsatResultsData>;
  totals: ReportUtilityTotal;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) {
    this.initSummary();
  }

  initSummary() {
    this.psatAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedPsats = new BehaviorSubject<Array<PsatCompare>>(new Array<PsatCompare>());
    this.selectedPsatResults = new Array<PsatResultsData>();
    this.allPsatResults = new Array<AllPsatResultsData>();
    this.totals = {
      totalEnergy: 0,
      totalCost: 0,
      savingPotential: 0,
      energySavingsPotential: 0,
      fuelEnergy: 0,
      electricityEnergy: 0
    }
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

  setTotals(settings: Settings) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.selectedPsatResults.forEach(result => {
      let diffCost = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annual_cost;
      let diffEnergy = result.baselineResults.annual_energy - result.modificationResults.annual_energy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annual_energy;
    });
    sumEnergySavings = this.convertUnitsService.value(sumEnergySavings).from('MWh').to(settings.pumpsRollupUnit);
    sumEnergy = this.convertUnitsService.value(sumEnergy).from('MWh').to(settings.pumpsRollupUnit);
    this.totals = {
      totalEnergy: sumEnergy,
      totalCost: sumCost,
      energySavingsPotential: sumEnergySavings,
      savingPotential: sumSavings,
      electricityEnergy: sumEnergy + sumEnergySavings,
      fuelEnergy: 0
    }
  }
}

