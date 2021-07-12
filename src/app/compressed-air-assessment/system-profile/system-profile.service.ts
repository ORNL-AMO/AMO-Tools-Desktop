import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Injectable()
export class SystemProfileService {


  // selectedProfileSummary: BehaviorSubject<Array<ProfileSummary>>;
  constructor(private formBuilder: FormBuilder, private compressedAirCalculationService: CompressedAirCalculationService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) {
    // this.selectedProfileSummary = new BehaviorSubject<Array<ProfileSummary>>([]);
   }

  getProfileSetupFormFromObj(systemProfileSetup: SystemProfileSetup, dayTypes: Array<CompressedAirDayType>): FormGroup {
    let dayTypeExists: CompressedAirDayType = dayTypes.find(dayType => {return dayType.dayTypeId == systemProfileSetup.dayTypeId});
    if(!dayTypeExists && dayTypes.length != 0){
      systemProfileSetup.dayTypeId = dayTypes[0].dayTypeId;
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


  calculateProfileSummary(compressedAirAssessment: CompressedAirAssessment): Array<{compressorName: string, summaryData: Array<ProfileSummaryData>}> {
    let results: Array<{compressorName: string, summaryData: Array<ProfileSummaryData>}> = new Array();
    let inventoryItems: Array<CompressorInventoryItem> = compressedAirAssessment.compressorInventoryItems;
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let totalFullLoadCapacity: number = _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
    selectedProfileSummary.forEach(summary => {
      let profileSummaryData: Array<ProfileSummaryData> = new Array();
      let compressor: CompressorInventoryItem = inventoryItems.find(item => { return item.itemId == summary.compressorId });
      summary.dayTypeSummarries.forEach(summary => {
        if(summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId){
          profileSummaryData = profileSummaryData.concat(summary.profileSummaryData);
        }
      })
      profileSummaryData.forEach(summaryData => {
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
      results.push({compressorName: summary.compressorName, summaryData: profileSummaryData});
    });
    return results;
  }

  calculateProfileSummaryTotals(compressedAirAssessment: CompressedAirAssessment): Array<{ airflow: number, power: number, percentCapacity: number, percentPower: number }> {
    // let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    // let inventoryItems: Array<CompressorInventoryItem> = compressedAirAssessment.compressorInventoryItems;
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let totalSystemCapacity: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });

    let totalFullLoadPower: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.performancePoints.fullLoad.power;
    });
    let allData: Array<ProfileSummaryData> = new Array();
    selectedProfileSummary.forEach(summary => {      
      // let compressor: CompressorInventoryItem = inventoryItems.find(item => { return item.itemId == summary.compressorId });
      summary.dayTypeSummarries.forEach(summary => {
        if(summary.dayTypeId == compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId){
          allData = allData.concat(summary.profileSummaryData);
        }
      })
    });
    let totals: Array<{ airflow: number, power: number, percentCapacity: number, percentPower: number }> = new Array();
    let intervals: Array<number> = allData.map(data => { return data.timeInterval });
    intervals = _.uniq(intervals);
    // let allData: Array<ProfileSummaryData> = _.flatMap(compressedAirAssessment.systemProfile.profileSummary, (summary) => { return summary.profileSummaryData });

    intervals.forEach(interval => {
      let filteredData: Array<ProfileSummaryData> = allData.filter(data => { return data.timeInterval == interval });
      let totalAirFlow: number = _.sumBy(filteredData, 'airflow');
      let totalPower: number = _.sumBy(filteredData, 'power');
      totals.push({
        airflow: totalAirFlow,
        power: totalPower,
        percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
        percentPower: (totalPower / totalFullLoadPower) * 100
      });
    });
    return totals;
  }
}
