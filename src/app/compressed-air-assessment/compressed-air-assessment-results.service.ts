import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ReduceSystemAirPressure, Modification, ProfileSummary, ReduceRuntime, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntimeData, SystemProfile, ImproveEndUseEfficiency, ReduceAirLeaks, UseAutomaticSequencer, AdjustCascadingSetPoints, CascadingSetPointData, PerformancePoints } from '../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from './compressed-air-calculation.service';
import * as _ from 'lodash';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';

@Injectable()
export class CompressedAirAssessmentResultsService {

  constructor(private compressedAirCalculationService: CompressedAirCalculationService, private performancePointCalculationsService: PerformancePointCalculationsService) { }


  calculateBaselineResults(compressedAirAssessment: CompressedAirAssessment): BaselineResults {
    let dayTypeResults: Array<BaselineResult> = new Array();

    let totalFullLoadCapacity: number = this.getTotalCapacity(compressedAirAssessment.compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressedAirAssessment.compressorInventoryItems);
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {

      let baselineProfileSummary: Array<ProfileSummary> = this.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType);
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment.compressorInventoryItems, dayType, baselineProfileSummary);
      let baselineResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(baselineProfileSummary, dayType, compressedAirAssessment.systemBasics.electricityCost);
      let totalOperatingHours: number = dayType.numberOfDays * 24;
      let averageAirFlow: number = _.meanBy(totals, (total) => { return total.airflow });
      let averagePower: number = _.meanBy(totals, (total) => { return total.power });
      dayTypeResults.push({
        cost: baselineResults.cost,
        energyUse: baselineResults.power,
        peakDemand: baselineResults.peakDemand,
        name: dayType.name,
        averageAirFlow: averageAirFlow,
        averageAirFlowPercentCapacity: averageAirFlow / totalFullLoadCapacity * 100,
        operatingDays: dayType.numberOfDays,
        totalOperatingHours: totalOperatingHours,
        loadFactorPercent: averagePower / totalFullLoadPower * 100
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

    return {
      dayTypeResults: dayTypeResults,
      total: {
        cost: annualEnergyCost,
        peakDemand: peakDemand,
        energyUse: _.sumBy(dayTypeResults, (result) => { return result.energyUse }),
        name: 'System Totals',
        averageAirFlow: (sumAverages / totalDays),
        averageAirFlowPercentCapacity: sumAveragePercent / totalDays,
        operatingDays: totalDays,
        totalOperatingHours: totalDays * 24,
        loadFactorPercent: sumAverageLoadFactor / totalDays
      },
      demandCost: demandCost,
      totalAnnualOperatingCost: demandCost + annualEnergyCost
    }
  }

  calculateModificationResults(compressedAirAssessment: CompressedAirAssessment, modification: Modification): CompressedAirAssessmentResult {
    // console.time('calculateModificationResults')
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
        item = this.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessmentCopy.systemInformation.targetPressure, compressedAirAssessmentCopy.systemInformation.variance, item)
      });
    }
    compressedAirAssessmentCopy.compressedAirDayTypes.forEach(dayType => {
      let baselineProfileSummary: Array<ProfileSummary> = this.calculateBaselineDayTypeProfileSummary(compressedAirAssessmentCopy, dayType);
      let adjustedCompressors: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(compressedAirAssessmentCopy.compressorInventoryItems));

      let adjustedData: AdjustProfileResults = this.adjustProfileSummary(dayType, baselineProfileSummary, adjustedCompressors, modification, modificationOrders, compressedAirAssessmentCopy.systemBasics.electricityCost);
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedData.adjustedProfileSummary);
      let allSavingsResults: EemSavingsResults = this.calculateSavings(baselineProfileSummary, adjustedData.adjustedProfileSummary, dayType, compressedAirAssessmentCopy.systemBasics.electricityCost);
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
        useAutomaticSequencerProfileSummary: adjustedData.useAutomaticSequencerProfileSummary
      });
    });
    // console.timeEnd('calculateModificationResults');
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

  adjustProfileSummary(dayType: CompressedAirDayType, baselineProfileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, modification: Modification, modificationOrders: Array<number>, electricityCost?: number): AdjustProfileResults {
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
    //1. start with flow allocation
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, baselineProfileSummary);
    let adjustedProfileSummary: Array<ProfileSummary> = this.reallocateFlow(dayType, baselineProfileSummary, adjustedCompressors, 0, totals);
    flowAllocationProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    if (electricityCost) {
      flowReallocationSavings = this.calculateSavings(baselineProfileSummary, adjustedProfileSummary, dayType, electricityCost)
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
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary);
        adjustedProfileSummary = this.reallocateFlow(dayType, adjustedProfileSummary, adjustedCompressors, modification.addPrimaryReceiverVolume.increasedVolume, totals, reduceRuntime);
        addReceiverVolumeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          addReceiverVolumeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }
      } else if (modification.adjustCascadingSetPoints.order == orderIndex) {
        //ADJUST CASCADING SET POINTS
        let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
        //adjust compressors
        adjustedCompressors = this.adjustCascadingSetPointsAdjustCompressors(adjustedCompressors, modification.adjustCascadingSetPoints);
        //adjusted air flow based on compressor pressure changes
        adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, adjustedCompressors, adjustedProfileSummary)
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary);
        adjustedProfileSummary = this.reallocateFlow(dayType, adjustedProfileSummary, adjustedCompressors, 0, totals, reduceRuntime);
        adjustCascadingSetPointsProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          adjustCascadingSetPointsSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }

      } else if (modification.improveEndUseEfficiency.order == orderIndex) {
        //IMPROVE END USE EFFICIENCY
        adjustedProfileSummary = this.improveEndUseEfficiency(adjustedProfileSummary, dayType, modification.improveEndUseEfficiency, adjustedCompressors, reduceRuntime);
        improveEndUseEfficiencyProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          improveEndUseEfficiencySavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }
      } else if (modification.reduceRuntime.order == orderIndex) {
        //REDUCE RUNTIME
        adjustedProfileSummary = this.reduceRuntime(adjustedProfileSummary, dayType, modification.reduceRuntime, adjustedCompressors);
        reduceRunTimeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceRunTimeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }
      } else if (modification.reduceAirLeaks.order == orderIndex) {
        //REDUCE AIR LEAKS
        adjustedProfileSummary = this.reduceAirLeaks(adjustedProfileSummary, dayType, modification.reduceAirLeaks, adjustedCompressors, reduceRuntime);
        reduceAirLeaksProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceAirLeaksSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }
      } else if (modification.reduceSystemAirPressure.order == orderIndex) {
        //REDUCE SYSTEM AIR PRESSURE
        let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
        //adjust compressors
        adjustedCompressors = this.reduceSystemAirPressureAdjustCompressors(adjustedCompressors, modification.reduceSystemAirPressure);
        //adjusted air flow based on compressor reduction
        adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, adjustedCompressors, adjustedProfileSummary)
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary);
        adjustedProfileSummary = this.reallocateFlow(dayType, adjustedProfileSummary, adjustedCompressors, 0, totals, reduceRuntime);
        reduceSystemAirPressureProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          reduceSystemAirPressureSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost)
        }
      } else if (modification.useAutomaticSequencer.order == orderIndex) {
        //USE AUTOMATIC SEQUENCER
        adjustedCompressors = this.useAutomaticSequencerAdjustCompressor(modification.useAutomaticSequencer, adjustedCompressors, modification.useAutomaticSequencer.profileSummary, dayType.dayTypeId);
        let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary);
        adjustedProfileSummary = this.useAutomaticSequencerMapOrders(modification.useAutomaticSequencer.profileSummary, adjustedProfileSummary);
        adjustedProfileSummary = this.reallocateFlow(dayType, adjustedProfileSummary, adjustedCompressors, 0, totals, reduceRuntime);
        useAutomaticSequencerProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
        if (electricityCost) {
          useAutomaticSequencerSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost);
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
      useAutomaticSequencerProfileSummary: useAutomaticSequencerProfileSummary
    };
  }


  calculateBaselineDayTypeProfileSummary(compressedAirAssessment: CompressedAirAssessment, dayType: CompressedAirDayType): Array<ProfileSummary> {
    let inventoryItems: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(compressedAirAssessment.compressorInventoryItems));
    //Adjuste perfomance points for sequencer
    if (compressedAirAssessment.systemInformation.isSequencerUsed) {
      inventoryItems.forEach(item => {
        item = this.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation.targetPressure, compressedAirAssessment.systemInformation.variance, item)
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
          let computeFrom: 1 | 2 | 3;
          let computeFromVal: number;
          if (dayType.profileDataType == 'power') {
            computeFrom = 2;
            computeFromVal = summaryData.power;
          } else if (dayType.profileDataType == 'percentCapacity') {
            computeFrom = 1;
            computeFromVal = summaryData.percentCapacity;
          } else if (dayType.profileDataType == 'airflow') {
            computeFrom = 3;
            computeFromVal = summaryData.airflow;
          }
          let calcResult: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, computeFrom, computeFromVal, 0, true);
          summaryData.airflow = calcResult.capacityCalculated;
          summaryData.power = calcResult.powerCalculated;
          summaryData.percentCapacity = calcResult.percentageCapacity;
          summaryData.percentPower = calcResult.percentagePower;
          summaryData.percentSystemCapacity = (calcResult.capacityCalculated / totalFullLoadCapacity) * 100;
          summaryData.percentSystemPower = (calcResult.powerCalculated / totalFullLoadPower) * 100
        });
        selectedDayTypeSummary.push(summary);
      }
    });
    return selectedDayTypeSummary;
  }

  calculateProfileSummaryTotals(compressorInventoryItems: Array<CompressorInventoryItem>, selectedDayType: CompressedAirDayType, profileSummary: Array<ProfileSummary>): Array<ProfileSummaryTotal> {
    let totalSystemCapacity: number = this.getTotalCapacity(compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressorInventoryItems);

    let allData: Array<ProfileSummaryData> = new Array();
    profileSummary.forEach(summary => {
      if (summary.dayTypeId == selectedDayType.dayTypeId) {
        allData = allData.concat(summary.profileSummaryData);
      }
    });
    let totals: Array<ProfileSummaryTotal> = new Array();
    let intervals: Array<number> = allData.map(data => { return data.timeInterval });
    intervals = _.uniq(intervals);
    intervals.forEach(interval => {
      let filteredData: Array<ProfileSummaryData> = allData.filter(data => { return data.timeInterval == interval && data.order != 0 });
      let totalAirFlow: number = _.sumBy(filteredData, 'airflow');
      let totalPower: number = _.sumBy(filteredData, 'power');
      totals.push({
        airflow: totalAirFlow,
        power: totalPower,
        percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
        percentPower: (totalPower / totalFullLoadPower) * 100,
        timeInterval: interval
      });
    });
    return totals;
  }

  reallocateFlow(dayType: CompressedAirDayType, profileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, additionalReceiverVolume: number, totals: Array<ProfileSummaryTotal>, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      adjustedProfileSummary = this.adjustProfile(total.airflow, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, additionalReceiverVolume, reduceRuntime);
    });
    return adjustedProfileSummary;
  }

  adjustProfile(neededAirFlow: number, timeInterval: number, adjustedCompressors: Array<CompressorInventoryItem>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, additionalRecieverVolume: number, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
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
    intervalData.forEach(data => {
      let isTurnedOn: boolean = data.summaryData.order != 0;
      if (reduceRuntime) {
        let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
          return dataItem.compressorId == data.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
        });
        let intervalData: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == data.summaryData.timeInterval });
        isTurnedOn = intervalData.isCompressorOn;
        reduceRuntimeShutdownTimer = reduceRuntimeData.automaticShutdownTimer;
      }
      if ((data.summaryData.order != 0 && isTurnedOn) && Math.abs(neededAirFlow) > 0.01) {
        let compressor: CompressorInventoryItem = adjustedCompressors.find(item => { return item.itemId == data.compressorId });
        if (reduceRuntime) {
          compressor.compressorControls.automaticShutdown = reduceRuntimeShutdownTimer;
        }
        let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
        //calc with full load
        let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow, additionalRecieverVolume, true);
        let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
        //if excess air added then reduce amount and calc again
        if (tmpNeededAirFlow < 0) {
          calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow + tmpNeededAirFlow, additionalRecieverVolume, true);
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
          order: data.summaryData.order,
        };
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
          order: data.summaryData.order,
        };
      }
    });
    return adjustedProfileSummary;
  }

  //adjustCascadingSetPoints
  adjustCascadingSetPointsAdjustCompressors(adjustedCompressors: Array<CompressorInventoryItem>, adjustCascadingSetPoints: AdjustCascadingSetPoints): Array<CompressorInventoryItem> {
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
      compressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressor);
    });
    return adjustedCompressors;
  }


  //improveEndUseEfficiency
  improveEndUseEfficiency(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, improveEndUseEfficiency: ImproveEndUseEfficiency, adjustedCompressors: Array<CompressorInventoryItem>, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      let reductionData: {
        dayTypeId: string;
        dayTypeName: string;
        data: Array<{
          hourInterval: number;
          applyReduction: boolean;
          reductionAmount: number;
        }>
      } = improveEndUseEfficiency.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
      let intervalReductionData = reductionData.data.find(rData => { return rData.hourInterval == total.timeInterval });
      if (improveEndUseEfficiency.reductionType == 'Fixed') {
        if (intervalReductionData.applyReduction) {
          total.airflow = total.airflow - improveEndUseEfficiency.airflowReduction;
        }
      } else if (improveEndUseEfficiency.reductionType == 'Variable') {
        if (intervalReductionData.reductionAmount) {
          total.airflow = total.airflow - intervalReductionData.reductionAmount;
        }
      }
      adjustedProfileSummary = this.adjustProfile(total.airflow, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, reduceRuntime);
    });
    return adjustedProfileSummary;
  }
  //reduceRuntime
  reduceRuntime(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, reduceRuntime: ReduceRuntime, adjustedCompressors: Array<CompressorInventoryItem>): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      adjustedProfileSummary = this.adjustProfile(total.airflow, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, reduceRuntime);
    });
    return adjustedProfileSummary;
  }
  //reduceAirLeaks
  reduceAirLeaks(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, reduceAirLeaks: ReduceAirLeaks, adjustedCompressors: Array<CompressorInventoryItem>, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, profileSummary);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    totals.forEach(total => {
      total.airflow = total.airflow - (reduceAirLeaks.leakReduction / 100 * reduceAirLeaks.leakFlow);
      adjustedProfileSummary = this.adjustProfile(total.airflow, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, 0, reduceRuntime);
    });
    return adjustedProfileSummary;
  }
  //reduceSystemAirPressure
  reduceSystemAirPressureAdjustCompressors(adjustedCompressors: Array<CompressorInventoryItem>, reduceSystemAirPressure: ReduceSystemAirPressure): Array<CompressorInventoryItem> {
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
      compressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressor);
    });
    return adjustedCompressors;
  }

  systemPressureChangeAdjustProfile(originalCompressors: Array<CompressorInventoryItem>, adjustedCompressors: Array<CompressorInventoryItem>, adjustedProfileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    adjustedProfileSummary.forEach(profile => {
      let ogCompressors: CompressorInventoryItem = originalCompressors.find(ogCompressor => { return ogCompressor.itemId == profile.compressorId });
      let adjustedCompressor: CompressorInventoryItem = adjustedCompressors.find(adjustedCompressor => { return adjustedCompressor.itemId == profile.compressorId });
      profile.profileSummaryData.forEach(summaryData => {
        summaryData.airflow = this.calculateReducedAirFlow(summaryData.airflow, adjustedCompressor.performancePoints.fullLoad.dischargePressure, adjustedCompressor.inletConditions.atmosphericPressure, ogCompressors.performancePoints.fullLoad.dischargePressure);
      });
    });

    return adjustedProfileSummary;
  }
  //useAutomaticSequencer
  useAutomaticSequencerAdjustCompressor(useAutomaticSequencer: UseAutomaticSequencer, inventoryItems: Array<CompressorInventoryItem>, automaticSequencerProfile: Array<ProfileSummary>, dayTypeId: string): Array<CompressorInventoryItem> {
    inventoryItems.forEach(item => {
      let sequencerProfile: ProfileSummary = automaticSequencerProfile.find(profileItem => { return profileItem.compressorId == item.itemId && profileItem.dayTypeId == dayTypeId });
      item.compressorControls.automaticShutdown = sequencerProfile.automaticShutdownTimer;
      item = this.adjustCompressorPerformancePointsWithSequencer(useAutomaticSequencer.targetPressure, useAutomaticSequencer.variance, item)
    });
    return inventoryItems;
  }


  adjustCompressorPerformancePointsWithSequencer(targetPressure: number, variance: number, item: CompressorInventoryItem): CompressorInventoryItem {
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
    if (controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10 || controlType == 6) {
      item.performancePoints.unloadPoint.dischargePressure = targetPressure + variance;
      item.performancePoints.unloadPoint.isDefaultPressure = false;
      if (item.performancePoints.maxFullFlow.dischargePressure > item.performancePoints.fullLoad.dischargePressure) {
        item.performancePoints.maxFullFlow.dischargePressure = item.performancePoints.fullLoad.dischargePressure;
        item.performancePoints.maxFullFlow.isDefaultPressure = false;
      }
    } else if (controlType == 1) {
      item.performancePoints.noLoad.dischargePressure = targetPressure + variance;
      item.performancePoints.noLoad.isDefaultPressure = false;
    } else if (controlType == 5 || controlType == 4) {
      item.performancePoints.maxFullFlow.dischargePressure = targetPressure + variance;
      item.performancePoints.maxFullFlow.isDefaultPressure = false;
    } else if (controlType == 7 || controlType == 9) {
      item.performancePoints.blowoff.dischargePressure = targetPressure + variance;
      item.performancePoints.blowoff.isDefaultPressure = false;
    }
    item.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(item);
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

  calculateSavings(profileSummary: Array<ProfileSummary>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): EemSavingsResults {
    let baselineResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(profileSummary, dayType, costKwh);
    let adjustedResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(adjustedProfileSummary, dayType, costKwh);
    let savings: { cost: number, power: number, peakDemand: number, percentSavings: number } = {
      cost: baselineResults.cost - adjustedResults.cost,
      power: baselineResults.power - adjustedResults.power,
      peakDemand: baselineResults.peakDemand - adjustedResults.peakDemand,
      percentSavings: ((baselineResults.cost - adjustedResults.cost) / baselineResults.cost) * 100,
    };
    return {
      baselineResults: baselineResults,
      adjustedResults: adjustedResults,
      savings: savings,
      dayTypeId: dayType.dayTypeId
    }
  }


  calculateEnergyAndCost(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): { cost: number, power: number, peakDemand: number } {
    let filteredSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    let flatSummaryData: Array<ProfileSummaryData> = _.flatMap(filteredSummary, (summary) => { return summary.profileSummaryData });
    flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
    let peakDemand: ProfileSummaryData = _.maxBy(flatSummaryData, 'power');
    let sumPower: number = _.sumBy(flatSummaryData, 'power');
    //todo: divide sumPower by hourInterval amount
    sumPower = sumPower * dayType.numberOfDays;
    let sumCost: number = sumPower * costKwh;
    return {
      cost: sumCost,
      peakDemand: peakDemand.power,
      power: sumPower
    }
  }

  calculateReducedAirFlow(c_usage: number, adjustedFullLoadDischargePressure: number, p_alt: number, originalFullLoadDischargePressure: number): number {
    if (adjustedFullLoadDischargePressure == originalFullLoadDischargePressure) {
      return c_usage;
    } else {
      let p: number = (adjustedFullLoadDischargePressure + p_alt) / (originalFullLoadDischargePressure + 14.7);
      return (c_usage - (c_usage - (c_usage * p)) * .6);
    }
  }

  getEmptyEemSavings(): EemSavingsResults {
    return {
      baselineResults: {
        cost: 0,
        power: 0,
        peakDemand: 0
      },
      adjustedResults: {
        cost: 0,
        power: 0,
        peakDemand: 0
      },
      savings: {
        cost: 0,
        power: 0,
        peakDemand: 0,
        percentSavings: 0
      },
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
  dayTypeId: string

}


export interface EemSavingsResults {
  baselineResults: { cost: number, power: number, peakDemand: number },
  adjustedResults: { cost: number, power: number, peakDemand: number },
  savings: { cost: number, power: number, peakDemand: number, percentSavings: number },
  dayTypeId: string,
}

export interface BaselineResults {
  total: BaselineResult,
  dayTypeResults: Array<BaselineResult>,
  demandCost: number,
  totalAnnualOperatingCost: number
}

export interface BaselineResult {
  cost: number,
  energyUse: number,
  peakDemand: number,
  name: string,
  averageAirFlow: number,
  averageAirFlowPercentCapacity: number,
  operatingDays: number,
  totalOperatingHours: number,
  loadFactorPercent: number

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
}