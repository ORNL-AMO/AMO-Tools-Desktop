import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
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
  compressedAirAssessment: CompressedAirAssessment;
  dayTypes: Array<CompressedAirDayType>;

  compressorSummaries: Array<Array<CompressorSummary>>

  inventoryItems: Array<CompressorInventoryItem>;
  settings: Settings;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit() {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.inventoryItems = val.compressorInventoryItems;
      this.dayTypes = val.compressedAirDayTypes;
    });

    this.compressorSummaries = this.compressedAirAssessmentResultsService.calculateCompressorSummary(this.dayTypes, this.compressedAirAssessment, this.settings);

    
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

}
