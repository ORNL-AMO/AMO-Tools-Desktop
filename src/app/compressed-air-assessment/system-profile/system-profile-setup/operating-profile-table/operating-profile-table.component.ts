import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, CompressorOrderItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile.service';

@Component({
  selector: 'app-operating-profile-table',
  templateUrl: './operating-profile-table.component.html',
  styleUrls: ['./operating-profile-table.component.css']
})
export class OperatingProfileTableComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  // orderingOptions: Array<number>;
  compressorOrdering: Array<CompressorOrderItem>
  hourIntervals: Array<number>;
  profileSummary: Array<ProfileSummary>;
  profileDataType: "power" | "percentCapacity" | "airflow";
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.profileDataType = val.systemProfile.systemProfileSetup.profileDataType;
        this.profileSummary = val.systemProfile.profileSummary;
        this.initializeProfileSummary(val.compressorInventoryItems, val.systemProfile.systemProfileSetup);
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  initializeProfileSummary(compressorInventoryItems: Array<CompressorInventoryItem>, systemProfileSetup: SystemProfileSetup) {
    if (this.profileSummary.length != compressorInventoryItems.length) {
      this.profileSummary = new Array();
      compressorInventoryItems.forEach(item => {
        this.hourIntervals = new Array();
        let profileSummaryData: Array<ProfileSummaryData> = new Array();
        for (let timeInterval = 1; timeInterval <= systemProfileSetup.numberOfHours;) {
          profileSummaryData.push({
            power: undefined,
            airflow: undefined,
            percentCapacity: Math.floor(Math.random() * 100),
            timeInterval: timeInterval,
            percentPower: undefined
          })
          this.hourIntervals.push(timeInterval);
          timeInterval = timeInterval + systemProfileSetup.dataInterval;
        }
        this.profileSummary.push({
          compressorName: item.name,
          compressorId: item.itemId,
          profileSummaryData: profileSummaryData
        })
      });
      this.save();
    } else {
      this.profileSummary.forEach(summaryItem => {
        this.hourIntervals = new Array();
        let profileSummaryData: Array<ProfileSummaryData> = new Array();
        for (let timeInterval = 1; timeInterval <= systemProfileSetup.numberOfHours;) {
          profileSummaryData.push({
            power: undefined,
            airflow: undefined,
            percentCapacity: Math.floor(Math.random() * 100),
            timeInterval: timeInterval,
            percentPower: undefined
          })
          this.hourIntervals.push(timeInterval);
          timeInterval = timeInterval + systemProfileSetup.dataInterval;
        }
        if (summaryItem.profileSummaryData.length != profileSummaryData.length) {
          summaryItem.profileSummaryData = profileSummaryData;
        }
      });
      this.save();
    }
  }

  save() {
    this.isFormChange = true;
    // let systemProfileSetup: SystemProfileSetup = this.systemProfileService.getProfileSetupFromForm(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
