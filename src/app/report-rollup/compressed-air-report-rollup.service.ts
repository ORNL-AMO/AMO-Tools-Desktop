import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllCompressedAirResultsData, CompressedAirCompare, CompressedAirResultsData, ReportItem, ReportUtilityTotal } from './report-rollup-models';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { BaselineResults, DayTypeModificationResult } from '../compressed-air-assessment/calculations/caCalculationModels';
import { CompressedAirCalculationService } from '../compressed-air-assessment/compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentBaselineResults } from '../compressed-air-assessment/calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from '../compressed-air-assessment/calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirCombinedDayTypeResults } from '../compressed-air-assessment/calculations/modifications/CompressedAirCombinedDayTypeResults';
import { CompressedAirAssessmentValidation, CompressedAirModificationValid } from '../compressed-air-assessment/compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { CompressedAirAssessmentValidationService } from '../compressed-air-assessment/compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { ExploreOpportunitiesValidationService } from '../compressed-air-assessment/compressed-air-assessment-validation/explore-opportunities-validation.service';
import { CompressedAirDayType, ProfileSummary, ProfileSummaryTotal } from '../shared/models/compressed-air-assessment';
import { CompressedAirBaselineDayTypeProfileSummary } from '../compressed-air-assessment/calculations/CompressedAirBaselineDayTypeProfileSummary';
@Injectable()
export class CompressedAirReportRollupService {

  compressedAirAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedAssessments: BehaviorSubject<Array<CompressedAirCompare>>;
  selectedAssessmentResults: Array<CompressedAirResultsData>;
  allAssessmentResults: Array<AllCompressedAirResultsData>;
  totals: ReportUtilityTotal;
  constructor(private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private convertUnitsService: ConvertUnitsService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) {
    this.initSummary();
  }

  initSummary() {
    this.compressedAirAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedAssessments = new BehaviorSubject<Array<CompressedAirCompare>>(new Array<CompressedAirCompare>());
    this.selectedAssessmentResults = new Array<CompressedAirResultsData>();
    this.allAssessmentResults = new Array<AllCompressedAirResultsData>();
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

    //USED FOR Compressed air  SUMMARY
  initCompressedAirCompare() {
    let tmpResults: Array<CompressedAirCompare> = new Array<CompressedAirCompare>();
    let compressedAirAssessments: Array<ReportItem> = this.compressedAirAssessments.value;
    this.allAssessmentResults.forEach(result => {
      let assessmentIndex: number = compressedAirAssessments.findIndex(val => val.assessment.id === result.assessmentId);
      let item: ReportItem = compressedAirAssessments[assessmentIndex];

      const baselineResults: CompressedAirCompare = { baseline: item.assessment.compressedAirAssessment, modification: undefined, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings };
      if (result.isBaseline) {
        tmpResults.push(baselineResults);
      } else {
        const modificationResults: Array<DayTypeModificationResult> = result.modificationResults || [];
        if (modificationResults.length === 0) {
          tmpResults.push(baselineResults);
        } else {
          const minCost: DayTypeModificationResult = _.minBy(modificationResults, (res: DayTypeModificationResult) => { return res.totalAnnualOperatingCost; });
          let modIndex: number = modificationResults.indexOf(minCost);
          if (modIndex === -1) {
            modIndex = 0;
          }
          tmpResults.push({ baseline: item.assessment.compressedAirAssessment, modification: item.assessment.compressedAirAssessment.modifications[modIndex], assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
        }
      }
    });
    this.selectedAssessments.next(tmpResults);
  }

  updateSelectedCompressorAssessments(item: ReportItem, modIndex: number) {
    let tmpSelected: Array<CompressedAirCompare> = this.selectedAssessments.value;
    if (modIndex !== -1) {
      let selectedIndex: number = tmpSelected.findIndex(val => val.assessmentId === item.assessment.id);
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.compressedAirAssessment, modification: item.assessment.compressedAirAssessment.modifications[modIndex], assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex: number = tmpSelected.findIndex(val => val.assessmentId === item.assessment.id);
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.compressedAirAssessment, modification: undefined, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedAssessments.next(tmpSelected);
  }

  setAllAssessmentResults(assessmentArr: Array<ReportItem>) {
    this.allAssessmentResults = new Array<AllCompressedAirResultsData>();
    assessmentArr.forEach(val => {
      let validationStatus: CompressedAirAssessmentValidation = this.compressedAirAssessmentValidationService.validateCompressedAirAssessment(val.assessment.compressedAirAssessment, val.settings);

      if (validationStatus.baselineValid) {
        let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(val.assessment.compressedAirAssessment, val.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
        let baselineResults: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
        if (val.assessment.compressedAirAssessment.modifications) {
          if (val.assessment.compressedAirAssessment.modifications.length !== 0) {
            let baselineProfileSummaries: Array<{ profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }> = new Array();
            val.assessment.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
              let compressedAirBaselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(summary => { return summary.dayType.dayTypeId == dayType.dayTypeId });
              let profileSummary: Array<ProfileSummary> = compressedAirBaselineDayTypeProfileSummary.profileSummary;
              let profileSummaryTotals: Array<ProfileSummaryTotal> = compressedAirBaselineDayTypeProfileSummary.profileSummaryTotals;
              baselineProfileSummaries.push({
                dayType: dayType,
                profileSummary: profileSummary,
                profileSummaryTotals: profileSummaryTotals
              });
            });
            let modResultsArr: Array<DayTypeModificationResult> = new Array<DayTypeModificationResult>();
            val.assessment.compressedAirAssessment.modifications.forEach(mod => {
              let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(val.assessment.compressedAirAssessment, mod, val.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
              let modificationValid: CompressedAirModificationValid = this.exploreOpportunitiesValidationService.setModificationValid(mod, baselineResults, baselineProfileSummaries, val.assessment.compressedAirAssessment, val.settings, compressedAirAssessmentModificationResults);
              if (modificationValid.isValid) {
                let compressedAirCombinedDayTypeResults: CompressedAirCombinedDayTypeResults = new CompressedAirCombinedDayTypeResults(compressedAirAssessmentModificationResults);
                let combinedResults: DayTypeModificationResult = compressedAirCombinedDayTypeResults.getDayTypeModificationResult();
                modResultsArr.push(combinedResults);
              }
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
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(val.assessment.compressedAirAssessment, val.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      let baselineResults: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
      if (val.modification) {
        let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(val.assessment.compressedAirAssessment, val.modification, val.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
        let compressedAirCombinedDayTypeResults: CompressedAirCombinedDayTypeResults = new CompressedAirCombinedDayTypeResults(compressedAirAssessmentModificationResults);
        let combinedResults: DayTypeModificationResult = compressedAirCombinedDayTypeResults.getDayTypeModificationResult();
        this.selectedAssessmentResults.push({ baselineResults: baselineResults, modificationResults: combinedResults, assessmentId: val.assessmentId, name: val.name, modName: val.modification.name, baseline: val.baseline, modification: val.modification, settings: val.settings });
      } else {
        this.selectedAssessmentResults.push({ baselineResults: baselineResults, modificationResults: undefined, assessmentId: val.assessmentId, name: val.name, modName: 'Baseline', baseline: val.baseline, modification: val.modification, settings: val.settings });
      }
    });
  }

  setTotals(settings: Settings) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    let sumCo2Emissions = 0;
    let sumCo2Savings = 0;
    this.selectedAssessmentResults.forEach(result => {
      let diffCost: number = 0;
      let diffEnergy: number = 0;
      if (result.modificationResults) {
        diffCost = result.baselineResults.total.totalAnnualOperatingCost - result.modificationResults.totalAnnualOperatingCost;
        sumCost += result.modificationResults.totalAnnualOperatingCost;
        diffEnergy = result.baselineResults.total.energyUse - result.modificationResults.allSavingsResults.adjustedResults.power;
        sumEnergy += result.modificationResults.allSavingsResults.adjustedResults.power;
        // * results already in ton/tonne (calculated from assessment)
        sumCo2Savings += result.modificationResults.allSavingsResults.savings.annualEmissionOutputSavings;
        sumCo2Emissions += result.modificationResults.annualEmissionOutput;
      } else {
        sumCost += result.baselineResults.total.totalAnnualOperatingCost;
        sumEnergy += result.baselineResults.total.energyUse;
        // * results already in ton/tonne (calculated from assessment)
        sumCo2Emissions += result.baselineResults.total.annualEmissionOutput;
      }
      sumSavings += diffCost;
      sumEnergySavings += diffEnergy;
    })
    sumEnergy = this.convertUnitsService.value(sumEnergy).from('kWh').to(settings.compressedAirRollupUnit);
    sumEnergySavings = this.convertUnitsService.value(sumEnergySavings).from('kWh').to(settings.compressedAirRollupUnit);
    this.totals = {
      savingPotential: sumSavings,
      energySavingsPotential: sumEnergySavings,
      totalCost: sumCost,
      totalEnergy: sumEnergy,
      electricityEnergy: sumEnergy + sumEnergySavings,
      fuelEnergy: 0,
      carbonEmissions: sumCo2Emissions,
      carbonSavings: sumCo2Savings
    }
  }
}
