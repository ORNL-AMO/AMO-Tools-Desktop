import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';

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

  constructor(private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService
  ) { }

  ngOnInit() {
    this.compressorInventoryItems = this.compressedAirAssessment.compressorInventoryItems;
    this.dayTypes = this.compressedAirAssessment.compressedAirDayTypes;
    let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
    this.compressorSummaries = compressedAirAssessmentBaselineResults.getCompressorSummaries(this.settings);
  }

  updateTableString() {
    this.allTablesString = this.profileTable.nativeElement.innerText;
  }

  getIsFinite(value: number) {
    return isFinite(value);
  }

}
