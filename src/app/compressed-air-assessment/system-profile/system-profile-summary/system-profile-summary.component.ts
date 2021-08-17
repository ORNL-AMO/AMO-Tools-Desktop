import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';

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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      let selectedDayType: CompressedAirDayType = val.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == val.systemProfile.systemProfileSetup.dayTypeId });
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateDayTypeProfileSummary(val, selectedDayType);
      this.totals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(val, selectedDayType, this.profileSummary);
      this.inventoryItems = val.compressorInventoryItems;
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }
}
