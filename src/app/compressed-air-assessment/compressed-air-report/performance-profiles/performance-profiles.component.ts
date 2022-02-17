import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';

@Component({
  selector: 'app-performance-profiles',
  templateUrl: './performance-profiles.component.html',
  styleUrls: ['./performance-profiles.component.css']
})
export class PerformanceProfilesComponent implements OnInit {
  @Input()
  inReport: boolean;

  @Input()
  printView: boolean;

  @Input()
  compressedAirAssessment: CompressedAirAssessment;

  @Input()
  settings: Settings;

  dayTypes: Array<CompressedAirDayType>;

  compressorSummaries: Array<Array<CompressorSummary>>

  inventoryItems: Array<CompressorInventoryItem>;

  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit() {
    this.inventoryItems = this.compressedAirAssessment.compressorInventoryItems;
    this.dayTypes = this.compressedAirAssessment.compressedAirDayTypes;
    this.compressorSummaries = this.compressedAirAssessmentResultsService.calculateCompressorSummary(this.dayTypes, this.compressedAirAssessment, this.settings);

  }

}
