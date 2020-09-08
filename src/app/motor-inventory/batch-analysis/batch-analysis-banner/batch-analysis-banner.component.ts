import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BatchAnalysisService } from '../batch-analysis.service';

@Component({
  selector: 'app-batch-analysis-banner',
  templateUrl: './batch-analysis-banner.component.html',
  styleUrls: ['./batch-analysis-banner.component.css']
})
export class BatchAnalysisBannerComponent implements OnInit {
  
  selectedTab: string;
  selectedTabSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
    this.selectedTabSub = this.batchAnalysisService.selectedTab.subscribe(val => {
      this.selectedTab = val;
    })
  }

  ngOnDestroy(){
    this.selectedTabSub.unsubscribe();
  }

  setTab(str: string){
    this.batchAnalysisService.selectedTab.next(str);
  }
}
