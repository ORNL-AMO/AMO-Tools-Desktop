import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import * as _ from 'lodash';

@Injectable()
export class SystemProfileService {


  constructor(private formBuilder: FormBuilder, private compressedAirCalculationService: CompressedAirCalculationService) {
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


  calculateDayTypeProfileSummary(compressedAirAssessment: CompressedAirAssessment): Array<ProfileSummary> {
    let inventoryItems: Array<CompressorInventoryItem> = compressedAirAssessment.compressorInventoryItems;
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let selectedDayTypeSummary: Array<ProfileSummary> = new Array();
    let totalFullLoadCapacity: number = _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
    selectedProfileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = inventoryItems.find(item => { return item.itemId == summary.compressorId });
      if (summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId) {
        summary.profileSummaryData.forEach(summaryData => {
          let computeFrom: 1 | 2 | 3;
          let computeFromVal: number;
          if (compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType == 'power') {
            computeFrom = 2;
            computeFromVal = summaryData.power;
          } else if (compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType == 'percentCapacity') {
            computeFrom = 1;
            computeFromVal = summaryData.percentCapacity;
          } else if (compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType == 'airflow') {
            computeFrom = 3;
            computeFromVal = summaryData.airflow;
          }
          let calcResult: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, computeFrom, computeFromVal);
          summaryData.airflow = calcResult.capacityCalculated;
          summaryData.power = calcResult.powerCalculated;
          summaryData.percentCapacity = calcResult.percentageCapacity;
          summaryData.percentPower = calcResult.percentagePower;
          summaryData.percentSystemCapacity = (calcResult.capacityCalculated / totalFullLoadCapacity) * 100;
        });
        selectedDayTypeSummary.push(summary);
      }
    });
    return selectedDayTypeSummary;
  }

  calculateProfileSummaryTotals(compressedAirAssessment: CompressedAirAssessment, profileSummary?: Array<ProfileSummary>): Array<ProfileSummaryTotal> {
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
      if (summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId) {
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


  flowReallocation(compressedAirAssessment: CompressedAirAssessment): Array<ProfileSummary> {
    // let profileSummaryData: Array<ProfileSummary> = this.calculateDayTypeProfileSummary(compressedAirAssessment);
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment);

    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(compressedAirAssessment.systemProfile.profileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
    adjustedProfileSummary.forEach(summary => {
      summary.profileSummaryData = new Array();
    });


    totals.forEach(total => {
      adjustedProfileSummary = this.calculatedNeededAirFlow(total, compressedAirAssessment, adjustedProfileSummary);
    });
    return adjustedProfileSummary;
  }

  calculatedNeededAirFlow(total: ProfileSummaryTotal, compressedAirAssessment: CompressedAirAssessment, adjustedProfileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    // console.log('interval: ' + total.timeInterval);
    let neededAirFlow: number = total.airflow;
    let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId) {
        intervalData.push({
          compressorId: summary.compressorId,
          summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == total.timeInterval })
        });
      }
    });

    intervalData = _.orderBy(intervalData, (data) => { return data.summaryData.order });
    intervalData.forEach(data => {
      if (data.summaryData.order != 0 && Math.abs(neededAirFlow) > 0.01) {
        let compressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == data.compressorId });
        // console.log(compressor.name);
        let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
        let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow);
        let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
        // console.log(tmpNeededAirFlow);
        if (tmpNeededAirFlow < 0) {
          // console.log('re-calc')
          calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow + tmpNeededAirFlow);
          tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
          // console.log(tmpNeededAirFlow)
        }
        neededAirFlow = tmpNeededAirFlow;
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: calculateFullLoad.powerCalculated,
          airflow: calculateFullLoad.capacityCalculated,
          percentCapacity: calculateFullLoad.percentageCapacity,
          timeInterval: data.summaryData.timeInterval,
          percentPower: calculateFullLoad.percentagePower,
          //TODO
          percentSystemCapacity: 0,
          order: data.summaryData.order,
        });
      } else {
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: 0,
          airflow: 0,
          percentCapacity: 0,
          timeInterval: data.summaryData.timeInterval,
          percentPower: 0,
          //TODO
          percentSystemCapacity: 0,
          order: data.summaryData.order,
        });
      }
    });
    // console.log('final air flow: ' + neededAirFlow);
    // console.log('===');
    return adjustedProfileSummary;
  }



}
