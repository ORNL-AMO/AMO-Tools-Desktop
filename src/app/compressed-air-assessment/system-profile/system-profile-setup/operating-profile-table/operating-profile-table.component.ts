import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Component({
  selector: 'app-operating-profile-table',
  templateUrl: './operating-profile-table.component.html',
  styleUrls: ['./operating-profile-table.component.css']
})
export class OperatingProfileTableComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
  profileSummary: Array<ProfileSummary>;
  profileDataType: "power" | "percentCapacity" | "airflow";
  selectedDayTypeId: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.profileDataType = val.systemProfile.systemProfileSetup.profileDataType;
        this.selectedDayTypeId = val.systemProfile.systemProfileSetup.dayTypeId;
        this.profileSummary = val.systemProfile.profileSummary;
        this.initializeProfileSummary(val.compressorInventoryItems, val.systemProfile.systemProfileSetup, val.compressedAirDayTypes);
        this.hourIntervals = this.profileSummary[0].profileSummaryData.map(data => { return data.timeInterval });
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  initializeProfileSummary(compressorInventoryItems: Array<CompressorInventoryItem>, systemProfileSetup: SystemProfileSetup, dayTypes: Array<CompressedAirDayType>) {
    //remove missing daytype/compressor combos
    let inventoryItemIds: Array<string> = compressorInventoryItems.map(item => { return item.itemId });
    let dayTypeIds: Array<string> = dayTypes.map(dayType => { return dayType.dayTypeId });
    this.profileSummary.filter(summary => {
      let inventoryItemExist: boolean = inventoryItemIds.includes(summary.compressorId);
      let dayTypeItemExist: boolean = dayTypeIds.includes(summary.dayTypeId);
      return (!inventoryItemExist || !dayTypeItemExist);
    });

    //add missing dayType/compressor combos
    let updatedSummary: Array<ProfileSummary> = new Array();
    compressorInventoryItems.forEach(item => {
      dayTypes.forEach(dayType => {
        let profileSummaryItem: ProfileSummary = this.checkProfileSummary(item, dayType.dayTypeId, this.profileSummary, systemProfileSetup);
        updatedSummary.push(profileSummaryItem);
      })
    });
    this.profileSummary = updatedSummary;
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  checkProfileSummary(inventoryItem: CompressorInventoryItem, dayTypeId: string, allProfileSummaries: Array<ProfileSummary>, systemProfileSetup: SystemProfileSetup): ProfileSummary {
    let profileSummary: ProfileSummary = allProfileSummaries.find(summary => { return summary.dayTypeId == dayTypeId && inventoryItem.itemId == summary.compressorId });
    if (profileSummary && (profileSummary.profileSummaryData.length == (systemProfileSetup.numberOfHours / systemProfileSetup.dataInterval))) {
      return profileSummary
    } else {
      let profileSummaryData: Array<ProfileSummaryData> = this.getDummyData(systemProfileSetup.numberOfHours, systemProfileSetup.dataInterval);
      profileSummary = {
        compressorId: inventoryItem.itemId,
        compressorName: inventoryItem.name,
        dayTypeId: dayTypeId,
        profileSummaryData: profileSummaryData
      }
    }
    return profileSummary;
  }

  getDummyData(numberOfHours: number, dataInterval: number): Array<ProfileSummaryData> {
    let profileSummaryData: Array<ProfileSummaryData> = new Array();
    for (let timeInterval = 1; timeInterval <= numberOfHours;) {
      profileSummaryData.push({
        power: undefined,
        airflow: undefined,
        percentCapacity: Math.floor(Math.random() * 100),
        timeInterval: timeInterval,
        percentPower: undefined,
        percentSystemCapacity: 0
      })
      timeInterval = timeInterval + dataInterval;
    }
    return profileSummaryData;
  }

}
