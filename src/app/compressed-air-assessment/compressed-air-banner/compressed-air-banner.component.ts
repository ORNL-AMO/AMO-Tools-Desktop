import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-compressed-air-banner',
  templateUrl: './compressed-air-banner.component.html',
  styleUrls: ['./compressed-air-banner.component.css']
})
export class CompressedAirBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  isBaselineValid: boolean = true;
  mainTab: string;
  mainTabSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.mainTabSub = this.compressedAirAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy(){
    this.mainTabSub.unsubscribe();
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'diagram' || this.isBaselineValid) {
      this.compressedAirAssessmentService.mainTab.next(str);
    }
  }

}
