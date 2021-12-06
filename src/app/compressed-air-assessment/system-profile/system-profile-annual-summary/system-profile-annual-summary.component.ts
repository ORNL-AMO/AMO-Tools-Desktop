import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessment, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-system-profile-annual-summary',
  templateUrl: './system-profile-annual-summary.component.html',
  styleUrls: ['./system-profile-annual-summary.component.css']
})
export class SystemProfileAnnualSummaryComponent implements OnInit {

  @ViewChild('dayTypeTable', { static: false }) dayTypeTable: ElementRef;
  @ViewChild('totalsTable', { static: false }) totalsTable: ElementRef;
  allTablesString: string;

  compressedAirAssessment: CompressedAirAssessment;
  baselineResults: BaselineResults;
  settings: Settings;

  compressorAnnualSummaryOptions: Array<CompressorAnnualSummaryOption> = [];
  selectedAnnualSummary: CompressorAnnualSummaryOption;
  baselineProfileSummaries: Array<{dayTypeId: string, profileSummary: Array<ProfileSummary> }> = [];
  
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.compressedAirAssessment) {
      this.compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
        this.compressorAnnualSummaryOptions.push({compressorName: compressor.name, compressorId: compressor.itemId});
      });
      this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        let profileSumary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, dayType, this.settings)
        this.baselineProfileSummaries.push({
          dayTypeId: dayType.dayTypeId,
          profileSummary: profileSumary
        });
      });
    }
    this.setSelectedAnnualSummary();
  }


  setSelectedAnnualSummary() {
    let baselineProfileSummaries: Array<{dayTypeId: string, profileSummary: Array<ProfileSummary> }>;
    if (this.selectedAnnualSummary && this.compressedAirAssessment && this.compressedAirAssessment.compressedAirDayTypes) {
      baselineProfileSummaries = JSON.parse(JSON.stringify(this.baselineProfileSummaries));
      baselineProfileSummaries.forEach(summary => {
        summary.profileSummary = summary.profileSummary.filter(s => {
          return s.compressorId == this.selectedAnnualSummary.compressorId
        });
      });
    }
    this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings, baselineProfileSummaries);
    if (this.selectedAnnualSummary) {
      this.baselineResults.total.name = this.selectedAnnualSummary.compressorName + ' Totals';
    }
  }

  updateTableString() {
    this.allTablesString = 
    this.dayTypeTable.nativeElement.innerText + '\n' +
    this.totalsTable.nativeElement.innerText + '\n';
  }

}

export interface CompressorAnnualSummaryOption {
  compressorName: string,
  compressorId: string,
}
