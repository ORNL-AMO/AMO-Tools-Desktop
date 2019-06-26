import { Component, OnInit } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-analysis-banner',
  templateUrl: './fan-analysis-banner.component.html',
  styleUrls: ['./fan-analysis-banner.component.css']
})
export class FanAnalysisBannerComponent implements OnInit {

  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fanAnalysisService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.fanAnalysisService.mainTab.next(str);
  }

  changeStepTab(str: string) {
    this.fanAnalysisService.stepTab.next(str);
  }
}
