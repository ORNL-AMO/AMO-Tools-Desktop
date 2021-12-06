import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.compressedAirAssessment, this.settings);
  }

  updateTableString() {
    this.allTablesString = 
    this.dayTypeTable.nativeElement.innerText + '\n' +
    this.totalsTable.nativeElement.innerText + '\n';
  }

}
