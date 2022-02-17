import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ReduceSystemAirPressure, Modification, ProfileSummary, ReduceRuntime, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntimeData, SystemProfile, ImproveEndUseEfficiency, ReduceAirLeaks, UseAutomaticSequencer, AdjustCascadingSetPoints, CascadingSetPointData, PerformancePoints, EndUseEfficiencyReductionData, SystemInformation, CompressorSummary } from '../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from './compressed-air-calculation.service';
import * as _ from 'lodash';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';

@Injectable()
export class CompressedAirAssessmentResultsService {

  flowReallocationSummaries: Array<FlowReallocationSummary>;
  constructor(private compressedAirCalculationService: CompressedAirCalculationService,
    private performancePointCalculationsService: PerformancePointCalculationsService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private convertUnitsService: ConvertUnitsService) { }


  calculateBaselineResults(compressedAirAssessment: CompressedAirAssessment, 
    settings: Settings, baselineProfileSummaries?: Array<{ dayTypeId: string, profileSummary: Array<ProfileSummary> }>): BaselineResults {
    let dayTypeResults: Array<BaselineResult> = new Array();
    let totalFullLoadCapacity: number = this.getTotalCapacity(compressedAirAssessment.compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressedAirAssessment.compressorInventoryItems);
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      let baselineProfileSummary: Array<ProfileSummary>
      if (baselineProfileSummaries) {
        baselineProfileSummary = baselineProfileSummaries.find(summary => { return summary.dayTypeId == dayType.dayTypeId }).profileSummary;
      } else {
        baselineProfileSummary = this.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings);
      }

      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment.compressorInventoryItems, dayType, baselineProfileSummary, compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
      let baselineResults: SavingsItem = this.calculateEnergyAndCost(baselineProfileSummary, dayType, compressedAirAssessment.systemBasics.electricityCost, compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
      let hoursOn: number = 0;
      totals.forEach(total => {
        if (total.power != 0) {
          hoursOn = hoursOn + compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
        }
      });
      let totalOperatingHours: number = dayType.numberOfDays * hoursOn;
      let averageAirFlow: number = _.sumBy(totals, (total) => { return total.airflow }) / hoursOn;
      if (isNaN(averageAirFlow)) {
        averageAirFlow = 0;
      }
      let averagePower: number = _.sumBy(totals, (total) => { return total.power }) / hoursOn;
      if (isNaN(averagePower)) {
        averagePower = 0;
      }

      let peakDemandTotal: ProfileSummaryTotal = _.maxBy(totals, (total) => { return total.power });
      let peakDemand: number = 0;
      if (peakDemandTotal) {
        peakDemand = peakDemandTotal.power;
      }
      let demandCost: number = peakDemand * 12 * compressedAirAssessment.systemBasics.demandCost;
      let maxAirFlowTotal: ProfileSummaryTotal = _.maxBy(totals, (total) => { return total.airflow });
      let maxAirFlow: number = 0;
      if (maxAirFlowTotal) {
        maxAirFlow = maxAirFlowTotal.airflow;
      }

      let dayTypeAnnualEmissionsOutput: number;
      if (compressedAirAssessment.systemInformation.co2SavingsData) {
        compressedAirAssessment.systemInformation.co2SavingsData.electricityUse = baselineResults.power;
        dayTypeAnnualEmissionsOutput = this.assessmentCo2SavingsService.getCo2EmissionsResult(compressedAirAssessment.systemInformation.co2SavingsData, settings);
      }
      dayTypeResults.push({
        cost: baselineResults.cost,
        energyUse: baselineResults.power,
        annualEmissionOutput: dayTypeAnnualEmissionsOutput,
        peakDemand: peakDemand,
        name: dayType.name,
        averageAirFlow: averageAirFlow,
        averageAirFlowPercentCapacity: averageAirFlow / totalFullLoadCapacity * 100,
        operatingDays: dayType.numberOfDays,
        totalOperatingHours: totalOperatingHours,
        loadFactorPercent: averagePower / totalFullLoadPower * 100,
        dayTypeId: dayType.dayTypeId,
        demandCost: demandCost,
        totalAnnualOperatingCost: demandCost + baselineResults.cost,
        maxAirFlow: maxAirFlow
      });
    });

    let sumAverages: number = 0;
    let totalDays: number = 0;
    let sumAveragePercent: number = 0;
    let sumAverageLoadFactor: number = 0;
    dayTypeResults.forEach(result => {
      totalDays = totalDays + result.operatingDays;
      sumAverages = sumAverages + (result.averageAirFlow * result.operatingDays);
      sumAveragePercent = sumAveragePercent + (result.averageAirFlowPercentCapacity * result.operatingDays);
      sumAverageLoadFactor = sumAverageLoadFactor + (result.loadFactorPercent * result.operatingDays);
    });

    let annualEnergyCost: number = _.sumBy(dayTypeResults, (result) => { return result.cost });
    let peakDemand: number = _.maxBy(dayTypeResults, (result) => { return result.peakDemand }).peakDemand;
    let demandCost: number = peakDemand * 12 * compressedAirAssessment.systemBasics.demandCost;
    let maxAirflow: number = _.maxBy(dayTypeResults, (result) => { return result.maxAirFlow }).maxAirFlow;
    let totalEnergyUse = _.sumBy(dayTypeResults, (result) => { return result.energyUse });
    let totalAnnualEmissionOutput = _.sumBy(dayTypeResults, (result) => { return result.annualEmissionOutput });
    
    return {
      dayTypeResults: dayTypeResults,
      total: {
        cost: annualEnergyCost,
        peakDemand: peakDemand,
        energyUse: totalEnergyUse,
        name: 'System Totals',
        averageAirFlow: (sumAverages / totalDays),
        averageAirFlowPercentCapacity: sumAveragePercent / totalDays,
        operatingDays: totalDays,
        annualEmissionOutput: totalAnnualEmissionOutput,
        totalOperatingHours: _.sumBy(dayTypeResults, (result) => { return result.totalOperatingHours }),
        loadFactorPercent: sumAverageLoadFactor / totalDays,
        demandCost: demandCost,
        totalAnnualOperatingCost: demandCost + annualEnergyCost,
        maxAirFlow: maxAirflow
      }
    }
  }

  setFlowReallocationSummaries(dayTypes: Array<CompressedAirDayType>, settings: Settings, baselineDayTypeProfileSummarries: Array<{ dayTypeId: string, profileSummary: Array<ProfileSummary> }>, compressors: Array<CompressorInventoryItem>, atmosphericPressure: number, numberOfSummaryIntervals: number, totalAirStorage: number, electricityCost: number) {
    let flowReallocationSummaries: Array<FlowReallocationSummary> = new Array();
    dayTypes.forEach(dayType => {
      let baselineProfileSummary: Array<ProfileSummary> = baselineDayTypeProfileSummarries.find(summary => { return summary.dayTypeId == dayType.dayTypeId }).profileSummary;
      this.flowReallocationSummaries = new Array();
      let flowReallocationSavings: EemSavingsResults = this.getEmptyEemSavings();
      let flowAllocationProfileSummary: Array<ProfileSummary>;
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressors, dayType, baselineProfileSummary, numberOfSummaryIntervals);
      let adjustedProfileSummary: Array<ProfileSummary> = this.reallocateFlow(dayType, settings, baselineProfileSummary, compressors, 0, totals, atmosphericPressure, totalAirStorage);
      flowAllocationProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
      if (electricityCost) {
        flowReallocationSavings = this.calculateSavings(baselineProfileSummary, adjustedProfileSummary, dayType, electricityCost, 0, numberOfSummaryIntervals);
      }
      flowReallocationSummaries.push({
        dayTypeId: dayType.dayTypeId,
        profileSummary: flowAllocationProfileSummary,
        dayTypeBaselineTotals: totals,
        flowReallocationSavings: flowReallocationSavings
      });
    });
    this.flowReallocationSummaries = flowReallocationSummaries;
  }

  getFlowReallocationSummary(dayTypeId: string): FlowReallocationSummary {
    if (this.flowReallocationSummaries) {
      return this.flowReallocationSummaries.find(summary => { return summary.dayTypeId == dayTypeId });
    } else {
      return undefined;
    }
  }



  calculateModificationResults(compressedAirAssessment: CompressedAirAssessment, modification: Modification, settings: Settings, baselineProfileSummaries?: Array<{ dayTypeId: string, profileSummary: Array<ProfileSummary> }>, baselineResults?: BaselineResults): CompressedAirAssessmentResult {
    let modificationOrders: Array<number> = [
      modification.addPrimaryReceiverVolume.order,
      modification.adjustCascadingSetPoints.order,
      modification.improveEndUseEfficiency.order,
      modification.reduceRuntime.order,
      modification.reduceAirLeaks.order,
      modification.reduceSystemAirPressure.order,
      modification.useAutomaticSequencer.order,
    ]
    modificationOrders = modificationOrders.filter(order => { return order != 100 });
    let modificationResults: Array<DayTypeModificationResult> = new Array();
    let compressedAirAssessmentCopy: CompressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
    if (compressedAirAssessmentCopy.systemInformation.isSequencerUsed) {
      compressedAirAssessmentCopy.compressorInventoryItems.forEach(item => {
        item = this.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessmentCopy.systemInformation.targetPressure, compressedAirAssessmentCopy.systemInformation.variance, item, compressedAirAssessmentCopy.systemInformation.atmosphericPressure, settings)
      });
    }

    let numberOfSummaryIntervals: number = compressedAirAssessmentCopy.systemProfile.systemProfileSetup.dataInterval;

    compressedAirAssessmentCopy.compressedAirDayTypes.forEach(dayType => {
      let baselineProfileSummary: Array<ProfileSummary>
      if (baselineProfileSummaries) {
        baselineProfileSummary = baselineProfileSummaries.find(summary => { return summary.dayTypeId == dayType.dayTypeId }).profileSummary;
      } else {
        baselineProfileSummary = this.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings);
      }

      let adjustedCompressors: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(compressedAirAssessmentCopy.compressorInventoryItems));
      let adjustedData: AdjustProfileResults = this.adjustProfileSummary(dayType, settings, baselineProfileSummary, adjustedCompressors, modification, modificationOrders, compressedAirAssessmentCopy.systemInformation.atmosphericPressure, numberOfSummaryIntervals, compressedAirAssessmentCopy.systemInformation.totalAirStorage, compressedAirAssessmentCopy.systemBasics.electricityCost);
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedData.adjustedProfileSummary, numberOfSummaryIntervals, modification.improveEndUseEfficiency);
      let totalImplementationCost: number = this.getTotalImplementationCost(modification);
      let allSavingsResults: EemSavingsResults = this.calculateSavings(baselineProfileSummary, adjustedData.adjustedProfileSummary, dayType, compressedAirAssessmentCopy.systemBasics.electricityCost, totalImplementationCost, numberOfSummaryIntervals, adjustedData.auxiliaryPowerUsage);
      if (baselineResults && compressedAirAssessment.systemInformation.co2SavingsData) {
        compressedAirAssessment.systemInformation.co2SavingsData.electricityUse = allSavingsResults.adjustedResults.power;  
        allSavingsResults.adjustedResults.annualEmissionOutput = this.assessmentCo2SavingsService.getCo2EmissionsResult(compressedAirAssessment.systemInformation.co2SavingsData, settings);
        let currentDayTypeBaselineResult: BaselineResult = baselineResults.dayTypeResults.find(result => result.dayTypeId === dayType.dayTypeId);
        allSavingsResults.savings.annualEmissionOutputSavings = currentDayTypeBaselineResult.annualEmissionOutput - allSavingsResults.adjustedResults.annualEmissionOutput; 
      }
      
      let peakDemandObj: ProfileSummaryTotal = _.maxBy(totals, (result) => { return result.totalPower });
      let peakDemand: number = peakDemandObj?.totalPower || 0;
      let peakDemandCost: number = peakDemand * 12 * compressedAirAssessmentCopy.systemBasics.demandCost;
      let totalModifiedAnnualOperatingCost: number = peakDemandCost + allSavingsResults.adjustedResults.cost;
      modificationResults.push({
        adjustedProfileSummary: adjustedData.adjustedProfileSummary,
        adjustedCompressors: adjustedData.adjustedCompressors,
        profileSummaryTotals: totals,
        dayTypeId: dayType.dayTypeId,
        allSavingsResults: allSavingsResults,
        flowReallocationSavings: adjustedData.flowReallocationSavings,
        flowAllocationProfileSummary: adjustedData.flowAllocationProfileSummary,
        addReceiverVolumeSavings: adjustedData.addReceiverVolumeSavings,
        addReceiverVolumeProfileSummary: adjustedData.addReceiverVolumeProfileSummary,
        adjustCascadingSetPointsSavings: adjustedData.adjustCascadingSetPointsSavings,
        adjustCascadingSetPointsProfileSummary: adjustedData.adjustCascadingSetPointsProfileSummary,
        improveEndUseEfficiencySavings: adjustedData.improveEndUseEfficiencySavings,
        improveEndUseEfficiencyProfileSummary: adjustedData.improveEndUseEfficiencyProfileSummary,
        reduceAirLeaksSavings: adjustedData.reduceAirLeaksSavings,
        reduceAirLeaksProfileSummary: adjustedData.reduceAirLeaksProfileSummary,
        reduceRunTimeSavings: adjustedData.reduceRunTimeSavings,
        reduceRunTimeProfileSummary: adjustedData.reduceRunTimeProfileSummary,
        reduceSystemAirPressureSavings: adjustedData.reduceSystemAirPressureSavings,
        reduceSystemAirPressureProfileSummary: adjustedData.reduceSystemAirPressureProfileSummary,
        useAutomaticSequencerSavings: adjustedData.useAutomaticSequencerSavings,
        useAutomaticSequencerProfileSummary: adjustedData.useAutomaticSequencerProfileSummary,
        auxiliaryPowerUsage: adjustedData.auxiliaryPowerUsage,
        dayTypeName: dayType.name,
        peakDemand: peakDemand,
        peakDemandCost: peakDemandCost,
        totalAnnualOperatingCost: totalModifiedAnnualOperatingCost,
        annualEmissionOutput: allSavingsResults.adjustedResults.annualEmissionOutput
      });
    });
    return {
      dayTypeModificationResults: modificationResults,
      totalBaselineCost: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.baselineResults.cost }),
      totalBaselinePower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.baselineResults.power }),
      totalModificationCost: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.adjustedResults.cost }),
      totalModificationPower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.adjustedResults.power }),
      totalCostSavings: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.savings.cost }),
      totalCostPower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.savings.power }),
      modification: modification
    }
  }

  getTotalImplementationCost(modification: Modification): number {
    let implementationCost: number = 0;
    if (modification.addPrimaryReceiverVolume.order != 100) {
      implementationCost += modification.addPrimaryReceiverVolume.implementationCost;
    }
    if (modification.adjustCascadingSetPoints.order != 100) {
      implementationCost += modification.adjustCascadingSetPoints.implementationCost;
    }
    if (modification.improveEndUseEfficiency.order != 100) {
      modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => { implementationCost += item.implementationCost });
    }
    if (modification.reduceAirLeaks.order != 100) {
      implementationCost += modification.reduceAirLeaks.implementationCost;
    }
    if (modification.reduceRuntime.order != 100) {
      implementationCost += modification.reduceRuntime.implementationCost;
    }
    if (modification.reduceSystemAirPressure.order != 100) {
      implementationCost += modification.reduceSystemAirPressure.implementationCost;
    }
    if (modification.useAutomaticSequencer.order != 100) {
      implementationCost += modification.useAutomaticSequencer.implementationCost;
    }
    return implementationCost;
  }


  combineDayTypeResults(modificationResults: CompressedAirAssessmentResult, baselineResults: BaselineResults): DayTypeModificationResult {
    let dayTypeModificationResult: DayTypeModificationResult = {
      adjustedProfileSummary: [],
      adjustedCompressors: [],
      profileSummaryTotals: [],
      allSavingsResults: this.getEmptyEemSavings(),
      flowReallocationSavings: this.getEmptyEemSavings(),
      addReceiverVolumeSavings: this.getEmptyEemSavings(),
      adjustCascadingSetPointsSavings: this.getEmptyEemSavings(),
      improveEndUseEfficiencySavings: this.getEmptyEemSavings(),
      reduceAirLeaksSavings: this.getEmptyEemSavings(),
      reduceRunTimeSavings: this.getEmptyEemSavings(),
      reduceSystemAirPressureSavings: this.getEmptyEemSavings(),
      useAutomaticSequencerSavings: this.getEmptyEemSavings(),
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
      totalAnnualOperatingCost: 0,
      annualEmissionOutput: 0
    }
    modificationResults.dayTypeModificationResults.forEach(modResult => {

      dayTypeModificationResult.allSavingsResults.savings.cost += modResult.allSavingsResults.savings.cost;
      dayTypeModificationResult.allSavingsResults.savings.power += modResult.allSavingsResults.savings.power;

      dayTypeModificationResult.allSavingsResults.implementationCost += modResult.allSavingsResults.implementationCost;
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
    
    if (modificationResults.dayTypeModificationResults && modificationResults.dayTypeModificationResults.length > 0) {
      dayTypeModificationResult.addReceiverVolumeSavings.implementationCost = modificationResults.dayTypeModificationResults[0].addReceiverVolumeSavings.implementationCost;
      dayTypeModificationResult.adjustCascadingSetPointsSavings.implementationCost = modificationResults.dayTypeModificationResults[0].adjustCascadingSetPointsSavings.implementationCost;
      dayTypeModificationResult.improveEndUseEfficiencySavings.implementationCost = modificationResults.dayTypeModificationResults[0].improveEndUseEfficiencySavings.implementationCost;
      dayTypeModificationResult.reduceAirLeaksSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceAirLeaksSavings.implementationCost;
      dayTypeModificationResult.reduceRunTimeSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceRunTimeSavings.implementationCost;
      dayTypeModificationResult.reduceSystemAirPressureSavings.implementationCost = modificationResults.dayTypeModificationResults[0].reduceSystemAirPressureSavings.implementationCost;
      dayTypeModificationResult.useAutomaticSequencerSavings.implementationCost = modificationResults.dayTypeModificationResults[0].useAutomaticSequencerSavings.implementationCost;
    }
    
    dayTypeModificationResult.flowReallocationSavings.paybackPeriod = 0;
    dayTypeModificationResult.addReceiverVolumeSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.addReceiverVolumeSavings);
    dayTypeModificationResult.adjustCascadingSetPointsSavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.adjustCascadingSetPointsSavings);
    dayTypeModificationResult.improveEndUseEfficiencySavings.paybackPeriod = this.getPaybackPeriod(dayTypeModificationResult.improveEndUseEfficiencySavings);
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
    dayTypeModificationResult.allSavingsResults.savings.percentSavings = ((baselineResults.total.totalAnnualOperatingCost - dayTypeModificationResult.totalAnnualOperatingCost) / dayTypeModificationResult.totalAnnualOperatingCost) * 100

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

  adjustProfileSummary(dayType: CompressedAirDayType, settings: Settings, baselineProfileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, modification: Modification, modificationOrders: Array<number>, atmosphericPressure: number, numberOfSummaryIntervals: number, totalAirStorage: number, electricityCost: number): AdjustProfileResults {
    let addReceiverVolumeSavings: EemSavingsResults = this.getEmptyEemSavings();
    let adjustCascadingSetPointsSavings: EemSavingsResults = this.getEmptyEemSavings();
    let improveEndUseEfficiencySavings: EemSavingsResults = this.getEmptyEemSavings();
    let reduceAirLeaksSavings: EemSavingsResults = this.getEmptyEemSavings();
    let reduceRunTimeSavings: EemSavingsResults = this.getEmptyEemSavings();
    let reduceSystemAirPressureSavings: EemSavingsResults = this.getEmptyEemSavings();
    let useAutomaticSequencerSavings: EemSavingsResults = this.getEmptyEemSavings();
    let flowReallocationSavings: EemSavingsResults = this.getEmptyEemSavings();
    let flowAllocationProfileSummary: Array<ProfileSummary>;
    let reduceRunTimeProfileSummary: Array<ProfileSummary>;
    let addReceiverVolumeProfileSummary: Array<ProfileSummary>;
    let adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>;
    let improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>;
    let reduceAirLeaksProfileSummary: Array<ProfileSummary>;
    let reduceSystemAirPressureProfileSummary: Array<ProfileSummary>;
    let useAutomaticSequencerProfileSummary: Array<ProfileSummary>;
    let auxiliaryPowerUsage: { cost: number, energyUse: number } = { cost: 0, energyUse: 0 };
    //1. start with flow allocation
    let adjustedProfileSummary: Array<ProfileSummary>;
    let flowReallocationSummary: FlowReallocationSummary = this.getFlowReallocationSummary(dayType.dayTypeId);
    if (flowReallocationSummary) {
      flowReallocationSavings = flowReallocationSummary.flowReallocationSavings;
      flowAllocationProfileSummary = flowReallocationSummary.profileSummary;
      adjustedProfileSummary = JSON.parse(JSON.stringify(flowReallocationSummary.profileSummary));
    } else {
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, baselineProfileSummary, numberOfSummaryIntervals);
      adjustedProfileSummary = this.reallocateFlow(dayType, settings, baselineProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage);
      flowAllocationProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
      if (electricityCost) {
        flowReallocationSavings = this.calculateSavings(baselineProfileSummary, adjustedProfileSummary, dayType, electricityCost, 0, numberOfSummaryIntervals);
      }
    }
    //2. iterate modification orders
    for (let orderIndex = 1; orderIndex <= modificationOrders.length; orderIndex++) {
      let adjustedProfileCopy: Array<ProfileSummary> = JSON.parse(JSON.stringify(adjustedProfileSummary));
      let reduceRuntime: ReduceRuntime;
      if (orderIndex > modification.reduceRuntime.order) {
        reduceRuntime = modification.reduceRuntime;
      }
      if (modification.addPrimaryReceiverVolume.order == orderIndex) {
        //ADD PRIMARY RECEIVER VOLUME
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
        adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, modification.addPrimaryReceiverVolume.increasedVolume, totals, atmosphericPressure, totalAirStorage, reduceRuntime);
        addReceiverVolumeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          addReceiverVolumeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.addPrimaryReceiverVolume.implementationCost, numberOfSummaryIntervals)
        }
      } else if (modification.adjustCascadingSetPoints.order == orderIndex) {
        //ADJUST CASCADING SET POINTS
        let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
        //adjust compressors
        adjustedCompressors = this.adjustCascadingSetPointsAdjustCompressors(adjustedCompressors, modification.adjustCascadingSetPoints, atmosphericPressure, settings);
        //adjusted air flow based on compressor pressure changes
        adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, settings, adjustedCompressors, adjustedProfileSummary, atmosphericPressure, dayType)
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
        adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, reduceRuntime);
        adjustCascadingSetPointsProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          adjustCascadingSetPointsSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.adjustCascadingSetPoints.implementationCost, numberOfSummaryIntervals)
        }

      } else if (modification.improveEndUseEfficiency.order == orderIndex) {
        //IMPROVE END USE EFFICIENCY
        adjustedProfileSummary = this.improveEndUseEfficiency(adjustedProfileSummary, settings, dayType, modification.improveEndUseEfficiency, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage, reduceRuntime);
        improveEndUseEfficiencyProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          auxiliaryPowerUsage = this.calculateEfficiencyImprovementAuxiliaryPower(modification.improveEndUseEfficiency, electricityCost, dayType);
          let implementationCost: number = 0;
          modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => { implementationCost = implementationCost + item.implementationCost });
          improveEndUseEfficiencySavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, implementationCost, numberOfSummaryIntervals)
        }
      } else if (modification.reduceRuntime.order == orderIndex) {
        //REDUCE RUNTIME
        adjustedProfileSummary = this.reduceRuntime(adjustedProfileSummary, settings, dayType, modification.reduceRuntime, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage);
        reduceRunTimeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceRunTimeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceRuntime.implementationCost, numberOfSummaryIntervals)
        }
      } else if (modification.reduceAirLeaks.order == orderIndex) {
        //REDUCE AIR LEAKS
        adjustedProfileSummary = this.reduceAirLeaks(adjustedProfileSummary, settings, dayType, modification.reduceAirLeaks, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage, reduceRuntime);
        reduceAirLeaksProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceAirLeaksSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceAirLeaks.implementationCost, numberOfSummaryIntervals)
        }
      } else if (modification.reduceSystemAirPressure.order == orderIndex) {
        //REDUCE SYSTEM AIR PRESSURE
        let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
        //adjust compressors
        adjustedCompressors = this.reduceSystemAirPressureAdjustCompressors(adjustedCompressors, modification.reduceSystemAirPressure, atmosphericPressure, settings);
        //adjusted air flow based on compressor reduction
        adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, settings, adjustedCompressors, adjustedProfileSummary, atmosphericPressure)
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
        adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, reduceRuntime);
        reduceSystemAirPressureProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceSystemAirPressureSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceSystemAirPressure.implementationCost, numberOfSummaryIntervals)
        }
      } else if (modification.useAutomaticSequencer.order == orderIndex) {
        //USE AUTOMATIC SEQUENCER
        adjustedCompressors = this.useAutomaticSequencerAdjustCompressor(modification.useAutomaticSequencer, adjustedCompressors, modification.useAutomaticSequencer.profileSummary, dayType.dayTypeId, atmosphericPressure, settings);
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals, undefined);
        adjustedProfileSummary = this.useAutomaticSequencerMapOrders(modification.useAutomaticSequencer.profileSummary, adjustedProfileSummary);
        adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, reduceRuntime);
        useAutomaticSequencerProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          useAutomaticSequencerSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.useAutomaticSequencer.implementationCost, numberOfSummaryIntervals);
        }
      }
    }
    return {
      adjustedCompressors: adjustedCompressors,
      adjustedProfileSummary: adjustedProfileSummary,
      addReceiverVolumeSavings: addReceiverVolumeSavings,
      adjustCascadingSetPointsSavings: adjustCascadingSetPointsSavings,
      improveEndUseEfficiencySavings: improveEndUseEfficiencySavings,
      reduceAirLeaksSavings: reduceAirLeaksSavings,
      reduceRunTimeSavings: reduceRunTimeSavings,
      reduceSystemAirPressureSavings: reduceSystemAirPressureSavings,
      useAutomaticSequencerSavings: useAutomaticSequencerSavings,
      flowReallocationSavings: flowReallocationSavings,
      flowAllocationProfileSummary: flowAllocationProfileSummary,
      reduceRunTimeProfileSummary: reduceRunTimeProfileSummary,
      addReceiverVolumeProfileSummary: addReceiverVolumeProfileSummary,
      adjustCascadingSetPointsProfileSummary: adjustCascadingSetPointsProfileSummary,
      improveEndUseEfficiencyProfileSummary: improveEndUseEfficiencyProfileSummary,
      reduceAirLeaksProfileSummary: reduceAirLeaksProfileSummary,
      reduceSystemAirPressureProfileSummary: reduceSystemAirPressureProfileSummary,
      useAutomaticSequencerProfileSummary: useAutomaticSequencerProfileSummary,
      auxiliaryPowerUsage: auxiliaryPowerUsage
    };
  }

  calculateCompressorSummary(dayTypes: Array<CompressedAirDayType>, compressedAirAssessment: CompressedAirAssessment, settings: Settings): Array<Array<CompressorSummary>> {
    let compressorSummaries: Array<Array<CompressorSummary>> = new Array<Array<CompressorSummary>>();
    dayTypes.forEach(dayType => {
      let dayTypeCompressorSummaries: Array<CompressorSummary> = new Array<CompressorSummary>();
      let profileSummary = this.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings);
      profileSummary.forEach(profile => {
        let specificPowerAvgLoad = (profile.avgPower/profile.avgAirflow)*100;
        specificPowerAvgLoad = this.convertUnitsService.roundVal(specificPowerAvgLoad, 4);
        let specificPowerFullLoad = profile.avgPower;
        specificPowerFullLoad = this.convertUnitsService.roundVal(specificPowerFullLoad, 4);
        let isentropicEfficiency = profile.avgAirflow;
        isentropicEfficiency = this.convertUnitsService.roundVal(isentropicEfficiency, 4);
        let compressorSummary: CompressorSummary = {
          dayType: dayType,
          specificPowerAvgLoad: specificPowerAvgLoad,
          specificPowerFullLoad: specificPowerFullLoad,
          isentropicEfficiency: isentropicEfficiency
        }
        dayTypeCompressorSummaries.push(compressorSummary);
      });
      compressorSummaries.push(dayTypeCompressorSummaries);
    });
    return compressorSummaries;
  }


  calculateBaselineDayTypeProfileSummary(compressedAirAssessment: CompressedAirAssessment, dayType: CompressedAirDayType, settings: Settings): Array<ProfileSummary> {
    let inventoryItems: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(compressedAirAssessment.compressorInventoryItems));
    //Adjuste perfomance points for sequencer
    if (compressedAirAssessment.systemInformation.isSequencerUsed) {
      inventoryItems.forEach(item => {
        item = this.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation.targetPressure, compressedAirAssessment.systemInformation.variance, item, compressedAirAssessment.systemInformation.atmosphericPressure, settings)
      });
    }
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let selectedDayTypeSummary: Array<ProfileSummary> = new Array();
    let totalFullLoadCapacity: number = this.getTotalCapacity(inventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(inventoryItems);
    selectedProfileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = inventoryItems.find(item => { return item.itemId == summary.compressorId });
      if (summary.dayTypeId == dayType.dayTypeId) {
        summary.profileSummaryData.forEach(summaryData => {
          if (summaryData.order != 0) {
            let computeFrom: 0 | 1 | 2 | 3 | 4;
            let computeFromVal: number;
            let powerFactorData: { amps: number, volts: number };
            if (dayType.profileDataType == 'power') {
              computeFrom = 2;
              computeFromVal = summaryData.power;
            } else if (dayType.profileDataType == 'percentCapacity') {
              computeFrom = 1;
              computeFromVal = summaryData.percentCapacity;
            } else if (dayType.profileDataType == 'airflow') {
              computeFrom = 3;
              computeFromVal = summaryData.airflow;
            } else if (dayType.profileDataType == 'percentPower') {
              computeFrom = 0;
              computeFromVal = summaryData.percentPower;
            } else if (dayType.profileDataType == 'powerFactor') {
              computeFrom = 4;
              powerFactorData = { amps: summaryData.amps, volts: summaryData.volts };
              computeFromVal = summaryData.powerFactor;
            }
            let calcResult: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, settings, computeFrom, computeFromVal, compressedAirAssessment.systemInformation.atmosphericPressure, compressedAirAssessment.systemInformation.totalAirStorage, 0, true, powerFactorData);
            summaryData.airflow = this.convertUnitsService.roundVal(calcResult.capacityCalculated, 2);
            summaryData.power = calcResult.powerCalculated;
            summaryData.percentCapacity = calcResult.percentageCapacity;
            summaryData.percentPower = calcResult.percentagePower;
            summaryData.percentSystemCapacity = (calcResult.capacityCalculated / totalFullLoadCapacity) * 100;
            summaryData.percentSystemPower = (calcResult.powerCalculated / totalFullLoadPower) * 100;
          } else {
            summaryData.airflow = 0;
            summaryData.power = 0;
            summaryData.percentCapacity = 0;
            summaryData.percentPower = 0;
            summaryData.percentSystemCapacity = 0;
            summaryData.percentSystemPower = 0;
          }
        });
        selectedDayTypeSummary.push(summary);
      }
    });
    selectedDayTypeSummary = this.getProfileSummaryDataAverages(selectedDayTypeSummary);
    return selectedDayTypeSummary;
  }

  calculateProfileSummaryTotals(compressorInventoryItems: Array<CompressorInventoryItem>, selectedDayType: CompressedAirDayType, profileSummary: Array<ProfileSummary>, numberOfSummaryIntervals: number, improveEndUseEfficiency?: ImproveEndUseEfficiency): Array<ProfileSummaryTotal> {
    let totalSystemCapacity: number = this.getTotalCapacity(compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressorInventoryItems);
    let allData: Array<ProfileSummaryData> = new Array();
    profileSummary.forEach(summary => {
      if (summary.dayTypeId == selectedDayType.dayTypeId) {
        allData = allData.concat(summary.profileSummaryData);
      }
    });
    let totals: Array<ProfileSummaryTotal> = new Array();
    let numIntervals: number = 24 / numberOfSummaryIntervals;
    for (let interval = 0; interval < numIntervals; interval++) {
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

  reallocateFlow(dayType: CompressedAirDayType, settings: Settings, profileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, additionalReceiverVolume: number, totals: Array<ProfileSummaryTotal>, atmosphericPressure: number, totalAirStorage: number, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, additionalReceiverVolume, atmosphericPressure, totalAirStorage, reduceRuntime);
    });
    return adjustedProfileSummary;
  }

  adjustProfile(neededAirFlow: number, settings: Settings, timeInterval: number, adjustedCompressors: Array<CompressorInventoryItem>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, additionalRecieverVolume: number, atmosphericPressure: number, totalAirStorage: number, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
    adjustedProfileSummary.forEach(summary => {
      if (summary.dayTypeId == dayType.dayTypeId) {
        intervalData.push({
          compressorId: summary.compressorId,
          summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == timeInterval })
        });
      }
    });
    //calc totals for system percentages
    let totalFullLoadCapacity: number = this.getTotalCapacity(adjustedCompressors);
    let totalFullLoadPower: number = this.getTotalPower(adjustedCompressors);
    let reduceRuntimeShutdownTimer: boolean;
    intervalData = _.orderBy(intervalData, (data) => { return data.summaryData.order });
    let orderCount: number = 1;
    intervalData.forEach(data => {
      let isTurnedOn: boolean = data.summaryData.order != 0;
      if (reduceRuntime) {
        let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
          return dataItem.compressorId == data.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
        });
        let intervalData: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == data.summaryData.timeInterval });
        isTurnedOn = intervalData.isCompressorOn;
        if (!isTurnedOn) {
          data.summaryData.order = 0;
        } else if (isTurnedOn && data.summaryData.order == 0) {
          data.summaryData.order = orderCount;
        }
        reduceRuntimeShutdownTimer = reduceRuntimeData.automaticShutdownTimer;
      }
      if (data.summaryData.order != 0 && isTurnedOn) {
        let compressor: CompressorInventoryItem = adjustedCompressors.find(item => { return item.itemId == data.compressorId });
        if (reduceRuntime) {
          compressor.compressorControls.automaticShutdown = reduceRuntimeShutdownTimer;
        }
        let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
        if (Math.abs(neededAirFlow) < 0.01) {
          fullLoadAirFlow = 0;
        }
        //calc with full load
        let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true, undefined);
        let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
        //if excess air added then reduce amount and calc again
        if (tmpNeededAirFlow < 0 && (fullLoadAirFlow + tmpNeededAirFlow) > 0) {
          calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow + tmpNeededAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true);
          tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
        }
        neededAirFlow = tmpNeededAirFlow;
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        let adjustedSummaryIndex: number = adjustedProfileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
        adjustedProfileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
          power: calculateFullLoad.powerCalculated,
          airflow: calculateFullLoad.capacityCalculated,
          percentCapacity: calculateFullLoad.percentageCapacity,
          timeInterval: data.summaryData.timeInterval,
          percentPower: calculateFullLoad.percentagePower,
          percentSystemCapacity: (calculateFullLoad.capacityCalculated / totalFullLoadCapacity) * 100,
          percentSystemPower: (calculateFullLoad.powerCalculated / totalFullLoadPower) * 100,
          order: orderCount,
        };
        orderCount++;
      } else {
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        let adjustedSummaryIndex: number = adjustedProfileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
        adjustedProfileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
          power: 0,
          airflow: 0,
          percentCapacity: 0,
          timeInterval: data.summaryData.timeInterval,
          percentPower: 0,
          percentSystemCapacity: 0,
          percentSystemPower: 0,
          order: 0,
        };
      }
    });
    return adjustedProfileSummary;
  }

  //adjustCascadingSetPoints
  adjustCascadingSetPointsAdjustCompressors(adjustedCompressors: Array<CompressorInventoryItem>, adjustCascadingSetPoints: AdjustCascadingSetPoints, atmosphericPressure: number, settings: Settings): Array<CompressorInventoryItem> {
    adjustedCompressors.forEach(compressor => {
      let setPointData: CascadingSetPointData = adjustCascadingSetPoints.setPointData.find(data => { return data.compressorId == compressor.itemId });
      compressor.performancePoints.fullLoad.dischargePressure = setPointData.fullLoadDischargePressure;
      compressor.performancePoints.fullLoad.isDefaultPressure = false;
      compressor.performancePoints.fullLoad.isDefaultAirFlow = false;
      compressor.performancePoints.fullLoad.isDefaultPower = true;
      compressor.performancePoints.maxFullFlow.isDefaultAirFlow = true;
      compressor.performancePoints.maxFullFlow.isDefaultPressure = true;
      compressor.performancePoints.maxFullFlow.isDefaultPower = true;
      compressor.performancePoints.maxFullFlow.isDefaultPressure = false;
      compressor.performancePoints.maxFullFlow.dischargePressure = setPointData.maxFullFlowDischargePressure;
      compressor.performancePoints.noLoad.isDefaultAirFlow = true;
      compressor.performancePoints.noLoad.isDefaultPressure = true;
      compressor.performancePoints.noLoad.isDefaultPower = true;
      compressor.performancePoints.unloadPoint.isDefaultAirFlow = true;
      compressor.performancePoints.unloadPoint.isDefaultPressure = true;
      compressor.performancePoints.unloadPoint.isDefaultPower = true;
      compressor.performancePoints.blowoff.isDefaultAirFlow = true;
      compressor.performancePoints.blowoff.isDefaultPressure = true;
      compressor.performancePoints.blowoff.isDefaultPower = true;
      compressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressor, atmosphericPressure, settings);
    });
    return adjustedCompressors;
  }


  //improveEndUseEfficiency
  improveEndUseEfficiency(profileSummary: Array<ProfileSummary>, settings: Settings, dayType: CompressedAirDayType, improveEndUseEfficiency: ImproveEndUseEfficiency, adjustedCompressors: Array<CompressorInventoryItem>, atmosphericPressure: number, numberOfSummaryIntervals: number, totalAirStorage: number, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary, numberOfSummaryIntervals);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
        let intervalReductionData = reductionData.data.find(rData => { return rData.hourInterval == total.timeInterval });
        if (item.reductionType == 'Fixed') {
          if (intervalReductionData.applyReduction) {
            total.airflow = total.airflow - item.airflowReduction;
          }
        } else if (item.reductionType == 'Variable') {
          if (intervalReductionData.reductionAmount) {
            total.airflow = total.airflow - intervalReductionData.reductionAmount;
          }
        }
        if (total.airflow < 0) {
          total.airflow = 0;
        }
        adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, atmosphericPressure, totalAirStorage, reduceRuntime);
      });
    });
    return adjustedProfileSummary;
  }

  calculateEfficiencyImprovementAuxiliaryPower(improveEndUseEfficiency: ImproveEndUseEfficiency, electricityCost: number, dayType: CompressedAirDayType): { cost: number, energyUse: number } {
    let energyUse: number = 0;
    improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
      if (item.substituteAuxiliaryEquipment) {
        if (item.reductionType == 'Fixed') {
          let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
          reductionData.data.forEach(d => {
            if (d.applyReduction) {
              energyUse = energyUse + item.equipmentDemand;
            }
          });

        } else if (item.reductionType == 'Variable') {
          let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
          reductionData.data.forEach(d => {
            if (d.reductionAmount) {
              energyUse = energyUse + item.equipmentDemand;
            }
          });
        }
      }
    });
    energyUse = energyUse * dayType.numberOfDays;
    return { cost: energyUse * electricityCost, energyUse: energyUse };
  }


  //reduceRuntime
  reduceRuntime(profileSummary: Array<ProfileSummary>, settings: Settings, dayType: CompressedAirDayType, reduceRuntime: ReduceRuntime, adjustedCompressors: Array<CompressorInventoryItem>, atmosphericPressure: number, numberOfSummaryIntervals: number, totalAirStorage: number): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary, numberOfSummaryIntervals);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, atmosphericPressure, totalAirStorage, reduceRuntime);
    });
    return adjustedProfileSummary;
  }
  //reduceAirLeaks
  reduceAirLeaks(profileSummary: Array<ProfileSummary>, settings: Settings, dayType: CompressedAirDayType, reduceAirLeaks: ReduceAirLeaks, adjustedCompressors: Array<CompressorInventoryItem>, atmosphericPressure: number, numberOfSummaryIntervals: number, totalAirStorage: number, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary, numberOfSummaryIntervals);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      total.airflow = total.airflow - (reduceAirLeaks.leakReduction / 100 * reduceAirLeaks.leakFlow);
      if (total.airflow < 0) {
        total.airflow = 0;
      }
      adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, atmosphericPressure, totalAirStorage, reduceRuntime);
    });
    return adjustedProfileSummary;
  }
  //reduceSystemAirPressure
  reduceSystemAirPressureAdjustCompressors(adjustedCompressors: Array<CompressorInventoryItem>, reduceSystemAirPressure: ReduceSystemAirPressure, atmosphericPressure: number, settings: Settings): Array<CompressorInventoryItem> {
    adjustedCompressors.forEach(compressor => {
      //EEM: Reduce System Pressure
      compressor.performancePoints.fullLoad.dischargePressure = compressor.performancePoints.fullLoad.dischargePressure - reduceSystemAirPressure.averageSystemPressureReduction;
      compressor.performancePoints.fullLoad.isDefaultPressure = false;
      compressor.performancePoints.fullLoad.isDefaultAirFlow = false;
      compressor.performancePoints.fullLoad.isDefaultPower = true;
      compressor.performancePoints.maxFullFlow.isDefaultAirFlow = true;
      compressor.performancePoints.maxFullFlow.isDefaultPressure = true;
      compressor.performancePoints.maxFullFlow.isDefaultPower = true;
      if (compressor.compressorControls.controlType != 1 && compressor.compressorControls.controlType != 7 && compressor.compressorControls.controlType != 9) {
        compressor.performancePoints.maxFullFlow.isDefaultPressure = false;
        compressor.performancePoints.maxFullFlow.dischargePressure = compressor.performancePoints.maxFullFlow.dischargePressure - reduceSystemAirPressure.averageSystemPressureReduction;
      }
      compressor.performancePoints.noLoad.isDefaultAirFlow = true;
      compressor.performancePoints.noLoad.isDefaultPressure = true;
      compressor.performancePoints.noLoad.isDefaultPower = true;
      compressor.performancePoints.unloadPoint.isDefaultAirFlow = true;
      compressor.performancePoints.unloadPoint.isDefaultPressure = true;
      compressor.performancePoints.unloadPoint.isDefaultPower = true;
      compressor.performancePoints.blowoff.isDefaultAirFlow = true;
      compressor.performancePoints.blowoff.isDefaultPressure = true;
      compressor.performancePoints.blowoff.isDefaultPower = true;
      compressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressor, atmosphericPressure, settings);
    });
    return adjustedCompressors;
  }

  systemPressureChangeAdjustProfile(originalCompressors: Array<CompressorInventoryItem>, settings: Settings, adjustedCompressors: Array<CompressorInventoryItem>, adjustedProfileSummary: Array<ProfileSummary>, atmosphericPressure: number, dayType?: CompressedAirDayType): Array<ProfileSummary> {
    //reduce airflow
    adjustedProfileSummary.forEach(profile => {
      let ogCompressors: CompressorInventoryItem = originalCompressors.find(ogCompressor => { return ogCompressor.itemId == profile.compressorId });
      let adjustedCompressor: CompressorInventoryItem = adjustedCompressors.find(adjustedCompressor => { return adjustedCompressor.itemId == profile.compressorId });
      profile.profileSummaryData.forEach(summaryData => {
        summaryData.airflow = this.calculateReducedAirFlow(summaryData.airflow, adjustedCompressor.performancePoints.fullLoad.dischargePressure, atmosphericPressure, ogCompressors.performancePoints.fullLoad.dischargePressure, settings);
      });
    });
    if (dayType) {
      //order compressors
      let orderedCompressors: Array<CompressorInventoryItem> = _.orderBy(adjustedCompressors, (compressor) => {
        return compressor.performancePoints.fullLoad.dischargePressure
      }, 'desc');
      //get each day type summary
      let dayTypeSummaries: Array<ProfileSummary> = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
      //iterate hour intervals. TODO: HANDLE 1 day interval
      for (let i = 0; i < dayTypeSummaries[0].profileSummaryData.length; i++) {
        let newOrder: number = 1;
        //iterate new ordered compressors and update corresponding summary order
        orderedCompressors.forEach(compressor => {
          let dayTypeSummary = dayTypeSummaries.find(summary => { return summary.compressorId == compressor.itemId });
          let intervalData = dayTypeSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == i });
          if (intervalData.order != 0) {
            intervalData.order = newOrder;
            newOrder++;
          }
        });
      };
    }
    return adjustedProfileSummary;
  }
  //useAutomaticSequencer
  useAutomaticSequencerAdjustCompressor(useAutomaticSequencer: UseAutomaticSequencer, inventoryItems: Array<CompressorInventoryItem>, automaticSequencerProfile: Array<ProfileSummary>, dayTypeId: string, atmosphericPressure: number, settings: Settings): Array<CompressorInventoryItem> {
    inventoryItems.forEach(item => {
      let sequencerProfile: ProfileSummary = automaticSequencerProfile.find(profileItem => { return profileItem.compressorId == item.itemId && profileItem.dayTypeId == dayTypeId });
      item.compressorControls.automaticShutdown = sequencerProfile.automaticShutdownTimer;
      item = this.adjustCompressorPerformancePointsWithSequencer(useAutomaticSequencer.targetPressure, useAutomaticSequencer.variance, item, atmosphericPressure, settings)
    });
    return inventoryItems;
  }


  adjustCompressorPerformancePointsWithSequencer(targetPressure: number, variance: number, item: CompressorInventoryItem, atmosphericPressure: number, settings: Settings): CompressorInventoryItem {
    item.performancePoints.fullLoad.isDefaultPressure = false;
    item.performancePoints.fullLoad.isDefaultAirFlow = true;
    item.performancePoints.fullLoad.isDefaultPower = true;
    item.performancePoints.maxFullFlow.isDefaultAirFlow = true;
    item.performancePoints.maxFullFlow.isDefaultPressure = true;
    item.performancePoints.maxFullFlow.isDefaultPower = true;
    item.performancePoints.noLoad.isDefaultAirFlow = true;
    item.performancePoints.noLoad.isDefaultPressure = true;
    item.performancePoints.noLoad.isDefaultPower = true;
    item.performancePoints.unloadPoint.isDefaultAirFlow = true;
    item.performancePoints.unloadPoint.isDefaultPressure = true;
    item.performancePoints.unloadPoint.isDefaultPower = true;
    item.performancePoints.blowoff.isDefaultAirFlow = true;
    item.performancePoints.blowoff.isDefaultPressure = true;
    item.performancePoints.blowoff.isDefaultPower = true;

    item.performancePoints.fullLoad.dischargePressure = targetPressure - variance;

    let controlType: number = item.compressorControls.controlType;
    if (controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10 || controlType == 5) {
      item.performancePoints.unloadPoint.dischargePressure = targetPressure + variance;
      item.performancePoints.unloadPoint.isDefaultPressure = false;
      if (item.performancePoints.maxFullFlow.dischargePressure > item.performancePoints.fullLoad.dischargePressure) {
        item.performancePoints.maxFullFlow.dischargePressure = item.performancePoints.fullLoad.dischargePressure;
        item.performancePoints.maxFullFlow.isDefaultPressure = false;
      }
    } else if (controlType == 1) {
      item.performancePoints.noLoad.dischargePressure = targetPressure + variance;
      item.performancePoints.noLoad.isDefaultPressure = false;
    } else if (controlType == 6 || controlType == 4) {
      item.performancePoints.maxFullFlow.dischargePressure = targetPressure + variance;
      item.performancePoints.maxFullFlow.isDefaultPressure = false;
    } else if (controlType == 7 || controlType == 9) {
      item.performancePoints.blowoff.dischargePressure = targetPressure + variance;
      item.performancePoints.blowoff.isDefaultPressure = false;
    }
    item.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(item, atmosphericPressure, settings);
    return item;
  }

  useAutomaticSequencerMapOrders(automaticSequencerProfile: Array<ProfileSummary>, adjustedProfile: Array<ProfileSummary>): Array<ProfileSummary> {
    adjustedProfile.forEach(profileItem => {
      let automaticSequencerProfileItem: ProfileSummary = automaticSequencerProfile.find(sequencerItem => { return sequencerItem.dayTypeId == profileItem.dayTypeId && sequencerItem.compressorId == profileItem.compressorId });
      profileItem.profileSummaryData.forEach(profileSummaryDataItem => {
        let sequencerProfileDataItem: ProfileSummaryData = automaticSequencerProfileItem.profileSummaryData.find(profileData => { return profileData.timeInterval == profileSummaryDataItem.timeInterval });
        profileSummaryDataItem.order = sequencerProfileDataItem.order;
      });
    });
    return adjustedProfile;
  }

  calculateSavings(profileSummary: Array<ProfileSummary>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number, implementationCost: number, summaryDataInterval: number, auxiliaryPowerUsage?: { cost: number, energyUse: number }): EemSavingsResults {
    let baselineResults: SavingsItem = this.calculateEnergyAndCost(profileSummary, dayType, costKwh, summaryDataInterval);
    let adjustedResults: SavingsItem = this.calculateEnergyAndCost(adjustedProfileSummary, dayType, costKwh, summaryDataInterval, auxiliaryPowerUsage);
    let savings: SavingsItem = {
      cost: baselineResults.cost - adjustedResults.cost,
      power: baselineResults.power - adjustedResults.power,
      percentSavings: ((baselineResults.cost - adjustedResults.cost) / baselineResults.cost) * 100,
    };

    let paybackPeriod: number = (implementationCost / savings.cost) * 12;
    if (paybackPeriod < 0) {
      paybackPeriod = 0;
    }

    return {
      baselineResults: baselineResults,
      adjustedResults: adjustedResults,
      savings: savings,
      implementationCost: implementationCost,
      paybackPeriod: paybackPeriod,
      dayTypeId: dayType.dayTypeId
    }
  }


  calculateEnergyAndCost(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number, summaryDataInterval: number, auxiliaryPowerUsage?: { cost: number, energyUse: number }): SavingsItem {
    let filteredSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    let flatSummaryData: Array<ProfileSummaryData> = _.flatMap(filteredSummary, (summary) => { return summary.profileSummaryData });
    flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
    let sumPower: number = _.sumBy(flatSummaryData, 'power');
    sumPower = sumPower * summaryDataInterval * dayType.numberOfDays;
    if (auxiliaryPowerUsage) {
      sumPower = sumPower + auxiliaryPowerUsage.energyUse;
    }
    let sumCost: number = sumPower * costKwh;
    return {
      cost: sumCost,
      power: sumPower,
    }
  }

  calculateReducedAirFlow(c_usage: number, adjustedFullLoadDischargePressure: number, p_alt: number, originalFullLoadDischargePressure: number, settings: Settings): number {
    if (adjustedFullLoadDischargePressure == originalFullLoadDischargePressure) {
      return c_usage;
    } else {
      if (settings.unitsOfMeasure == 'Imperial') {
        let p: number = (adjustedFullLoadDischargePressure + p_alt) / (originalFullLoadDischargePressure + 14.7);
        let reduceFlow: number = (c_usage - (c_usage - (c_usage * p)) * .6);
        return reduceFlow;
      } else {
        //for metric convert values to imperial calcs and then convert back to metric
        let c_usage_imperial: number = this.convertUnitsService.value(JSON.parse(JSON.stringify(c_usage))).from('m3/min').to('ft3/min');
        let adjustedFullLoadDischargePressureImperial: number = this.convertUnitsService.value(JSON.parse(JSON.stringify(adjustedFullLoadDischargePressure))).from('barg').to('psig');
        let p_alt_imperial: number = this.convertUnitsService.value(JSON.parse(JSON.stringify(p_alt))).from('kPaa').to('psia');
        let ogDischargePressureImperial: number = this.convertUnitsService.value(JSON.parse(JSON.stringify(originalFullLoadDischargePressure))).from('barg').to('psig');
        let p: number = (adjustedFullLoadDischargePressureImperial + p_alt_imperial) / (ogDischargePressureImperial + 14.7);
        let reducedFlow: number = (c_usage_imperial - (c_usage_imperial - (c_usage_imperial * p)) * .6);
        reducedFlow = this.convertUnitsService.value(reducedFlow).from('ft3/min').to('m3/min');
        return reducedFlow;
      }
    }
  }

  getEmptyEemSavings(): EemSavingsResults {
    return {
      baselineResults: {
        cost: 0,
        power: 0,
      },
      adjustedResults: {
        cost: 0,
        power: 0,
      },
      savings: {
        cost: 0,
        power: 0,
        percentSavings: 0,
      },
      implementationCost: 0,
      paybackPeriod: 0,
      dayTypeId: undefined,
    };
  }

  getTotalCapacity(inventoryItems: Array<CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
  }

  getTotalPower(inventoryItems: Array<CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.performancePoints.fullLoad.power;
    });
  }

  getProfileSummaryDataAverages(profileSummary: Array<ProfileSummary>): Array<ProfileSummary>{
    let updatedSum: Array<ProfileSummary> = new Array<ProfileSummary>();
    profileSummary.forEach(sums => {
      let updatedData: ProfileSummary = sums;
      updatedData.avgPower = this.getAvgPower(sums.profileSummaryData);
      updatedData.avgAirflow = this.getAvgAirflow(sums.profileSummaryData);
      updatedData.avgPrecentPower = this.getAvgPercentPower(sums.profileSummaryData);
      updatedData.avgPercentCapacity = this.getAvgPercentCapacity(sums.profileSummaryData);
      updatedSum.push(updatedData);
    });
    return updatedSum;
  }

  getAvgPower(profileSummaryData: Array<ProfileSummaryData>): number {
    let powerData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
      if(data.power != 0){
        powerData.push(data.power);        
      }
    });
    let avgPower: number = _.mean(powerData);    
    return avgPower;
  }

  getAvgAirflow(profileSummaryData: Array<ProfileSummaryData>): number {
    let airflowData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
      if(data.airflow != 0){
        airflowData.push(data.airflow);        
      }
    });
    let avgAirflow: number = _.mean(airflowData);
    return avgAirflow;
  }

  getAvgPercentPower(profileSummaryData: Array<ProfileSummaryData>): number {
    let percentPowerData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
      if(data.percentPower != 0){
        percentPowerData.push(data.percentPower);        
      }
    });
    let avgPercentPower: number = _.mean(percentPowerData);
    return avgPercentPower;
  }

  getAvgPercentCapacity(profileSummaryData: Array<ProfileSummaryData>): number {
    let percentCapacityData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
      if(data.percentCapacity != 0){
        percentCapacityData.push(data.percentCapacity);        
      }
    });
    let avgPercentCapacity: number = _.mean(percentCapacityData);
    return avgPercentCapacity;
  }


}


export interface CompressedAirAssessmentResult {
  dayTypeModificationResults: Array<DayTypeModificationResult>,
  totalBaselineCost: number,
  totalBaselinePower: number,
  totalModificationCost: number,
  totalModificationPower: number,
  totalCostSavings: number,
  totalCostPower: number,
  modification: Modification
}

export interface DayTypeModificationResult {
  adjustedProfileSummary: Array<ProfileSummary>,
  adjustedCompressors: Array<CompressorInventoryItem>,
  profileSummaryTotals: Array<ProfileSummaryTotal>,
  allSavingsResults: EemSavingsResults,
  flowReallocationSavings: EemSavingsResults,
  flowAllocationProfileSummary: Array<ProfileSummary>,
  addReceiverVolumeSavings: EemSavingsResults,
  addReceiverVolumeProfileSummary: Array<ProfileSummary>,
  adjustCascadingSetPointsSavings: EemSavingsResults,
  adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>,
  improveEndUseEfficiencySavings: EemSavingsResults,
  improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>,
  reduceAirLeaksSavings: EemSavingsResults,
  reduceAirLeaksProfileSummary: Array<ProfileSummary>,
  reduceRunTimeSavings: EemSavingsResults,
  reduceRunTimeProfileSummary: Array<ProfileSummary>,
  reduceSystemAirPressureSavings: EemSavingsResults,
  reduceSystemAirPressureProfileSummary: Array<ProfileSummary>,
  useAutomaticSequencerSavings: EemSavingsResults,
  useAutomaticSequencerProfileSummary: Array<ProfileSummary>,
  auxiliaryPowerUsage: { cost: number, energyUse: number },
  dayTypeId: string,
  dayTypeName: string,
  peakDemand: number,
  peakDemandCost: number,
  totalAnnualOperatingCost: number,
  annualEmissionOutput: number
}


export interface EemSavingsResults {
  baselineResults: SavingsItem,
  adjustedResults: SavingsItem,
  savings: SavingsItem,
  implementationCost: number,
  paybackPeriod: number,
  dayTypeId: string,
}

export interface SavingsItem {
  cost: number,
  power: number,
  annualEmissionOutput?: number,
  annualEmissionOutputSavings?: number,
  percentSavings?: number
}

export interface BaselineResults {
  total: BaselineResult,
  dayTypeResults: Array<BaselineResult>
}

export interface BaselineResult {
  cost: number,
  energyUse: number,
  peakDemand: number,
  demandCost: number,
  name: string,
  maxAirFlow: number,
  averageAirFlow: number,
  averageAirFlowPercentCapacity: number,
  operatingDays: number,
  totalOperatingHours: number,
  annualEmissionOutput?: number,
  loadFactorPercent: number,
  dayTypeId?: string,
  totalAnnualOperatingCost: number
}


export interface AdjustProfileResults {
  adjustedProfileSummary: Array<ProfileSummary>,
  adjustedCompressors: Array<CompressorInventoryItem>,
  flowReallocationSavings: EemSavingsResults,
  flowAllocationProfileSummary: Array<ProfileSummary>,
  addReceiverVolumeSavings: EemSavingsResults,
  addReceiverVolumeProfileSummary: Array<ProfileSummary>,
  adjustCascadingSetPointsSavings: EemSavingsResults,
  adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>,
  improveEndUseEfficiencySavings: EemSavingsResults,
  improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>,
  reduceAirLeaksSavings: EemSavingsResults,
  reduceAirLeaksProfileSummary: Array<ProfileSummary>,
  reduceRunTimeSavings: EemSavingsResults,
  reduceRunTimeProfileSummary: Array<ProfileSummary>,
  reduceSystemAirPressureSavings: EemSavingsResults,
  reduceSystemAirPressureProfileSummary: Array<ProfileSummary>,
  useAutomaticSequencerSavings: EemSavingsResults,
  useAutomaticSequencerProfileSummary: Array<ProfileSummary>,
  auxiliaryPowerUsage: { cost: number, energyUse: number },
}

export interface FlowReallocationSummary {
  dayTypeId: string,
  profileSummary: Array<ProfileSummary>,
  dayTypeBaselineTotals: Array<ProfileSummaryTotal>,
  flowReallocationSavings: EemSavingsResults
}