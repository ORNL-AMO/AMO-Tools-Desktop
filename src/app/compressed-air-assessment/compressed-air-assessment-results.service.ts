import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ReduceSystemAirPressure, Modification, ProfileSummary, ReduceRuntime, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntimeData, ImproveEndUseEfficiency, ReduceAirLeaks, UseAutomaticSequencer, AdjustCascadingSetPoints, CascadingSetPointData, EndUseEfficiencyReductionData, CompressorSummary, ProfilesForPrint, SystemInformation } from '../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from './compressed-air-calculation.service';
import * as _ from 'lodash';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { AdjustProfileResults, BaselineResult, BaselineResults, CompressedAirAssessmentResult, DayTypeModificationResult, DayTypeProfileSummary, EemSavingsResults, FlowReallocationSummary, SavingsItem } from './calculations/caCalculationModels';
import { getEmptyEemSavings, getProfileSummaryDataAverages, getTotalCapacity, getTotalPower } from './calculations/caCalculationHelpers';
import { CompressedAirAssessmentBaselineResults } from './calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from './calculations/modifications/CompressedAirAssessmentModificationResults';

@Injectable()
export class CompressedAirAssessmentResultsService {

  constructor(private compressedAirCalculationService: CompressedAirCalculationService,
    private performancePointCalculationsService: PerformancePointCalculationsService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private convertUnitsService: ConvertUnitsService) { }

  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }

    let compressedAirAssessment: CompressedAirAssessment = integratedAssessment.assessment.compressedAirAssessment;
    let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(integratedAssessment.assessment.compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
    let baselineOutputs: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
    baselineOutputs.total.energyUse = this.convertUnitsService.roundVal(baselineOutputs.total.energyUse, 0);

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
        modificationOutputs.totalModificationPower = this.convertUnitsService.roundVal(modificationOutputs.totalModificationPower, 0);
        let combineDayTypeResults: DayTypeModificationResult = this.combineDayTypeResults(modificationOutputs, baselineOutputs);

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

  combineDayTypeResults(modificationResults: CompressedAirAssessmentResult, baselineResults: BaselineResults): DayTypeModificationResult {
    let dayTypeModificationResult: DayTypeModificationResult = {
      adjustedProfileSummary: [],
      adjustedCompressors: [],
      profileSummaryTotals: [],
      allSavingsResults: getEmptyEemSavings(),
      flowReallocationSavings: getEmptyEemSavings(),
      addReceiverVolumeSavings: getEmptyEemSavings(),
      adjustCascadingSetPointsSavings: getEmptyEemSavings(),
      improveEndUseEfficiencySavings: getEmptyEemSavings(),
      reduceAirLeaksSavings: getEmptyEemSavings(),
      reduceRunTimeSavings: getEmptyEemSavings(),
      reduceSystemAirPressureSavings: getEmptyEemSavings(),
      useAutomaticSequencerSavings: getEmptyEemSavings(),
      reduceRunTimeProfileSummary: undefined,
      flowAllocationProfileSummary: undefined,
      reduceAirLeaksProfileSummary: undefined,
      addReceiverVolumeProfileSummary: undefined,
      useAutomaticSequencerProfileSummary: undefined,
      improveEndUseEfficiencyProfileSummary: undefined,
      reduceSystemAirPressureProfileSummary: undefined,
      adjustCascadingSetPointsProfileSummary: undefined,
      dayTypeId: undefined,
      dayTypeName: undefined,
      auxiliaryPowerUsage: { cost: 0, energyUse: 0 },
      peakDemand: 0,
      peakDemandCost: 0,
      peakDemandCostSavings: 0,
      totalAnnualOperatingCost: 0,
      annualEmissionOutput: 0
    }
    modificationResults.dayTypeModificationResults.forEach(modResult => {

      dayTypeModificationResult.allSavingsResults.savings.cost += modResult.allSavingsResults.savings.cost;
      dayTypeModificationResult.allSavingsResults.savings.power += modResult.allSavingsResults.savings.power;

      dayTypeModificationResult.allSavingsResults.baselineResults.cost += modResult.allSavingsResults.baselineResults.cost;
      dayTypeModificationResult.allSavingsResults.baselineResults.power += modResult.allSavingsResults.baselineResults.power;

      dayTypeModificationResult.allSavingsResults.adjustedResults.cost += modResult.allSavingsResults.adjustedResults.cost;
      dayTypeModificationResult.allSavingsResults.adjustedResults.power += modResult.allSavingsResults.adjustedResults.power;
      dayTypeModificationResult.annualEmissionOutput += modResult.allSavingsResults.adjustedResults.annualEmissionOutput;

      dayTypeModificationResult.flowReallocationSavings.savings.cost += modResult.flowReallocationSavings.savings.cost;
      dayTypeModificationResult.flowReallocationSavings.savings.power += modResult.flowReallocationSavings.savings.power;

      dayTypeModificationResult.addReceiverVolumeSavings.savings.cost += modResult.addReceiverVolumeSavings.savings.cost;
      dayTypeModificationResult.addReceiverVolumeSavings.savings.power += modResult.addReceiverVolumeSavings.savings.power;

      dayTypeModificationResult.adjustCascadingSetPointsSavings.savings.cost += modResult.adjustCascadingSetPointsSavings.savings.cost;
      dayTypeModificationResult.adjustCascadingSetPointsSavings.savings.power += modResult.adjustCascadingSetPointsSavings.savings.power;

      dayTypeModificationResult.improveEndUseEfficiencySavings.savings.cost += modResult.improveEndUseEfficiencySavings.savings.cost;
      dayTypeModificationResult.improveEndUseEfficiencySavings.savings.power += modResult.improveEndUseEfficiencySavings.savings.power;

      dayTypeModificationResult.reduceAirLeaksSavings.savings.cost += modResult.reduceAirLeaksSavings.savings.cost;
      dayTypeModificationResult.reduceAirLeaksSavings.savings.power += modResult.reduceAirLeaksSavings.savings.power;

      dayTypeModificationResult.reduceRunTimeSavings.savings.cost += modResult.reduceRunTimeSavings.savings.cost;
      dayTypeModificationResult.reduceRunTimeSavings.savings.power += modResult.reduceRunTimeSavings.savings.power;

      dayTypeModificationResult.reduceSystemAirPressureSavings.savings.cost += modResult.reduceSystemAirPressureSavings.savings.cost;
      dayTypeModificationResult.reduceSystemAirPressureSavings.savings.power += modResult.reduceSystemAirPressureSavings.savings.power;

      dayTypeModificationResult.useAutomaticSequencerSavings.savings.cost += modResult.useAutomaticSequencerSavings.savings.cost;
      dayTypeModificationResult.useAutomaticSequencerSavings.savings.power += modResult.useAutomaticSequencerSavings.savings.power;

      dayTypeModificationResult.auxiliaryPowerUsage.cost += modResult.auxiliaryPowerUsage.cost;
      dayTypeModificationResult.auxiliaryPowerUsage.energyUse += modResult.auxiliaryPowerUsage.energyUse;
    });

    dayTypeModificationResult.peakDemand = _.maxBy(modificationResults.dayTypeModificationResults, (result) => { return result.peakDemand }).peakDemand;
    dayTypeModificationResult.peakDemandCost = _.maxBy(modificationResults.dayTypeModificationResults, (result) => { return result.peakDemandCost }).peakDemandCost;
    dayTypeModificationResult.peakDemandCostSavings = baselineResults.total.demandCost - dayTypeModificationResult.peakDemandCost;
    if (modificationResults.dayTypeModificationResults && modificationResults.dayTypeModificationResults.length > 0) {
      dayTypeModificationResult.allSavingsResults.implementationCost = modificationResults.dayTypeModificationResults[0].allSavingsResults.implementationCost;

      dayTypeModificationResult.addReceiverVolumeSavings.implementationCost = modificationResults.dayTypeModificationResults[0].addReceiverVolumeSavings.implementationCost;
      dayTypeModificationResult.adjustCascadingSetPointsSavings.implementationCost = modificationResults.dayTypeModificationResults[0].adjustCascadingSetPointsSavings.implementationCost;
      dayTypeModificationResult.improveEndUseEfficiencySavings.implementationCost = modificationResults.dayTypeModificationResults[0].improveEndUseEfficiencySavings.implementationCost;
      dayTypeModificationResult.reduceAirLeaksSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceAirLeaksSavings.implementationCost;
      dayTypeModificationResult.reduceRunTimeSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceRunTimeSavings.implementationCost;
      dayTypeModificationResult.reduceSystemAirPressureSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceSystemAirPressureSavings.implementationCost;
      dayTypeModificationResult.useAutomaticSequencerSavings.implementationCost = modificationResults.dayTypeModificationResults[0].useAutomaticSequencerSavings.implementationCost;

      dayTypeModificationResult.flowReallocationSavings.implementationCost = modificationResults.dayTypeModificationResults[0].flowReallocationSavings.implementationCost;
    }

    dayTypeModificationResult.flowReallocationSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.flowReallocationSavings);
    dayTypeModificationResult.addReceiverVolumeSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.addReceiverVolumeSavings);
    dayTypeModificationResult.adjustCascadingSetPointsSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.adjustCascadingSetPointsSavings);
    let improveEndUseEfficiencySavingsCpy: EemSavingsResults = JSON.parse(JSON.stringify(dayTypeModificationResult.improveEndUseEfficiencySavings));
    improveEndUseEfficiencySavingsCpy.savings.cost = improveEndUseEfficiencySavingsCpy.savings.cost - dayTypeModificationResult.auxiliaryPowerUsage.cost;
    dayTypeModificationResult.improveEndUseEfficiencySavings.paybackPeriod = this.getPaybackPeriod(improveEndUseEfficiencySavingsCpy);
    dayTypeModificationResult.reduceAirLeaksSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.reduceAirLeaksSavings);
    dayTypeModificationResult.reduceRunTimeSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.reduceRunTimeSavings);
    dayTypeModificationResult.reduceSystemAirPressureSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.reduceSystemAirPressureSavings);
    dayTypeModificationResult.useAutomaticSequencerSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.useAutomaticSequencerSavings);

    // dayTypeModificationResult.auxiliaryPowerUsage.cost += modResult.auxiliaryPowerUsage.cost;
    // dayTypeModificationResult.auxiliaryPowerUsage.energyUse += modResult.auxiliaryPowerUsage.energyUse;
    // dayTypeModificationResult.auxiliaryPowerUsage.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.auxiliaryPowerUsage);

    dayTypeModificationResult.totalAnnualOperatingCost = dayTypeModificationResult.peakDemandCost + dayTypeModificationResult.allSavingsResults.adjustedResults.cost;

    dayTypeModificationResult.allSavingsResults.savings.annualEmissionOutputSavings = baselineResults.total.annualEmissionOutput - dayTypeModificationResult.annualEmissionOutput;

    dayTypeModificationResult.allSavingsResults.paybackPeriod = (dayTypeModificationResult.allSavingsResults.implementationCost / (baselineResults.total.totalAnnualOperatingCost - dayTypeModificationResult.totalAnnualOperatingCost)) * 12
    if (dayTypeModificationResult.allSavingsResults.paybackPeriod < 0) {
      dayTypeModificationResult.allSavingsResults.paybackPeriod = 0;
    }
    dayTypeModificationResult.allSavingsResults.savings.percentSavings = ((baselineResults.total.totalAnnualOperatingCost - dayTypeModificationResult.totalAnnualOperatingCost) / baselineResults.total.totalAnnualOperatingCost) * 100

    return dayTypeModificationResult;
  }

  getPaybackPeriod(savingsResult: EemSavingsResults): number {
    let paybackPeriod: number = (savingsResult.implementationCost / savingsResult.savings.cost) * 12
    if (paybackPeriod < 0) {
      return 0;
    } else {
      return paybackPeriod;
    }
  }


  calculateProfileSummaryTotals(compressorInventoryItems: Array<CompressorInventoryItem>, selectedDayType: CompressedAirDayType, profileSummary: Array<ProfileSummary>, selectedHourInterval: number, improveEndUseEfficiency?: ImproveEndUseEfficiency): Array<ProfileSummaryTotal> {
    let totalSystemCapacity: number = getTotalCapacity(compressorInventoryItems);
    let totalFullLoadPower: number = getTotalPower(compressorInventoryItems);
    let allData: Array<ProfileSummaryData> = new Array();
    profileSummary.forEach(summary => {
      if (summary.dayTypeId == selectedDayType.dayTypeId) {
        allData = allData.concat(summary.profileSummaryData);
      }
    });
    let totals: Array<ProfileSummaryTotal> = new Array();
    for (let interval = 0; interval < 24;) {
      let totalAirFlow: number = 0;
      let compressorPower: number = 0;
      allData.forEach(dataItem => {
        if (dataItem.timeInterval == interval && dataItem.order != 0) {
          if (isNaN(dataItem.airflow) == false) {
            totalAirFlow += dataItem.airflow;
          }
          if (isNaN(dataItem.power) == false) {
            compressorPower += dataItem.power;
          }
        }
      });
      let auxiliaryPower: number = this.getTotalAuxiliaryPower(selectedDayType, interval, improveEndUseEfficiency);
      totals.push({
        auxiliaryPower: auxiliaryPower,
        airflow: totalAirFlow,
        power: compressorPower,
        totalPower: compressorPower + auxiliaryPower,
        percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
        percentPower: (compressorPower / totalFullLoadPower) * 100,
        timeInterval: interval
      });
      interval = interval + selectedHourInterval;
    }
    return totals;
  }

  getTotalAuxiliaryPower(selectedDayType: CompressedAirDayType, interval: number, improveEndUseEfficiency?: ImproveEndUseEfficiency): number {
    if (!improveEndUseEfficiency || improveEndUseEfficiency.order == 100) {
      return 0;
    } else {
      let auxiliaryPower: number = 0;
      improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        if (item.substituteAuxiliaryEquipment) {
          let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(data => {
            return data.dayTypeId == selectedDayType.dayTypeId;
          });
          let data: { hourInterval: number, applyReduction: boolean, reductionAmount: number } = reductionData.data.find(d => { return d.hourInterval == interval });
          if (item.reductionType == 'Fixed' && data.applyReduction) {
            auxiliaryPower += item.equipmentDemand;
          } else if (item.reductionType == 'Variable' && data.reductionAmount) {
            auxiliaryPower += item.equipmentDemand;
          }
        }
      });
      return auxiliaryPower;
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
