import { Component, OnInit } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-analysis-banner',
  templateUrl: './fan-analysis-banner.component.html',
  styleUrls: ['./fan-analysis-banner.component.css']
})
export class FanAnalysisBannerComponent implements OnInit {

  mainTab: string = 'fan-info';
  mainTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fanAnalysisService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy(){
    this.mainTabSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.fanAnalysisService.mainTab.next(str);
  }
}
