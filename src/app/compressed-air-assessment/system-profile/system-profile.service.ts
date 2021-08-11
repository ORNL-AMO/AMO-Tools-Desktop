import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntime, ReduceRuntimeData, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import * as _ from 'lodash';
import { PerformancePointCalculationsService } from '../inventory/performance-points/calculations/performance-point-calculations.service';

@Injectable()
export class SystemProfileService {


  constructor(private formBuilder: FormBuilder, private compressedAirCalculationService: CompressedAirCalculationService,
    private performancePointCalculationsService: PerformancePointCalculationsService) {
  }

  getProfileSetupFormFromObj(systemProfileSetup: SystemProfileSetup, dayTypes: Array<CompressedAirDayType>): FormGroup {
    let dayTypeExists: CompressedAirDayType = dayTypes.find(dayType => { return dayType.dayTypeId == systemProfileSetup.dayTypeId });
    if (!dayTypeExists && dayTypes.length != 0) {
      systemProfileSetup.dayTypeId = dayTypes[0].dayTypeId;
      systemProfileSetup.profileDataType = dayTypes[0].profileDataType;
    }
    let form: FormGroup = this.formBuilder.group({
      dayTypeId: [systemProfileSetup.dayTypeId],
      numberOfHours: [systemProfileSetup.numberOfHours, [Validators.required, Validators.min(24)]],
      dataInterval: [systemProfileSetup.dataInterval, [Validators.required]],
      profileDataType: [systemProfileSetup.profileDataType]
    })
    return form;
  }

  getProfileSetupFromForm(form: FormGroup): SystemProfileSetup {
    return {
      dayTypeId: form.controls.dayTypeId.value,
      numberOfHours: form.controls.numberOfHours.value,
      dataInterval: form.controls.dataInterval.value,
      profileDataType: form.controls.profileDataType.value
    }
  }


  calculateDayTypeProfileSummary(compressedAirAssessment: CompressedAirAssessment, dayTypeId?: string): Array<ProfileSummary> {
    let inventoryItems: Array<CompressorInventoryItem> = compressedAirAssessment.compressorInventoryItems;
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let selectedDayTypeSummary: Array<ProfileSummary> = new Array();
    let totalFullLoadCapacity: number = _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      if (!dayTypeId || dayType.dayTypeId == dayTypeId) {
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
            });
            selectedDayTypeSummary.push(summary);
          }
        });
      }
    });
    return selectedDayTypeSummary;
  }

  calculateProfileSummaryTotals(compressedAirAssessment: CompressedAirAssessment, selectedDayType: CompressedAirDayType, profileSummary?: Array<ProfileSummary>): Array<ProfileSummaryTotal> {
    let selectedProfileSummary: Array<ProfileSummary> = profileSummary;
    if (!profileSummary) {
      selectedProfileSummary = compressedAirAssessment.systemProfile.profileSummary;
    }
    let totalSystemCapacity: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });

    let totalFullLoadPower: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.performancePoints.fullLoad.power;
    });
    let allData: Array<ProfileSummaryData> = new Array();
    selectedProfileSummary.forEach(summary => {
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


  //no sequencer
  updateCompressorOrderingNoSequencer(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType): Array<ProfileSummary> {
    let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < 24; orderIndex++) {
        let order: number = 1;
        for (let compressorOrderIndex = 0; compressorOrderIndex < dayTypeSummaries.length; compressorOrderIndex++) {
          if (compressorOrderIndex != compressorIndex && dayTypeSummaries[compressorOrderIndex].profileSummaryData[orderIndex].order != 0) {
            if (dayTypeSummaries[compressorIndex].fullLoadPressure < dayTypeSummaries[compressorOrderIndex].fullLoadPressure) {
              order++;
            } else if (dayTypeSummaries[compressorOrderIndex].fullLoadPressure == dayTypeSummaries[compressorIndex].fullLoadPressure && compressorOrderIndex < compressorIndex) {
              order++;
            }
          }
        }
        if (dayTypeSummaries[compressorIndex].profileSummaryData[orderIndex].order != 0) {
          let summaryIndex: number = profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
          profileSummary[summaryIndex].profileSummaryData[orderIndex].order = order;
        }
      }
    }
    return profileSummary;
  }

  updateCompressorOrderingSequencer(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, removedSummary: ProfileSummary): Array<ProfileSummary> {
    let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < 24; orderIndex++) {
        if (dayTypeSummaries[compressorIndex].profileSummaryData[orderIndex].order > removedSummary.profileSummaryData[orderIndex].order) {
          let summaryIndex: number = profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
          profileSummary[summaryIndex].profileSummaryData[orderIndex].order--;
        }
      }
    }
    return profileSummary;
  }


  flowReallocation(compressedAirAssessment: CompressedAirAssessment, dayType: CompressedAirDayType, modification: Modification, applyEEEMs: boolean): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment, dayType);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(compressedAirAssessment.systemProfile.profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    adjustedProfileSummary.forEach(summary => {
      summary.profileSummaryData = new Array();
    });


    totals.forEach(total => {
      adjustedProfileSummary = this.calculatedNeededAirFlow(total, compressedAirAssessment, adjustedProfileSummary, dayType, modification, applyEEEMs);
    });
    return adjustedProfileSummary;
  }

  calculatedNeededAirFlow(total: ProfileSummaryTotal, compressedAirAssessment: CompressedAirAssessment, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, modification: Modification, applyEEEMs: boolean): Array<ProfileSummary> {
    let neededAirFlow: number = total.airflow;
    if (applyEEEMs) {
      //EEM: Reduce Air leaks
      if (modification.reduceAirLeaks.selected) {
        neededAirFlow = neededAirFlow - (modification.reduceAirLeaks.leakReduction / 100 * modification.reduceAirLeaks.leakFlow);
      }
      //EEM: Improve End use Efficiency
      if (modification.improveEndUseEfficiency.selected) {
        let reductionData: {
          dayTypeId: string;
          dayTypeName: string;
          data: Array<{
            hourInterval: number;
            applyReduction: boolean;
            reductionAmount: number;
          }>
        } = modification.improveEndUseEfficiency.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
        let intervalReductionData = reductionData.data.find(rData => { return rData.hourInterval == total.timeInterval });
        if (modification.improveEndUseEfficiency.reductionType == 'Fixed') {
          if (intervalReductionData.applyReduction) {
            neededAirFlow = neededAirFlow - modification.improveEndUseEfficiency.airflowReduction;
          }
        } else if (modification.improveEndUseEfficiency.reductionType == 'Variable') {
          if (intervalReductionData.reductionAmount) {
            neededAirFlow = neededAirFlow - intervalReductionData.reductionAmount;
          }
        }
      }
    }
    let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.dayTypeId == dayType.dayTypeId) {
        intervalData.push({
          compressorId: summary.compressorId,
          summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == total.timeInterval })
        });
      }
    });

    intervalData = _.orderBy(intervalData, (data) => { return data.summaryData.order });
    intervalData.forEach(data => {
      let isTurnedOn: boolean = data.summaryData.order != 0;
      let additionalRecieverVolume: number = 0
      if (applyEEEMs) {
        //EEM: Reduce run time
        if (modification.reduceRuntime.selected) {
          let reduceRuntime: ReduceRuntimeData = modification.reduceRuntime.runtimeData.find(dataItem => {
            return dataItem.compressorId == data.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
          });
          let intervalData: { isCompressorOn: boolean, timeInterval: number } = reduceRuntime.intervalData.find(iData => { return iData.timeInterval == data.summaryData.timeInterval });
          isTurnedOn = intervalData.isCompressorOn;
        }
        //EEM: Add primary receiver volume
        if (modification.addPrimaryReceiverVolume.selected) {
          additionalRecieverVolume = modification.addPrimaryReceiverVolume.increasedVolume;
        }
      }
      if ((data.summaryData.order != 0 && isTurnedOn) && Math.abs(neededAirFlow) > 0.01) {
        let compressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == data.compressorId });
        let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(compressor));
        if (applyEEEMs) {
          //EEM: Use unloading controls
          if (modification.useUnloadingControls.selected) {
            let adjustedCompressor: AdjustedUnloadingCompressor = modification.useUnloadingControls.adjustedCompressors.find(adjustedCompressor => {
              return (adjustedCompressor.compressorId == compressorCopy.itemId);
            });
            let adjustedCompressorCopy: AdjustedUnloadingCompressor = JSON.parse(JSON.stringify(adjustedCompressor))
            compressorCopy.compressorControls.controlType = adjustedCompressorCopy.controlType;
            compressorCopy.performancePoints = adjustedCompressorCopy.performancePoints;
            compressorCopy.compressorControls.unloadPointCapacity = adjustedCompressorCopy.unloadPointCapacity;
            compressorCopy.compressorControls.automaticShutdown = adjustedCompressorCopy.automaticShutdown;
          }
          //EEM: Reduce System Pressure
          if (modification.reduceSystemAirPressure.selected) {
            let originalPressure: number = compressorCopy.performancePoints.fullLoad.dischargePressure;
            compressorCopy.performancePoints.fullLoad.dischargePressure = compressorCopy.performancePoints.fullLoad.dischargePressure - modification.reduceSystemAirPressure.averageSystemPressureReduction;
            compressorCopy.performancePoints.fullLoad.isDefaultPressure = false;
            compressorCopy.performancePoints.fullLoad.airflow = this.calculateReducedAirFlow(compressorCopy.performancePoints.fullLoad.airflow, compressorCopy.performancePoints.fullLoad.dischargePressure, compressorCopy.inletConditions.atmosphericPressure, originalPressure);
            compressorCopy.performancePoints.fullLoad.isDefaultAirFlow = false;
            compressorCopy.performancePoints.fullLoad.isDefaultPower = true;
            compressorCopy.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressorCopy);
          }
        }

        let fullLoadAirFlow: number = compressorCopy.performancePoints.fullLoad.airflow;
        //calc with full load
        let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressorCopy, 3, fullLoadAirFlow, additionalRecieverVolume, true);
        let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
        //if excess air added then reduce amount and calc again
        if (tmpNeededAirFlow < 0) {
          calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressorCopy, 3, fullLoadAirFlow + tmpNeededAirFlow, additionalRecieverVolume, true);
          tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
        }
        neededAirFlow = tmpNeededAirFlow;
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: calculateFullLoad.powerCalculated,
          airflow: calculateFullLoad.capacityCalculated,
          percentCapacity: calculateFullLoad.percentageCapacity,
          timeInterval: data.summaryData.timeInterval,
          percentPower: calculateFullLoad.percentagePower,
          percentSystemCapacity: 0,
          order: data.summaryData.order,
        });
      } else {
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: 0,
          airflow: 0,
          percentCapacity: 0,
          timeInterval: data.summaryData.timeInterval,
          percentPower: 0,
          percentSystemCapacity: 0,
          order: data.summaryData.order,
        });
      }
    });
    return adjustedProfileSummary;
  }


  calculateSavings(profileSummary: Array<ProfileSummary>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): {
    baselineResults: { cost: number, power: number, peakDemand: number },
    adjustedResults: { cost: number, power: number, peakDemand: number },
    savings: { cost: number, power: number, peakDemand: number }
  } {
    let baselineResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(profileSummary, dayType, costKwh);
    let adjustedResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(adjustedProfileSummary, dayType, costKwh);
    let savings: { cost: number, power: number, peakDemand: number } = {
      cost: baselineResults.cost - adjustedResults.cost,
      power: baselineResults.power - adjustedResults.power,
      peakDemand: baselineResults.peakDemand - adjustedResults.peakDemand
    };
    return {
      baselineResults: baselineResults,
      adjustedResults: adjustedResults,
      savings: savings
    }
  }


  calculateEnergyAndCost(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): { cost: number, power: number, peakDemand: number } {
    let filteredSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    let flatSummaryData: Array<ProfileSummaryData> = _.flatMap(filteredSummary, (summary) => { return summary.profileSummaryData });
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

  calculateReducedAirFlow(c_usage: number, p_fl_rpred: number, p_alt: number, p_fl: number): number {
    let p: number = (p_fl_rpred + p_alt) / (p_fl + 14.7);
    return (c_usage - (c_usage - (c_usage * p)) * .6)
  }

}
