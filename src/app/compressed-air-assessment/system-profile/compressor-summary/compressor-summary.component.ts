import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
    selector: 'app-compressor-summary',
    templateUrl: './compressor-summary.component.html',
    styleUrls: ['./compressor-summary.component.css'],
    standalone: false
})
export class CompressorSummaryComponent implements OnInit {
  @Input()
  printView: boolean;

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  
  settings: Settings;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit() {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

}
