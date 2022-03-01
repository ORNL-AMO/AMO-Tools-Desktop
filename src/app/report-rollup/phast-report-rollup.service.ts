import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastResultsService } from '../phast/phast-results.service';
import { AllPhastResultsData, PhastCompare, PhastResultsData, ReportItem, ReportUtilityTotal } from './report-rollup-models';
import * as _ from 'lodash';
import { ExecutiveSummaryService } from '../phast/phast-report/executive-summary.service';
import { ExecutiveSummary } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class PhastReportRollupService {

  phastAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedPhasts: BehaviorSubject<Array<PhastCompare>>;
  selectedPhastResults: Array<PhastResultsData>;
  allPhastResults: Array<AllPhastResultsData>;
  totals: ReportUtilityTotal;
  constructor(
    private executiveSummaryService: ExecutiveSummaryService,
    private phastResultsService: PhastResultsService,
    private convertUnitsService: ConvertUnitsService) {
    this.initSummary();
  }

  initSummary() {
    this.phastAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedPhasts = new BehaviorSubject<Array<PhastCompare>>(new Array<PhastCompare>());
    this.selectedPhastResults = new Array<PhastResultsData>();
    this.allPhastResults = new Array<AllPhastResultsData>();
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

  //USED FOR PHAST SUMMARY
  initPhastCompare() {
    let tmpResults: Array<PhastCompare> = new Array<PhastCompare>();
    this.allPhastResults.forEach(result => {
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

  setAllPhastResults(phastArray: Array<ReportItem>) {
    this.allPhastResults = new Array<AllPhastResultsData>();
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
            this.allPhastResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<ExecutiveSummary>();
            let tmpResults = this.executiveSummaryService.getSummary(val.assessment.phast, true, val.settings, val.assessment.phast, baselineResults);
            modResultsArr.push(tmpResults);
            this.allPhastResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<ExecutiveSummary>();
          let tmpResults = this.executiveSummaryService.getSummary(val.assessment.phast, true, val.settings, val.assessment.phast, baselineResults);
          modResultsArr.push(tmpResults);
          this.allPhastResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setPhastResultsFromSelected(selectedPhasts: Array<PhastCompare>) {
    this.selectedPhastResults = new Array<PhastResultsData>();
    selectedPhasts.forEach(val => {
      let baselineResults = this.executiveSummaryService.getSummary(val.baseline, false, val.settings, val.baseline);
      let modificationResults = this.executiveSummaryService.getSummary(val.modification, true, val.settings, val.baseline, baselineResults);
      let baselineResultData = this.phastResultsService.getResults(val.baseline, val.settings);
      let modificationResultData = this.phastResultsService.getResults(val.modification, val.settings);
      this.selectedPhastResults.push({
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
  }

  setTotals(settings: Settings) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    let fuelEnergy = 0;
    let electricityEnergy = 0
    let sumCo2Emissions = 0;
    let sumCo2Savings = 0;
    let diffCO2: number = 0;
    this.selectedPhastResults.forEach(result => {
      //use copy for conversions
      let resultCopy: PhastResultsData = JSON.parse(JSON.stringify(result))
      let diffCost = result.modificationResults.annualCostSavings;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annualCost;
      let convertedEnergySavings = this.convertUnitsService.value(resultCopy.modificationResults.annualEnergySavings).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
      sumEnergySavings += convertedEnergySavings;
      
      if (result.settings.energySourceType == 'Steam' || result.settings.energySourceType == 'Fuel') {
        let convertedSumEnergy = this.convertUnitsService.value(resultCopy.modificationResults.annualEnergyUsed).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
        sumEnergy += convertedSumEnergy;
        fuelEnergy += convertedSumEnergy + convertedEnergySavings;

      }else if (result.settings.energySourceType == 'Electricity') {
        let modificationElectricalEnergy: number;
        let baselineElectricalEnergy: number;
        let modificationFuelEnergy: number;
        let baselineFuelEnergy: number;

        if (result.settings.furnaceType === 'Electric Arc Furnace (EAF)') {
          modificationElectricalEnergy = this.convertUnitsService.value(resultCopy.modificationResultData.annualEAFResults.electricEnergyUsed).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
          baselineElectricalEnergy = this.convertUnitsService.value(resultCopy.baselineResultData.annualEAFResults.electricEnergyUsed).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
          
          modificationFuelEnergy = this.convertEAFFuelEnergy(resultCopy.modificationResultData.annualEAFResults.totalFuelEnergyUsed, result.settings, settings.phastRollupUnit);
          baselineFuelEnergy = this.convertEAFFuelEnergy(resultCopy.baselineResultData.annualEAFResults.totalFuelEnergyUsed, result.settings, settings.phastRollupUnit);
        } else {
          modificationElectricalEnergy = this.convertUnitsService.value(resultCopy.modificationResultData.electricalHeatDelivered).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
          baselineElectricalEnergy = this.convertUnitsService.value(resultCopy.baselineResultData.electricalHeatDelivered).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
          
          modificationFuelEnergy = resultCopy.modificationResultData.energyInputHeatDelivered + resultCopy.modificationResultData.totalExhaustGas;
          baselineFuelEnergy = resultCopy.baselineResultData.energyInputHeatDelivered + resultCopy.baselineResultData.totalExhaustGas;
          modificationFuelEnergy = this.convertUnitsService.value(modificationFuelEnergy).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
          baselineFuelEnergy = this.convertUnitsService.value(baselineFuelEnergy).from(result.settings.energyResultUnit).to(settings.phastRollupUnit);
        }
        modificationElectricalEnergy = this.convertEAFFuelEnergy(modificationElectricalEnergy, result.settings, settings.phastRollupUnit);
        baselineElectricalEnergy = this.convertEAFFuelEnergy(baselineElectricalEnergy, result.settings, settings.phastRollupUnit);

        electricityEnergy += modificationElectricalEnergy;
        let fuelEnergySavings: number = baselineFuelEnergy - modificationFuelEnergy;
        let electricalEnergySavings: number = baselineElectricalEnergy - modificationElectricalEnergy;
        fuelEnergy += modificationFuelEnergy + fuelEnergySavings + electricalEnergySavings;
        sumEnergy += modificationFuelEnergy + modificationElectricalEnergy;
      }

      if (result.baselineResults.co2EmissionsOutput) {
        diffCO2 = result.baselineResults.co2EmissionsOutput.totalEmissionOutput - result.modificationResults.co2EmissionsOutput.totalEmissionOutput;
        sumCo2Savings += diffCO2;
      } 
      if (result.modificationResults.co2EmissionsOutput) {
        sumCo2Emissions += result.modificationResults.co2EmissionsOutput.totalEmissionOutput;
      }
    });
    this.totals = {
      savingPotential: sumSavings,
      energySavingsPotential: sumEnergySavings,
      totalCost: sumCost,
      totalEnergy: sumEnergy,
      electricityEnergy: electricityEnergy,
      fuelEnergy: fuelEnergy,
      carbonEmissions: sumCo2Emissions,
      carbonSavings: sumCo2Savings
    }
  }

  convertResult(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

  convertEAFFuelEnergy(fuelEnergy: number, resultSettings: Settings, conversionUnit: string) {
    if (resultSettings.unitsOfMeasure === 'Metric') {
      return this.convertUnitsService.value(fuelEnergy).from('GJ').to(conversionUnit);
    } else {
      return this.convertUnitsService.value(fuelEnergy).from('MMBtu').to(conversionUnit);
    }
  }


}
