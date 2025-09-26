import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary, SystemInformation, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirBaselineDayTypeProfileSummary } from '../../calculations/CompressedAirBaselineDayTypeProfileSummary';
import { CompressedAirCalculationService } from '../../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';

@Component({
    selector: 'app-system-profile-summary',
    templateUrl: './system-profile-summary.component.html',
    styleUrls: ['./system-profile-summary.component.css'],
    standalone: false
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
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.systemInformation = val.systemInformation;
      this.systemProfileSetup = val.systemProfile.systemProfileSetup;
      let selectedDayType: CompressedAirDayType = val.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == val.systemProfile.systemProfileSetup.dayTypeId });
      let compressedAirBaselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary = new CompressedAirBaselineDayTypeProfileSummary(val, selectedDayType, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      this.profileSummary = compressedAirBaselineDayTypeProfileSummary.profileSummary;
      this.totals = compressedAirBaselineDayTypeProfileSummary.profileSummaryTotals;
      this.inventoryItems = val.compressorInventoryItems;
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }
}
