import { Component, Input, OnInit } from '@angular/core';
import { Settings } from 'http2';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-compressed-air-calculators',
  templateUrl: './compressed-air-calculators.component.html',
  styleUrls: ['./compressed-air-calculators.component.css']
})
export class CompressedAirCalculatorsComponent implements OnInit {

  @Input()
  assessment: CompressedAirAssessment;
  @Input()
  settings: Settings;
  
  calcTabSub: Subscription;
  calcTab: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.calcTabSub = this.compressedAirAssessmentService.calcTab.subscribe(currentCalcTab => {
      this.calcTab = currentCalcTab;
    });
  }

  ngOnDestroy() {
    this.calcTabSub.unsubscribe();
  }

  changeCalcTab(str: string) {
    this.compressedAirAssessmentService.calcTab.next(str);
  }

}
