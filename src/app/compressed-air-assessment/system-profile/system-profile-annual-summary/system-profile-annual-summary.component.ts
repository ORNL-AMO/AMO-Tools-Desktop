import { Component, OnInit } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-system-profile-annual-summary',
  templateUrl: './system-profile-annual-summary.component.html',
  styleUrls: ['./system-profile-annual-summary.component.css']
})
export class SystemProfileAnnualSummaryComponent implements OnInit {



  compressedAirAssessment: CompressedAirAssessment;
  baselineResults: BaselineResults;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.compressedAirAssessment);
  }

}
