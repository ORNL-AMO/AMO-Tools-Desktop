import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary, SystemInformation, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-system-profile-summary',
  templateUrl: './system-profile-summary.component.html',
  styleUrls: ['./system-profile-summary.component.css']
})
export class SystemProfileSummaryComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  totals: Array<{
    airflow: number;
    power: number;
    percentCapacity: number;
    percentPower: number;
  }>;
  inventoryItems: Array<CompressorInventoryItem>;
  settings: Settings;
  systemProfileSetup: SystemProfileSetup;
  systemInformation: SystemInformation;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.systemInformation = val.systemInformation;
      this.systemProfileSetup = val.systemProfile.systemProfileSetup;
      let selectedDayType: CompressedAirDayType = val.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == val.systemProfile.systemProfileSetup.dayTypeId });
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(val, selectedDayType, this.settings);
      this.totals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(val.compressorInventoryItems, selectedDayType, this.profileSummary, val.systemProfile.systemProfileSetup.dataInterval);
      this.inventoryItems = val.compressorInventoryItems;
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }
}
