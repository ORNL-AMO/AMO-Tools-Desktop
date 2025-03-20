import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';

@Component({
    selector: 'app-compressor-summary-table',
    templateUrl: './compressor-summary-table.component.html',
    styleUrls: ['./compressor-summary-table.component.css'],
    standalone: false
})
export class CompressorSummaryTableComponent implements OnInit {
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  inReport: boolean;  
  
  compressorSummaries: Array<Array<CompressorSummary>>;
  dayTypes: Array<CompressedAirDayType>;
  compressorInventoryItems: Array<CompressorInventoryItem>;


  @ViewChild('profileTable', { static: false }) profileTable: ElementRef;
  allTablesString: string;

  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit() {
    this.compressorInventoryItems = this.compressedAirAssessment.compressorInventoryItems;
    this.dayTypes = this.compressedAirAssessment.compressedAirDayTypes;
    this.compressorSummaries = this.compressedAirAssessmentResultsService.calculateCompressorSummary(this.dayTypes, this.compressedAirAssessment, this.settings);
  }

  updateTableString() {
    this.allTablesString = this.profileTable.nativeElement.innerText;
  }

  getIsFinite(value: number) {
    return isFinite(value);
  }

}
