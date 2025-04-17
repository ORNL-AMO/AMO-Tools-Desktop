import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
    selector: 'app-compressed-air-calculators',
    templateUrl: './compressed-air-calculators.component.html',
    styleUrls: ['./compressed-air-calculators.component.css'],
    standalone: false
})
export class CompressedAirCalculatorsComponent implements OnInit {

  @Input()
  assessment: Assessment;

  settings: Settings;
  
  calcTabSub: Subscription;
  calcTab: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
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
