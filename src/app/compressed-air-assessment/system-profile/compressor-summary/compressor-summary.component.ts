import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-compressor-summary',
  templateUrl: './compressor-summary.component.html',
  styleUrls: ['./compressor-summary.component.css']
})
export class CompressorSummaryComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  
  inventoryItems: Array<CompressorInventoryItem>;
  settings: Settings;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      let selectedDayType: CompressedAirDayType = val.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == val.systemProfile.systemProfileSetup.dayTypeId });
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(val, selectedDayType, this.settings);
      this.inventoryItems = val.compressorInventoryItems;
    });
  }

}
