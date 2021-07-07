import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../compressed-air-calculation.service';
import { SystemProfileService } from '../system-profile.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-system-profile-summary',
  templateUrl: './system-profile-summary.component.html',
  styleUrls: ['./system-profile-summary.component.css']
})
export class SystemProfileSummaryComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  inventoryItems: Array<CompressorInventoryItem>;
  profileDataType: "power" | "percentCapacity" | "airflow";
  totals: Array<{
    airflow: number;
    power: number;
    percentCapacity: number;
    percentPower: number;
  }>;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirCalculationService: CompressedAirCalculationService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.inventoryItems = val.compressorInventoryItems;
      this.profileDataType = val.systemProfile.systemProfileSetup.profileDataType;
      this.profileSummary = this.calculateProfileSummary(val.systemProfile.profileSummary);
      this.setTotals();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  calculateProfileSummary(profileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    profileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == summary.compressorId });
      summary.profileSummaryData.forEach(summaryData => {
        let computeFrom: 1 | 2 | 3;
        let computeFromVal: number;
        if (this.profileDataType == 'power') {
          computeFrom = 2;
          computeFromVal = summaryData.power;
        } else if (this.profileDataType == 'percentCapacity') {
          computeFrom = 1;
          computeFromVal = summaryData.percentCapacity;
        } else if (this.profileDataType == 'airflow') {
          computeFrom = 3;
          computeFromVal = summaryData.airflow;
        }
        let calcResult: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, computeFrom, computeFromVal);
        summaryData.airflow = calcResult.capacityCalculated;
        summaryData.power = calcResult.powerCalculated;
        summaryData.percentCapacity = calcResult.percentageCapacity;
        summaryData.percentPower = calcResult.percentagePower;
      });
    });
    return profileSummary;
  }

  setTotals() {
    this.totals = new Array();
    let intervals: Array<number> = this.profileSummary[0].profileSummaryData.map(data => { return data.timeInterval });
    let allData: Array<ProfileSummaryData> = _.flatMap(this.profileSummary, (summary) => { return summary.profileSummaryData });

    intervals.forEach(interval => {
      let filteredData: Array<ProfileSummaryData> = allData.filter(data => { return data.timeInterval == interval });
      let totalAirFlow: number = _.sumBy(filteredData, 'airflow');
      let totalPower: number = _.sumBy(filteredData, 'power');
      let totalPercentCapacity: number = _.sumBy(filteredData, 'percentCapacity');
      let percentCapacity: number = totalPercentCapacity / filteredData.length;
      let totalPercentPower: number = _.sumBy(filteredData, 'percentPower');
      let percentPower: number = totalPercentPower / filteredData.length;
      this.totals.push({
        airflow: totalAirFlow,
        power: totalPower,
        percentCapacity: percentCapacity,
        percentPower: percentPower
      });
    });
  }
}
