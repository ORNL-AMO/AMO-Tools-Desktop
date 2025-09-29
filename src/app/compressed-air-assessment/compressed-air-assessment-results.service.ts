import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ImproveEndUseEfficiency, EndUseEfficiencyReductionData, ProfilesForPrint } from '../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService } from './compressed-air-calculation.service';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { BaselineResults, CompressedAirAssessmentResult, DayTypeModificationResult, EemSavingsResults } from './calculations/caCalculationModels';
import { getEmptyEemSavings, getTotalCapacity, getTotalPower } from './calculations/caCalculationHelpers';
import { CompressedAirAssessmentBaselineResults } from './calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from './calculations/modifications/CompressedAirAssessmentModificationResults';
import { roundVal } from '../shared/helperFunctions';
import { CompressedAirCombinedDayTypeResults } from './calculations/modifications/CompressedAirCombinedDayTypeResults';

@Injectable()
export class CompressedAirAssessmentResultsService {

  constructor(private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }

    let compressedAirAssessment: CompressedAirAssessment = integratedAssessment.assessment.compressedAirAssessment;
    let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(integratedAssessment.assessment.compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
    let baselineOutputs: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
    baselineOutputs.total.energyUse = roundVal(baselineOutputs.total.energyUse, 0);

    energyOptions.baseline = {
      name: compressedAirAssessment.name,
      annualEnergy: baselineOutputs.total.energyUse,
      annualCost: baselineOutputs.total.cost,
      co2EmissionsOutput: baselineOutputs.total.annualEmissionOutput,
      energyThDisplayUnits: 'kWh'
    };

    let baselineEnergy: EnergyUseItem = {
      type: 'Electricity',
      amount: baselineOutputs.total.energyUse,
      integratedEnergyCost: baselineOutputs.total.cost,
      integratedEmissionRate: baselineOutputs.total.annualEmissionOutput
    };

    integratedAssessment.hasModifications = integratedAssessment.assessment.compressedAirAssessment.modifications && integratedAssessment.assessment.compressedAirAssessment.modifications.length !== 0;
    if (integratedAssessment.hasModifications) {
      let modificationEnergyOptions: Array<ModificationEnergyOption> = [];
      compressedAirAssessment.modifications.forEach(modification => {
        let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(compressedAirAssessment, modification, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);

        let modificationOutputs: CompressedAirAssessmentResult = compressedAirAssessmentModificationResults.getModificationResults();
        modificationOutputs.totalModificationPower = roundVal(modificationOutputs.totalModificationPower, 0);
        let combineDayTypeResults: DayTypeModificationResult = new CompressedAirCombinedDayTypeResults(compressedAirAssessmentModificationResults).getDayTypeModificationResult();

        energyOptions.modifications.push({
          name: modification.name,
          annualEnergy: modificationOutputs.totalModificationPower,
          annualCost: modificationOutputs.totalModificationCost,
          modificationId: modification.modificationId,
          co2EmissionsOutput: combineDayTypeResults.annualEmissionOutput
        });


        let modificationEnergy: EnergyUseItem = {
          type: 'Electricity',
          amount: modificationOutputs.totalModificationPower,
          integratedEnergyCost: modificationOutputs.totalModificationCost,
          integratedEmissionRate: combineDayTypeResults.annualEmissionOutput
        }

        modificationEnergyOptions.push(
          {
            modificationId: modification.modificationId,
            energies: [modificationEnergy]
          })
      });
      integratedAssessment.modificationEnergyUseItems = modificationEnergyOptions;
    }
    integratedAssessment.assessmentType = 'CompressedAir';
    integratedAssessment.baselineEnergyUseItems = [baselineEnergy];
    integratedAssessment.thEquipmentType = 'compressedAir';
    integratedAssessment.energyOptions = energyOptions;
    integratedAssessment.navigation = {
      queryParams: undefined,
      url: '/compressed-air/' + integratedAssessment.assessment.id
    }
  }

  getProfileSummariesForPrinting(profileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    profileSummary.forEach(summary => {
      summary.profileSummaryForPrint = new Array<Array<ProfileSummaryData>>();
      let numberOfBreaks: number = summary.profileSummaryData.length / 12;
      if (numberOfBreaks > 1) {
        let start: number = 0;
        let end: number = 12;
        for (let i = 0; i < numberOfBreaks; i++) {
          summary.profileSummaryForPrint.push(summary.profileSummaryData.slice(start, end));
          start += 12;
          end += 12;
        }
      } else {
        summary.profileSummaryForPrint.push(summary.profileSummaryData);
      }
    });
    return profileSummary;
  }

  getProfileSummariesTotalsForPrinting(totals: Array<ProfileSummaryTotal>): Array<Array<ProfileSummaryTotal>> {
    let totalsForPrint: Array<Array<ProfileSummaryTotal>> = new Array<Array<ProfileSummaryTotal>>();
    let numberOfBreaks: number = totals.length / 12;
    if (numberOfBreaks > 1) {
      let start: number = 0;
      let end: number = 12;
      for (let i = 0; i < numberOfBreaks; i++) {
        totalsForPrint.push(totals.slice(start, end));
        start += 12;
        end += 12;
      }
    } else {
      totalsForPrint.push(totals);
    }
    return totalsForPrint;
  }

  setProfileSummariesForPrinting(compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults): Array<ProfilesForPrint> {
    let profliesForPrint: Array<ProfilesForPrint> = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.map(dayTypeProfileSummary => {
      return {
        dayType: dayTypeProfileSummary.dayType,
        profileSummary: dayTypeProfileSummary.profileSummary,
        totalsForPrint: this.getProfileSummariesTotalsForPrinting(dayTypeProfileSummary.profileSummaryTotals)
      }
    });
    return profliesForPrint;
  }

}
