import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import * as _ from 'lodash';

@Injectable()
export class SystemProfileService {



  constructor(private formBuilder: FormBuilder, private compressedAirCalculationService: CompressedAirCalculationService) { }

  getProfileSetupFormFromObj(systemProfileSetup: SystemProfileSetup): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      dayType: [systemProfileSetup.dayType],
      numberOfHours: [systemProfileSetup.numberOfHours, [Validators.required, Validators.min(24)]],
      dataInterval: [systemProfileSetup.dataInterval, [Validators.required]],
      profileDataType: [systemProfileSetup.profileDataType]
    })
    return form;
  }

  getProfileSetupFromForm(form: FormGroup): SystemProfileSetup {
    return {
      dayType: form.controls.dayType.value,
      numberOfHours: form.controls.numberOfHours.value,
      dataInterval: form.controls.dataInterval.value,
      profileDataType: form.controls.profileDataType.value
    }
  }


  calculateProfileSummary(compressedAirAssessment: CompressedAirAssessment): Array<ProfileSummary> {
    let totalFullLoadCapacity: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == summary.compressorId });
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
    });
    return compressedAirAssessment.systemProfile.profileSummary;
  }

  calculateProfileSummaryTotals(compressedAirAssessment: CompressedAirAssessment): Array<{ airflow: number, power: number, percentCapacity: number, percentPower: number }> {
    let totalSystemCapacity: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });

    let totalFullLoadPower: number = _.sumBy(compressedAirAssessment.compressorInventoryItems, (inventoryItem) => {
      return inventoryItem.performancePoints.fullLoad.power;
    });
    let totals: Array<{ airflow: number, power: number, percentCapacity: number, percentPower: number }> = new Array();
    let intervals: Array<number> = compressedAirAssessment.systemProfile.profileSummary[0].profileSummaryData.map(data => { return data.timeInterval });
    let allData: Array<ProfileSummaryData> = _.flatMap(compressedAirAssessment.systemProfile.profileSummary, (summary) => { return summary.profileSummaryData });

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
